// Subdocumento de auditoria DETAIL_ROW comun a todas las colecciones
const { Schema } = require('mongoose');

const detailRowRegSchema = new Schema(
  {
    CURRENT: { type: Boolean, required: true },
    REGDATE: { type: Date, required: true },
    REGTIME: { type: String },
    REGUSER: { type: String, required: true }
  },
  { _id: false }
);

const detailRowSchema = new Schema(
  {
    ACTIVED: { type: Boolean, required: true, default: true },
    DELETED: { type: Boolean, required: true, default: false },
    DETAIL_ROW_REG: { type: [detailRowRegSchema], default: [] }
  },
  { _id: false }
);

module.exports = { detailRowSchema };
