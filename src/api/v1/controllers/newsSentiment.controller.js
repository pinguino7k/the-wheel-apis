// Controladores del submodulo Noticias y sentimiento (news_sentiment)
const service = require('../services/newsSentiment.service');
const c = require('./base.controller');

const K = 'newsId';

module.exports = {
  getAllNews: c.list(service.getAllNews),
  getNewsById: c.getOne(service.getNewsById, K),
  addNews: c.create(service.addNews, 'Noticia creada'),
  addManyNews: c.createMany(service.addManyNews, 'Noticias creadas'),
  updateNews: c.update(service.updateNews, K, 'Noticia actualizada'),
  updateManyNews: c.updateMany(service.updateManyNews, 'Noticias actualizadas'),
  deleteNews: c.remove(service.deleteNews, K, 'Noticia eliminada'),
  deleteManyNews: c.removeMany(service.deleteManyNews, 'Noticias eliminadas'),

  getSentiment: c.objGet(service.sentiment, K),
  addSentiment: c.objCreate(service.sentiment, K),
  updateSentiment: c.objUpdate(service.sentiment, K),
  deleteSentiment: c.objRemove(service.sentiment, K),

  getEvent: c.objGet(service.event, K),
  addEvent: c.objCreate(service.event, K),
  updateEvent: c.objUpdate(service.event, K),
  deleteEvent: c.objRemove(service.event, K)
};
