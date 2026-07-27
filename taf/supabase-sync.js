(function () {
  'use strict';

  const config = window.QG_TAF_SUPABASE || {};
  const bridge = window.QGTafBridge;
  const status = document.getElementById('syncStatus');
  const message = document.getElementById('syncMessage');
  const loggedOut = document.getElementById('syncLoggedOut');
  const loggedIn = document.getElementById('syncLoggedIn');
  const userEmail = document.getElementById('syncUserEmail');
  const emailInput = document.getElementById('syncEmail');
  const passwordInput = document.getElementById('syncPassword');
  let client = null;
  let session = null;
  let syncTimer = null;
  let applyingCloud = false;
  let syncing = false;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'sync-status' + (kind ? ' ' + kind : '');
  }

  function setMessage(text) {
    message.textContent = text;
  }

  function showSession() {
    const active = Boolean(session && session.user);
    loggedOut.hidden = active;
    loggedIn.hidden = !active;
    userEmail.textContent = active ? session.user.email : '';
    if (!active && client) {
      setStatus(navigator.onLine ? 'Não conectado' : 'Offline');
      setMessage('Entre ou crie uma conta para sincronizar seus dados.');
    }
  }

  function friendlyError(error) {
    const text = String(error && error.message ? error.message : error || '');
    const map = {
      'Invalid login credentials': 'E-mail ou senha incorretos.',
      'Email not confirmed': 'Confirme o e-mail enviado pelo Supabase antes de entrar.',
      'User already registered': 'Este e-mail já possui uma conta.',
      'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.'
    };
    return map[text] || text || 'Não foi possível concluir a operação.';
  }

  async function pushState() {
    if (!client || !session || !navigator.onLine || syncing || applyingCloud) return;
    syncing = true;
    setStatus('Sincronizando…');
    const { data, error } = await client.from('taf_user_data').upsert({
      user_id: session.user.id,
      app_data: bridge.getState()
    }, { onConflict: 'user_id' }).select('updated_at').single();
    syncing = false;
    if (error) {
      setStatus('Erro ao sincronizar', 'error');
      setMessage(friendlyError(error));
      return;
    }
    localStorage.setItem('qg-taf-cbm-last-modified', data.updated_at);
    setStatus('Sincronizado', 'synced');
    setMessage('Dados salvos neste aparelho e no Supabase.');
  }

  async function reconcile() {
    if (!client || !session || !navigator.onLine) return;
    setStatus('Comparando dados…');
    const { data, error } = await client
      .from('taf_user_data')
      .select('app_data,updated_at')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) {
      setStatus('Erro ao sincronizar', 'error');
      setMessage(friendlyError(error));
      return;
    }
    if (!data) {
      await pushState();
      return;
    }
    const localTime = Date.parse(bridge.getLastModified() || 0);
    const cloudTime = Date.parse(data.updated_at || 0);
    if (cloudTime > localTime) {
      applyingCloud = true;
      bridge.replaceStateFromCloud(data.app_data, data.updated_at);
      applyingCloud = false;
      setStatus('Sincronizado', 'synced');
      setMessage('Dados mais recentes baixados do Supabase.');
    } else {
      await pushState();
    }
  }

  async function authenticate(mode) {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || password.length < 6) {
      setMessage('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.');
      setStatus('Confira os dados', 'error');
      return;
    }
    setStatus(mode === 'signup' ? 'Criando conta…' : 'Entrando…');
    const result = mode === 'signup'
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password });
    if (result.error) {
      setStatus('Não foi possível entrar', 'error');
      setMessage(friendlyError(result.error));
      return;
    }
    if (mode === 'signup' && !result.data.session) {
      setStatus('Confirme seu e-mail');
      setMessage('Conta criada. Abra o e-mail de confirmação e depois volte para entrar.');
      return;
    }
    session = result.data.session;
    passwordInput.value = '';
    showSession();
    await reconcile();
  }

  function scheduleSync() {
    if (!session || applyingCloud) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(pushState, 1200);
  }

  if (!bridge || !config.url || !config.anonKey || !window.supabase) {
    setStatus('Configuração pendente');
    setMessage('O projeto Supabase exclusivo ainda precisa da URL e da chave pública.');
    loggedOut.querySelectorAll('input,button').forEach(element => element.disabled = true);
    return;
  }

  client = window.supabase.createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'qgCbmSupabaseSession' }
  });

  document.getElementById('syncLogin').addEventListener('click', () => authenticate('login'));
  document.getElementById('syncSignup').addEventListener('click', () => authenticate('signup'));
  document.getElementById('syncNow').addEventListener('click', reconcile);
  document.getElementById('syncLogout').addEventListener('click', async () => {
    await client.auth.signOut();
    session = null;
    showSession();
  });
  window.addEventListener('qgtaf:state-changed', scheduleSync);
  window.addEventListener('online', reconcile);
  window.addEventListener('offline', () => {
    setStatus('Offline');
    setMessage('As mudanças continuam salvas neste aparelho e serão enviadas quando a internet voltar.');
  });

  client.auth.onAuthStateChange((_event, nextSession) => {
    session = nextSession;
    showSession();
  });

  client.auth.getSession().then(async ({ data }) => {
    session = data.session;
    showSession();
    if (session) await reconcile();
  });
}());
