const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  message: { type: String, default: 'Hi! I would like to join your band :)' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  to: { type: Schema.Types.ObjectId, ref: 'Band' },
}, {
    timestamps: true,
  });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;