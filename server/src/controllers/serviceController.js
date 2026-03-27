const Service = require('../models/Service');
const smmApi = require('../config/smmApi');

const getServices = async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const services = await Service.find(filter).sort({ category: 1, name: 1 });
    const categories = [...new Set(services.map((s) => s.category))];
    res.json({ services, categories });
  } catch (err) {
    next(err);
  }
};

const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (err) {
    next(err);
  }
};

const syncServices = async (req, res, next) => {
  try {
    const apiServices = await smmApi.getServices();
    let created = 0;
    let updated = 0;
    for (const s of apiServices) {
      const serviceData = {
        externalId: String(s.service),
        name: s.name,
        type: s.type,
        category: s.category,
        rate: parseFloat(s.rate),
        min: parseInt(s.min),
        max: parseInt(s.max),
        description: s.description || '',
        active: true,
      };
      const result = await Service.findOneAndUpdate(
        { externalId: String(s.service) },
        serviceData,
        { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true }
      );
      if (result.lastErrorObject?.upserted) created++;
      else updated++;
    }
    res.json({ message: 'Services synced', created, updated, total: apiServices.length });
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ service });
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (err) {
    next(err);
  }
};

module.exports = { getServices, getService, syncServices, createService, updateService };
