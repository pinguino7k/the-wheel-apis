// Servicios del submodulo Ciclos de The Wheel (coleccion active_wheels / tabla zt_active_wheels)
const modelDef = require('../models/activeWheel.model');
const httpError = require('../../../helpers/httpError');
const { createBaseService } = require('./base.service');
const { createSubdocumentService } = require('./subdocument.service');

// Transiciones permitidas entre las 4 fases de la rueda
const TRANSITIONS = {
  CSP: ['ASSIGNED', 'CLOSED'], // la PUT se asigna, o expira OTM y el ciclo se cierra
  ASSIGNED: ['CC', 'CLOSED'],  // con las 100 acciones se vende la Covered Call
  CC: ['CLOSED'],              // las acciones son "called away" y el ciclo termina
  CLOSED: []
};
const EVENTS = { ASSIGNED: 'ASSIGNMENT', CC: 'OPEN_CC', CLOSED: 'CLOSE_CYCLE' };

// Siguiente identificador con formato WHL-0000 (considera tambien los del mismo lote)
const nextWheelId = async (repo, pending = []) => {
  const all = await repo.find({}, true);
  const numbers = [...all, ...pending]
    .map((d) => parseInt(String(d.wheel_id || '').substring(4), 10))
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `WHL-${String(next).padStart(4, '0')}`;
};

// Siguiente contrato del ciclo con formato CT-0000
const nextContractId = (list) => {
  const numbers = list.map((c) => parseInt(String(c.contract_id || '').substring(3), 10)).filter((n) => !Number.isNaN(n));
  return `CT-${String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(4, '0')}`;
};

// Calculos: prima total de cada contrato y prima acumulada del ciclo
const normalize = (doc) => {
  (doc.contracts || []).forEach((c) => {
    if (!c.premium) c.premium = { per_share: 0, total: 0 }; // premium es obligatorio en la BD
    if (c.premium && c.premium.per_share !== undefined && c.premium.per_share !== null) {
      c.premium.total = Math.round(c.premium.per_share * 100 * (c.quantity || 1) * 100) / 100;
    }
  });
  const total = (doc.contracts || []).reduce((acc, c) => acc + ((c.premium && c.premium.total) || 0), 0);
  doc.metrics = { ...(doc.metrics || {}), total_premium: Math.round(total * 100) / 100 };
};

const base = createBaseService({
  modelDef,
  label: 'ciclo',
  filters: { symbol: 'upper', phase: 'upper', status: 'upper' },
  normalize,

  // Un ciclo nuevo siempre inicia en la Fase 1 (Cash-Secured Put)
  onCreate: async (doc, repo, ctx, pending) => {
    if (!doc.symbol || !doc.broker) throw httpError(400, 'Los campos symbol y broker son obligatorios');
    doc.wheel_id = doc.wheel_id || (await nextWheelId(repo, pending));
    doc.phase = 'CSP';
    doc.status = 'ACTIVE';
    doc.start_date = doc.start_date || new Date();
    doc.end_date = null;
    doc.contracts = (doc.contracts || []).map((c, i, arr) => ({
      status: 'OPEN',
      opened_at: new Date(),
      ...c,
      contract_id: c.contract_id || nextContractId(arr.slice(0, i))
    }));
    doc.phase_history = [{
      from: null,
      to: 'CSP',
      event: 'OPEN_CSP',
      date: doc.start_date,
      note: doc.note || `Apertura del ciclo de ${String(doc.symbol).toUpperCase()}`
    }];
    delete doc.note;
  },

  // Controla el cambio de fase y lo registra en phase_history
  onUpdate: (current, changes) => {
    const note = changes.note;
    delete changes.note;
    delete changes.phase_history; // el historial se maneja con su propia API
    if (changes.phase && changes.phase !== current.phase) {
      const allowed = TRANSITIONS[current.phase] || [];
      if (!allowed.includes(changes.phase)) {
        throw httpError(400, `Cambio de fase no permitido: ${current.phase} -> ${changes.phase}`);
      }
      changes.phase_history = [
        ...(current.phase_history || []),
        {
          from: current.phase,
          to: changes.phase,
          event: EVENTS[changes.phase],
          date: new Date(),
          note: note || `Cambio de fase ${current.phase} a ${changes.phase}`
        }
      ];
      if (changes.phase === 'CLOSED') {
        changes.status = changes.status || 'FINISHED';
        changes.end_date = changes.end_date || new Date();
      }
    }
  },

  onLogicalDelete: (doc) => { doc.status = 'CANCELED'; }
});

// --------------------------- Subdocumentos ---------------------------
const contracts = createSubdocumentService(base, {
  label: 'contrato',
  type: 'array',
  path: [{ field: 'contracts', key: 'contract_id', label: 'contrato' }],
  autoKey: (list) => nextContractId(list)
});

const contractOrders = createSubdocumentService(base, {
  label: 'orden del contrato',
  type: 'array',
  path: [
    { field: 'contracts', key: 'contract_id', label: 'contrato' },
    { field: 'orders', key: 'broker_order_id' }
  ]
});

const stockOrders = createSubdocumentService(base, {
  label: 'orden de acciones',
  type: 'array',
  path: [{ field: 'stock_orders', key: 'broker_order_id' }]
});

const phaseHistory = createSubdocumentService(base, {
  label: 'registro del historial',
  type: 'array',
  path: [{ field: 'phase_history', key: null }] // se identifica por su posicion (0, 1, 2...)
});

const capital = createSubdocumentService(base, { label: 'capital', type: 'object', path: [{ field: 'capital' }] });
const position = createSubdocumentService(base, { label: 'posicion', type: 'object', path: [{ field: 'position' }] });
// metrics se recalcula en cada cambio (prima acumulada), por eso es obligatorio
const metrics = createSubdocumentService(base, { label: 'metricas', type: 'object', required: true, path: [{ field: 'metrics' }] });

module.exports = {
  // Coleccion principal
  getAllWheels: base.getAll,
  getWheelById: base.getOne,
  addWheel: base.addOne,
  addManyWheels: base.addMany,
  updateWheel: base.updateOne,
  updateManyWheels: base.updateMany,
  deleteWheel: base.deleteOne,
  deleteManyWheels: base.deleteMany,
  // Subdocumentos
  contracts,
  contractOrders,
  stockOrders,
  phaseHistory,
  capital,
  position,
  metrics
};
