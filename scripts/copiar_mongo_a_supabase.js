// Copia los documentos de MongoDB Atlas (BD the_wheel) a las tablas de Supabase,
// para que las APIs tengan los mismos datos de prueba en las dos bases.
// Uso: npm run copiar:supabase   (necesita el archivo .env lleno)
const mongoose = require('mongoose');
const { connectMongo } = require('../src/config/mongo.config');
const { connectSupabase, getSupabase } = require('../src/config/supabase.config');
const { toRow } = require('../src/api/v1/repositories/supabase.repository');

const models = [
  require('../src/api/v1/models/activeWheel.model'),
  require('../src/api/v1/models/marketAnalysis.model'),
  require('../src/api/v1/models/marketIndex.model'),
  require('../src/api/v1/models/newsSentiment.model'),
  require('../src/api/v1/models/wheelConfig.model'),
  require('../src/api/v1/models/tradeValidation.model')
];

const main = async () => {
  if (!(await connectMongo()) || !(await connectSupabase())) process.exit(1);
  const sb = getSupabase();
  for (const { Model, table } of models) {
    const docs = await Model.find({}).lean();
    const rows = docs.map((doc) => toRow(table, doc));
    const keyColumn = table.key === '_id' ? 'id' : table.key;
    const { error } = rows.length
      ? await sb.from(table.name).upsert(rows, { onConflict: keyColumn })
      : { error: null };
    console.log(`${Model.collection.name} -> ${table.name}: ${error ? 'ERROR ' + error.message : rows.length + ' registros'}`);
  }
  await mongoose.disconnect();
};

main();
