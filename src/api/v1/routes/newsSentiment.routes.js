// Ruteo del submodulo Noticias y sentimiento: /api/v1/news-sentiment
const { Router } = require('express');
const c = require('../controllers/newsSentiment.controller');

const router = Router();

// ----- Coleccion principal: news_sentiment -----
router.get('/', c.getAllNews);
router.post('/', c.addNews);
router.post('/batch', c.addManyNews);
router.put('/batch', c.updateManyNews);
router.delete('/batch', c.deleteManyNews);
router.get('/:newsId', c.getNewsById);
router.put('/:newsId', c.updateNews);
router.delete('/:newsId', c.deleteNews);

// ----- Subdocumento objeto: sentiment -----
router.get('/:newsId/sentiment', c.getSentiment);
router.post('/:newsId/sentiment', c.addSentiment);
router.put('/:newsId/sentiment', c.updateSentiment);
router.delete('/:newsId/sentiment', c.deleteSentiment);

// ----- Subdocumento objeto: event -----
router.get('/:newsId/event', c.getEvent);
router.post('/:newsId/event', c.addEvent);
router.put('/:newsId/event', c.updateEvent);
router.delete('/:newsId/event', c.deleteEvent);

module.exports = router;
