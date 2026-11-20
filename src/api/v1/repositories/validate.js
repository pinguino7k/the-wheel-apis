// Valida un documento con la clase modelo (Mongoose) antes de guardarlo,
// sin importar si se guarda en MongoDB o en Supabase.
const validateWithModel = async (Model, doc) => {
  const instance = new Model(doc);
  await instance.validate();
  return instance.toObject({ depopulate: true });
};

module.exports = { validateWithModel };
