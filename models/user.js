const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Password hashing middleware before saving the user
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Skip hashing if password is not modified
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



// Compare the entered password with the hashed password in the database
userSchema.methods.comparePassword = async function(password) {
  console.log('Entered password:', password);
  console.log('Stored password hash:', this.password);
  return await bcrypt.compare(password, this.password);
};


// Create the User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
