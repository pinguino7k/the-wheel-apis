// Prueba de punta a punta (rutas -> controladores -> servicios -> repositorio de Supabase)
// usando un cliente de Supabase simulado en memoria.
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { setSupabaseClient } = require('../src/config/supabase.config');
const { createFakeSupabase } = require('./fakeSupabase');
const { modules } = require('../src/api/v1/catalog');

const API = '/api/v1';
let token;
const auth = () => ({ Authorization: `Bearer ${token}` });

test.before(async () => {
  setSupabaseClient(createFakeSupabase({
    zt_usuarios: [{
      mongo_id: '1', usuario: 'MJGONZALEZ', nombre: 'Maria Jose', apellido: 'Gonzalez Acuna',
      email: 'mariajose@thewheel.mx', password_hash: await bcrypt.hash('TheWheel2026', 10),
      rol: 'ADMIN', activo: true, eliminado: false
    }]
  }));
});

test('sin token responde 401', async () => {
  const res = await request(app).get(`${API}/active-wheels`);
  assert.strictEqual(res.status, 401);
});

test('login con contrasena incorrecta responde 401', async () => {
  const res = await request(app).post(`${API}/auth/login`).send({ email: 'mariajose@thewheel.mx', password: 'x', dbServer: 'Supabase' });
  assert.strictEqual(res.status, 401);
});

test('login con MongoDB sin conexion responde 503', async () => {
  const res = await request(app).post(`${API}/auth/login`).send({ email: 'mariajose@thewheel.mx', password: 'TheWheel2026', dbServer: 'MongoDB' });
  assert.strictEqual(res.status, 503);
});

test('login con Supabase regresa el token', async () => {
  const res = await request(app).post(`${API}/auth/login`).send({ email: 'mariajose@thewheel.mx', password: 'TheWheel2026', dbServer: 'Supabase' });
  assert.strictEqual(res.status, 200, JSON.stringify(res.body));
  token = res.body.data.token;
  const me = await request(app).get(`${API}/auth/me`).set(auth());
  assert.strictEqual(me.body.data.dbServer, 'Supabase');
  assert.strictEqual(me.body.data.user, 'MJGONZALEZ');
});

test('ciclos: CRUD principal, uno y varios', async () => {
  const m = modules.find((x) => x.tag === 'ActiveWheels');
  let res = await request(app).post(`${API}/active-wheels`).set(auth()).send(m.example);
  assert.strictEqual(res.status, 201, JSON.stringify(res.body));
  assert.strictEqual(res.body.data.wheel_id, 'WHL-0001');
  assert.strictEqual(res.body.data.phase, 'CSP');
  assert.strictEqual(res.body.data.contracts[0].contract_id, 'CT-0001');
  assert.strictEqual(res.body.data.contracts[0].premium.total, 85);
  assert.strictEqual(res.body.data.metrics.total_premium, 85);
  assert.strictEqual(res.body.data.phase_history.length, 1);

  res = await request(app).post(`${API}/active-wheels/batch`).set(auth()).send([
    { ...m.example, symbol: 'AAPL' }, { ...m.example, symbol: 'MSFT' }
  ]);
  assert.strictEqual(res.status, 201, JSON.stringify(res.body));
  assert.deepStrictEqual(res.body.data.map((d) => d.wheel_id), ['WHL-0002', 'WHL-0003']);

  res = await request(app).get(`${API}/active-wheels?symbol=aapl`).set(auth());
  assert.strictEqual(res.body.count, 1);

  res = await request(app).put(`${API}/active-wheels/WHL-0001`).set(auth()).send(m.updateExample);
  assert.strictEqual(res.status, 200, JSON.stringify(res.body));
  assert.strictEqual(res.body.data.phase, 'ASSIGNED');
  assert.strictEqual(res.body.data.phase_history.length, 2);
  assert.strictEqual(res.body.data.DETAIL_ROW.DETAIL_ROW_REG.length, 2);

  res = await request(app).put(`${API}/active-wheels/WHL-0001`).set(auth()).send({ phase: 'CSP' });
  assert.strictEqual(res.status, 400);

  res = await request(app).put(`${API}/active-wheels/batch`).set(auth()).send([
    { wheel_id: 'WHL-0002', capital: { collateral: 1000, cash_reserved: 1000 } },
    { wheel_id: 'WHL-9999', capital: {} }
  ]);
  assert.strictEqual(res.status, 207);
  assert.strictEqual(res.body.count, 1);
  assert.strictEqual(res.body.errors[0].status, 404);

  res = await request(app).delete(`${API}/active-wheels/WHL-0003`).set(auth());
  assert.strictEqual(res.body.data.DETAIL_ROW.DELETED, true);
  assert.strictEqual(res.body.data.status, 'CANCELED');
  res = await request(app).get(`${API}/active-wheels`).set(auth());
  assert.strictEqual(res.body.count, 2);
  res = await request(app).get(`${API}/active-wheels?includeDeleted=true`).set(auth());
  assert.strictEqual(res.body.count, 3);

  res = await request(app).delete(`${API}/active-wheels/batch?type=physical`).set(auth()).send({ ids: ['WHL-0003'] });
  assert.strictEqual(res.status, 200, JSON.stringify(res.body));
  res = await request(app).get(`${API}/active-wheels/WHL-0003`).set(auth());
  assert.strictEqual(res.status, 404);
});

test('ciclos: subdocumentos arreglo, anidados y objeto', async () => {
  const base = `${API}/active-wheels/WHL-0001`;
  let res = await request(app).post(`${base}/contracts`).set(auth()).send({ type: 'CALL', occ_symbol: 'KO260116C00072000', strike: 72, expiration: '2026-01-16', premium: { per_share: 0.95 } });
  assert.strictEqual(res.status, 201, JSON.stringify(res.body));
  assert.strictEqual(res.body.data.contract_id, 'CT-0002');

  res = await request(app).post(`${base}/contracts/batch`).set(auth()).send([
    { contract_id: 'CT-0010', type: 'PUT', occ_symbol: 'A', strike: 60, expiration: '2026-02-20' },
    { contract_id: 'CT-0011', type: 'PUT', occ_symbol: 'B', strike: 61, expiration: '2026-02-20' }
  ]);
  assert.strictEqual(res.status, 201, JSON.stringify(res.body));
  assert.strictEqual(res.body.count, 2);

  res = await request(app).post(`${base}/contracts`).set(auth()).send({ contract_id: 'CT-0010', type: 'PUT', occ_symbol: 'A', strike: 60, expiration: '2026-02-20' });
  assert.strictEqual(res.status, 409);

  res = await request(app).put(`${base}/contracts/CT-0002`).set(auth()).send({ status: 'EXPIRED' });
  assert.strictEqual(res.body.data.status, 'EXPIRED');
  res = await request(app).put(`${base}/contracts/batch`).set(auth()).send([{ contract_id: 'CT-0010', strike: 59 }, { contract_id: 'CT-0011', strike: 58 }]);
  assert.deepStrictEqual(res.body.data.map((c) => c.strike), [59, 58]);

  res = await request(app).get(`${base}/metrics`).set(auth());
  assert.strictEqual(res.body.data.total_premium, 180);

  // ordenes anidadas dentro del contrato
  const orders = `${base}/contracts/CT-0002/orders`;
  res = await request(app).post(orders).set(auth()).send({ broker_order_id: 'o-1', side: 'SELL_TO_OPEN', qty: 1, status: 'FILLED' });
  assert.strictEqual(res.status, 201, JSON.stringify(res.body));
  res = await request(app).post(`${orders}/batch`).set(auth()).send([{ broker_order_id: 'o-2', qty: 1 }, { broker_order_id: 'o-3', qty: 1 }]);
  assert.strictEqual(res.body.count, 2);
  res = await request(app).put(`${orders}/o-2`).set(auth()).send({ status: 'CANCELED' });
  assert.strictEqual(res.body.data.status, 'CANCELED');
  res = await request(app).put(`${orders}/batch`).set(auth()).send([{ broker_order_id: 'o-3', status: 'FILLED' }]);
  assert.strictEqual(res.body.data[0].status, 'FILLED');
  res = await request(app).delete(`${orders}/o-1`).set(auth());
  assert.strictEqual(res.body.data.broker_order_id, 'o-1');
  res = await request(app).delete(`${orders}/batch`).set(auth()).send({ ids: ['o-2', 'o-3'] });
  assert.strictEqual(res.body.count, 2);
  res = await request(app).get(orders).set(auth());
  assert.strictEqual(res.body.count, 0);
  res = await request(app).get(`${base}/contracts/CT-9999/orders`).set(auth());
  assert.strictEqual(res.status, 404);

  // historial por posicion
  res = await request(app).get(`${base}/phase-history/1`).set(auth());
  assert.strictEqual(res.body.data.to, 'ASSIGNED');
  res = await request(app).post(`${base}/phase-history/batch`).set(auth()).send([{ to: 'CC', event: 'OPEN_CC' }, { to: 'CLOSED', event: 'X' }]);
  assert.strictEqual(res.body.count, 2);
  res = await request(app).put(`${base}/phase-history/batch`).set(auth()).send([{ index: 3, note: 'corregido' }]);
  assert.strictEqual(res.body.data[0].note, 'corregido');
  res = await request(app).delete(`${base}/phase-history/batch`).set(auth()).send({ ids: [2, 3] });
  assert.strictEqual(res.body.count, 2);

  // objetos
  res = await request(app).put(`${base}/position`).set(auth()).send({ shares: 0 });
  assert.strictEqual(res.body.data.shares, 0);
  res = await request(app).post(`${base}/capital`).set(auth()).send({ collateral: 1 });
  assert.strictEqual(res.status, 409);
  res = await request(app).delete(`${base}/capital`).set(auth());
  assert.strictEqual(res.status, 200);
  res = await request(app).get(`${base}/capital`).set(auth());
  assert.strictEqual(res.status, 404);
  res = await request(app).post(`${base}/capital`).set(auth()).send({ collateral: 500, cash_reserved: 0 });
  assert.strictEqual(res.status, 201, JSON.stringify(res.body));

  res = await request(app).delete(`${base}/contracts/batch`).set(auth()).send({ ids: ['CT-0010', 'CT-0011'] });
  assert.strictEqual(res.body.count, 2);
  res = await request(app).delete(`${base}/stock-orders/nada`).set(auth());
  assert.strictEqual(res.status, 404);
});

test('cada submodulo: ejemplos del catalogo funcionan (POST, GET, PUT, subdocumentos, DELETE)', async () => {
  for (const m of modules.filter((x) => x.tag !== 'ActiveWheels')) {
    let res = await request(app).post(`${API}${m.base}`).set(auth()).send(m.example);
    assert.strictEqual(res.status, 201, `${m.tag}: ${JSON.stringify(res.body)}`);
    const key = String(res.body.data[m.keyField]);
    const one = `${API}${m.base}/${encodeURIComponent(key)}`;

    res = await request(app).post(`${API}${m.base}/batch`).set(auth()).send(m.keyField === '_id' ? [m.example, m.example] : [{ ...m.example, scope: 'AAPL' }, { ...m.example, scope: 'MSFT' }]);
    assert.strictEqual(res.status, 201, `${m.tag} batch: ${JSON.stringify(res.body)}`);
    assert.strictEqual(res.body.count, 2);

    res = await request(app).put(one).set(auth()).send(m.updateExample);
    assert.strictEqual(res.status, 200, `${m.tag} put: ${JSON.stringify(res.body)}`);

    for (const s of m.subdocs) {
      const p = `${one}/${s.route}`;
      if (s.type === 'object') {
        res = await request(app).get(p).set(auth());
        assert.strictEqual(res.status, 200, `${m.tag}/${s.route} get: ${JSON.stringify(res.body)}`);
        res = await request(app).put(p).set(auth()).send(s.updateExample);
        assert.strictEqual(res.status, 200, `${m.tag}/${s.route} put: ${JSON.stringify(res.body)}`);
        res = await request(app).delete(p).set(auth());
        assert.strictEqual(res.status, s.required ? 400 : 200, `${m.tag}/${s.route} delete`);
        if (!s.required) {
          res = await request(app).post(p).set(auth()).send(s.example);
          assert.strictEqual(res.status, 201, `${m.tag}/${s.route} post: ${JSON.stringify(res.body)}`);
        }
      } else {
        res = await request(app).post(p).set(auth()).send(s.example);
        assert.strictEqual(res.status, 201, `${m.tag}/${s.route} post: ${JSON.stringify(res.body)}`);
        const subKey = s.example[s.key];
        res = await request(app).put(`${p}/${subKey}`).set(auth()).send(s.updateExample);
        assert.strictEqual(res.status, 200, `${m.tag}/${s.route} put: ${JSON.stringify(res.body)}`);
        res = await request(app).get(p).set(auth());
        assert.ok(res.body.count >= 1);
        res = await request(app).delete(`${p}/${subKey}`).set(auth());
        assert.strictEqual(res.status, 200, `${m.tag}/${s.route} delete: ${JSON.stringify(res.body)}`);
      }
    }

    res = await request(app).get(`${API}${m.base}`).set(auth());
    assert.strictEqual(res.body.count, 3, m.tag);
    res = await request(app).delete(one).set(auth());
    assert.strictEqual(res.status, 200);
    res = await request(app).delete(`${one}?type=physical`).set(auth());
    assert.strictEqual(res.status, 200);
    res = await request(app).get(one).set(auth());
    assert.strictEqual(res.status, 404);
  }
});

test('reglas de negocio: indices, noticias, validaciones y configuracion', async () => {
  let res = await request(app).post(`${API}/market-indices`).set(auth()).send({ date: '2025-11-12', indices: [{ symbol: 'VIX', close: 31 }], risk_level: 'LOW' });
  assert.strictEqual(res.body.data.risk_level, 'HIGH');
  assert.strictEqual(res.body.data.trading_allowed, false);

  res = await request(app).post(`${API}/news-sentiment`).set(auth()).send({ published_at: '2025-11-12', source: 's', headline: 'h', sentiment: { score: 0, label: 'NEUTRAL' }, event: { is_earnings: true }, blocks_trading: false });
  assert.strictEqual(res.body.data.blocks_trading, true);

  res = await request(app).post(`${API}/trade-validations`).set(auth()).send({ symbol: 'TSLA', requested_phase: 'CSP', checks: { technical: { passed: false }, financial: { passed: false }, indices: { passed: true }, news: { passed: true } }, result: 'APPROVED' });
  assert.strictEqual(res.body.data.result, 'REJECTED');
  assert.match(res.body.data.reason, /technical, financial/);

  res = await request(app).post(`${API}/wheel-config`).set(auth()).send({ scope: 'tsla', option_rules: { target_delta_put: 0.3, target_delta_call: 0.3, dte_min: 50, dte_max: 20 }, filters: {} });
  assert.strictEqual(res.status, 400);
  res = await request(app).get(`${API}/wheel-config/aapl`).set(auth());
  assert.strictEqual(res.status, 200);

  res = await request(app).post(`${API}/market-analysis`).set(auth()).send({ symbol: 'X', date: '2025-11-12', technical: { close: 1, rsi14: 150, signal: 'NEUTRAL' }, financial: { pe_ratio: 1, rating: 'APTO' } });
  assert.strictEqual(res.status, 400);
  res = await request(app).get(`${API}/market-analysis/no-existe`).set(auth());
  assert.strictEqual(res.status, 404);
});
