/* ==========================================================================
   calculos.js  |  só de calculos.html  (Arquitetura de Computadores e Matemática)
   Quatro cálculos que fazem sentido para quem dança.
   Cada um lê campos (input_...), calcula e escreve na tela (div_resultado_...).
   Os símbolos matemáticos usados:
     + - * /  operações básicas        %  resto da divisão (MOD no MySQL)
     **       potência (POWER)         Math.sqrt  raiz quadrada (SQRT)
     Math.floor / Math.round           (FLOOR / ROUND do MySQL)
   ========================================================================== */

/* ---------- 1) CONTAGEM DE 8: do BPM da música ao tempo da coreografia ----------
   BPM = batidas (tempos) por minuto.
   segundos por tempo     = 60 / BPM
   segundos por contagem  = 8 * 60 / BPM
   tempos na coreografia  = minutos * BPM */
function calcularContagem() {
  let bpm = Number(input_bpm.value.replace(',', '.'));
  let minutos = Number(input_duracao.value.replace(',', '.'));

  if (bpm > 0 && minutos > 0) {
    let segPorTempo = 60 / bpm;
    let segPorContagem = 8 * segPorTempo;
    let totalTempos = Math.floor(minutos * bpm);
    let contagensCompletas = Math.floor(totalTempos / 8);   // quantas "contagens de 8" cabem
    let sobra = totalTempos % 8;                             // tempos que sobram (resto da divisão)

    div_resultado_contagem.innerHTML = `
      Cada tempo dura <b>${segPorTempo.toFixed(2)} s</b> e cada contagem de 8 dura <b>${segPorContagem.toFixed(2)} s</b>.<br>
      Em ${minutos} min cabem <b>${totalTempos} tempos</b> = <b>${contagensCompletas} contagens de 8</b>
      e sobram ${sobra} tempo(s).`;
  } else {
    div_resultado_contagem.innerHTML = 'Digite o BPM e a duração com números maiores que zero.';
  }
}

/* ---------- 2) CALORIAS DO ENSAIO ----------
   Estimativa pelo MET (esforço da atividade): kcal = MET * peso(kg) * horas
   Os MET abaixo são valores aproximados de referência, só para o cálculo. */
function calcularCalorias() {
  let peso = Number(input_peso.value.replace(',', '.'));
  let minutos = Number(input_min_cal.value.replace(',', '.'));
  let estilo = select_estilo_cal.value;

  // quanto mais intenso o estilo, maior o MET
  let met = 5;
  if (estilo == 'ballet') {
    met = 5;
  } else if (estilo == 'hiphop') {
    met = 7;
  } else if (estilo == 'contemporaneo') {
    met = 5;
  } else if (estilo == 'kpop') {
    met = 6.5;
  } else {
    met = 5;
  }

  if (peso > 0 && minutos > 0) {
    let horas = minutos / 60;
    let kcal = met * peso * horas;
    div_resultado_calorias.innerHTML = `
      MET do estilo: <b>${met}</b> &nbsp;·&nbsp; tempo: ${horas.toFixed(2)} h<br>
      ${met} × ${peso} kg × ${horas.toFixed(2)} h = <b>cerca de ${kcal.toFixed(0)} kcal</b>.<br>
      <small>É só uma estimativa: o gasto real muda de pessoa para pessoa.</small>`;
  } else {
    div_resultado_calorias.innerHTML = 'Digite o peso e os minutos com números maiores que zero.';
  }
}

/* ---------- 3) MINHA REGULARIDADE: média e desvio padrão ----------
   Usa os minutos de ensaio dos últimos 7 dias do usuário logado (tabela ensaio).
   média    = soma dos minutos / 7
   variância = soma de (minutos do dia - média) ao quadrado / 7
   desvio   = raiz quadrada da variância
   coeficiente de variação = desvio / média * 100   (quanto menor, mais regular) */
function calcularRegularidade() {
  if (logado == -1) {
    div_resultado_regularidade.innerHTML = 'Entre na sua conta para usar os seus dados de ensaio. <a href="login.html">Entrar</a>';
  } else {
    calcularMinutosPorDia(7);   // preenche dias_rotulo e dias_minutos

    let soma = 0;
    for (let i = 0; i < dias_minutos.length; i++) {
      soma += dias_minutos[i];
    }
    let media = soma / dias_minutos.length;

    if (soma == 0) {
      div_resultado_regularidade.innerHTML = 'Você ainda não registrou ensaios nos últimos 7 dias. Use o cronômetro no dashboard.';
    } else {
      let somaQuadrados = 0;
      let lista = '';
      for (let i = 0; i < dias_minutos.length; i++) {
        let diferenca = dias_minutos[i] - media;
        somaQuadrados += diferenca ** 2;   // potência
        lista += dias_rotulo[i] + ': ' + dias_minutos[i] + ' min<br>';
      }
      let variancia = somaQuadrados / dias_minutos.length;
      let desvio = Math.sqrt(variancia);   // raiz quadrada
      let coeficiente = desvio / media * 100;

      let classificacao = 'muito irregular: tente distribuir melhor os dias';
      if (coeficiente < 50) {
        classificacao = 'bem regular: sua linha está constante';
      } else if (coeficiente < 100) {
        classificacao = 'meio irregular: alguns dias pesam mais que outros';
      }

      div_resultado_regularidade.innerHTML = `
        ${lista}<br>
        Média: <b>${media.toFixed(1)} min/dia</b> &nbsp;·&nbsp; desvio padrão: <b>${desvio.toFixed(1)} min</b><br>
        Coeficiente de variação: <b>${coeficiente.toFixed(0)}%</b> → ${classificacao}.`;
    }
  }
}

/* ---------- 4) NÚMERO EM BINÁRIO (como o computador enxerga) ----------
   Divide por 2 até chegar a 0. Os restos, lidos de trás para frente, são o binário.
   Depois confere: cada bit vale 2 elevado à sua posição. */
function converterBinario() {
  let numero = Number(input_decimal.value);

  if (numero >= 0 && numero % 1 == 0 && numero <= 100000 && input_decimal.value != '') {
    let restos = [];
    let passos = '';
    let n = numero;

    if (n == 0) {
      restos.push(0);
    }
    while (n > 0) {
      let resto = n % 2;
      passos += n + ' ÷ 2 = ' + Math.floor(n / 2) + ' resto ' + resto + '<br>';
      restos.push(resto);
      n = Math.floor(n / 2);
    }

    // lê os restos de trás para frente (for decrescente)
    let binario = '';
    for (let i = restos.length - 1; i >= 0; i--) {
      binario += restos[i];
    }

    // conferência: cada bit vale 2 ** posição
    let conferencia = '';
    let total = 0;
    for (let i = 0; i < restos.length; i++) {
      total += restos[i] * 2 ** i;
    }
    for (let i = restos.length - 1; i >= 0; i--) {
      conferencia += restos[i] + '×2<sup>' + i + '</sup>';
      if (i > 0) {
        conferencia += ' + ';
      }
    }

    div_resultado_binario.innerHTML = `
      ${passos}
      <br><b>${numero}</b> em binário é <b>${binario}</b><br>
      Conferindo: ${conferencia} = <b>${total}</b>`;
  } else {
    div_resultado_binario.innerHTML = 'Digite um número inteiro de 0 até 100000.';
  }
}

/* ---------- INÍCIO ---------- */
iniciarPagina('calculos');
