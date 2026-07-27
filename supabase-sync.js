(() => {
  'use strict';

  const APP_KEY = 'qgCbmState';
  const SESSION_KEY = 'qgCbmSupabaseSession';
  const META_KEY = 'qgCbmSyncMeta';
  const BACKUP_KEY = 'qgCbmStateBeforeRemoteSync';
  const DEVICE_KEY = 'qgCbmDeviceId';
  const DEFAULT_CONFIG = Object.freeze({
    url: 'https://bormijoqcxkdersftifn.supabase.co',
    anonKey: 'sb_publishable_J8Fjv8zDaakH6HcHWGC6ng_SGygTjSQ'
  });

  const readJSON = (key, fallback = null) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const nowISO = () => new Date().toISOString();
  const getConfig = () => DEFAULT_CONFIG;
  const getSession = () => readJSON(SESSION_KEY, null);
  const getMeta = () => readJSON(META_KEY, { dirty: false, lastLocalChange: null, lastRemoteSync: null });
  const setMeta = patch => writeJSON(META_KEY, { ...getMeta(), ...patch });

  if (!localStorage.getItem(DEVICE_KEY)) {
    localStorage.setItem(DEVICE_KEY, crypto.randomUUID());
  }

  let internalWrite = false;
  let pushTimer = null;
  const nativeSetItem = Storage.prototype.setItem;

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    nativeSetItem.call(this, key, value);
    if (this === localStorage && key === APP_KEY && !internalWrite) {
      setMeta({ dirty: true, lastLocalChange: nowISO() });
      updateStatus();
      clearTimeout(pushTimer);
      pushTimer = setTimeout(() => {
        if (navigator.onLine && getSession()) syncNow({ quiet: true });
      }, 1200);
    }
  };

  function normalizeUrl(url) {
    return String(url || '').trim().replace(/\/+$/, '');
  }

  function configured() {
    const { url, anonKey } = getConfig();
    return Boolean(normalizeUrl(url) && String(anonKey || '').trim());
  }

  async function request(path, options = {}, allowRefresh = true) {
    const config = getConfig();
    const session = getSession();
    const headers = {
      apikey: config.anonKey,
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    const response = await fetch(`${normalizeUrl(config.url)}${path}`, { ...options, headers });
    if (response.status === 401 && allowRefresh && session?.refresh_token) {
      const refreshed = await refreshSession();
      if (refreshed) return request(path, options, false);
    }
    return response;
  }

  async function refreshSession() {
    const config = getConfig();
    const session = getSession();
    if (!configured() || !session?.refresh_token) return false;
    try {
      const response = await fetch(`${normalizeUrl(config.url)}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      if (!response.ok) throw new Error('Sessão expirada');
      writeJSON(SESSION_KEY, await response.json());
      return true;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
  }

  async function auth(action, email, password) {
    if (!configured()) throw new Error('Configure primeiro a URL e a chave pública do Supabase.');
    const config = getConfig();
    const endpoint = action === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';
    const response = await fetch(`${normalizeUrl(config.url)}${endpoint}`, {
      method: 'POST',
      headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.msg || body.error_description || body.message || 'Não foi possível entrar.');
    if (body.access_token) {
      writeJSON(SESSION_KEY, body);
      await syncNow({ firstSync: true });
    }
    return body;
  }

  function mergeById(remote = [], local = []) {
    const merged = new Map();
    for (const item of remote) merged.set(item?.id ?? JSON.stringify(item), item);
    for (const item of local) merged.set(item?.id ?? JSON.stringify(item), { ...(merged.get(item?.id) || {}), ...item });
    return [...merged.values()];
  }

  function mergeStates(remote, local) {
    if (!remote) return local;
    if (!local) return remote;
    const merged = { ...remote, ...local };
    for (const key of ['logs', 'errors', 'essays', 'sims']) {
      merged[key] = mergeById(remote[key], local[key]);
    }
    merged.syllabusDone = { ...(remote.syllabusDone || {}), ...(local.syllabusDone || {}) };
    merged.cycleProgress = { ...(remote.cycleProgress || {}), ...(local.cycleProgress || {}) };
    merged.settings = { ...(remote.settings || {}), ...(local.settings || {}) };
    return merged;
  }

  async function getRemoteState(userId) {
    const response = await request(`/rest/v1/user_app_state?user_id=eq.${encodeURIComponent(userId)}&select=state,updated_at&limit=1`, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'Não foi possível ler os dados sincronizados.');
    }
    return (await response.json())[0] || null;
  }

  async function saveRemoteState(userId, state) {
    const payload = {
      user_id: userId,
      state,
      device_id: localStorage.getItem(DEVICE_KEY),
      updated_at: nowISO()
    };
    const response = await request('/rest/v1/user_app_state?on_conflict=user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'Não foi possível enviar os dados.');
    }
    return (await response.json())[0];
  }

  async function syncNow({ quiet = false, firstSync = false } = {}) {
    if (!navigator.onLine) {
      updateStatus('offline');
      if (!quiet) alert('Sem internet. Seus dados continuam salvos neste aparelho.');
      return;
    }
    const session = getSession();
    if (!session?.user?.id) {
      updateStatus();
      if (!quiet) openAccountDialog();
      return;
    }

    updateStatus('syncing');
    try {
      const local = readJSON(APP_KEY, {});
      const remoteRow = await getRemoteState(session.user.id);
      let nextState = local;

      if (remoteRow?.state) {
        const meta = getMeta();
        const remoteChanged = new Date(remoteRow.updated_at).getTime();
        const lastSync = meta.lastRemoteSync ? new Date(meta.lastRemoteSync).getTime() : 0;
        const hasUnsentLocalChanges = Boolean(meta.dirty);

        if (firstSync || (remoteChanged > lastSync && hasUnsentLocalChanges)) {
          nextState = mergeStates(remoteRow.state, local);
        } else if (remoteChanged > lastSync && !hasUnsentLocalChanges) {
          nextState = remoteRow.state;
        }
      }

      const saved = await saveRemoteState(session.user.id, nextState);
      localStorage.setItem(BACKUP_KEY, localStorage.getItem(APP_KEY) || '{}');
      internalWrite = true;
      nativeSetItem.call(localStorage, APP_KEY, JSON.stringify(nextState));
      internalWrite = false;
      setMeta({ dirty: false, lastRemoteSync: saved?.updated_at || nowISO(), lastError: null });
      updateStatus('synced');

      if (JSON.stringify(nextState) !== JSON.stringify(local)) {
        location.reload();
      } else if (!quiet) {
        alert('Sincronização concluída.');
      }
    } catch (error) {
      setMeta({ lastError: error.message });
      updateStatus('error');
      if (!quiet) alert(`Falha na sincronização: ${error.message}`);
    }
  }

  function statusText(forced) {
    if (forced === 'syncing') return ['Sincronizando…', 'syncing'];
    if (!navigator.onLine || forced === 'offline') return ['Offline · dados salvos no aparelho', 'offline'];
    if (forced === 'error' || getMeta().lastError) return ['Falha na última sincronização', 'error'];
    if (!configured()) return ['Supabase ainda não configurado', 'setup'];
    if (!getSession()) return ['Entre para sincronizar entre aparelhos', 'signed-out'];
    if (getMeta().dirty) return ['Alterações aguardando sincronização', 'pending'];
    return ['Sincronizado', 'synced'];
  }

  function updateStatus(forced) {
    const element = document.querySelector('#syncStatus');
    if (!element) return;
    const [text, className] = statusText(forced);
    element.textContent = text;
    element.className = `sync-status ${className}`;
    const session = getSession();
    const email = document.querySelector('#syncEmailLabel');
    if (email) email.textContent = session?.user?.email || 'Nenhuma conta conectada';
  }

  function injectUI() {
    const settings = document.querySelector('#view-settings .section-title');
    if (!settings || document.querySelector('#syncCard')) return;
    settings.insertAdjacentHTML('afterend', `
      <div class="card sync-card" id="syncCard">
        <div class="row">
          <div>
            <h3>Conta e sincronização</h3>
            <div class="subtle" id="syncEmailLabel">Nenhuma conta conectada</div>
          </div>
          <span id="syncStatus" class="sync-status signed-out">Entre para sincronizar</span>
        </div>
        <p class="subtle">O app salva primeiro neste aparelho e sincroniza quando houver internet. Seus registros locais não são apagados ao entrar.</p>
        <div class="actions">
          <button class="btn" id="openAccountBtn">Conta</button>
          <button class="btn secondary" id="syncNowBtn">Sincronizar agora</button>
        </div>
      </div>
      <dialog id="accountDialog">
        <div class="modal-head"><h3>Conta e nuvem</h3><button class="close" id="closeAccountBtn">×</button></div>
        <div class="modal-body">
          <p class="subtle">Banco do QG conectado. Use a mesma conta nos módulos Estudos e TAF.</p>
          <form id="accountForm" class="form-grid">
            <div class="field full"><label>E-mail</label><input id="accountEmail" type="email" autocomplete="email" required></div>
            <div class="field full"><label>Senha</label><input id="accountPassword" type="password" autocomplete="current-password" minlength="6" required></div>
            <div class="field full account-actions">
              <button class="btn" type="submit">Entrar</button>
              <button class="btn secondary" type="button" id="signupBtn">Criar conta</button>
              <button class="btn danger" type="button" id="signoutBtn">Sair</button>
            </div>
          </form>
          <p class="subtle" id="accountMessage"></p>
        </div>
      </dialog>
    `);

    document.querySelector('#openAccountBtn').onclick = openAccountDialog;
    document.querySelector('#syncNowBtn').onclick = () => syncNow();
    document.querySelector('#closeAccountBtn').onclick = () => document.querySelector('#accountDialog').close();
    document.querySelector('#accountForm').onsubmit = async event => {
      event.preventDefault();
      await runAuth('login');
    };
    document.querySelector('#signupBtn').onclick = () => runAuth('signup');
    document.querySelector('#signoutBtn').onclick = async () => {
      try {
        if (getSession()) await request('/auth/v1/logout', { method: 'POST', body: '{}' });
      } catch {
        // A sessão local ainda deve ser removida se a rede falhar.
      }
      localStorage.removeItem(SESSION_KEY);
      updateStatus();
      showMessage('Conta desconectada. Os dados locais foram mantidos.');
    };
    updateStatus();
  }

  function openAccountDialog() {
    const dialog = document.querySelector('#accountDialog');
    if (dialog && !dialog.open) dialog.showModal();
  }

  function showMessage(message) {
    const element = document.querySelector('#accountMessage');
    if (element) element.textContent = message;
  }

  async function runAuth(action) {
    const email = document.querySelector('#accountEmail').value.trim();
    const password = document.querySelector('#accountPassword').value;
    showMessage(action === 'signup' ? 'Criando conta…' : 'Entrando…');
    try {
      const result = await auth(action, email, password);
      if (action === 'signup' && !result.access_token) {
        showMessage('Conta criada. Confirme o e-mail e depois toque em Entrar.');
      } else {
        showMessage('Conta conectada e dados sincronizados.');
        updateStatus();
      }
    } catch (error) {
      showMessage(error.message);
    }
  }

  window.addEventListener('online', () => {
    updateStatus();
    if (getSession()) syncNow({ quiet: true });
  });
  window.addEventListener('offline', () => updateStatus('offline'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine && getSession()) {
      syncNow({ quiet: true });
    }
  });

  injectUI();
  if (navigator.onLine && getSession()) syncNow({ quiet: true });
})();
