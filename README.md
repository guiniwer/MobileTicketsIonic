# 🏥 MobileTicketsIonic — Sistema de Controle de Atendimento

Aplicação móvel desenvolvida com **Ionic + Angular** para simular um sistema de controle de atendimento por senhas, inspirado em filas de laboratórios médicos.

O projeto contempla três agentes principais:

- **AC — Agente Cliente:** retira uma senha no aplicativo.
- **AA — Agente Atendente:** chama a próxima senha disponível.
- **AS — Agente Sistema:** organiza as filas, aplica as regras de prioridade e registra as chamadas.

Além do aplicativo mobile, o projeto possui uma **API REST simples em Node.js + Express**, usando **dados em memória** para fins de teste e integração.

---

## 🎯 Objetivo do projeto

O objetivo principal é demonstrar:

- desenvolvimento de aplicação móvel com Ionic;
- organização de telas com Angular;
- comunicação com uma API REST;
- manipulação de filas e regras de negócio;
- separação entre front-end mobile e back-end;
- simulação de atendimento com diferentes prioridades.

---

## 🛠️ Tecnologias utilizadas

### Aplicativo mobile

- Ionic Framework
- Angular
- TypeScript
- HTML
- SCSS
- RxJS
- HttpClient

### API REST

- Node.js
- Express
- CORS
- Armazenamento em memória

---

## 🧠 Como o sistema funciona

1. O cliente acessa a aba **Cliente**.
2. O cliente escolhe o tipo de senha:
   - **SP** — Senha Prioritária
   - **SG** — Senha Geral
   - **SE** — Senha para retirada de Exames
3. O aplicativo envia a solicitação para a API REST.
4. A API gera a senha no formato `YYMMDD-PPSQ`.
5. O atendente acessa a aba **Atendente** e chama a próxima senha.
6. A API aplica a regra de prioridade.
7. A senha chamada aparece no **Painel** com o número e o guichê.
8. O painel exibe apenas as **5 últimas senhas chamadas**.

---

## 🔢 Modelo de numeração das senhas

Cada senha segue o formato:

```txt
YYMMDD-PPSQ
```

Onde:

- `YY` — ano com dois dígitos;
- `MM` — mês com dois dígitos;
- `DD` — dia com dois dígitos;
- `PP` — tipo da senha: `SP`, `SG` ou `SE`;
- `SQ` — sequência diária por tipo de senha.

Exemplo:

```txt
260531-SP01
```

---

## ⚖️ Regra de prioridade

O sistema utiliza a lógica de alternância solicitada no projeto:

```txt
SP -> SE/SG -> SP -> SE/SG
```

Ou seja:

- a senha **SP** tem prioridade;
- após chamar uma senha **SP**, o sistema tenta chamar uma senha **SE**;
- se não houver **SE**, chama uma senha **SG**;
- depois retorna para **SP**, caso exista;
- se não houver senha SP, o sistema continua chamando as demais disponíveis.

---

## 🕒 Horário de expediente

O expediente definido para a simulação é das:

```txt
07h às 17h
```

Fora desse horário:

- novas senhas não são emitidas;
- senhas pendentes podem ser descartadas;
- a API retorna uma mensagem informando que o expediente está encerrado.

O controle de horário considera o horário local do dispositivo/servidor onde a API está sendo executada.

### Modo de teste fora do horário

Para fins de apresentação, caso seja necessário testar o sistema fora do horário comercial, a API possui um modo de teste:

```bash
IGNORAR_HORARIO=true npm start
```

No Windows PowerShell, use:

```powershell
$env:IGNORAR_HORARIO="true"; npm start
```

Esse modo libera a emissão e chamada de senhas mesmo fora das 7h às 17h.

---

## 🔌 API REST

A API fica na pasta:

```txt
api-ionic/
```

Ela utiliza dados em memória, ou seja, os dados são apagados quando o servidor é encerrado.

Essa escolha segue a orientação da disciplina: não é obrigatório utilizar MySQL nesta etapa, pois o foco principal é a aplicação móvel e a comunicação com APIs REST.

---

## 📌 Rotas da API

### Teste da API

```http
GET /
```

Retorna uma mensagem confirmando que a API está funcionando.

---

### Listar estado atual das filas

```http
GET /senhas
```

Retorna:

- filas atuais;
- senhas chamadas;
- histórico;
- contadores;
- status do expediente.

---

### Gerar senha

```http
POST /senhas
```

Body:

```json
{
  "tipo": "SP"
}
```

Tipos aceitos:

```txt
SP, SG, SE
```

---

### Chamar próxima senha

```http
POST /senhas/chamar-proxima
```

Aplica a regra de prioridade e retorna a próxima senha chamada.

---

### Consultar painel

```http
GET /painel
```

Retorna apenas as **5 últimas senhas chamadas**.

---

### Relatório geral

```http
GET /relatorios/resumo
```

Retorna:

- total de senhas emitidas;
- total de senhas atendidas;
- total de senhas descartadas;
- quantitativo por tipo;
- tempo médio de atendimento;
- relatório detalhado das senhas.

---

### Relatório diário

```http
GET /relatorios/diario
```

Retorna o relatório filtrado para o dia atual.

---

### Relatório mensal

```http
GET /relatorios/mensal
```

Retorna o relatório filtrado para o mês atual.

---

### Descartar senhas pendentes

```http
POST /senhas/descartar-pendentes
```

Descarta manualmente todas as senhas que ainda estão na fila.

---

### Reiniciar dados

```http
POST /reset
```

Limpa filas, histórico, senhas chamadas e contadores.

---

## ✅ Requisitos atendidos

- Aplicação móvel em Ionic + Angular.
- API REST simples para integração.
- Uso de dados em memória para teste.
- Geração de senhas nos tipos SP, SG e SE.
- Numeração no formato `YYMMDD-PPSQ`.
- Separação das filas por tipo.
- Chamada de senhas pelo atendente.
- Exibição da senha chamada no painel.
- Exibição do guichê responsável pelo atendimento.
- Painel limitado às 5 últimas senhas chamadas.
- Lógica de prioridade alternada: `SP -> SE/SG -> SP -> SE/SG`.
- Horário de expediente das 7h às 17h.
- Descarte de senhas pendentes fora do expediente.
- Simulação de 5% de senhas não atendidas.
- Simulação do tempo médio de atendimento por tipo de senha.
- Relatório geral, diário e mensal via API.
- Interface separada para Cliente, Atendente e Painel.
- Feedback sonoro ao chamar uma senha.

---

## 📂 Estrutura principal de pastas

```txt
MobileTicketsIonic/
├── api-ionic/
│   ├── package.json
│   └── server.js
│
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── senha.model.ts
│   │   ├── services/
│   │   │   └── fila.service.ts
│   │   └── tabs/
│   │       ├── cliente/
│   │       ├── atendente/
│   │       └── painel/
│   │
│   └── assets/
│
├── package.json
└── README.md
```

---

## 🚀 Como rodar o projeto

Para o sistema funcionar corretamente, é necessário rodar **dois terminais**:

1. um terminal para a API;
2. outro terminal para o aplicativo Ionic.

---

## 1️⃣ Rodar a API

Entre na pasta da API:

```bash
cd api-ionic
```

Instale as dependências:

```bash
npm install
```

Rode o servidor:

```bash
npm start
```

A API ficará disponível em:

```txt
http://localhost:3000
```

Para testar se a API está funcionando, acesse no navegador:

```txt
http://localhost:3000
```

---

## 2️⃣ Rodar o aplicativo Ionic

Em outro terminal, volte para a pasta principal do projeto e instale as dependências:

```bash
npm install
```

Rode o aplicativo:

```bash
ionic serve
```

O aplicativo será aberto no navegador e irá consumir a API em:

```txt
http://localhost:3000
```

---

## 📱 Observação para teste em celular físico

Se o aplicativo for testado em um celular físico, `localhost` pode não funcionar, porque no celular `localhost` aponta para o próprio aparelho.

Nesse caso, será necessário trocar a URL da API no arquivo:

```txt
src/app/services/fila.service.ts
```

De:

```ts
private readonly API_URL = 'http://localhost:3000';
```

Para o IP da máquina onde a API está rodando, por exemplo:

```ts
private readonly API_URL = 'http://192.168.0.10:3000';
```

---

## 🧪 Observação sobre armazenamento

A API utiliza armazenamento em memória.

Isso significa que:

- os dados existem apenas enquanto a API estiver rodando;
- ao reiniciar o servidor, as senhas e relatórios são apagados;
- essa abordagem foi escolhida para simplificar a integração e atender ao foco da disciplina.

---

## 📌 Autor

Güiniwer Buñol  
Projeto desenvolvido para fins acadêmicos.
