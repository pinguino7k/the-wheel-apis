// Modelo de la coleccion market_analysis / tabla zt_market_analysis
// Analisis tecnico y financiero de un simbolo en una fecha.
const mongoose = require('mongoose');
const { detailRowSchema } = require('./detailRow.schema');

const { Schema } = mongoose;

// Subdocumento objeto: datos del instrumento
const instrumentSchema = new Schema(
  {
    name: { type: String },
    sector: { type: String },
    exchange: { type: String },
    optionable: { type: Boolean, default: true }
  },
  { _id: false }
);

// Subdocumento objeto: analisis tecnico (RSI, medias moviles, soportes)
const technicalSchema = new Schema(
  {
    close: { type: Number, required: true },
    rsi14: { type: Number, required: true, min: 0, max: 100 },
    moving_averages: {
      sma50: { type: Number },
      sma200: { type: Number },
      ema20: { type: Number }
    },
    levels: {
      support: { type: Number },
      resistance: { type: Number }
    },
    trend: { type: String, enum: ['BULLISH', 'BEARISH', 'SIDEWAYS'] },
    suggested_strikes: {
      put: { type: Number },
      call: { type: Number }
    },
    signal: { type: String, enum: ['FAVORABLE', 'NEUTRAL', 'UNFAVORABLE'], required: true }
  },
  { _id: false }
);

// Subdocumento objeto: analisis financiero / fundamental
const financialSchema = new Schema(
  {
    as_of: { type: Date },
    pe_ratio: { type: Number, required: true },
    eps: { type: Number },
    eps_growth_pct: { type: Number },
    market_cap: { type: Number },
    dividend_yield_pct: { type: Number },
    debt_to_equity: { type: Number },
    rating: { type: String, enum: ['APTO', 'REVISAR', 'NO_APTO'], required: true },
    source: { type: String }
  },
  { _id: false }
);

const marketAnalysisSchema = new Schema(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true },
    date: { type: Date, required: true },
    instrument: { type: instrumentSchema },
    technical: { type: technicalSchema, required: true },
    financial: { type: financialSchema, required: true },
    DETAIL_ROW: { type: detailRowSchema, required: true }
  },
  { collection: 'market_analysis', versionKey: false }
);

const MarketAnalysis = mongoose.models.MarketAnalysis || mongoose.model('MarketAnalysis', marketAnalysisSchema);

const table = {
  name: 'zt_market_analysis',
  key: '_id',
  fields: ['_id', 'symbol', 'date', 'instrument', 'technical', 'financial']
};

module.exports = { Model: MarketAnalysis, table, keyField: '_id' };
