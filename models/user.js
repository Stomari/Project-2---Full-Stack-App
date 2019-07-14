const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: { type: String, required: true },
  email: String,
  role: {
    type: String,
    enum: ['GUEST', 'EDITOR', 'ADMIN'],
    default: 'GUEST',
  },
  instruments: {
    type: Array,
  },
  bands: { type: Schema.Types.ObjectId, ref: 'Band' },
  votes: Number,
  votesValues: Number,
  Friends: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
