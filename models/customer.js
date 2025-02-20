const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  rate_discount: { type: Number, default: null },
  wallet: { type: Number, default: 0 }
});

// เข้ารหัสรหัสผ่านก่อนบันทึกลงฐานข้อมูล
CustomerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Customer", CustomerSchema);
