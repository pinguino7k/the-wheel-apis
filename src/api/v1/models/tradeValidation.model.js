// Modelo de la coleccion trade_validations / tabla zt_trade_validations
// Resultado de los 4 filtros (tecnico, financiero, indices y noticias) antes de operar.
const mongoose = require('mongoose');
const { detailRowSchema } = require('./detailRow.schema');

const { Schema } = mongoose;

// Cada filtro guarda si paso y el dato que se reviso
const checkSchema = new Schema(
  {
    passed: { type: Boolean, required: true },
    rsi14: { type: Number },
    pe_ratio: { type: Number },
    vix: { type: Number },
    note: { type: String }
  },
  { _id: false }
);

// Subdocumento objeto: los 4 filtros
const checksSchema = new Schema(
  {
    technical: { type: checkSchema, required: true },
    financial: { type: checkSchema, required: true },
    indices: { type: checkSchema, required: true },
    news: { type: checkSchema, required: true }
  },
  { _id: false }
);

const tradeValidationSchema = new Schema(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true },
    wheel_id: { type: String, default: null },
    requested_phase: { type: String, enum: ['CSP', 'CC'], required: true },
    date: { type: Date, required: true, default: Date.now },
    checks: { type: checksSchema, required: true },
    result: { type: String, enum: ['APPROVED', 'REJECTED'], required: true },
    reason: { type: String },
    DETAIL_ROW: { type: detailRowSchema, required: true }
  },
  { collection: 'trade_validations', versionKey: false }
);

const TradeValidation = mongoose.models.TradeValidation || mongoose.model('TradeValidation', tradeValidationSchema);

const table = {
  name: 'zt_trade_validations',
  key: '_id',
  fields: ['_id', 'symbol', 'wheel_id', 'requested_phase', 'date', 'checks', 'result', 'reason']
};

module.exports = { Model: TradeValidation, table, keyField: '_id' };
