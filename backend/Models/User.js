const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minlength: 3,
    trim: true
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\d{10}$/, 'Phone must be 10 digits']
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid email format"]
  },
  password: {
    type: String,
    required: [true, "Password is required atleast 6 letter required "],
    minlength: 6,
    select: false // Prevent password exposure in queries
  },
signature: {
  type: String // base64 image (optional)
},
role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
}

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
