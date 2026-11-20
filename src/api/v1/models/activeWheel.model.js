// Modelo de la coleccion active_wheels / tabla zt_active_wheels
// Un documento por ciclo de la estrategia The Wheel.
const mongoose = require('mongoose');
const { detailRowSchema } = require('./detailRow.schema');

const { Schema } = mongoose;

// Subdocumento objeto: cuenta del broker
const brokerSchema = new Schema(
  {
    name: { type: String, enum: ['ALPACA', 'WEBULL'], required: true },
    mode: { type: String, enum: ['PAPER', 'SANDBOX'], required: true },
    account_ref: { type: String }
  },
  { _id: false }
);

// Subdocumento objeto: capital reservado (colateral de la PUT)
const capitalSchema = new Schema(
  {
    collateral: { type: Number, default: 0, min: 0 },
    cash_reserved: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

// Subdocumento objeto: acciones en cartera despues de la asignacion
const positionSchema = new Schema(
  {
    shares: { type: Number, default: 0, min: 0 },
    assignment_price: { type: Number, default: null },
    cost_basis: { type: Number, default: null }
  },
  { _id: false }
);

// Subdocumento arreglo (dentro de cada contrato): ordenes enviadas al broker
const orderSchema = new Schema(
  {
    broker_order_id: { type: String, required: true },
    side: { type: String, enum: ['SELL_TO_OPEN', 'BUY_TO_CLOSE', 'SELL_TO_CLOSE', 'BUY_TO_OPEN'] },
    order_type: { type: String, enum: ['LIMIT', 'MARKET'] },
    qty: { type: Number, min: 1 },
    limit_price: { type: Number },
    filled_price: { type: Number },
    status: { type: String, enum: ['NEW', 'FILLED', 'PARTIALLY_FILLED', 'CANCELED', 'REJECTED'] },
    submitted_at: { type: Date },
    filled_at: { type: Date }
  },
  { _id: false }
);

// Subdocumento arreglo: contratos de opciones (PUT o CALL) del ciclo
const contractSchema = new Schema(
  {
    contract_id: { type: String, required: true },
    type: { type: String, enum: ['PUT', 'CALL'], required: true },
    occ_symbol: { type: String, required: true },
    strike: { type: Number, required: true, min: 0 },
    expiration: { type: Date, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    premium: {
      per_share: { type: Number },
      total: { type: Number }
    },
    greeks: {
      delta: { type: Number },
      theta: { type: Number },
      iv: { type: Number }
    },
    status: { type: String, enum: ['OPEN', 'EXPIRED', 'ASSIGNED', 'EXERCISED', 'CLOSED'], required: true, default: 'OPEN' },
    opened_at: { type: Date },
    closed_at: { type: Date, default: null },
    orders: { type: [orderSchema], default: [] }
  },
  { _id: false }
);

// Subdocumento arreglo: compras y ventas de las 100 acciones
const stockOrderSchema = new Schema(
  {
    broker_order_id: { type: String, required: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    origin: { type: String, enum: ['ASSIGNMENT', 'EXERCISE', 'MANUAL'] },
    qty: { type: Number, min: 1 },
    price: { type: Number },
    status: { type: String },
    date: { type: Date }
  },
  { _id: false }
);

// Subdocumento arreglo: historial de cambios de fase
const phaseHistorySchema = new Schema(
  {
    from: { type: String, default: null },
    to: { type: String, enum: ['CSP', 'ASSIGNED', 'CC', 'CLOSED'], required: true },
    event: { type: String },
    date: { type: Date, default: Date.now },
    note: { type: String }
  },
  { _id: false }
);

// Subdocumento objeto: metricas del ciclo
const metricsSchema = new Schema(
  {
    total_premium: { type: Number, default: 0 },
    realized_pnl: { type: Number, default: 0 },
    rotations: { type: Number, default: 0 },
    validation_ref: { type: String, default: null }
  },
  { _id: false }
);

const activeWheelSchema = new Schema(
  {
    wheel_id: { type: String, required: true, unique: true, match: /^WHL-[0-9]{4}$/ },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    broker: { type: brokerSchema, required: true },
    phase: { type: String, enum: ['CSP', 'ASSIGNED', 'CC', 'CLOSED'], required: true, default: 'CSP' },
    status: { type: String, enum: ['ACTIVE', 'FINISHED', 'CANCELED'], required: true, default: 'ACTIVE' },
    start_date: { type: Date, required: true, default: Date.now },
    end_date: { type: Date, default: null },
    capital: { type: capitalSchema },
    position: { type: positionSchema },
    contracts: { type: [contractSchema], default: [] },
    stock_orders: { type: [stockOrderSchema], default: [] },
    phase_history: { type: [phaseHistorySchema], default: [] },
    metrics: { type: metricsSchema, default: () => ({}) },
    DETAIL_ROW: { type: detailRowSchema, required: true }
  },
  { collection: 'active_wheels', versionKey: false }
);

const ActiveWheel = mongoose.models.ActiveWheel || mongoose.model('ActiveWheel', activeWheelSchema);

// Tabla equivalente en Supabase: columnas simples + columnas jsonb para los subdocumentos
const table = {
  name: 'zt_active_wheels',
  key: 'wheel_id',
  fields: ['wheel_id', 'symbol', 'broker', 'phase', 'status', 'start_date', 'end_date', 'capital',
    'position', 'contracts', 'stock_orders', 'phase_history', 'metrics']
};

module.exports = { Model: ActiveWheel, table, keyField: 'wheel_id' };
