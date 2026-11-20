// Verifica que cada API del catalogo exista en los archivos de ruteo y viceversa
const test = require('node:test');
const assert = require('node:assert');
const { buildEndpoints } = require('../src/api/v1/catalog');

test('el catalogo de APIs y los archivos de ruteo coinciden', () => {
  const files = {
    '/auth': require('../src/api/v1/routes/auth.routes'),
    '/active-wheels': require('../src/api/v1/routes/activeWheel.routes'),
    '/market-analysis': require('../src/api/v1/routes/marketAnalysis.routes'),
    '/market-indices': require('../src/api/v1/routes/marketIndex.routes'),
    '/news-sentiment': require('../src/api/v1/routes/newsSentiment.routes'),
    '/wheel-config': require('../src/api/v1/routes/wheelConfig.routes'),
    '/trade-validations': require('../src/api/v1/routes/tradeValidation.routes')
  };
  const registered = [];
  Object.entries(files).forEach(([base, router]) => {
    router.stack.forEach((layer) => {
      if (!layer.route) return;
      Object.keys(layer.route.methods).forEach((m) => {
        registered.push(`${m.toUpperCase()} ${base}${layer.route.path === '/' ? '' : layer.route.path}`);
      });
    });
  });
  const catalog = buildEndpoints().map((e) => `${e.method} ${e.path}`);
  assert.strictEqual(new Set(catalog).size, catalog.length, 'hay rutas repetidas en el catalogo');
  assert.deepStrictEqual([...catalog].sort(), [...registered].sort());
});
