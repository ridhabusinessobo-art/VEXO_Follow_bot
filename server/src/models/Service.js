const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  externalId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  min: {
    type: Number,
    required: true,
    min: 1,
  },
  max: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

serviceSchema.index({ category: 1 });
serviceSchema.index({ active: 1 });

module.exports = mongoose.model('Service', serviceSchema);
