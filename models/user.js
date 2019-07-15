const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, require: true },
  password: { type: String, required: true },
  email: String,
  role: {
    type: String,
    enum: ['GUEST', 'EDITOR', 'ADMIN'],
    default: 'GUEST',
  },
  picture: [{ type: Schema.Types.ObjectId, ref: 'Picture' }],
  name: { type: String, required: true },
  surname: { type: String, required: true },
  age: { type: Number, required: true },
  biography: { type: String, default: '' },
  instruments: {
    type: [String], default: [],
  },
  bands: [{ type: Schema.Types.ObjectId, ref: 'Band', default: [] }],
  votes: { type: Number, default: 0 },
  votesValues: { type: Number, default: 0 },
  Friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  firstTime: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
