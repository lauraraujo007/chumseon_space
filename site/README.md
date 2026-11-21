# Chumseon Space

Site de dança feito com HTML, CSS e JavaScript puros (sem framework), com banco de dados MySQL.
Os dados do site rodam no navegador (vetores + localStorage) para o front-end funcionar sozinho;
o banco de verdade está em `banco/chumseon_space.sql`.

## Como abrir no VS Code
1. Abra a pasta `chumseon-space` no VS Code (Arquivo > Abrir Pasta).
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

A internet é necessária para as fontes (Google Fonts) e para os gráficos (Chart.js).
Conta de teste: `demo@chumseon.space` / `123456`.

## Estrutura
```
chumseon-space/
├── index.html       home (preloader, energia do dia, cards de estilos, vídeos, quiz)
├── cadastro.html    criar conta
├── login.html       entrar
├── dashboard.html   painel (só com login): KPIs e gráficos
├── calculos.html    cálculos da dança (BPM, calorias, regularidade, binário)
├── sobre.html       por que este tema + informações pessoais
├── banco/
│   └── chumseon_space.sql   tabelas, dados, views e os SELECTs do dashboard
├── css/  base.css (todas) + um CSS por página (home, auth, dashboard, calculos, sobre)
└── js/   dados.js + app.js (todas) + um JS por página
```
Cada página carrega `css/base.css` + o CSS dela, e `js/dados.js` + `js/app.js` + o JS dela (nessa ordem).
O JS de cada página termina chamando `iniciarPagina('nome-da-pagina')`.

## Onde está cada exigência do projeto

### Banco de dados (`banco/chumseon_space.sql`)
| Exigência | Onde |
|---|---|
| Relacionamento **1:N** | `estilo` -> `usuario`, `estilo` -> `video`, `usuario` -> `ensaio`, `usuario` -> `tentativa_quiz` |
| Relacionamento **1:1** | `usuario` -> `perfil_usuario` (a PK do perfil é também a FK do usuário) |
| Relacionamento **N:N** | `usuario` x `video`, resolvido pela tabela `usuario_video` (PK composta + data em que assistiu) |
| **View** | `vw_resumo_usuario` e `vw_estilos_comunidade` |
| Dashboard e KPIs ligados ao banco | seção "SELECTs DO DASHBOARD": cada KPI e gráfico tem um SELECT numerado |
| Extras da aula | `GROUP BY`/`HAVING`, subquery (`NOT IN`, `NOT EXISTS`, filtro, coluna), funções matemáticas (`ROUND`, `TRUNCATE`, `CEIL`, `FLOOR`, `MOD`, `SQRT`, `POWER`) |

Os SELECTs têm o mesmo número dos comentários `SELECT n` em `js/dashboard.js`.
No site, o "SELECT" é feito com `for` + `if` sobre os vetores; no projeto real vira uma consulta no MySQL.

### Algoritmos (JavaScript)
| Conteúdo | Exemplos |
|---|---|
| **Variáveis** | `let` em todos os arquivos (`let periodo = 7;`, `let META = 180;`) |
| **Funções** | todas as ações são funções chamadas por `onclick` (`cadastrar()`, `entrar()`, `calcularContagem()`...) e funções com parâmetro (`montarOpcoes(...)`, `aplicarEstilo(id)`) |
| **Operações matemáticas** | `+ - * / % **` em `calculos.js` e `dashboard.js` (porcentagens, médias, tempo do cronômetro) |
| **Condicionais** | `if / else if / else` na validação do cadastro (`cadastro.js`), no login, nas notas e na meta |
| **Repetições** | `for` (contagens e gráficos), `for` decrescente (binário, dias), `while` (`pegarPrimeiroNome`, `converterBinario`) |
| **Vetores** | as tabelas inteiras (`dados.js`), `push`, `includes`, `indexOf`, `length`, vetor de vetores nas perguntas do quiz |

### Arquitetura de Computadores e Matemática (`calculos.html`)
- **Contagem de 8 pelo BPM**: divisão, multiplicação e resto da divisão (`%`).
- **Calorias do ensaio**: `kcal = MET x peso x horas`.
- **Minha regularidade**: média, desvio padrão (potência e raiz quadrada) usando os dados do banco.
- **Número em binário**: divisões sucessivas por 2 e conferência com potências de 2.
- Também: conversão de cor hexadecimal para rgba (`converterCor`, base 16) e o cronômetro (resto da divisão).

## O que ainda não foi visto em aula (e por quê)
Ficou o mínimo possível, e tudo está comentado com **NOVO** no código:
- `localStorage` + `JSON` (só em `salvarBanco()` e `carregarBanco()`): é o que guarda os vetores no navegador, porque o MySQL não está ligado.
- `setInterval` / `setTimeout`: preloader, cronômetro e aviso.
- `style.setProperty`, `setAttribute`, `scrollIntoView`: trocar a cor do tema e rolar a página.
- Chart.js: a biblioteca dos gráficos (a configuração `{ ... }` é do próprio Chart.js).
- `return false` no `onsubmit` dos formulários: só impede a página de recarregar.

Ainda não vimos `return`, então as funções que calculam algo guardam o resultado em uma variável global
(como no exemplo do contador).

## Para ligar no Node.js + MySQL
Cada função `inserir...` do `js/dados.js` vira uma rota com `INSERT`, e cada `for` de contagem do
`js/dashboard.js` vira o `SELECT` de mesmo número do arquivo SQL.
Login: o e-mail fica em `sessionStorage.EMAIL_USUARIO` (mesmo modelo de sessão usado na SPTech).

## O que mexer
- **Cor de destaque:** `css/base.css`, variável `--accent`. As cores dos estilos estão em `estilo_cor` no `js/dados.js`.
- **Vídeos:** `js/dados.js`, vetor `video_yt`. Cole o ID do YouTube na posição do vídeo.
- **Perguntas do quiz:** `js/dados.js`, vetores `pergunta_...`.
- **Meta semanal de ensaio:** `usuario_meta` (no SQL, `perfil_usuario.metaSemanalMin`).
- **Textos pessoais:** `sobre.html` (procure por `EDITE`).
