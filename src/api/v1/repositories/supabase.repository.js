// Acceso a datos en Supabase (PostgreSQL) para cualquier modelo.
// Cada campo simple del documento es una columna y cada subdocumento es una
// columna jsonb. DETAIL_ROW se guarda en las columnas de auditoria
// actived, deleted, detail_row_reg, reguser, regdate, moduser y moddate.
const httpError = require('../../../helpers/httpError');
const { getSupabase } = require('../../../config/supabase.config');
const { validateWithModel } = require('./validate');

const column = (field) => (field === '_id' ? 'id' : field.toLowerCase());

// Documento JSON -> fila de la tabla
const toRow = (table, doc) => {
  const row = {};
  table.fields.forEach((field) => {
    const value = doc[field];
    row[column(field)] = value === undefined ? null : field === '_id' ? String(value) : value;
  });
  const detail = doc.DETAIL_ROW || {};
  const regs = detail.DETAIL_ROW_REG || [];
  const first = regs[0] || {};
  const current = regs.find((r) => r.CURRENT) || regs[regs.length - 1] || {};
  row.actived = detail.ACTIVED !== false;
  row.deleted = detail.DELETED === true;
  row.detail_row_reg = regs;
  row.reguser = first.REGUSER || null;
  row.regdate = first.REGDATE || null;
  row.moduser = current.REGUSER || null;
  row.moddate = current.REGDATE || null;
  // se convierte a JSON puro (fechas como texto ISO) antes de enviarlo
  return JSON.parse(JSON.stringify(row));
};

// Fila de la tabla -> documento JSON (misma forma que en MongoDB)
const fromRow = (table, row) => {
  if (!row) return null;
  const doc = {};
  table.fields.forEach((field) => {
    const value = row[column(field)];
    if (value !== null && value !== undefined) doc[field] = value;
  });
  doc.DETAIL_ROW = {
    ACTIVED: row.actived,
    DELETED: row.deleted,
    DETAIL_ROW_REG: row.detail_row_reg || []
  };
  return doc;
};

const check = (error) => {
  if (error) {
    const err = httpError(error.code === '23505' ? 409 : 400, `Supabase: ${error.message}`);
    throw err;
  }
};

const supabaseRepository = ({ Model, table }) => {
  const client = () => {
    const sb = getSupabase();
    if (!sb) throw httpError(503, 'Supabase no esta conectado');
    return sb;
  };
  const keyColumn = column(table.key);

  return {
    async find(filters = {}, includeDeleted = false) {
      let query = client().from(table.name).select('*');
      Object.entries(filters).forEach(([field, value]) => { query = query.eq(column(field), value); });
      if (!includeDeleted) query = query.eq('deleted', false);
      const { data, error } = await query.order(keyColumn, { ascending: true });
      check(error);
      return data.map((row) => fromRow(table, row));
    },

    async findOne(key) {
      const { data, error } = await client().from(table.name).select('*').eq(keyColumn, key).maybeSingle();
      check(error);
      return fromRow(table, data);
    },

    async insertMany(docs) {
      const rows = [];
      for (const doc of docs) rows.push(toRow(table, await validateWithModel(Model, doc)));
      const { data, error } = await client().from(table.name).insert(rows).select('*');
      check(error);
      return data.map((row) => fromRow(table, row));
    },

    async replaceOne(key, doc) {
      const row = toRow(table, await validateWithModel(Model, doc));
      const { data, error } = await client().from(table.name).update(row).eq(keyColumn, key).select('*').single();
      check(error);
      return fromRow(table, data);
    },

    async deleteMany(keys) {
      const { data, error } = await client().from(table.name).delete().in(keyColumn, keys).select(keyColumn);
      check(error);
      return data.length;
    }
  };
};

module.exports = supabaseRepository;
module.exports.toRow = toRow;
module.exports.fromRow = fromRow;
