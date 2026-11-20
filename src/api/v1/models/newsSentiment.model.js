// Modelo de la coleccion news_sentiment / tabla zt_news_sentiment
// Noticias con su sentimiento y si bloquean la apertura de contratos.
const mongoose = require('mongoose');
const { detailRowSchema } = require('./detailRow.schema');

const { Schema } = mongoose;

// Subdocumento objeto: sentimiento de la noticia
const sentimentSchema = new Schema(
  {
    score: { type: Number, required: true, min: -1, max: 1 },
    label: { type: String, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'], required: true }
  },
  { _id: false }
);

// Subdocumento objeto: evento asociado (reporte de resultados)
const eventSchema = new Schema(
  {
    is_earnings: { type: Boolean, default: false },
    event_date: { type: Date, default: null }
  },
  { _id: false }
);

const newsSentimentSchema = new Schema(
  {
    symbol: { type: String, default: null, uppercase: true, trim: true },
    published_at: { type: Date, required: true },
    source: { type: String, required: true },
    headline: { type: String, required: true },
    url: { type: String },
    sentiment: { type: sentimentSchema, required: true },
    event: { type: eventSchema },
    blocks_trading: { type: Boolean, required: true, default: false },
    DETAIL_ROW: { type: detailRowSchema, required: true }
  },
  { collection: 'news_sentiment', versionKey: false }
);

const NewsSentiment = mongoose.models.NewsSentiment || mongoose.model('NewsSentiment', newsSentimentSchema);

const table = {
  name: 'zt_news_sentiment',
  key: '_id',
  fields: ['_id', 'symbol', 'published_at', 'source', 'headline', 'url', 'sentiment', 'event', 'blocks_trading']
};

module.exports = { Model: NewsSentiment, table, keyField: '_id' };
