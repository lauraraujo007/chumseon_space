/* ==========================================================================
   dashboard.js  |  só de dashboard.html
   Depende de: dados.js (vetores e funções), app.js e da biblioteca Chart.js
   (carregada pelo <script> no <head> do HTML).

   CADA KPI E CADA GRÁFICO VEM DE UM SELECT. Os SELECTs com o mesmo número de
   comentário estão em banco/chumseon_space.sql (seção "SELECTs do dashboard").
   Aqui o "SELECT" é feito com for + if sobre os vetores.

   Ligações com o HTML (ids):
     titulo_painel / p_subtitulo ....... título e subtítulo
     div_periodo ....................... botões 7 dias / 30 dias
     btn_cronometro / div_cronometro ... cronômetro de ensaio
     p_meta_texto / barra_meta / p_meta_msg ... meta da semana
     kpi_minutos kpi_videos kpi_quiz ... números pessoais
     canvas_ensaio canvas_videos canvas_quiz ... gráficos pessoais
     kpi_usuarios kpi_estilo_top kpi_retomar ... números da comunidade
     canvas_estilos canvas_sentidos canvas_niveis ... gráficos da comunidade
   ========================================================================== */

let periodo = 7;          // filtro: 7 ou 30 dias
let META = 180;           // meta de minutos por semana (vem de perfil_usuario)
let cron_timer = null;    // cronômetro rodando? (null = parado)
let cron_inicio = 0;
let graficos = [];        // gráficos desenhados (para apagar antes de desenhar de novo)

/* atualizarPainel() = refaz tudo. Roda ao abrir a página e a cada ação do usuário */
function atualizarPainel() {
  pegarPrimeiroNome(usuario_nome[logado]);
  META = usuario_meta[logado];
  titulo_painel.innerHTML = 'Olá, ' + primeiroNome;
  p_subtitulo.innerHTML = 'Seu estilo: ' + estilo_nome[estilo_id.indexOf(usuario_estilo[logado])] + '. Cada ação sua muda este painel na hora.';

  atualizarKpisComunidade();
  atualizarPessoal();
  desenharGraficos();
}

/* ---------- KPIs DA COMUNIDADE (SELECTs 1, 2 e 3) ---------- */
function atualizarKpisComunidade() {
  let total = usuario_email.length;

  // SELECT 1: quantos dançarinos cadastrados -> COUNT(*)
  kpi_usuarios.innerHTML = total;

  // SELECT 2: estilo mais votado da semana -> GROUP BY estilo ORDER BY COUNT DESC
  let contagem = [0, 0, 0, 0, 0];   // uma posição para cada estilo
  let novos = 0;
  let limite = Date.now() - 7 * 86400000;
  for (let i = 0; i < total; i++) {
    if (usuario_criado[i] > limite) {
      contagem[estilo_id.indexOf(usuario_estilo[i])]++;
      novos++;
    }
  }
  if (novos == 0) {
    // ninguém se cadastrou na semana: conta todo mundo
    for (let i = 0; i < total; i++) {
      contagem[estilo_id.indexOf(usuario_estilo[i])]++;
    }
  }
  let melhor = 0;
  for (let e = 1; e < contagem.length; e++) {
    if (contagem[e] > contagem[melhor]) {
      melhor = e;
    }
  }
  kpi_estilo_top.innerHTML = estilo_nome[melhor];

  // SELECT 3: % de quem já praticou na infância ("querem retomar") -> regra de três
  let retomar = 0;
  for (let i = 0; i < total; i++) {
    if (usuario_tempo[i] == 'infancia') {
      retomar++;
    }
  }
  kpi_retomar.innerHTML = Math.round(retomar / total * 100) + '%';
}

/* ---------- NÚMEROS PESSOAIS, FILTRO E META (SELECTs 4, 5, 6 e 7) ---------- */
function atualizarPessoal() {
  let email = usuario_email[logado];
  let agora = Date.now();
  let limitePeriodo = agora - periodo * 86400000;
  let limiteSemana = agora - 7 * 86400000;

  let minutosPeriodo = 0;
  let minutosSemana = 0;
  let videosPeriodo = 0;
  let somaAcertos = 0;
  let qtdQuiz = 0;

  // SELECT 4: SUM(minutos) FROM ensaio  (no período e na semana)
  for (let e = 0; e < ensaio_min.length; e++) {
    if (ensaio_usuario[e] == email) {
      if (ensaio_data[e] > limitePeriodo) {
        minutosPeriodo += ensaio_min[e];
      }
      if (ensaio_data[e] > limiteSemana) {
        minutosSemana += ensaio_min[e];
      }
    }
  }
  // SELECT 5: COUNT(*) FROM usuario_video
  for (let a = 0; a < assistido_usuario.length; a++) {
    if (assistido_usuario[a] == email && assistido_data[a] > limitePeriodo) {
      videosPeriodo++;
    }
  }
  // SELECT 6: AVG(acertos) FROM tentativa_quiz
  for (let t = 0; t < tentativa_usuario.length; t++) {
    if (tentativa_usuario[t] == email && tentativa_data[t] > limitePeriodo) {
      somaAcertos += tentativa_acertos[t];
      qtdQuiz++;
    }
  }

  kpi_minutos.innerHTML = minutosPeriodo + ' min';
  kpi_videos.innerHTML = videosPeriodo;
  if (qtdQuiz > 0) {
    // média de acertos / 3 perguntas * 100 = nota em %
    kpi_quiz.innerHTML = Math.round(somaAcertos / qtdQuiz / 3 * 100) + '%';
  } else {
    kpi_quiz.innerHTML = '-';
  }

  // SELECT 7: meta da semana (minutos da semana x metaSemanalMin do perfil)
  p_meta_texto.innerHTML = minutosSemana + ' de ' + META + ' minutos nesta semana';
  let porcentagem = minutosSemana / META * 100;
  if (porcentagem > 100) {
    porcentagem = 100;
  }
  // NOVO: .style.width muda a largura da barra (a animação está no CSS)
  barra_meta.style.width = porcentagem + '%';
  if (minutosSemana >= META) {
    p_meta_msg.innerHTML = 'Meta batida. Sua linha está em dia!';
  } else {
    p_meta_msg.innerHTML = 'Faltam ' + (META - minutosSemana) + ' minutos para bater a meta.';
  }

  // sem nada no período? mostra a dica
  let temAtividade = false;
  if (minutosPeriodo > 0 || videosPeriodo > 0 || qtdQuiz > 0) {
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
function desenharGraficos() {
  if (window.Chart == undefined) {
    // sem internet o Chart.js não carrega
    p_erro_graficos.hidden = false;
  } else {
    p_erro_graficos.hidden = true;

    // apaga os gráficos antigos antes de desenhar os novos
    for (let i = 0; i < graficos.length; i++) {
      graficos[i].destroy();
    }
    graficos = [];

    // cores dos textos e linhas de acordo com o tema (iguais às do css/base.css)
    let corMuted = '#8e979d';
    let corTexto = '#c9cfd3';
    let corLinha = 'rgba(255,255,255,0.12)';
    if (document.documentElement.getAttribute('data-theme') == 'light') {
      corMuted = '#666d75';
      corTexto = '#363a40';
      corLinha = 'rgba(20,18,40,0.14)';
    }
    Chart.defaults.color = corMuted;
    Chart.defaults.font.family = 'Montserrat, sans-serif';

    desenharGraficosComunidade(corTexto, corLinha);
    desenharGraficosPessoais(corTexto, corLinha);
  }
}

/* gráficos da COMUNIDADE (SELECTs 8, 9 e 10) */
function desenharGraficosComunidade(corTexto, corLinha) {
  let grade = { color: corLinha };
  let semGrade = { display: false };

  // contagens: por estilo, por sentido e matriz tempo x estilo
  let porEstilo = [0, 0, 0, 0, 0];
  let porSentido = [0, 0, 0, 0];
  let porTempoEstilo = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
  for (let i = 0; i < usuario_email.length; i++) {
    let e = estilo_id.indexOf(usuario_estilo[i]);
    let s = sentido_id.indexOf(usuario_sentido[i]);
    let t = tempo_id.indexOf(usuario_tempo[i]);
    porEstilo[e]++;
    porSentido[s]++;
    porTempoEstilo[t][e]++;
  }

  // SELECT 8: estilos favoritos (radar)
  converterCor(corAtual, 0.25);
  graficos.push(new Chart(canvas_estilos, {
    type: 'radar',
    data: {
      labels: estilo_nome,
      datasets: [{
        data: porEstilo,
        borderColor: corAtual,
        backgroundColor: corConvertida,
        pointBackgroundColor: corAtual,
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: semGrade },
      scales: {
        r: {
          grid: grade,
          angleLines: grade,
          ticks: { display: false, backdropColor: 'transparent' },
          pointLabels: { color: corTexto, font: { size: 12 } }
        }
      }
    }
  }));

  // SELECT 9: o que a dança representa (barras na horizontal)
  graficos.push(new Chart(canvas_sentidos, {
    type: 'bar',
    data: {
      labels: sentido_nome,
      datasets: [{
        data: porSentido,
        backgroundColor: ['#ff5fa2', '#3fd6c0', '#ff6a4d', '#8b7bff'],
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: { legend: semGrade },
      scales: {
        x: { grid: grade, ticks: { precision: 0 } },
        y: { grid: semGrade }
      }
    }
  }));

  // SELECT 10: nível de experiência por estilo (colunas empilhadas)
  let conjuntos = [];
  for (let e = 0; e < estilo_id.length; e++) {
    conjuntos.push({
      label: estilo_nome[e],
      backgroundColor: estilo_cor[e],
      borderRadius: 4,
      data: [porTempoEstilo[0][e], porTempoEstilo[1][e], porTempoEstilo[2][e]]
    });
  }
  graficos.push(new Chart(canvas_niveis, {
    type: 'bar',
    data: { labels: tempo_nome, datasets: conjuntos },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: corTexto, boxWidth: 12 } } },
      scales: {
        x: { stacked: true, grid: semGrade },
        y: { stacked: true, grid: grade, ticks: { precision: 0 } }
      }
    }
  }));
}

/* gráficos PESSOAIS (SELECTs 11, 12 e 13) */
function desenharGraficosPessoais(corTexto, corLinha) {
  let grade = { color: corLinha };
  let semGrade = { display: false };
  let email = usuario_email[logado];
  let limitePeriodo = Date.now() - periodo * 86400000;

  // SELECT 11: minutos por dia (linha)
  calcularMinutosPorDia(periodo);
  let raioPonto = 4;
  if (periodo > 7) {
    raioPonto = 0;
  }
  converterCor(corAtual, 0.18);
  graficos.push(new Chart(canvas_ensaio, {
    type: 'line',
    data: {
      labels: dias_rotulo,
      datasets: [{
        label: 'Minutos',
        data: dias_minutos,
        borderColor: corAtual,
        backgroundColor: corConvertida,
        fill: true,
        tension: 0.35,
        pointRadius: raioPonto,
        pointBackgroundColor: corAtual
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: semGrade },
      scales: {
        x: { grid: semGrade, ticks: { maxTicksLimit: 8 } },
        y: { grid: grade, beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  }));

  // SELECT 12: vídeos assistidos por estilo (rosca). Junta usuario_video com video
  let videosPorEstilo = [0, 0, 0, 0, 0];
  for (let a = 0; a < assistido_usuario.length; a++) {
    if (assistido_usuario[a] == email && assistido_data[a] > limitePeriodo) {
      let estiloDoVideo = video_estilo[assistido_video[a]];
      videosPorEstilo[estilo_id.indexOf(estiloDoVideo)]++;
    }
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

  // SELECT 13: nota média dos quizzes por estilo (só estilos com quiz feito)
  let rotulosQuiz = [];
  let notasQuiz = [];
  let coresQuiz = [];
  for (let e = 0; e < estilo_id.length; e++) {
    let soma = 0;
    let qtd = 0;
    for (let t = 0; t < tentativa_usuario.length; t++) {
      if (tentativa_usuario[t] == email && tentativa_estilo[t] == estilo_id[e] && tentativa_data[t] > limitePeriodo) {
        soma += tentativa_acertos[t];
        qtd++;
      }
    }
    if (qtd > 0) {
      rotulosQuiz.push(estilo_nome[e]);
      notasQuiz.push(Math.round(soma / qtd / 3 * 100));
      coresQuiz.push(estilo_cor[e]);
    }
  }
  graficos.push(new Chart(canvas_quiz, {
    type: 'bar',
    data: {
      labels: rotulosQuiz,
      datasets: [{ data: notasQuiz, backgroundColor: coresQuiz, borderRadius: 8 }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: semGrade },
      scales: { x: { grid: semGrade }, y: { grid: grade, min: 0, max: 100 } }
    }
  }));
}

/* ---------- CRONÔMETRO DE ENSAIO ---------- */

/* roda a cada meio segundo e mostra mm:ss. O % (resto da divisão) separa os segundos */
function atualizarCronometro() {
  let segundos = Math.floor((Date.now() - cron_inicio) / 1000);
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
  if (cron_timer == null) {
    cron_inicio = Date.now();
    cron_timer = setInterval(atualizarCronometro, 500);
    btn_cronometro.innerHTML = 'Terminar ensaio';
    div_cronometro.className = 'timer run';
  } else {
    clearInterval(cron_timer);
    cron_timer = null;
    let minutos = Math.round((Date.now() - cron_inicio) / 60000);
    if (minutos < 1) {
      minutos = 1;
    }
    btn_cronometro.innerHTML = 'Começar ensaio';
    div_cronometro.className = 'timer';
    div_cronometro.innerHTML = '00:00';
    adicionarEnsaio(minutos, 'Ensaio registrado: ' + minutos + ' min.');
  }
}

/* INSERT em ensaio (cronômetro e botões +15 / +30) e atualiza o painel */
function adicionarEnsaio(minutos, mensagem) {
  inserirEnsaio(estiloAtual, minutos);
  mostrarAviso(mensagem);
  atualizarPainel();
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
