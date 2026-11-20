// Subdocumento de auditoria DETAIL_ROW (convencion del sistema del grupo)
const config = require('../config/config');

// Nuevo registro para DETAIL_ROW_REG
const newRegistry = (user) => {
  const now = new Date();
  return {
    CURRENT: true,
    REGDATE: now,
    REGTIME: now.toISOString().substring(11, 19),
    REGUSER: user || config.DEFAULT_REGUSER
  };
};

// DETAIL_ROW de un registro nuevo
const newDetailRow = (user) => ({
  ACTIVED: true,
  DELETED: false,
  DETAIL_ROW_REG: [newRegistry(user)]
});

// Marca los registros anteriores como no vigentes y agrega uno nuevo
const pushRegistry = (doc, user) => {
  if (!doc.DETAIL_ROW) doc.DETAIL_ROW = newDetailRow(user);
  const regs = doc.DETAIL_ROW.DETAIL_ROW_REG || [];
  regs.forEach((reg) => { reg.CURRENT = false; });
  regs.push(newRegistry(user));
  doc.DETAIL_ROW.DETAIL_ROW_REG = regs;
};

module.exports = { newRegistry, newDetailRow, pushRegistry };
