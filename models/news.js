const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },  
  text: { type: String, required: true },
  writer: { type: Schema.Types.ObjectId, ref: 'User' },
  image: { type: Schema.Types.ObjectId, ref: 'Picture', default: null },
}, {
    timestamps: true,
  });

const News = mongoose.model('News', newsSchema);

module.exports = News;
