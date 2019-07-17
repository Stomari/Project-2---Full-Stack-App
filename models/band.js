const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bandSchema = new Schema({
  bandname: { type: String, required: true },
  biography: { type: String, default: 'We are a band !' },
  leader: { type: Schema.Types.ObjectId, ref: 'User' },
  picture: { type: Schema.Types.ObjectId, ref: 'Picture' },
  genre: {
    type: Array,
  },
  chatband: { type: [String], default: [] },
  members: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  votesValues: { type: Number, default: 0 },
  request: [{ type: Schema.Types.ObjectId, ref: 'Request', default: [] }],
}, {
    timestamps: true,
  });

const Band = mongoose.model('Band', bandSchema);

module.exports = Band;
