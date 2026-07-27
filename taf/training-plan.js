window.QG_TAF_TRAINING_PLAN = {
  phases: [
    {name:"Base técnica",short:"BASE",note:"Priorize execução limpa. Termine as séries sentindo que ainda conseguiria 1–2 repetições.",volume:.9},
    {name:"Progressão",short:"PROGRESSÃO",note:"Aumente uma repetição por série ou um bloco curto, sem chegar à falha.",volume:1},
    {name:"Específica",short:"ESPECÍFICA",note:"Aproxime ritmo e técnica do padrão da prova, mantendo qualidade.",volume:1.08},
    {name:"Descarga + simulado",short:"DESCARGA",note:"Reduza o volume. Faça o simulado mensal somente se estiver recuperado e sem dor.",volume:.72}
  ],
  days: [
    {
      day:"Segunda",title:"Barra + flexão + abdominal",duration:"45–55 min",intensity:"Moderada",
      why:"Ataca os testes de força quando você tende a estar mais recuperado.",
      blocks:[
        {name:"Aquecimento",sets:"1",work:"6–8 min",rest:"—",tip:"Ombros, punhos, escápulas e 2 séries leves de flexão."},
        {name:"Barra escapular",sets:"4",work:"5–8 reps",rest:"60 s",tip:"Braços estendidos; mova apenas as escápulas."},
        {name:"Negativa na barra",sets:"4",work:"3 reps × 5–8 s",rest:"90 s",tip:"Suba com apoio e desça devagar. Pare se perder o controle."},
        {name:"Flexão submáxima",sets:"5",work:"55–60% do máximo",rest:"75–90 s",tip:"Com máximo atual de 20, comece com 10–12 por série."},
        {name:"Abdominal supra",sets:"6",work:"20 s",rest:"40 s",tip:"Padrão do edital; registre o total de repetições corretas."},
        {name:"Mobilidade",sets:"1",work:"5 min",rest:"—",tip:"Peitoral, dorsal e quadril, sem forçar dor."}
      ]
    },
    {
      day:"Terça",title:"Natação técnica",duration:"40–55 min",intensity:"Leve/técnica",
      why:"Como você ainda está aprendendo, técnica e segurança vêm antes da velocidade.",
      warning:"Faça com professor ou pessoa habilitada, em piscina com guarda-vidas. Não treine sozinho.",
      blocks:[
        {name:"Adaptação",sets:"1",work:"5–8 min",rest:"livre",tip:"Respirar na borda, soltar o ar na água e flutuar com apoio."},
        {name:"Pernada com prancha",sets:"6",work:"25 m",rest:"60–90 s",tip:"Movimento curto, contínuo e quadril alto."},
        {name:"Braçada + respiração",sets:"6",work:"25 m",rest:"60–90 s",tip:"Pare antes de perder a técnica; use apoio se necessário."},
        {name:"Nado completo",sets:"4",work:"25 m",rest:"90 s",tip:"Ritmo confortável. O objetivo inicial é completar bem."},
        {name:"Volta à calma",sets:"1",work:"5 min",rest:"—",tip:"Deslocamento leve e respiração controlada."}
      ]
    },
    {
      day:"Quarta",title:"Corrida de ritmo + salto",duration:"45–60 min",intensity:"Forte controlada",
      why:"Trabalha o ritmo de 12 minutos sem exigir um simulado máximo toda semana.",
      blocks:[
        {name:"Aquecimento",sets:"1",work:"10–12 min",rest:"—",tip:"Trote leve, mobilidade e 3 acelerações de 15 s."},
        {name:"Intervalado",sets:"6",work:"2 min forte",rest:"2 min trote/caminhada",tip:"Forte controlado; não é sprint nem teste máximo."},
        {name:"Salto técnico",sets:"4",work:"3 saltos",rest:"90 s",tip:"Balanço dos braços, saída atrás da linha e queda estável."},
        {name:"Desaquecimento",sets:"1",work:"8 min",rest:"—",tip:"Trote muito leve ou caminhada."}
      ]
    },
    {
      day:"Quinta",title:"Barra + flexão + abdominal",duration:"40–50 min",intensity:"Moderada",
      why:"Segunda exposição de força, com variação para acumular volume sem falhar.",
      blocks:[
        {name:"Aquecimento",sets:"1",work:"6–8 min",rest:"—",tip:"Escápulas, ombros, punhos e core."},
        {name:"Isometria na barra",sets:"5",work:"8–15 s",rest:"75 s",tip:"Queixo acima da barra com apoio para subir."},
        {name:"Remada australiana/mesa",sets:"4",work:"8–12 reps",rest:"75 s",tip:"Só use apoio firme e seguro; corpo alinhado."},
        {name:"Flexão em escada",sets:"5",work:"8–10–12–10–8",rest:"60–75 s",tip:"Reduza as repetições se perder o padrão."},
        {name:"Abdominal supra",sets:"4",work:"30 s",rest:"45 s",tip:"Ritmo constante, sem levantar o quadril."}
      ]
    },
    {
      day:"Sexta",title:"Força em casa + recuperação",duration:"35–45 min",intensity:"Leve/moderada",
      why:"Aproveita seus equipamentos em casa sem criar outra sessão muito pesada.",
      blocks:[
        {name:"Bike leve",sets:"1",work:"15–20 min",rest:"—",tip:"Ritmo em que ainda consegue conversar."},
        {name:"Agachamento com 20 kg",sets:"3",work:"10–12 reps",rest:"90 s",tip:"Carga junto ao corpo; joelhos acompanhando os pés."},
        {name:"Terra romeno com 20 kg",sets:"3",work:"10–12 reps",rest:"90 s",tip:"Coluna neutra e quadril para trás."},
        {name:"Barra assistida",sets:"3",work:"4–6 reps",rest:"90 s",tip:"Use apoio suficiente para executar sem balanço."},
        {name:"Core + mobilidade",sets:"3",work:"30 s prancha",rest:"30 s",tip:"Finalize com 6 minutos de mobilidade."}
      ]
    },
    {
      day:"Sábado",title:"Corrida leve + técnica",duration:"35–50 min",intensity:"Leve",
      why:"Constrói condicionamento sem repetir o esforço máximo da prova.",
      blocks:[
        {name:"Corrida leve",sets:"1",work:"25–35 min",rest:"—",tip:"Ritmo confortável; consiga falar frases curtas."},
        {name:"Acelerações",sets:"4",work:"15 s",rest:"60 s andando",tip:"Rápido e solto, sem sprintar."},
        {name:"Mobilidade",sets:"1",work:"8 min",rest:"—",tip:"Panturrilha, tornozelo, quadril e posterior."}
      ]
    },
    {
      day:"Domingo",title:"Descanso e recuperação",duration:"20–30 min opcional",intensity:"Recuperação",
      why:"É no descanso que você absorve o treino e reduz o risco de lesão.",
      blocks:[
        {name:"Caminhada",sets:"1",work:"20–30 min opcional",rest:"—",tip:"Bem leve, apenas para se movimentar."},
        {name:"Recuperação",sets:"1",work:"Sono + hidratação",rest:"—",tip:"Não compense treino perdido fazendo tudo hoje."}
      ]
    }
  ],
  serviceRule:{
    title:"Modo plantão / pós-serviço",
    text:"Se estiver moído, com menos de 6 h de sono, dor ou tontura, troque o treino intenso por 15–25 min leves de bike/caminhada e mobilidade. Continue o ciclo no próximo dia disponível; não dobre o volume."
  }
};
