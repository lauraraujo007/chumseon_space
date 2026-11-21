/* ==========================================================================
   dados.js  |  o "banco de dados de mentira" do site (roda no navegador)
   Carregado em TODAS as páginas, antes do app.js.

   COMO LER ESTE ARQUIVO
   - Cada TABELA do MySQL (banco/chumseon_space.sql) vira um grupo de VETORES.
   - Cada COLUNA é um vetor. A POSIÇÃO i é a linha:
     usuario_nome[3] e usuario_email[3] pertencem ao MESMO usuário.
   - Relacionamentos:
       1:N  estilo -> usuario   (usuario_estilo guarda o id do estilo)
       1:1  usuario -> perfil   (usuario_meta tem a MESMA posição de usuario_nome)
       N:N  usuario x video     (assistido_usuario + assistido_video = tabela do meio)
   - NO PROJETO REAL: cada função "inserir..." vira um INSERT no MySQL
     e cada "for" que conta coisas vira um SELECT com GROUP BY.

   Só existe UMA coisa aqui que ainda não vimos em aula: guardar os vetores no
   navegador (localStorage + JSON), porque o MySQL não está ligado. Está tudo
   dentro de salvarBanco() e carregarBanco().
   ========================================================================== */

/* ---------- TABELAS DE APOIO (valores fixos) ---------- */

/* tabela estilo: id, nome e cor. A cor muda o site inteiro (variável --accent) */
let estilo_id = ['ballet', 'hiphop', 'contemporaneo', 'kpop', 'outro'];
let estilo_nome = ['Ballet clássico', 'Hip-hop e urbanas', 'Contemporâneo', 'K-pop', 'Outro'];
let estilo_cor = ['#8b7bff', '#ff6a4d', '#3fd6c0', '#ff5fa2', '#9aa3a9'];

/* tabela tempo_pratica: o contato da pessoa com a dança */
let tempo_id = ['curioso', 'infancia', 'pratica'];
let tempo_nome = ['Iniciante curioso', 'Já pratiquei na infância', 'Pratico atualmente'];

/* tabela sentido: o que a dança representa */
let sentido_id = ['emocao', 'saude', 'estresse', 'arte'];
let sentido_nome = ['Expressão emocional', 'Saúde e disciplina', 'Desconexão do estresse', 'Arte e estética'];

/* tabela video (1:N com estilo): 3 vídeos por estilo.
   video_yt = ID do YouTube. Deixe '' para "vídeo em breve" e cole o ID quando tiver. */
let video_estilo = [
  'ballet', 'ballet', 'ballet',
  'hiphop', 'hiphop', 'hiphop',
  'contemporaneo', 'contemporaneo', 'contemporaneo',
  'kpop', 'kpop', 'kpop',
  'outro', 'outro', 'outro'
];
let video_titulo = [
  'Postura e alinhamento em 5 minutos', 'Primeiros passos na barra', 'Port de bras para iniciantes',
  'Fundamentos: bounce e rock', 'Isolações de peito e quadril', 'Freestyle sem medo',
  'Respiração e peso', 'Trabalho de chão básico', 'Fluxo e improviso',
  'Aquecimento para coreografias', 'Contagem e precisão', 'Aprenda uma coreografia em 4 passos',
  'Aquecimento geral para dançar', 'Consciência corporal', 'Criando seus primeiros movimentos'
];
let video_nivel = [
  'Iniciante', 'Iniciante', 'Básico',
  'Iniciante', 'Básico', 'Todos os níveis',
  'Iniciante', 'Básico', 'Todos os níveis',
  'Iniciante', 'Básico', 'Todos os níveis',
  'Iniciante', 'Básico', 'Todos os níveis'
];
let video_yt = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

/* perguntas do mini quiz (3 por estilo). pergunta_opcoes é um vetor de vetores:
   pergunta_opcoes[2][0] = primeira opção da terceira pergunta.
   pergunta_certa guarda a POSIÇÃO da opção certa. */
let pergunta_estilo = [
  'ballet', 'ballet', 'ballet',
  'hiphop', 'hiphop', 'hiphop',
  'contemporaneo', 'contemporaneo', 'contemporaneo',
  'kpop', 'kpop', 'kpop',
  'outro', 'outro', 'outro'
];
let pergunta_texto = [
  'O que significa “plié”?',
  'O que o ballet clássico mais trabalha?',
  'Onde costuma começar uma aula de ballet?',
  'O que é o “bounce”?',
  'O que é uma isolação?',
  'O que é freestyle?',
  'Qual o papel da respiração no contemporâneo?',
  'O que é o trabalho de chão?',
  'Qual ideia combina com o contemporâneo?',
  'O que as coreografias de K-pop mais pedem?',
  'Por que contar os tempos ajuda?',
  'Antes de aprender uma coreografia, o ideal é:',
  'Para que serve o aquecimento?',
  'O que é consciência corporal?',
  'Beber água durante o ensaio é:'
];
let pergunta_opcoes = [
  ['Dobrar os joelhos', 'Saltar', 'Girar', 'Esticar os braços'],
  ['Improviso livre', 'Precisão e postura', 'Quebras de ritmo', 'Só trabalho no chão'],
  ['Na barra', 'No espelho do teto', 'No palco vazio', 'Fora da sala'],
  ['Quicar no ritmo com os joelhos', 'Um salto mortal', 'Um giro no chão', 'Parar de mãos'],
  ['Mexer uma parte do corpo mantendo o resto parado', 'Dançar sozinho', 'Dançar sem música', 'Dançar no chão'],
  ['Coreografia decorada', 'Improvisar no ritmo', 'Aula de alongamento', 'Um passo de ballet'],
  ['Guiar o movimento', 'Atrapalhar', 'Só serve no fim', 'Nenhum'],
  ['Usar o chão e o peso do corpo', 'Dançar só em pé', 'Limpar o palco', 'Dançar sem música'],
  ['Fluidez e peso', 'Só passos fixos', 'Imobilidade', 'Só saltos'],
  ['Sincronia e precisão', 'Só improviso', 'Nenhum ensaio', 'Só chão'],
  ['Marca o ritmo e a sequência', 'Deixa tudo mais lento', 'Substitui o aquecimento', 'Não ajuda'],
  ['Aquecer o corpo', 'Pular o aquecimento', 'Dançar cansado', 'Ficar parado'],
  ['Preparar o corpo e evitar lesões', 'Cansar antes da hora', 'Nada', 'Só enfeite'],
  ['Perceber como o corpo se move', 'Ficar parado', 'Decorar músicas', 'Medir a altura'],
  ['Importante', 'Proibido', 'Só no fim do dia', 'Desnecessário']
];
let pergunta_certa = [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];

/* ---------- TABELAS QUE CRESCEM (usuários e atividades) ---------- */

/* tabela usuario + tabela perfil_usuario (1:1: mesma posição nos vetores) */
let usuario_nome = [];
let usuario_email = [];
let usuario_senha = [];
let usuario_estilo = [];   // fkEstilo   (1:N)
let usuario_tempo = [];    // fkTempo    (1:N)
let usuario_sentido = [];  // fkSentido  (1:N)
let usuario_criado = [];   // dtCadastro (em milissegundos)
let usuario_meta = [];     // perfil_usuario.metaSemanalMin (1:1)

/* tabela usuario_video (N:N): quem assistiu qual vídeo, e quando */
let assistido_usuario = []; // e-mail do usuário
let assistido_video = [];   // posição do vídeo nos vetores video_...
let assistido_data = [];

/* tabela ensaio (1:N com usuario) */
let ensaio_usuario = [];
let ensaio_estilo = [];
let ensaio_min = [];
let ensaio_data = [];

/* tabela tentativa_quiz (1:N com usuario). acertos vai de 0 a 3 */
let tentativa_usuario = [];
let tentativa_estilo = [];
let tentativa_acertos = [];
let tentativa_data = [];

/* QUEM ESTÁ LOGADO: logado = posição do usuário nos vetores (ou -1 se ninguém) */
let logado = -1;
let primeiroNome = '';   // resultado de pegarPrimeiroNome()
let assistiuAntes = false; // resultado de jaAssistiu()
let corConvertida = '';  // resultado de converterCor()
let dias_rotulo = [];    // resultado de calcularMinutosPorDia()
let dias_minutos = [];   // resultado de calcularMinutosPorDia()

/* Ainda não vimos "return", então as funções que calculam algo guardam o
   resultado numa variável global (como no exemplo do contador). */


/* ==========================================================================
   SALVAR E CARREGAR (a única parte "nova")
   localStorage guarda texto; JSON.stringify transforma os vetores em texto
   e JSON.parse transforma de volta. No projeto real isso some: os dados
   ficam no MySQL.
   ========================================================================== */
function salvarBanco() {
  let tudo = [
    usuario_nome, usuario_email, usuario_senha, usuario_estilo, usuario_tempo,
    usuario_sentido, usuario_criado, usuario_meta,
    assistido_usuario, assistido_video, assistido_data,
    ensaio_usuario, ensaio_estilo, ensaio_min, ensaio_data,
    tentativa_usuario, tentativa_estilo, tentativa_acertos, tentativa_data
  ];
  try {
    localStorage.setItem('cs_banco_v2', JSON.stringify(tudo));
  } catch (erro) {
    console.log('Não foi possível salvar no navegador.');
  }
}

function carregarBanco() {
  let t = null;
  try {
    let texto = localStorage.getItem('cs_banco_v2');
    if (texto != null) {
      t = JSON.parse(texto);
    }
  } catch (erro) {
    t = null;
  }

  if (t == null || t.length != 19) {
    // primeira vez no site: cria os dados de exemplo
    criarDadosIniciais();
    salvarBanco();
  } else {
    usuario_nome = t[0];
    usuario_email = t[1];
    usuario_senha = t[2];
    usuario_estilo = t[3];
    usuario_tempo = t[4];
    usuario_sentido = t[5];
    usuario_criado = t[6];
    usuario_meta = t[7];
    assistido_usuario = t[8];
    assistido_video = t[9];
    assistido_data = t[10];
    ensaio_usuario = t[11];
    ensaio_estilo = t[12];
    ensaio_min = t[13];
    ensaio_data = t[14];
    tentativa_usuario = t[15];
    tentativa_estilo = t[16];
    tentativa_acertos = t[17];
    tentativa_data = t[18];
  }
}


/* ==========================================================================
   DADOS DE EXEMPLO (os INSERTs de mentira)
   Usa for + Math.random + else if, como no material de números aleatórios.
   ========================================================================== */
function criarDadosIniciais() {
  /* 1) 38 dançarinos de exemplo para a comunidade ter o que mostrar */
  for (let i = 0; i < 38; i++) {
    // sorteia o estilo com "pesos": ballet 22%, hip-hop 26%, contemporâneo 30%, k-pop 16%, outro 6%
    let sorteio = Math.random() * 100;
    let estilo = 'outro';
    if (sorteio < 22) {
      estilo = 'ballet';
    } else if (sorteio < 48) {
      estilo = 'hiphop';
    } else if (sorteio < 78) {
      estilo = 'contemporaneo';
    } else if (sorteio < 94) {
      estilo = 'kpop';
    }

    sorteio = Math.random() * 100;
    let tempo = 'pratica';
    if (sorteio < 30) {
      tempo = 'curioso';
    } else if (sorteio < 62) {
      tempo = 'infancia';
    }

    sorteio = Math.random() * 100;
    let sentido = 'arte';
    if (sorteio < 30) {
      sentido = 'emocao';
    } else if (sorteio < 52) {
      sentido = 'saude';
    } else if (sorteio < 80) {
      sentido = 'estresse';
    }

    usuario_nome.push('Dançarino ' + i);
    usuario_email.push('dancarino' + i + '@exemplo.com');
    usuario_senha.push('');  // sem senha: essas contas não conseguem entrar
    usuario_estilo.push(estilo);
    usuario_tempo.push(tempo);
    usuario_sentido.push(sentido);
    usuario_criado.push(Date.now() - Math.random() * 12 * 86400000); // nos últimos 12 dias
    usuario_meta.push(180);
  }

  /* 2) a conta de teste: demo@chumseon.space  /  senha 123456 */
  let demo = 'demo@chumseon.space';
  usuario_nome.push('Conta demo');
  usuario_email.push(demo);
  usuario_senha.push('123456');
  usuario_estilo.push('contemporaneo');
  usuario_tempo.push('infancia');
  usuario_sentido.push('emocao');
  usuario_criado.push(Date.now());
  usuario_meta.push(180);

  /* 3) 24 dias de atividades da conta demo (para o painel não nascer vazio) */
  for (let d = 0; d < 24; d++) {
    let momento = Date.now() - d * 86400000 - Math.random() * 30000000;

    if (Math.random() < 0.7) {
      // ensaio de 15 a 55 minutos, de 10 em 10
      ensaio_usuario.push(demo);
      ensaio_estilo.push(estilo_id[Math.floor(Math.random() * 4)]);
      ensaio_min.push(15 + Math.floor(Math.random() * 5) * 10);
      ensaio_data.push(momento);
    }

    if (Math.random() < 0.4) {
      // vídeo assistido (a tabela N:N não aceita o mesmo vídeo duas vezes)
      let v = Math.floor(Math.random() * video_estilo.length);
      jaAssistiu(demo, v);
      if (assistiuAntes == false) {
        assistido_usuario.push(demo);
        assistido_video.push(v);
        assistido_data.push(momento);
      }
    }

    if (Math.random() < 0.25) {
      // quiz com 1, 2 ou 3 acertos
      tentativa_usuario.push(demo);
      tentativa_estilo.push(estilo_id[Math.floor(Math.random() * 4)]);
      tentativa_acertos.push(1 + Math.floor(Math.random() * 3));
      tentativa_data.push(momento);
    }
  }
}


/* ==========================================================================
   FUNÇÕES QUE AS PÁGINAS USAM
   ========================================================================== */

/* Descobre quem está logado. O e-mail fica guardado na sessão do navegador
   (sessionStorage), igual ao modelo de login que a SPTech usa no projeto. */
function identificarLogado() {
  logado = -1;
  let email = sessionStorage.EMAIL_USUARIO;
  for (let i = 0; i < usuario_email.length; i++) {
    if (usuario_email[i] == email) {
      logado = i;
    }
  }
}

/* Pega só o primeiro nome: anda letra por letra (while + [índice]) até achar o espaço */
function pegarPrimeiroNome(nomeCompleto) {
  primeiroNome = '';
  let i = 0;
  while (i < nomeCompleto.length && nomeCompleto[i] != ' ') {
    primeiroNome += nomeCompleto[i];
    i++;
  }
}

/* O usuário (e-mail) já marcou este vídeo? Resultado em assistiuAntes */
function jaAssistiu(email, video) {
  assistiuAntes = false;
  for (let i = 0; i < assistido_usuario.length; i++) {
    if (assistido_usuario[i] == email && assistido_video[i] == video) {
      assistiuAntes = true;
    }
  }
}

/* INSERT em ensaio */
function inserirEnsaio(estilo, minutos) {
  ensaio_usuario.push(usuario_email[logado]);
  ensaio_estilo.push(estilo);
  ensaio_min.push(minutos);
  ensaio_data.push(Date.now());
  salvarBanco();
}

/* INSERT em usuario_video */
function inserirAssistido(video) {
  assistido_usuario.push(usuario_email[logado]);
  assistido_video.push(video);
  assistido_data.push(Date.now());
  salvarBanco();
}

/* INSERT em tentativa_quiz */
function inserirTentativa(estilo, acertos) {
  tentativa_usuario.push(usuario_email[logado]);
  tentativa_estilo.push(estilo);
  tentativa_acertos.push(acertos);
  tentativa_data.push(Date.now());
  salvarBanco();
}

/* Minutos de ensaio do usuário logado em cada um dos últimos "qtdDias" dias.
   É o SELECT do gráfico "Meu tempo de ensaio":
   SELECT DATE(dtEnsaio), SUM(minutos) FROM ensaio ... GROUP BY DATE(dtEnsaio)
   Resultado nos vetores dias_rotulo (ex.: '21/11') e dias_minutos. */
function calcularMinutosPorDia(qtdDias) {
  dias_rotulo = [];
  dias_minutos = [];
  let email = usuario_email[logado];

  // for decrescente: do dia mais antigo até hoje
  for (let i = qtdDias - 1; i >= 0; i--) {
    let dia = new Date(Date.now() - i * 86400000);
    let chaveDia = dia.getDate() + '/' + dia.getMonth() + '/' + dia.getFullYear();
    let soma = 0;

    for (let e = 0; e < ensaio_min.length; e++) {
      let diaEnsaio = new Date(ensaio_data[e]);
      let chaveEnsaio = diaEnsaio.getDate() + '/' + diaEnsaio.getMonth() + '/' + diaEnsaio.getFullYear();
      if (ensaio_usuario[e] == email && chaveEnsaio == chaveDia) {
        soma += ensaio_min[e];
      }
    }

    dias_rotulo.push(dia.getDate() + '/' + (dia.getMonth() + 1));
    dias_minutos.push(soma);
  }
}

/* Transforma uma cor hexadecimal (#8b7bff) em rgba com transparência.
   Cada par de letras do hexa é um número na base 16 (parseInt(..., 16)).
   Resultado em corConvertida. */
function converterCor(hex, alfa) {
  let vermelho = parseInt(hex.slice(1, 3), 16);
  let verde = parseInt(hex.slice(3, 5), 16);
  let azul = parseInt(hex.slice(5, 7), 16);
  corConvertida = 'rgba(' + vermelho + ',' + verde + ',' + azul + ',' + alfa + ')';
}

/* roda assim que o arquivo carrega: lê os dados salvos (ou cria os de exemplo) */
carregarBanco();
