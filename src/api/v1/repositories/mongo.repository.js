// Acceso a datos en MongoDB (Mongoose) para cualquier modelo
const mongoose = require('mongoose');
const httpError = require('../../../helpers/httpError');
const { isMongoReady } = require('../../../config/mongo.config');
const { validateWithModel } = require('./validate');

const mongoRepository = ({ Model, keyField }) => {
  const ensureReady = () => {
    if (!isMongoReady()) throw httpError(503, 'MongoDB no esta conectado');
  };

  // Filtro por llave; si la llave es _id y no es un ObjectId valido no hay coincidencias
  const keyFilter = (key) => {
    if (keyField === '_id' && !mongoose.isValidObjectId(key)) return null;
    return { [keyField]: key };
  };

  return {
    async find(filters = {}, includeDeleted = false) {
      ensureReady();
      const query = { ...filters };
      if (!includeDeleted) query['DETAIL_ROW.DELETED'] = { $ne: true };
      return Model.find(query).sort({ [keyField]: 1 }).lean();
    },

    async findOne(key) {
      ensureReady();
      const filter = keyFilter(key);
      if (!filter) return null;
      return Model.findOne(filter).lean();
    },

    async insertMany(docs) {
      ensureReady();
      const valid = [];
      for (const doc of docs) valid.push(await validateWithModel(Model, doc));
      const saved = await Model.insertMany(valid);
      return saved.map((d) => d.toObject());
    },

    async replaceOne(key, doc) {
      ensureReady();
      const valid = await validateWithModel(Model, doc);
      await Model.replaceOne(keyFilter(key), valid);
      return valid;
    },

    async deleteMany(keys) {
      ensureReady();
      const values = keyField === '_id' ? keys.filter((k) => mongoose.isValidObjectId(k)) : keys;
      const result = await Model.deleteMany({ [keyField]: { $in: values } });
      return result.deletedCount;
    }
  };
};

module.exports = mongoRepository;
