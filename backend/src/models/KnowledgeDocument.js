const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const knowledgeChunkSchema = new mongoose.Schema({
  chunkIndex: Number,
  text: String,
  embedding: [Number], // Vector representation
});

const knowledgeDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: Object.values(CATEGORIES), required: true },
  content: { type: String, required: true },
  summary: { type: String, default: '' },
  chunks: [knowledgeChunkSchema],
  tags: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
