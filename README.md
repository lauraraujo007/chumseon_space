 <div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:8b7bff,100:948ade&height=120&section=header" alt="" width="100%" />

<img src="./assets/logo-circular.svg" alt="Logo Chumseon Space" width="130" />

# Chumseon Space

### 춤선 — A linha que a dança desenha no espaço.

**Um espaço para descobrir, praticar e acompanhar sua evolução na dança.**

<img src="https://img.shields.io/badge/HTML5-Site-8b7bff?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
<img src="https://img.shields.io/badge/CSS3-Estilização-948ade?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
<img src="https://img.shields.io/badge/JavaScript-Interatividade-8b7bff?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript" />
<img src="https://img.shields.io/badge/MySQL-Banco%20de%20Dados-948ade?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
<img src="https://img.shields.io/badge/Chart.js-Dashboard-8b7bff?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />

</div>

---

## 💜 Sobre o projeto

**춤선 (Chumseon)** é uma expressão coreana que representa a linha ou silhueta que o corpo desenha durante a dança, traduzindo a relação entre movimento, expressão e espaço.

O **Chumseon Space** é um projeto individual desenvolvido na disciplina de Pesquisa e Inovação do curso de Análise e Desenvolvimento de Sistemas da SPTech.

A proposta é criar um espaço digital dedicado à dança, permitindo que os usuários descubram diferentes estilos, assistam a dicas em vídeo, realizem pequenos quizzes e registrem seus ensaios.

O projeto também conta com um dashboard interativo, no qual é possível acompanhar o próprio desenvolvimento por meio de indicadores e gráficos.

## Funcionalidades

O site conta com **6 páginas principais**:

| Página | Acesso | Descrição |
|:---:|:---:|---|
| **Home** | Público | Apresentação do projeto, energia do dia, estilos de dança e dicas em vídeo. |
| **Cadastro e Login** | Público | Criação de conta e autenticação dos usuários. |
| **Dashboard** | Restrito | Indicadores, gráficos de desempenho, dados da comunidade e meta semanal de ensaio. |
| **Cálculos da Dança** | Público | Ferramentas de cálculo relacionadas à dança, como contagem de 8 pelo BPM, estimativa de calorias, regularidade e conversão para binário. |
| **Sobre** | Público | Apresentação do projeto e justificativa da escolha do tema. |

**Outros recursos do projeto:**

- Mini quizzes relacionados aos vídeos assistidos.
- Cronômetro para registrar o tempo de ensaio.
- Acompanhamento da meta semanal de prática.
- Tema claro e escuro.
- Personalização das cores do site conforme o estilo de dança escolhido.

## Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| **HTML5** | Estruturação das páginas. |
| **CSS3** | Estilização, responsividade e temas visuais. |
| **JavaScript** | Funcionalidades, interações e cálculos do sistema. |
| **MySQL** | Armazenamento e gerenciamento dos dados. |
| **Chart.js** | Criação dos gráficos do dashboard. |

## Estrutura do projeto

```text
chumseon-space/
│
├── index.html
├── cadastro.html
├── login.html
├── dashboard.html
├── calculos.html
├── sobre.html
│
├── banco/
│   └── chumseon_space.sql
│
├── css/
│   ├── auth.css
│   ├── base.css
│   ├── calculos.css
│   ├── dashboard.css
│   ├── home.css
│   └── sobre.css
│
├── js/
│   ├── app.js
│   ├── cadastro.js
│   ├── calculos.js
│   ├── dados.js
│   ├── dashboard.js
│   ├── home.js
│   ├── login.js
│   └── sobre.js
│
├── img/
│   ├── ballet.jpg
│   ├── contemporaneo.jpg
│   └── hiphop.jpg
|
└── assets/
    ├── logo-circular.svg
    └── titulo-escuro.svg
```

## Como executar o projeto

### Pré-requisitos

Para executar o projeto localmente, é necessário ter:

| Programa | Finalidade |
|---|---|
| **Git** | Clonar o repositório. |
| **Visual Studio Code** | Editar e executar o projeto. |
| **MySQL Workbench** | Gerenciar e executar o banco de dados. |
| **Node.js** | Executar o servidor, caso utilize o método com npm. |

### 1. Clonar o repositório

Abra o terminal e execute:

```bash
git clone https://github.com/lauraraujo007/chumseon_space.git
```

Entre na pasta do projeto:

```bash
cd chumseon_space
```

### 2. Executar o site

Existem duas possibilidades para executar o projeto.

**Método 1 — Live Server**

1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão Live Server.
3. Clique com o botão direito no arquivo `index.html`.
4. Selecione a opção **Open with Live Server**.
5. O site será aberto no navegador.

**Método 2 — Node.js**

Caso utilize o servidor Node.js, execute no terminal:

```bash
npm install
npm start
```

Depois, acesse o endereço informado no terminal.

### 3. Configurar o banco de dados

1. Abra o MySQL Workbench.
2. Conecte-se ao servidor MySQL local.
3. Abra o arquivo `banco/chumseon_space.sql`.
4. Execute o script utilizando o botão de execução (⚡).
5. O banco de dados `chumseon_space` será criado com suas respectivas tabelas e estruturas.

**Atenção:** o script utiliza `DROP DATABASE IF EXISTS`, portanto, sua execução apaga e recria o banco de dados. Não execute novamente caso queira preservar dados existentes.

## Banco de dados

O banco de dados do Chumseon Space possui **9 tabelas**, organizadas para armazenar informações dos usuários, estilos de dança, vídeos, ensaios e atividades realizadas na plataforma.

## Conta de demonstração

Para acessar o sistema, também é possível utilizar uma conta de demonstração:

| Campo | Informação |
|---|---|
| E-mail | `demo@chumseon.space` |
| Senha | `123456` |

Você também pode criar sua própria conta na página de cadastro.

## 👩‍💻 Autora

**Laura de Araujo**

Estudante de Análise e Desenvolvimento de Sistemas (ADS) na SPTech.

---

<div align="center">

*Dance, pratique, evolua. Cada movimento conta.*

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:948ade,100:8b7bff&height=110&section=footer" alt="" width="100%" />

</div>
