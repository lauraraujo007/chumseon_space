
function entrar() {
  let email = input_email.value.trim().toLowerCase();
  let senha = input_senha.value;

  if (email == '' || senha == '') {
    p_erro_login.innerHTML = 'Preencha e-mail e senha.';
  } else {
    fetch('/usuarios/autenticar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailServer: email, senhaServer: senha })
    }).then(function (resposta) {
      if (resposta.ok) {
        resposta.json().then(function (json) {
          p_erro_login.innerHTML = '';
          sessionStorage.ID_USUARIO = json.idUsuario;
          sessionStorage.NOME_USUARIO = json.nome;
          sessionStorage.EMAIL_USUARIO = json.email;
          sessionStorage.ESTILO_USUARIO = json.estilo;
          sessionStorage.META_USUARIO = json.meta;
          pegarPrimeiroNome(json.nome);
          guardarMensagem('Bem-vindo(a), ' + primeiroNome + '.');
          location.href = 'dashboard.html';
        });
      } else if (resposta.status == 403) {
        p_erro_login.textContent = 'E-mail ou senha incorretos.';
      } else {
        resposta.text().then(function (texto) {
          p_erro_login.textContent = texto;
        });
      }
    }).catch(function (erroFetch) {
      console.log(erroFetch);
      p_erro_login.innerHTML = 'Não foi possível falar com o servidor. Ele está ligado?';
    });
  }
}

iniciarPagina('login');

let emailCadastrado = sessionStorage.EMAIL_CADASTRADO;
if (emailCadastrado != undefined) {
  input_email.value = emailCadastrado;
  sessionStorage.removeItem('EMAIL_CADASTRADO');
}
