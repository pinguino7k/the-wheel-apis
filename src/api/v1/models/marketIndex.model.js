// Modelo de la coleccion market_indices / tabla zt_market_indices
// Una foto diaria de los indices de mercado (SPX, NDX, DJI, VIX).
const mongoose = require('mongoose');
const { detailRowSchema } = require('./detailRow.schema');

const { Schema } = mongoose;

// Subdocumento arreglo: cada indice del dia
const indexSchema = new Schema(
  {
    symbol: { type: String, enum: ['SPX', 'NDX', 'DJI', 'VIX'], required: true },
    name: { type: String },
    close: { type: Number, required: true },
    change_pct: { type: Number }
  },
  { _id: false }
);

const marketIndexSchema = new Schema(
  {
    date: { type: Date, required: true },
    indices: {
      type: [indexSchema],
      validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: 'Debe tener al menos un indice' }
    },
    risk_level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    trading_allowed: { type: Boolean, default: true },
    DETAIL_ROW: { type: detailRowSchema, required: true }
  },
  { collection: 'market_indices', versionKey: false }
);

const MarketIndex = mongoose.models.MarketIndex || mongoose.model('MarketIndex', marketIndexSchema);

const table = {
  name: 'zt_market_indices',
  key: '_id',
  fields: ['_id', 'date', 'indices', 'risk_level', 'trading_allowed']
};

module.exports = { Model: MarketIndex, table, keyField: '_id' };
