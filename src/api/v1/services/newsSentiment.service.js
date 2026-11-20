// Servicios del submodulo Noticias y sentimiento (news_sentiment / zt_news_sentiment)
const modelDef = require('../models/newsSentiment.model');
const { createBaseService } = require('./base.service');
const { createSubdocumentService } = require('./subdocument.service');

// Regla: una noticia de reporte de resultados (earnings) bloquea la apertura de contratos
const normalize = (doc) => {
  if (doc.event && doc.event.is_earnings === true) doc.blocks_trading = true;
};

const base = createBaseService({
  modelDef,
  label: 'noticia',
  filters: { symbol: 'upper', blocks_trading: 'boolean' },
  normalize
});

const sentiment = createSubdocumentService(base, { label: 'sentimiento', type: 'object', required: true, path: [{ field: 'sentiment' }] });
const event = createSubdocumentService(base, { label: 'evento', type: 'object', path: [{ field: 'event' }] });

module.exports = {
  getAllNews: base.getAll,
  getNewsById: base.getOne,
  addNews: base.addOne,
  addManyNews: base.addMany,
  updateNews: base.updateOne,
  updateManyNews: base.updateMany,
  deleteNews: base.deleteOne,
  deleteManyNews: base.deleteMany,
  sentiment,
  event
};
