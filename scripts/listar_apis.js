// Imprime el listado de APIs del submodulo (metodo, ruta, request y response).
// Uso: npm run listar:apis            -> tabla en texto
//      npm run listar:apis -- --json  -> JSON
const config = require('../src/config/config');
const { buildEndpoints } = require('../src/api/v1/catalog');

const endpoints = buildEndpoints();
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(endpoints, null, 2));
} else {
  let current = '';
  endpoints.forEach((e) => {
    if (e.module !== current) {
      current = e.module;
      console.log(`\n=== ${current} ===`);
    }
    console.log(`${e.method.padEnd(6)} ${config.API_URL}${e.path}`);
    console.log(`       ${e.description}`);
  });
  console.log(`\nTotal: ${endpoints.length} APIs`);
}
