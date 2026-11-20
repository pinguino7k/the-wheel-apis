// Modelo de la coleccion wheel_config / tabla zt_wheel_config
// Parametros de la estrategia: uno GLOBAL y opcionalmente uno por simbolo.
const mongoose = require('mongoose');
const { detailRowSchema } = require('./detailRow.schema');

const { Schema } = mongoose;

// Subdocumento arreglo: cuentas de broker configuradas
const brokerConfigSchema = new Schema(
  {
    name: { type: String, enum: ['ALPACA', 'WEBULL'], required: true },
    mode: { type: String, enum: ['PAPER', 'SANDBOX'], required: true },
    base_url: { type: String, default: null },
    account_ref: { type: String },
    initial_capital: { type: Number, min: 0 }
  },
  { _id: false }
);

// Subdocumento objeto: reglas para elegir las opciones
const optionRulesSchema = new Schema(
  {
    target_delta_put: { type: Number, required: true, min: 0, max: 1 },
    target_delta_call: { type: Number, required: true, min: 0, max: 1 },
    dte_min: { type: Number, required: true, min: 0 },
    dte_max: { type: Number, required: true, min: 0 },
    early_close_pct: { type: Number, default: 50 }
  },
  { _id: false }
);

// Subdocumento objeto: filtros previos a operar
const filtersSchema = new Schema(
  {
    rsi_max_entry: { type: Number, default: 70 },
    vix_max: { type: Number, default: 30 },
    pe_max: { type: Number, default: 40 },
    earnings_block_days: { type: Number, default: 7 }
  },
  { _id: false }
);

// Subdocumento objeto: limites de riesgo
const riskSchema = new Schema(
  {
    max_capital_per_cycle: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const wheelConfigSchema = new Schema(
  {
    scope: { type: String, required: true, unique: true, uppercase: true, trim: true },
    universe: { type: [String], default: undefined },
    brokers: { type: [brokerConfigSchema], default: undefined },
    option_rules: { type: optionRulesSchema, required: true },
    filters: { type: filtersSchema, required: true },
    risk: { type: riskSchema },
    DETAIL_ROW: { type: detailRowSchema, required: true }
  },
  { collection: 'wheel_config', versionKey: false }
);

const WheelConfig = mongoose.models.WheelConfig || mongoose.model('WheelConfig', wheelConfigSchema);

const table = {
  name: 'zt_wheel_config',
  key: 'scope',
  fields: ['scope', 'universe', 'brokers', 'option_rules', 'filters', 'risk']
};

module.exports = { Model: WheelConfig, table, keyField: 'scope' };
