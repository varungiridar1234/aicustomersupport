const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. 'ticketId'
  seq: { type: Number, default: 1024 }
});

module.exports = mongoose.model('Counter', counterSchema);
