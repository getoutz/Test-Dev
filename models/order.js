const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product_name: String,
  product_price: Number,
  final_price: Number,
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;