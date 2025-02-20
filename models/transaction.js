const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ชื่อรายการ
  type: { type: String, enum: ["income", "expense"], required: true }, // ประเภท (รายรับ, รายจ่าย)
  amount: { type: Number, required: true }, // จำนวนเงิน
  date: { type: Date, default: Date.now } // วันที่ทำรายการ
});

module.exports = mongoose.model("Transaction", TransactionSchema);
