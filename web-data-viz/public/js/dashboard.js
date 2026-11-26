/* ==========================================================================
   dashboard.js  |  só de dashboard.html
   Depende de: dados.js (tabelas fixas e funções), app.js e da biblioteca Chart.js
   (carregada pelo <script> no <head> do HTML).

   Os números e gráficos vêm do MySQL (src/models/dashboardModel.js).
   Aqui chegam os resultados prontos, em JSON, pelo fetch.

   Ligações com o HTML (ids):
     titulo_painel / p_subtitulo ....... título e subtítulo
     div_periodo ....................... botões 7 dias / 30 dias
     btn_cronometro / btn_pausa / div_cronometro ... cronômetro de ensaio
     p_meta_texto / barra_meta / p_meta_msg ... meta da semana
     kpi_minutos kpi_videos ... números pessoais
     select_semana / p_semana_texto / canvas_ensaio ... gráfico "Meu tempo de ensaio" com filtro de semana
     canvas_videos ... gráfico de vídeos por estilo
   ========================================================================== */

let periodo = 7;          // filtro: 7 ou 30 dias
let META = 180;           // meta de minutos por semana (vem de perfil_usuario)
let graficos = [];        // gráficos desenhados (para apagar antes de desenhar de novo)
let corTexto = '';        // cores dos gráficos (mudam com o tema claro/escuro)
let corLinha = '';

let dp = null;   // dados pessoais (GET /dashboard/pessoal/:id/:periodo)

/* ---- cronômetro ---- */
let cron_timer = null;    // intervalo rodando? (null = parado ou pausado)
let cron_ativo = false;   // true = tem um ensaio em andamento (rodando ou pausado)
let cron_pausado = false; // true = ensaio em pausa
let cron_inicio = 0;      // hora em que o trecho atual começou
let cron_acumulado = 0;   // milissegundos dos trechos anteriores (antes das pausas)
let cron_total = 0;       // resultado de calcularTempoCronometro()

/* ---- filtro de semana do gráfico "Meu tempo de ensaio" ---- */
let semana = 0;              // 0 = últimos 7 dias, 1 = semana passada, 2 = 2 semanas atrás...
let graficoEnsaio = null;    // gráfico de linha (fica separado para redesenhar só ele)
let semana_datas = [];       // ex.: '2026-11-19' (formato do MySQL)
let semana_rotulo = [];      // ex.: 'Qui 19/11' (aparece no gráfico)
let semana_minutos = [];     // minutos de cada dia
let nomes_dia = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/* atualizarPainel() = busca os dados na API e refaz tudo.
   Roda ao abrir a página e a cada ação do usuário. */
function atualizarPainel() {
  fetch('/dashboard/pessoal/' + logado + '/' + periodo).then(function (resposta) {
    if (!resposta.ok) {
      throw new Error('pessoal ' + resposta.status);
    }
    resposta.json().then(function (json) {
      dp = json;
      mostrarPainel();
    });
  }).catch(function (erroFetch) {
    console.log(erroFetch);
    mostrarAviso('Não foi possível carregar o painel. O servidor está ligado?');
  });
}

/* com os dados em dp, preenche a tela */
function mostrarPainel() {
  META = dp.meta;
  pegarPrimeiroNome(sessionStorage.NOME_USUARIO);
  titulo_painel.innerHTML = 'Olá, ' + primeiroNome;
  p_subtitulo.innerHTML = 'Seu estilo: ' + estilo_nome[estilo_id.indexOf(estiloAtual)] + '. Cada ação sua muda este painel na hora.';

  atualizarPessoal();
  desenharGraficos();
}

/* ---------- NÚMEROS PESSOAIS, FILTRO E META ---------- */
function atualizarPessoal() {
  let minutosSemana = dp.minutosSemana;

  // SUM(minutos) FROM ensaio  e  COUNT(*) FROM usuario_video
  kpi_minutos.innerHTML = dp.minutos + ' min';
  kpi_videos.innerHTML = dp.videos;

  // meta da semana (minutos da semana x metaSemanalMin do perfil)
  p_meta_texto.innerHTML = minutosSemana + ' de ' + META + ' minutos nesta semana';
  let porcentagem = minutosSemana / META * 100;
  if (porcentagem > 100) {
    porcentagem = 100;
  }
  // .style.width muda a largura da barra (a animação está no CSS)
  barra_meta.style.width = porcentagem + '%';
  if (minutosSemana >= META) {
    p_meta_msg.innerHTML = 'Meta batida. Sua linha está em dia!';
  } else {
    p_meta_msg.innerHTML = 'Faltam ' + (META - minutosSemana) + ' minutos para bater a meta.';
  }

  // sem nada no período? mostra a dica
  let temAtividade = false;
  if (dp.minutos > 0 || dp.videos > 0) {
    temAtividade = true;
  }
  p_vazio.hidden = temAtividade;

  // botões 7 dias / 30 dias (o que está escolhido fica destacado)
  div_periodo.innerHTML = '<button class="tab" onclick="mudarPeriodo(7)" aria-selected="' + (periodo == 7) + '">7 dias</button>' +
    '<button class="tab" onclick="mudarPeriodo(30)" aria-selected="' + (periodo == 30) + '">30 dias</button>';
}

function mudarPeriodo(dias) {
  periodo = dias;
  atualizarPainel();
}

/* ---------- GRÁFICOS ---------- */
function definirCores() {
  // cores dos textos e linhas de acordo com o tema (iguais às do css/base.css)
  let corMuted = '#8e979d';
  corTexto = '#c9cfd3';
  corLinha = 'rgba(255,255,255,0.12)';
  if (document.documentElement.getAttribute('data-theme') == 'light') {
    corMuted = '#666d75';
    corTexto = '#363a40';
    corLinha = 'rgba(20,18,40,0.14)';
  }
  Chart.defaults.color = corMuted;
  Chart.defaults.font.family = 'Montserrat, sans-serif';
}

function desenharGraficos() {
  if (window.Chart == undefined) {
    // sem internet o Chart.js não carrega
    p_erro_graficos.hidden = false;
  } else {
    p_erro_graficos.hidden = true;
    definirCores();

    // apaga o gráfico antigo antes de desenhar o novo
    for (let i = 0; i < graficos.length; i++) {
      graficos[i].destroy();
    }
    graficos = [];

    desenharGraficoVideos();
    buscarSemana();
  }
}

/* gráfico de rosca: vídeos assistidos por estilo. Junta usuario_video com video */
function desenharGraficoVideos() {
  let videosPorEstilo = [0, 0, 0, 0, 0];
  for (let a = 0; a < dp.videosPorEstilo.length; a++) {
    videosPorEstilo[estilo_id.indexOf(dp.videosPorEstilo[a].estilo)] = dp.videosPorEstilo[a].videos;
  }
  graficos.push(new Chart(canvas_videos, {
    type: 'doughnut',
    data: {
      labels: estilo_nome,
      datasets: [{ data: videosPorEstilo, backgroundColor: estilo_cor, borderWidth: 0 }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { position: 'bottom', labels: { color: corTexto, boxWidth: 12 } } }
    }
  }));
}

/* ---------- FILTRO DE SEMANA ("Meu tempo de ensaio") ---------- */

/* quando a pessoa escolhe outra semana no <select> */
function mudarSemana() {
  semana = Number(select_semana.value);
  buscarSemana();
}

/* monta os 7 dias da semana escolhida (do mais antigo até o mais novo).
   semana 0 termina hoje; semana 1 termina 7 dias atrás; semana 2 termina 14 dias atrás... */
function calcularDatasSemana() {
  semana_datas = [];
  semana_rotulo = [];

  for (let i = 6; i >= 0; i--) {
    let dia = new Date(Date.now() - (i + semana * 7) * 86400000);
    let mes = dia.getMonth() + 1;
    let diaMes = dia.getDate();
    let chave = dia.getFullYear() + '-' + (mes < 10 ? '0' + mes : mes) + '-' + (diaMes < 10 ? '0' + diaMes : diaMes);

    semana_datas.push(chave);
    semana_rotulo.push(nomes_dia[dia.getDay()] + ' ' + diaMes + '/' + mes);
  }
}

/* GET /dashboard/semana/:id/:inicio/:fim e desenha só o gráfico de linha */
function buscarSemana() {
  calcularDatasSemana();
  p_semana_texto.innerHTML = 'Minutos por dia, de ' + semana_rotulo[0] + ' até ' + semana_rotulo[6];

  fetch('/dashboard/semana/' + logado + '/' + semana_datas[0] + '/' + semana_datas[6]).then(function (resposta) {
    if (!resposta.ok) {
      throw new Error('semana ' + resposta.status);
    }
    resposta.json().then(function (lista) {
      // dias sem ensaio entram com 0 minutos
      semana_minutos = [];
      for (let d = 0; d < semana_datas.length; d++) {
        let soma = 0;
        for (let e = 0; e < lista.length; e++) {
          if (lista[e].dia == semana_datas[d]) {
            soma += Number(lista[e].minutos);
          }
        }
        semana_minutos.push(soma);
      }
      desenharGraficoEnsaio();
    });
  }).catch(function (erroFetch) {
    console.log(erroFetch);
    mostrarAviso('Não foi possível carregar essa semana.');
  });
}

/* gráfico de linha: minutos de ensaio por dia */
function desenharGraficoEnsaio() {
  if (window.Chart != undefined) {
    // apaga o gráfico antigo antes de desenhar o novo
    if (graficoEnsaio != null) {
      graficoEnsaio.destroy();
    }
    let grade = { color: corLinha };
    let semGrade = { display: false };

    converterCor(corAtual, 0.18);
    graficoEnsaio = new Chart(canvas_ensaio, {
      type: 'line',
      data: {
        labels: semana_rotulo,
        datasets: [{
          label: 'Minutos',
          data: semana_minutos,
          borderColor: corAtual,
          backgroundColor: corConvertida,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: corAtual
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: semGrade },
        scales: {
          x: { grid: semGrade },
          y: { grid: grade, beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }
}

/* ---------- CRONÔMETRO DE ENSAIO ---------- */

/* total de milissegundos do ensaio (resultado em cron_total).
   Pausado: só o que já tinha acumulado. Rodando: acumulado + trecho atual */
function calcularTempoCronometro() {
  if (cron_pausado == true) {
    cron_total = cron_acumulado;
  } else {
    cron_total = cron_acumulado + (Date.now() - cron_inicio);
  }
}

/* roda a cada meio segundo e mostra mm:ss. O % (resto da divisão) separa os segundos */
function atualizarCronometro() {
  calcularTempoCronometro();
  let segundos = Math.floor(cron_total / 1000);
  let mm = Math.floor(segundos / 60);
  let ss = segundos % 60;
  if (mm < 10) {
    mm = '0' + mm;
  }
  if (ss < 10) {
    ss = '0' + ss;
  }
  div_cronometro.innerHTML = mm + ':' + ss;
}

/* botão "Começar ensaio" / "Terminar ensaio" */
function alternarCronometro() {
  if (cron_ativo == false) {
    // começar
    cron_ativo = true;
    cron_pausado = false;
    cron_acumulado = 0;
    cron_inicio = Date.now();
    cron_timer = setInterval(atualizarCronometro, 500);
    btn_cronometro.innerHTML = 'Terminar ensaio';
    btn_pausa.disabled = false;
    btn_pausa.innerHTML = 'Pausar';
    div_cronometro.className = 'timer run';
  } else {
    // terminar (pode ser rodando ou pausado)
    calcularTempoCronometro();
    clearInterval(cron_timer);
    cron_timer = null;
    cron_ativo = false;
    cron_pausado = false;
    let minutos = Math.round(cron_total / 60000);
    if (minutos < 1) {
      minutos = 1;
    }
    btn_cronometro.innerHTML = 'Começar ensaio';
    btn_pausa.disabled = true;
    btn_pausa.innerHTML = 'Pausar';
    div_cronometro.className = 'timer';
    div_cronometro.innerHTML = '00:00';
    adicionarEnsaio(minutos, 'Ensaio registrado: ' + minutos + ' min.');
  }
}

/* botão "Pausar" / "Continuar": o tempo parado não entra na conta */
function alternarPausa() {
  if (cron_ativo == true) {
    if (cron_pausado == false) {
      // pausar: guarda o que já passou e para o relógio
      calcularTempoCronometro();
      cron_acumulado = cron_total;
      clearInterval(cron_timer);
      cron_timer = null;
      cron_pausado = true;
      atualizarCronometro();
      btn_pausa.innerHTML = 'Continuar';
      div_cronometro.className = 'timer pause';
    } else {
      // continuar: começa um trecho novo a partir de agora
      cron_pausado = false;
      cron_inicio = Date.now();
      cron_timer = setInterval(atualizarCronometro, 500);
      btn_pausa.innerHTML = 'Pausar';
      div_cronometro.className = 'timer run';
    }
  }
}

/* POST /ensaios/registrar: INSERT em ensaio (cronômetro e botões +15 / +30) e atualiza o painel */
function adicionarEnsaio(minutos, mensagem) {
  fetch('/ensaios/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUsuarioServer: logado, estiloServer: estiloAtual, minutosServer: minutos })
  }).then(function (resposta) {
    if (resposta.ok) {
      mostrarAviso(mensagem);
      atualizarPainel();
    } else {
      mostrarAviso('Não foi possível registrar o ensaio.');
    }
  }).catch(function (erroFetch) {
    console.log(erroFetch);
    mostrarAviso('Não foi possível falar com o servidor.');
  });
}

/* ---------- INÍCIO ---------- */
iniciarPagina('dashboard');
if (logado == -1) {
  // acesso restrito: sem login, volta para a página de login
  guardarMensagem('Entre na sua conta para ver o painel.');
  location.href = 'login.html';
} else {
  atualizarPainel();
}
