const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: { type: Number, required: true },
});

// use this to copy _id to "id" this virtual field
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
