let estilo_id = ['ballet', 'hiphop', 'contemporaneo', 'kpop', 'outro'];
let estilo_nome = ['Ballet clássico', 'Hip-hop e urbanas', 'Contemporâneo', 'K-pop', 'Outro'];
let estilo_cor = ['#8b7bff', '#ff6a4d', '#3fd6c0', '#ff5fa2', '#9aa3a9'];

let tempo_id = ['curioso', 'infancia', 'pratica'];
let tempo_nome = ['Iniciante curioso', 'Já pratiquei na infância', 'Pratico atualmente'];
let sentido_id = ['emocao', 'saude', 'estresse', 'arte'];
let sentido_nome = ['Expressão emocional', 'Saúde e disciplina', 'Desconexão do estresse', 'Arte e estética'];

let logado = -1;
let primeiroNome = '';  
let corConvertida = ''; 

function identificarLogado() {
  logado = -1;
  let id = sessionStorage.ID_USUARIO;
  if (id != undefined) {
    logado = Number(id);
  }
}

function pegarPrimeiroNome(nomeCompleto) {
  primeiroNome = '';
  let i = 0;
  while (i < nomeCompleto.length && nomeCompleto[i] != ' ') {
    primeiroNome += nomeCompleto[i];
    i++;
  }
}

function converterCor(hex, alfa) {
  let vermelho = parseInt(hex.slice(1, 3), 16);
  let verde = parseInt(hex.slice(3, 5), 16);
  let azul = parseInt(hex.slice(5, 7), 16);
  corConvertida = 'rgba(' + vermelho + ',' + verde + ',' + azul + ',' + alfa + ')';
}