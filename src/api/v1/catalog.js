// Catalogo de las APIs del submodulo The Wheel. A partir de esta descripcion se
// generan la documentacion Swagger y el listado de APIs (npm run listar:apis).
// Cada ruta del catalogo existe en los archivos de ruteo (lo verifica test/rutas.test.js).

const AUTH_HEADER = 'Authorization: Bearer <token>';
const JSON_HEADERS = `${AUTH_HEADER}; Content-Type: application/json`;

const modules = [
  {
    tag: 'ActiveWheels',
    name: 'Ciclos de The Wheel',
    base: '/active-wheels',
    collection: 'active_wheels',
    table: 'zt_active_wheels',
    label: 'ciclo', labelPlural: 'ciclos',
    keyParam: 'wheelId', keyField: 'wheel_id', keyExample: 'WHL-0001',
    filters: [
      { name: 'symbol', example: 'KO' },
      { name: 'phase', example: 'CSP', enum: ['CSP', 'ASSIGNED', 'CC', 'CLOSED'] },
      { name: 'status', example: 'ACTIVE', enum: ['ACTIVE', 'FINISHED', 'CANCELED'] }
    ],
    purpose: 'ciclos de la estrategia (fase CSP, ASSIGNED, CC o CLOSED)',
    createNote: 'El ciclo inicia en fase CSP; si no se envía wheel_id se genera (WHL-0000) y se crea el primer registro de phase_history.',
    updateNote: 'Si cambia phase se valida la transición (CSP->ASSIGNED->CC->CLOSED) y se agrega a phase_history.',
    example: {
      symbol: 'KO',
      broker: { name: 'ALPACA', mode: 'PAPER', account_ref: 'PA-WHEEL-0001' },
      capital: { collateral: 6800, cash_reserved: 6800 },
      contracts: [{ type: 'PUT', occ_symbol: 'KO251219P00068000', strike: 68, expiration: '2025-12-19', quantity: 1, premium: { per_share: 0.85 }, greeks: { delta: -0.28 } }],
      note: 'Venta de PUT KO strike 68'
    },
    updateExample: { phase: 'ASSIGNED', position: { shares: 100, assignment_price: 68, cost_basis: 67.15 }, note: 'Asignación de 100 acciones' },
    subdocs: [
      {
        route: 'contracts', field: 'contracts', type: 'array', label: 'contrato', labelPlural: 'contratos',
        param: 'contractId', key: 'contract_id', keyExample: 'CT-0001',
        purpose: 'contratos de opciones PUT/CALL del ciclo',
        example: { type: 'CALL', occ_symbol: 'KO260116C00072000', strike: 72, expiration: '2026-01-16', quantity: 1, premium: { per_share: 0.95 }, status: 'OPEN' },
        updateExample: { status: 'EXPIRED', closed_at: '2025-12-19T21:00:00Z' }
      },
      {
        route: 'orders', field: 'orders', parent: 'contracts', type: 'array', label: 'orden del contrato', labelPlural: 'órdenes del contrato',
        param: 'orderId', key: 'broker_order_id', keyExample: 'alp-ord-0010',
        purpose: 'órdenes enviadas al broker para un contrato',
        example: { broker_order_id: 'alp-ord-0010', side: 'BUY_TO_CLOSE', order_type: 'LIMIT', qty: 1, limit_price: 0.40, status: 'NEW', submitted_at: '2025-11-10T15:00:00Z' },
        updateExample: { status: 'FILLED', filled_price: 0.40, filled_at: '2025-11-10T15:02:00Z' }
      },
      {
        route: 'stock-orders', field: 'stock_orders', type: 'array', label: 'orden de acciones', labelPlural: 'órdenes de acciones',
        param: 'orderId', key: 'broker_order_id', keyExample: 'alp-asg-0003',
        purpose: 'compras y ventas de las 100 acciones (asignación y called away)',
        example: { broker_order_id: 'alp-asg-0011', side: 'BUY', origin: 'ASSIGNMENT', qty: 100, price: 68, status: 'FILLED', date: '2025-12-19T21:00:00Z' },
        updateExample: { price: 67.95 }
      },
      {
        route: 'phase-history', field: 'phase_history', type: 'array', label: 'registro del historial', labelPlural: 'registros del historial',
        param: 'index', key: null, keyExample: '0',
        purpose: 'historial de cambios de fase del ciclo (se identifica por su posición 0, 1, 2...)',
        example: { from: 'CSP', to: 'ASSIGNED', event: 'ASSIGNMENT', date: '2025-12-19T21:00:00Z', note: 'Asignación manual' },
        updateExample: { note: 'Nota corregida' }
      },
      { route: 'capital', field: 'capital', type: 'object', label: 'capital', purpose: 'colateral y efectivo reservado del ciclo', example: { collateral: 6800, cash_reserved: 6800 }, updateExample: { cash_reserved: 0 } },
      { route: 'position', field: 'position', type: 'object', label: 'posición', purpose: 'acciones en cartera, precio de asignación y costo efectivo', example: { shares: 100, assignment_price: 68, cost_basis: 67.15 }, updateExample: { shares: 0 } },
      { route: 'metrics', field: 'metrics', type: 'object', required: true, label: 'métricas', purpose: 'prima acumulada, ganancia realizada y rotaciones', example: { total_premium: 85, realized_pnl: 0, rotations: 0 }, updateExample: { rotations: 1, realized_pnl: 250 } }
    ]
  },
  {
    tag: 'MarketAnalysis',
    name: 'Análisis técnico y financiero',
    base: '/market-analysis',
    collection: 'market_analysis',
    table: 'zt_market_analysis',
    label: 'análisis', labelPlural: 'análisis',
    keyParam: 'analysisId', keyField: '_id', keyExample: '<_id del análisis>',
    filters: [{ name: 'symbol', example: 'AAPL' }],
    purpose: 'análisis técnico (RSI, medías moviles, soportes) y financiero (P/E, EPS, Market Cap) por simbolo y fecha',
    example: {
      symbol: 'KO', date: '2025-11-10',
      instrument: { name: 'The Coca-Cola Company', sector: 'Consumo basico', exchange: 'NYSE', optionable: true },
      technical: { close: 70.1, rsi14: 50.2, moving_averages: { sma50: 69.2, sma200: 69.5, ema20: 69.8 }, levels: { support: 68, resistance: 72 }, trend: 'SIDEWAYS', suggested_strikes: { put: 68, call: 72 }, signal: 'FAVORABLE' },
      financial: { pe_ratio: 24.3, eps: 2.88, eps_growth_pct: 6.4, market_cap: 302000000000, dividend_yield_pct: 2.9, rating: 'APTO', source: 'Alpha Vantage' }
    },
    updateExample: { date: '2025-11-11' },
    subdocs: [
      { route: 'instrument', field: 'instrument', type: 'object', label: 'instrumento', purpose: 'nombre, sector y mercado del activo', example: { name: 'The Coca-Cola Company', sector: 'Consumo basico', exchange: 'NYSE', optionable: true }, updateExample: { sector: 'Bebidas' } },
      { route: 'technical', field: 'technical', type: 'object', required: true, label: 'análisis técnico', purpose: 'indicadores gráficos para elegir el strike', example: { close: 70.1, rsi14: 50.2, signal: 'FAVORABLE' }, updateExample: { rsi14: 72.5, signal: 'UNFAVORABLE' } },
      { route: 'financial', field: 'financial', type: 'object', required: true, label: 'análisis financiero', purpose: 'métricas fundamentales de la empresa', example: { pe_ratio: 24.3, rating: 'APTO' }, updateExample: { pe_ratio: 26.1, rating: 'REVISAR' } }
    ]
  },
  {
    tag: 'MarketIndices',
    name: 'Índices de mercado',
    base: '/market-indices',
    collection: 'market_indices',
    table: 'zt_market_indices',
    label: 'registro de índices', labelPlural: 'registros de índices',
    keyParam: 'indexId', keyField: '_id', keyExample: '<_id del registro>',
    filters: [{ name: 'risk_level', example: 'LOW', enum: ['LOW', 'MEDIUM', 'HIGH'] }],
    purpose: 'foto diaria de los índices SPX, NDX, DJI y VIX con el nivel de riesgo',
    createNote: 'risk_level se calcula con el VIX (>=30 HIGH, >=20 MEDIUM) y trading_allowed es false con riesgo HIGH.',
    example: {
      date: '2025-11-10',
      indices: [
        { symbol: 'SPX', name: 'S&P 500', close: 6900.5, change_pct: 0.4 },
        { symbol: 'VIX', name: 'CBOE Volatility Index', close: 17.2, change_pct: 2.1 }
      ],
      risk_level: 'LOW'
    },
    updateExample: { date: '2025-11-11' },
    subdocs: [
      {
        route: 'indices', field: 'indices', type: 'array', label: 'índice', labelPlural: 'índices',
        param: 'symbol', key: 'symbol', keyExample: 'VIX',
        purpose: 'cada índice del día (cierre y cambio porcentual)',
        example: { symbol: 'NDX', name: 'Nasdaq 100', close: 25700, change_pct: 0.8 },
        updateExample: { close: 31.5, change_pct: 25.4 }
      }
    ]
  },
  {
    tag: 'NewsSentiment',
    name: 'Noticias y sentimiento',
    base: '/news-sentiment',
    collection: 'news_sentiment',
    table: 'zt_news_sentiment',
    label: 'noticia', labelPlural: 'noticias',
    keyParam: 'newsId', keyField: '_id', keyExample: '<_id de la noticia>',
    filters: [{ name: 'symbol', example: 'AAPL' }, { name: 'blocks_trading', example: 'true', type: 'boolean' }],
    purpose: 'noticias con su sentimiento; las de reporte de resultados bloquean la apertura de contratos',
    createNote: 'Si event.is_earnings es true, blocks_trading se guarda en true.',
    example: {
      symbol: 'MSFT', published_at: '2025-11-10T14:00:00Z', source: 'Alpha Vantage News',
      headline: 'MSFT anuncia fecha de su reporte trimestral (dato de prueba)', url: 'https://example.com/noticias/msft',
      sentiment: { score: 0.15, label: 'NEUTRAL' }, event: { is_earnings: true, event_date: '2026-01-28' }, blocks_trading: true
    },
    updateExample: { headline: 'MSFT confirma fecha de su reporte trimestral (dato de prueba)' },
    subdocs: [
      { route: 'sentiment', field: 'sentiment', type: 'object', required: true, label: 'sentimiento', purpose: 'puntaje (-1 a 1) y etiqueta del sentimiento', example: { score: 0.15, label: 'NEUTRAL' }, updateExample: { score: -0.4, label: 'NEGATIVE' } },
      { route: 'event', field: 'event', type: 'object', label: 'evento', purpose: 'evento asociado a la noticia (earnings y su fecha)', example: { is_earnings: true, event_date: '2026-01-28' }, updateExample: { event_date: '2026-01-29' } }
    ]
  },
  {
    tag: 'WheelConfig',
    name: 'Configuración de la estrategia',
    base: '/wheel-config',
    collection: 'wheel_config',
    table: 'zt_wheel_config',
    label: 'configuración', labelPlural: 'configuraciones',
    keyParam: 'scope', keyField: 'scope', keyExample: 'GLOBAL',
    filters: [{ name: 'scope', example: 'GLOBAL' }],
    purpose: 'parametros de la estrategia: uno GLOBAL y uno opcional por simbolo',
    example: {
      scope: 'KO',
      option_rules: { target_delta_put: 0.30, target_delta_call: 0.30, dte_min: 21, dte_max: 45, early_close_pct: 50 },
      filters: { rsi_max_entry: 70, vix_max: 30, pe_max: 35, earnings_block_days: 7 },
      risk: { max_capital_per_cycle: 10000 }
    },
    updateExample: { universe: ['KO', 'AAPL', 'MSFT'] },
    subdocs: [
      { route: 'option-rules', field: 'option_rules', type: 'object', required: true, label: 'reglas de opciones', purpose: 'delta objetivo y rango de días al vencimiento', example: { target_delta_put: 0.3, target_delta_call: 0.3, dte_min: 21, dte_max: 45 }, updateExample: { dte_min: 30 } },
      { route: 'filters', field: 'filters', type: 'object', required: true, label: 'filtros', purpose: 'limites de RSI, VIX, P/E y días de bloqueo por earnings', example: { rsi_max_entry: 70, vix_max: 30, pe_max: 40, earnings_block_days: 7 }, updateExample: { vix_max: 25 } },
      { route: 'risk', field: 'risk', type: 'object', label: 'riesgo', purpose: 'capital máximo por ciclo', example: { max_capital_per_cycle: 10000 }, updateExample: { max_capital_per_cycle: 15000 } },
      {
        route: 'brokers', field: 'brokers', type: 'array', label: 'broker', labelPlural: 'brokers',
        param: 'name', key: 'name', keyExample: 'ALPACA',
        purpose: 'cuentas de broker (Alpaca y Webull) configuradas',
        example: { name: 'WEBULL', mode: 'PAPER', account_ref: 'WB-PAPER-0002', initial_capital: 50000 },
        updateExample: { initial_capital: 120000 }
      }
    ]
  },
  {
    tag: 'TradeValidations',
    name: 'Validaciones previas a operar',
    base: '/trade-validations',
    collection: 'trade_validations',
    table: 'zt_trade_validations',
    label: 'validación', labelPlural: 'validaciones',
    keyParam: 'validationId', keyField: '_id', keyExample: '<_id de la validación>',
    filters: [{ name: 'symbol', example: 'NVDA' }, { name: 'result', example: 'APPROVED', enum: ['APPROVED', 'REJECTED'] }, { name: 'wheel_id', example: 'WHL-0004' }],
    purpose: 'resultado de los 4 filtros (técnico, financiero, indices y noticias) antes de abrir un contrato',
    createNote: 'result se calcula: APPROVED solo si pasan los 4 filtros.',
    example: {
      symbol: 'KO', wheel_id: 'WHL-0001', requested_phase: 'CC', date: '2025-11-10T15:00:00Z',
      checks: { technical: { passed: true, rsi14: 50.2 }, financial: { passed: true, pe_ratio: 24.3 }, indices: { passed: true, vix: 17.2 }, news: { passed: true } },
      result: 'APPROVED'
    },
    updateExample: { reason: 'Revisado por MJGONZALEZ' },
    subdocs: [
      { route: 'checks', field: 'checks', type: 'object', required: true, label: 'filtros revisados', purpose: 'los 4 filtros con su resultado y el dato revisado', example: { technical: { passed: true }, financial: { passed: true }, indices: { passed: true }, news: { passed: true } }, updateExample: { news: { passed: false, note: 'Earnings en 3 días' } } }
    ]
  }
];

// --------------------------------------------------------------------------
// Genera la lista de endpoints (metodo, ruta, descripcion, request y response)
// --------------------------------------------------------------------------
const resp = (what) => `{ success, dbServer, message, ${what} }`;

const buildEndpoints = () => {
  const list = [];
  const add = (e) => list.push(e);

  // Inicio de sesion
  add({
    module: 'Sesión', tag: 'Auth', method: 'POST', path: '/auth/login', op: 'login',
    description: 'Inicia sesión y elige la base de datos (MongoDB o Supabase) con la que operarán todas las APIs.',
    headers: 'Content-Type: application/json', params: '-',
    body: '{ email, password, dbServer: "MongoDB" | "Supabase" }',
    bodyExample: { email: 'mariajose@thewheel.mx', password: 'TheWheel2026', dbServer: 'MongoDB' },
    response: '200 { success, dbServer, message, data: { token, expiresIn, user } }; 401 credenciales incorrectas', noAuth: true
  });
  add({
    module: 'Sesión', tag: 'Auth', method: 'GET', path: '/auth/me', op: 'me',
    description: 'Regresa el usuario y la base de datos de la sesión actual.',
    headers: AUTH_HEADER, params: '-', body: '-',
    response: '200 { success, dbServer, data: { user, rol, dbServer } }; 401 sin token'
  });

  modules.forEach((m) => {
    const k = `:${m.keyParam}`;
    const one = `${m.base}/${k}`;
    const filters = m.filters.map((f) => f.name).join(', ');
    const keyNote = m.keyField === '_id' ? 'se genera el _id' : `${m.keyField} es la llave`;

    add({ module: m.name, tag: m.tag, method: 'GET', path: m.base, op: 'list',
      description: `Consulta todos los registros (${m.purpose}). Se pueden filtrar.`,
      headers: AUTH_HEADER, params: `Query (opcionales): ${filters}, includeDeleted=true`, body: '-',
      response: `200 ${resp('count, data: [ ' + m.label + ' ]')}` });
    add({ module: m.name, tag: m.tag, method: 'GET', path: one, op: 'get',
      description: `Consulta un ${m.label} por su ${m.keyField}.`,
      headers: AUTH_HEADER, params: `Path: ${m.keyParam}`, body: '-',
      response: `200 ${resp('data: { ' + m.label + ' }')}; 404 no existe` });
    add({ module: m.name, tag: m.tag, method: 'POST', path: m.base, op: 'create', many: false,
      description: `Inserta un solo ${m.label} (${keyNote}; se crea DETAIL_ROW).${m.createNote ? ' ' + m.createNote : ''}`,
      headers: JSON_HEADERS, params: '-', body: `Objeto ${m.label}`, bodyExample: m.example,
      response: `201 ${resp('data: { ' + m.label + ' creado }')}; 400 datos inválidos; 409 llave repetida` });
    add({ module: m.name, tag: m.tag, method: 'POST', path: `${m.base}/batch`, op: 'createMany', many: true,
      description: `Inserta varios ${m.labelPlural} en una sola petición (arreglo de objetos).`,
      headers: JSON_HEADERS, params: '-', body: `Arreglo [ ${m.label}, ... ]`, bodyExample: [m.example],
      response: `201 ${resp('count, data: [ creados ]')}; 400 algun elemento inválido (no se inserta ninguno)` });
    add({ module: m.name, tag: m.tag, method: 'PUT', path: one, op: 'update', many: false,
      description: `Modifica un solo ${m.label} (solo los campos enviados; agrega registro en DETAIL_ROW).${m.updateNote ? ' ' + m.updateNote : ''}`,
      headers: JSON_HEADERS, params: `Path: ${m.keyParam}`, body: `Objeto con los campos a cambiar`, bodyExample: m.updateExample,
      response: `200 ${resp('data: { ' + m.label + ' actualizado }')}; 400; 404` });
    add({ module: m.name, tag: m.tag, method: 'PUT', path: `${m.base}/batch`, op: 'updateMany', many: true,
      description: `Modifica varios ${m.labelPlural}; cada objeto trae su ${m.keyField}.`,
      headers: JSON_HEADERS, params: '-', body: `Arreglo [ { ${m.keyField}, campos... } ]`,
      bodyExample: [{ [m.keyField]: m.keyExample, ...m.updateExample }],
      response: `200 todos / 207 parcial ${resp('count, data: [ actualizados ], errors: [ ]')}` });
    add({ module: m.name, tag: m.tag, method: 'DELETE', path: one, op: 'delete', many: false,
      description: `Elimina un solo ${m.label}: borrado lógico (ACTIVED=false, DELETED=true) o físico.`,
      headers: AUTH_HEADER, params: `Path: ${m.keyParam}; Query: type=logical|physical`, body: '-',
      response: `200 ${resp('data')}; 404 no existe` });
    add({ module: m.name, tag: m.tag, method: 'DELETE', path: `${m.base}/batch`, op: 'deleteMany', many: true,
      description: `Elimina varios ${m.labelPlural} (lógico o físico).`,
      headers: JSON_HEADERS, params: 'Query (opcional): type, ids=a,b', body: '{ ids: [ ... ], type: "logical" | "physical" }',
      bodyExample: { ids: [m.keyExample], type: 'logical' },
      response: `200 / 207 ${resp('count, data: [ eliminados ], errors: [ ]')}` });

    m.subdocs.forEach((s) => {
      const parent = s.parent ? m.subdocs.find((p) => p.route === s.parent) : null;
      const prefix = parent ? `${one}/${parent.route}/:${parent.param}/${s.route}` : `${one}/${s.route}`;
      const pathParams = parent ? `${m.keyParam}, ${parent.param}` : m.keyParam;
      const where = parent ? `del ${parent.label} indicado` : `del ${m.label}`;
      const subName = parent ? `${parent.field}[].${s.field}` : s.field;

      if (s.type === 'object') {
        const base = { module: m.name, tag: m.tag, subdoc: subName, subType: 'objeto', params: `Path: ${m.keyParam}` };
        add({ ...base, method: 'GET', path: prefix, op: 'objGet', description: `Consulta el subdocumento ${s.field} (${s.purpose}) ${where}.`, headers: AUTH_HEADER, body: '-', response: `200 ${resp('data: { ' + s.field + ' }')}; 404` });
        add({ ...base, method: 'POST', path: prefix, op: 'objCreate', description: `Agrega el subdocumento ${s.field} si el ${m.label} no lo tiene.`, headers: JSON_HEADERS, body: `Objeto ${s.field}`, bodyExample: s.example, response: `201 ${resp('data: { ' + s.field + ' }')}; 409 ya existe` });
        add({ ...base, method: 'PUT', path: prefix, op: 'objUpdate', description: `Modifica campos del subdocumento ${s.field}.`, headers: JSON_HEADERS, body: `Objeto con los campos a cambiar`, bodyExample: s.updateExample, response: `200 ${resp('data: { ' + s.field + ' }')}; 404` });
        add({ ...base, method: 'DELETE', path: prefix, op: 'objRemove', description: s.required ? `Quitaría el subdocumento ${s.field}; como es obligatorio responde 400 (se modifica con PUT).` : `Quita el subdocumento ${s.field} del ${m.label}.`, headers: AUTH_HEADER, body: '-', response: s.required ? '400 subdocumento obligatorio' : `200 ${resp('data: { eliminado }')}; 404` });
        return;
      }

      const keyName = s.key || 'index';
      const base = { module: m.name, tag: m.tag, subdoc: subName, subType: 'arreglo' };
      add({ ...base, method: 'GET', path: prefix, op: 'subList', description: `Consulta todos los ${s.labelPlural} (${s.purpose}) ${where}.`, headers: AUTH_HEADER, params: `Path: ${pathParams}`, body: '-', response: `200 ${resp('count, data: [ ' + s.label + ' ]')}` });
      add({ ...base, method: 'GET', path: `${prefix}/:${s.param}`, op: 'subGet', description: `Consulta un ${s.label} por su ${keyName}.`, headers: AUTH_HEADER, params: `Path: ${pathParams}, ${s.param}`, body: '-', response: `200 ${resp('data: { ' + s.label + ' }')}; 404` });
      add({ ...base, method: 'POST', path: prefix, op: 'subAdd', many: false, description: `Agrega un solo ${s.label} (objeto) al arreglo ${s.field}.`, headers: JSON_HEADERS, params: `Path: ${pathParams}`, body: `Objeto ${s.label}`, bodyExample: s.example, response: `201 ${resp('data: { ' + s.label + ' }')}; 409 llave repetida` });
      add({ ...base, method: 'POST', path: `${prefix}/batch`, op: 'subAddMany', many: true, description: `Agrega varios ${s.labelPlural} (arreglo de objetos) al arreglo ${s.field}.`, headers: JSON_HEADERS, params: `Path: ${pathParams}`, body: `Arreglo [ ${s.label}, ... ]`, bodyExample: [s.example], response: `201 ${resp('count, data: [ agregados ]')}` });
      add({ ...base, method: 'PUT', path: `${prefix}/:${s.param}`, op: 'subUpdate', many: false, description: `Modifica un solo ${s.label}.`, headers: JSON_HEADERS, params: `Path: ${pathParams}, ${s.param}`, body: 'Objeto con los campos a cambiar', bodyExample: s.updateExample, response: `200 ${resp('data: { ' + s.label + ' }')}; 404` });
      add({ ...base, method: 'PUT', path: `${prefix}/batch`, op: 'subUpdateMany', many: true, description: `Modifica varios ${s.labelPlural}; cada objeto trae su ${keyName}.`, headers: JSON_HEADERS, params: `Path: ${pathParams}`, body: `Arreglo [ { ${keyName}, campos... } ]`, bodyExample: [{ [keyName]: s.key ? s.keyExample : 0, ...s.updateExample }], response: `200 ${resp('count, data: [ actualizados ]')}` });
      add({ ...base, method: 'DELETE', path: `${prefix}/:${s.param}`, op: 'subRemove', many: false, description: `Elimina un solo ${s.label} del arreglo.`, headers: AUTH_HEADER, params: `Path: ${pathParams}, ${s.param}`, body: '-', response: `200 ${resp('data: { eliminado }')}; 404` });
      add({ ...base, method: 'DELETE', path: `${prefix}/batch`, op: 'subRemoveMany', many: true, description: `Elimina varios ${s.labelPlural} del arreglo.`, headers: JSON_HEADERS, params: `Path: ${pathParams}`, body: `{ ids: [ ${keyName}, ... ] }`, bodyExample: { ids: [s.key ? s.keyExample : 0] }, response: `200 ${resp('count, data: [ eliminados ]')}` });
    });
  });
  return list;
};

module.exports = { modules, buildEndpoints };
