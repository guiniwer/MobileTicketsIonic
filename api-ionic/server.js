const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Para apresentação/testes fora do horário, rode:
// IGNORAR_HORARIO=true npm start
const IGNORAR_HORARIO = process.env.IGNORAR_HORARIO === 'true';

app.use(cors());
app.use(express.json());

const TOTAL_GUICHES = 5;

const filas = {
  SP: [],
  SG: [],
  SE: []
};

let senhasChamadas = [];
let historico = [];
let contadores = {
  SP: 0,
  SG: 0,
  SE: 0
};

let ultimoGrupoChamado = null;

function estaEmHorarioExpediente() {
  if (IGNORAR_HORARIO) return true;

  const agora = new Date();
  const hora = agora.getHours();

  return hora >= 7 && hora < 17;
}

function gerarNumero(tipo) {
  const data = new Date();

  const yy = String(data.getFullYear()).slice(2);
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  const dd = String(data.getDate()).padStart(2, '0');

  contadores[tipo]++;
  const sequencia = String(contadores[tipo]).padStart(2, '0');

  return `${yy}${mm}${dd}-${tipo}${sequencia}`;
}

function criarSenha(tipo) {
  return {
    numero: gerarNumero(tipo),
    tipo,
    status: 'fila',
    horaEmissao: new Date().toISOString(),
    horaAtendimento: null,
    horaDescarte: null,
    guiche: null,
    tempoAtendimentoMinutos: null,
    motivoDescarte: null
  };
}

function removerSenhaNaoPrioritaria() {
  // Após uma SP, a prioridade é SE; se não houver SE, chama SG.
  return filas.SE.shift() || filas.SG.shift();
}

function selecionarProximaSenha() {
  // Regra do PDF: SP -> SE/SG -> SP -> SE/SG.
  if (ultimoGrupoChamado === 'SP') {
    return removerSenhaNaoPrioritaria() || filas.SP.shift();
  }

  return filas.SP.shift() || removerSenhaNaoPrioritaria();
}

function registrarGrupoChamado(tipo) {
  ultimoGrupoChamado = tipo === 'SP' ? 'SP' : 'NAO_SP';
}

function gerarGuiche() {
  return String(Math.floor(Math.random() * TOTAL_GUICHES) + 1).padStart(2, '0');
}

function numeroAleatorioEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcularTempoMedioAtendimento(tipo) {
  if (tipo === 'SP') {
    // SP: 15 minutos, podendo variar 5 minutos para baixo ou para cima.
    return numeroAleatorioEntre(10, 20);
  }

  if (tipo === 'SG') {
    // SG: 5 minutos, podendo variar 3 minutos para baixo ou para cima.
    return numeroAleatorioEntre(2, 8);
  }

  // SE: 95% dos atendimentos levam 1 minuto e 5% levam 5 minutos.
  return Math.random() < 0.95 ? 1 : 5;
}

function simularClienteNaoAtendido() {
  // Regra do PDF: 5% das senhas emitidas não são atendidas por responsabilidade do cliente.
  return Math.random() < 0.05;
}

function descartarSenhasPendentes(motivo = 'Expediente encerrado') {
  const pendentes = [
    ...filas.SP,
    ...filas.SG,
    ...filas.SE
  ];

  pendentes.forEach((senha) => {
    senha.status = 'descartada';
    senha.horaDescarte = new Date().toISOString();
    senha.motivoDescarte = motivo;
  });

  filas.SP.length = 0;
  filas.SG.length = 0;
  filas.SE.length = 0;

  return pendentes;
}

function montarEstado() {
  return {
    expedienteAberto: estaEmHorarioExpediente(),
    modoTesteHorario: IGNORAR_HORARIO,
    filas,
    senhasChamadas: senhasChamadas.slice(0, 5),
    historico,
    contadores,
    ultimoGrupoChamado
  };
}

function contarPorTipo(lista) {
  return lista.reduce((acc, senha) => {
    acc[senha.tipo] = (acc[senha.tipo] || 0) + 1;
    return acc;
  }, { SP: 0, SG: 0, SE: 0 });
}

function calcularMediaTempoAtendimento(lista = historico) {
  const atendidas = lista.filter((senha) => senha.status === 'atendida' && senha.tempoAtendimentoMinutos !== null);

  const media = (senhas) => {
    if (senhas.length === 0) return 0;

    const total = senhas.reduce((soma, senha) => soma + senha.tempoAtendimentoMinutos, 0);
    return Number((total / senhas.length).toFixed(2));
  };

  return {
    geral: media(atendidas),
    SP: media(atendidas.filter((senha) => senha.tipo === 'SP')),
    SG: media(atendidas.filter((senha) => senha.tipo === 'SG')),
    SE: media(atendidas.filter((senha) => senha.tipo === 'SE'))
  };
}

function montarRelatorio(lista) {
  const emitidas = lista;
  const atendidas = lista.filter((senha) => senha.status === 'atendida');
  const descartadas = lista.filter((senha) => senha.status === 'descartada');

  return {
    totalEmitidas: emitidas.length,
    totalAtendidas: atendidas.length,
    totalDescartadas: descartadas.length,
    emitidasPorTipo: contarPorTipo(emitidas),
    atendidasPorTipo: contarPorTipo(atendidas),
    descartadasPorTipo: contarPorTipo(descartadas),
    tempoMedioAtendimento: calcularMediaTempoAtendimento(lista),
    detalhe: lista
  };
}

function mesmaDataISO(dataISO, dataReferencia) {
  const data = new Date(dataISO);

  return (
    data.getFullYear() === dataReferencia.getFullYear()
    && data.getMonth() === dataReferencia.getMonth()
    && data.getDate() === dataReferencia.getDate()
  );
}

function mesmoMesISO(dataISO, dataReferencia) {
  const data = new Date(dataISO);

  return (
    data.getFullYear() === dataReferencia.getFullYear()
    && data.getMonth() === dataReferencia.getMonth()
  );
}

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API MobileTicketsIonic funcionando!',
    armazenamento: 'Dados em memória',
    expediente: '7h às 17h',
    modoTesteHorario: IGNORAR_HORARIO,
    rotas: [
      'GET /senhas',
      'POST /senhas',
      'POST /senhas/chamar-proxima',
      'GET /painel',
      'GET /relatorios/resumo',
      'GET /relatorios/diario',
      'GET /relatorios/mensal',
      'POST /senhas/descartar-pendentes',
      'POST /reset'
    ]
  });
});

app.get('/senhas', (req, res) => {
  res.json(montarEstado());
});

app.post('/senhas', (req, res) => {
  const { tipo } = req.body;

  if (!['SP', 'SG', 'SE'].includes(tipo)) {
    return res.status(400).json({
      mensagem: 'Tipo de senha inválido. Use SP, SG ou SE.'
    });
  }

  if (!estaEmHorarioExpediente()) {
    descartarSenhasPendentes();

    return res.status(403).json({
      mensagem: 'Expediente encerrado. O atendimento funciona das 7h às 17h.'
    });
  }

  const senha = criarSenha(tipo);

  filas[tipo].push(senha);
  historico.push(senha);

  return res.status(201).json(senha);
});

app.post('/senhas/chamar-proxima', (req, res) => {
  if (!estaEmHorarioExpediente()) {
    const descartadas = descartarSenhasPendentes();

    return res.status(403).json({
      mensagem: 'Expediente encerrado. Senhas pendentes foram descartadas.',
      descartadas
    });
  }

  const senha = selecionarProximaSenha();

  if (!senha) {
    return res.json({
      mensagem: 'Não há senhas aguardando atendimento.',
      senha: null
    });
  }

  registrarGrupoChamado(senha.tipo);

  if (simularClienteNaoAtendido()) {
    senha.status = 'descartada';
    senha.horaDescarte = new Date().toISOString();
    senha.motivoDescarte = 'Cliente não compareceu ao atendimento';

    return res.json({
      mensagem: `Senha ${senha.numero} descartada: cliente não compareceu.`,
      senha: null,
      senhaDescartada: senha
    });
  }

  senha.status = 'atendida';
  senha.horaAtendimento = new Date().toISOString();
  senha.guiche = gerarGuiche();
  senha.tempoAtendimentoMinutos = calcularTempoMedioAtendimento(senha.tipo);

  senhasChamadas.unshift(senha);
  senhasChamadas = senhasChamadas.slice(0, 5);

  return res.json({
    mensagem: `Senha ${senha.numero} chamada com sucesso.`,
    senha
  });
});

app.get('/painel', (req, res) => {
  res.json({
    senhasChamadas: senhasChamadas.slice(0, 5)
  });
});

app.post('/senhas/descartar-pendentes', (req, res) => {
  const descartadas = descartarSenhasPendentes('Descarte manual');

  res.json({
    mensagem: 'Senhas pendentes descartadas com sucesso.',
    descartadas
  });
});

app.get('/relatorios/resumo', (req, res) => {
  res.json(montarRelatorio(historico));
});

app.get('/relatorios/diario', (req, res) => {
  const hoje = new Date();
  const senhasDoDia = historico.filter((senha) => mesmaDataISO(senha.horaEmissao, hoje));

  res.json(montarRelatorio(senhasDoDia));
});

app.get('/relatorios/mensal', (req, res) => {
  const hoje = new Date();
  const senhasDoMes = historico.filter((senha) => mesmoMesISO(senha.horaEmissao, hoje));

  res.json(montarRelatorio(senhasDoMes));
});

app.post('/reset', (req, res) => {
  filas.SP.length = 0;
  filas.SG.length = 0;
  filas.SE.length = 0;
  senhasChamadas = [];
  historico = [];
  contadores = {
    SP: 0,
    SG: 0,
    SE: 0
  };
  ultimoGrupoChamado = null;

  res.json({
    mensagem: 'Dados da API reiniciados com sucesso.',
    estado: montarEstado()
  });
});

app.listen(PORT, () => {
  console.log(`API MobileTicketsIonic rodando em http://localhost:${PORT}`);
});
