// Cliente de Supabase simulado en memoria (solo para las pruebas automaticas).
// Implementa las funciones de supabase-js que usa la API.
const clone = (v) => JSON.parse(JSON.stringify(v));

const createFakeSupabase = (tables = {}) => {
  const db = clone(tables);
  const from = (name) => {
    if (!db[name]) db[name] = [];
    const state = { op: 'select', filters: [], payload: null, order: null, limit: null, mode: 'many' };
    const run = () => {
      const rows = db[name];
      const match = (r) => state.filters.every((f) => f(r));
      let data;
      if (state.op === 'select') {
        data = rows.filter(match);
        if (state.order) data.sort((a, b) => String(a[state.order]).localeCompare(String(b[state.order])));
        if (state.limit) data = data.slice(0, state.limit);
      } else if (state.op === 'insert') {
        for (const row of state.payload) {
          const key = Object.keys(row)[0];
          if (rows.some((r) => r[key] === row[key])) {
            return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
          }
        }
        rows.push(...clone(state.payload));
        data = clone(state.payload);
      } else if (state.op === 'update') {
        data = [];
        rows.forEach((r, i) => { if (match(r)) { rows[i] = { ...r, ...clone(state.payload) }; data.push(rows[i]); } });
      } else if (state.op === 'delete') {
        data = rows.filter(match);
        db[name] = rows.filter((r) => !match(r));
      }
      data = clone(data);
      if (state.mode === 'maybeSingle') return { data: data[0] || null, error: null };
      if (state.mode === 'single') {
        return data.length === 1 ? { data: data[0], error: null } : { data: null, error: { code: 'PGRST116', message: 'no rows' } };
      }
      return { data, error: null };
    };
    const builder = {
      select() { return builder; },
      insert(rows) { state.op = 'insert'; state.payload = rows; return builder; },
      update(row) { state.op = 'update'; state.payload = row; return builder; },
      delete() { state.op = 'delete'; return builder; },
      eq(col, val) { state.filters.push((r) => r[col] === val); return builder; },
      in(col, vals) { state.filters.push((r) => vals.includes(r[col])); return builder; },
      order(col) { state.order = col; return builder; },
      limit(n) { state.limit = n; return builder; },
      maybeSingle() { state.mode = 'maybeSingle'; return builder; },
      single() { state.mode = 'single'; return builder; },
      then(resolve, reject) { try { resolve(run()); } catch (e) { reject(e); } }
    };
    return builder;
  };
  return { from, _db: db };
};

module.exports = { createFakeSupabase };
