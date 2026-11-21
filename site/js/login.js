/* ==========================================================================
   login.js  |  só de login.html
   Depende de: dados.js (vetores, pegarPrimeiroNome) e app.js (guardarMensagem).
   Ligações com o HTML (ids): form_login, input_email, input_senha, p_erro_login.
   Conta de teste: demo@chumseon.space  /  senha 123456
   ========================================================================== */

/* botão "Entrar": SELECT ... FROM usuario WHERE email = ? AND senha = ? */
function entrar() {
  let email = input_email.value.trim().toLowerCase();
  let senha = input_senha.value;

  let achou = -1;
  for (let i = 0; i < usuario_email.length; i++) {
    if (usuario_email[i] == email && usuario_senha[i] == senha && senha != '') {
      achou = i;
    }
  }

  if (achou == -1) {
    p_erro_login.innerHTML = 'E-mail ou senha incorretos.';
  } else {
    p_erro_login.innerHTML = '';
    sessionStorage.EMAIL_USUARIO = email;   // guarda quem entrou (sessão do navegador)
    pegarPrimeiroNome(usuario_nome[achou]);
    guardarMensagem('Bem-vindo(a), ' + primeiroNome + '.');
    location.href = 'dashboard.html';
  }
}

/* ---------- INÍCIO ---------- */
iniciarPagina('login');

// se veio do cadastro, já preenche o e-mail
let emailCadastrado = sessionStorage.EMAIL_CADASTRADO;
if (emailCadastrado != undefined) {
  input_email.value = emailCadastrado;
  sessionStorage.removeItem('EMAIL_CADASTRADO');
}
