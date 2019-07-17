const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inviteSchema = new Schema({
  message: { type: String, default: 'Hi! I want YOU to join my band!' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  to: { type: Schema.Types.ObjectId, ref: 'User' },
  bandInvite: { type: Schema.Types.ObjectId, ref: 'Band' }
}, {
    timestamps: true,
  });

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
