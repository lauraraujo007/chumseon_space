/* ==========================================================================
   home.js  |  interações SÓ do index.html
   Depende de: dados.js (vetores, inserirAssistido...) e app.js (aplicarEstilo, mostrarAviso).
   Ligações com o HTML (ids):
     div_energias / p_sugestao .... botões "Qual é a sua energia hoje?" e a sugestão
     cards .sc .................... <section id="estilos"> (onclick chama escolherEstiloCard)
     div_abas / div_videos ........ abas e vídeos (<section id="dicas">)
     modal_quiz / div_quiz ........ janela (modal) do mini quiz
   ========================================================================== */

/* ENERGIAS: nome, estilo que combina e frase (vetores com a mesma posição) */
let vibe_nome = ['Leveza', 'Atitude', 'Fluidez', 'Performance'];
let vibe_estilo = ['ballet', 'hiphop', 'contemporaneo', 'kpop'];
let vibe_frase = [
  'O dia pede postura, alongamento e controle corporal',
  'O corpo pede peso, presença e conexão',
  'O momento pede movimentos leves, entrega e liberdade',
  'A vibe pede expressão facial, sincronia e energia de palco'
];

let videoTocando = -1;   // posição do vídeo que está tocando (-1 = nenhum)
let quizEstilo = '';     // estilo do quiz aberto
let quizPerguntas = [];  // posições das 3 perguntas do quiz aberto

/* ---------- ENERGIA DO DIA ---------- */
function desenharEnergias() {
  let html = '';
  for (let i = 0; i < vibe_nome.length; i++) {
    html += '<button class="vc" onclick="escolherEnergia(' + i + ')" aria-pressed="' + (vibe_estilo[i] == estiloAtual) + '">' + vibe_nome[i] + '</button>';
  }
  div_energias.innerHTML = html;
}

function escolherEnergia(i) {
  trocarEstilo(vibe_estilo[i]);
  let nomeEstilo = estilo_nome[estilo_id.indexOf(vibe_estilo[i])];
  p_sugestao.innerHTML = '<b>Hoje combina com ' + nomeEstilo + '.</b> ' + vibe_frase[i] + ' <a href="#dicas"> <br> Ver dicas em vídeo</a>';
}

/* troca o estilo (cor do site + vídeos). Usada pelas abas, cards e energias */
function trocarEstilo(id) {
  videoTocando = -1;
  aplicarEstilo(id);
}

/* clicar num card de estilo escolhe o estilo e rola até os vídeos */
function escolherEstiloCard(id) {
  trocarEstilo(id);
  // NOVO: rola a página até a seção de vídeos (id="dicas")
  dicas.scrollIntoView();
}

/* ---------- VÍDEOS ----------
   Desenha as abas e os vídeos do estilo escolhido. É o SELECT:
   SELECT * FROM video WHERE fkEstilo = <estilo escolhido> */
function desenharVideos() {
  let k = estiloAtual;
  if (k == null) {
    k = 'ballet';
  }

  let abas = '';
  for (let i = 0; i < estilo_id.length; i++) {
    abas += '<button class="tab" role="tab" onclick="trocarEstilo(\'' + estilo_id[i] + '\')" aria-selected="' + (estilo_id[i] == k) + '">' + estilo_nome[i] + '</button>';
  }
  div_abas.innerHTML = abas;
  p_dica_estilo.innerHTML = 'Dicas para quem quer treinar ' + estilo_nome[estilo_id.indexOf(k)] + '.';

  let cards = '';
  for (let v = 0; v < video_estilo.length; v++) {
    if (video_estilo[v] == k) {
      let miniatura = '<svg viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 140 C 90 30,160 190,330 50"/></svg><span class="play" aria-hidden="true">&#9654;</span>';
      if (v == videoTocando) {
        miniatura = '<iframe src="https://www.youtube-nocookie.com/embed/' + video_yt[v] + '?autoplay=1" title="' + video_titulo[v] + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      }
      let aviso = '';
      if (video_yt[v] == '') {
        aviso = ' · vídeo em breve';
      }
      cards += '<div class="vcard"><button class="vid" onclick="tocarVideo(' + v + ')"><div class="thumb">' + miniatura + '</div><strong>' + video_titulo[v] + '</strong><small>' + video_nivel[v] + aviso + '</small></button><button class="ok" onclick="marcarAssistido(' + v + ')">Marcar como assistido</button></div>';
    }
  }
  div_videos.innerHTML = cards;
}

function tocarVideo(v) {
  if (video_yt[v] == '') {
    mostrarAviso('Espaço para vídeo: cole o ID do YouTube em video_yt (js/dados.js).');
  } else {
    videoTocando = v;
    desenharVideos();
  }
}

/* "Marcar como assistido": INSERT na tabela N:N usuario_video e abre o quiz */
function marcarAssistido(v) {
  if (logado == -1) {
    mostrarAviso('Entre na sua conta para registrar suas atividades.');
  } else {
    jaAssistiu(usuario_email[logado], v);
    if (assistiuAntes) {
      mostrarAviso('Este vídeo já estava marcado. Vamos ao quiz!');
    } else {
      inserirAssistido(v);
      mostrarAviso('Vídeo marcado como assistido.');
    }
    abrirQuiz(video_estilo[v], video_titulo[v]);
  }
}

/* ---------- MINI QUIZ (3 perguntas por estilo) ---------- */
function abrirQuiz(k, titulo) {
  quizEstilo = k;
  quizPerguntas = [];
  for (let i = 0; i < pergunta_estilo.length; i++) {
    if (pergunta_estilo[i] == k) {
      quizPerguntas.push(i);
    }
  }

  let html = '<h3 id="qt">Mini quiz: ' + estilo_nome[estilo_id.indexOf(k)] + '</h3>';
  html += '<p class="hint" style="margin:0">Depois de “' + titulo + '”. São 3 perguntas rápidas.</p>';
  html += '<form id="form_quiz" novalidate>';

  for (let n = 0; n < quizPerguntas.length; n++) {
    let p = quizPerguntas[n];

    // embaralha a ordem das opções: sorteia uma posição de 0 até j e troca de lugar
    let ordem = [];
    for (let j = 0; j < pergunta_opcoes[p].length; j++) {
      ordem.push(j);
    }
    for (let j = ordem.length - 1; j > 0; j--) {
      let sorteada = Math.floor(Math.random() * (j + 1));
      let guardada = ordem[j];
      ordem[j] = ordem[sorteada];
      ordem[sorteada] = guardada;
    }

    html += '<fieldset class="q"><legend>' + pergunta_texto[p] + '</legend><div class="chips">';
    for (let j = 0; j < ordem.length; j++) {
      html += '<label class="chip"><input type="radio" name="q' + n + '" value="' + ordem[j] + '"><span>' + pergunta_opcoes[p][ordem[j]] + '</span></label>';
    }
    html += '</div></fieldset>';
  }

  html += '<p class="err" id="p_erro_quiz" role="alert"></p>';
  html += '<div class="row"><button class="pill solid" type="button" onclick="enviarQuiz()">Enviar respostas</button>';
  html += '<button class="pill" type="button" onclick="fecharQuiz()">Agora não</button></div></form>';

  div_quiz.innerHTML = html;
  modal_quiz.hidden = false;
}

/* corrige o quiz: conta os acertos e faz o INSERT em tentativa_quiz */
function enviarQuiz() {
  let acertos = 0;
  let faltou = false;

  for (let n = 0; n < quizPerguntas.length; n++) {
    let resposta = form_quiz['q' + n].value;   // '' = não marcou nada
    if (resposta == '') {
      faltou = true;
    } else if (Number(resposta) == pergunta_certa[quizPerguntas[n]]) {
      acertos++;
    }
  }

  if (faltou) {
    p_erro_quiz.innerHTML = 'Responda as 3 perguntas.';
  } else {
    fecharQuiz();
    inserirTentativa(quizEstilo, acertos);
    mostrarAviso('Você acertou ' + acertos + ' de 3. A nota foi para o seu painel.');
  }
}

function fecharQuiz() {
  modal_quiz.hidden = true;
}

/* tecla Esc fecha o quiz */
function teclaApertada(evento) {
  if (evento.key == 'Escape') {
    fecharQuiz();
  }
}
document.onkeydown = teclaApertada;

/* ---------- INÍCIO ---------- */
iniciarPagina('home');
desenharEnergias();
desenharVideos();
