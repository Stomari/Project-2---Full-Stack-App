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
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  votes: { type: Number, default: 0 },
  votesValues: { type: Number, default: 0 },
}, {
    timestamps: true,
  });

const Band = mongoose.model('Band', bandSchema);

module.exports = Band;
