const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bandSchema = new Schema({
  bandname: { type: String, required: true },
  leader: { type: Schema.Types.ObjectId, ref: 'User' },
  genre: {
    type: Array,
  },
  members: { type: Schema.Types.ObjectId, ref: 'User' },
  votes: Number,
  votesValues: Number,
}, {
  timestamps: true,
});

const Band = mongoose.model('Band', bandSchema);

module.exports = Band;
