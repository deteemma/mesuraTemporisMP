async function chargerOuNotFound(Model, id, res, message) {
  const document = await Model.findById(id);
  if (!document) {
    res.status(404).json({ message });
    return null;
  }
  return document;
}

module.exports = { chargerOuNotFound };
