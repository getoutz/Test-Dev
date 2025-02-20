const express = require("express");
const bcrypt = require("bcryptjs");
const Customer = require("../models/customer");
const Order = require("../models/order");
const router = express.Router();
const mongoose = require("mongoose");

// Create Customer
router.post("/", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) return res.status(400).json({ message: "📛 Email already exists" });

    const newCustomer = new Customer({ name, email, password, phone });
    await newCustomer.save();
    res.status(201).json({ message: "Customer created", customer: newCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Read Customers (Get all)
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update Customer
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, rate_discount, wallet } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.rate_discount = rate_discount !== undefined ? rate_discount : customer.rate_discount;
    customer.wallet = wallet !== undefined ? wallet : customer.wallet;

    await customer.save();
    res.json({ message: "Customer updated", customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    await Customer.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Top-up wallet
router.put("/topup/:id", async (req, res) => {
  try {
    const { wallet_topup } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (typeof wallet_topup !== "number" || wallet_topup <= 0) {
      return res.status(400).json({ message: "Invalid top-up amount" });
    }

    customer.wallet += wallet_topup;
    await customer.save();

    res.json({ message: `Wallet topped up by ${wallet_topup}`, customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Purchase Product
router.post("/purchase/:id", async (req, res) => {
  try {
    const { product_name, product_price } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (typeof product_price !== "number" || product_price <= 0) {
      return res.status(400).json({ message: "Invalid product price" });
    }

    // คำนวณส่วนลด
    const discount = customer.rate_discount ? (product_price * customer.rate_discount) / 100 : 0;
    const final_price = product_price - discount;

    if (customer.wallet < final_price) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // หักเงินจาก wallet
    customer.wallet -= final_price;
    await customer.save();

    // สร้าง Order ใหม่
    const newOrder = new Order({
      customer: customer._id,
      product_name,
      product_price,
      final_price
    });

    await newOrder.save();

    res.json({ message: `Purchase successful: ${product_name} for ${final_price} THB`, order: newOrder, customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get All Orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("customer", "name email");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get Orders by Customer ID
router.get("/orders/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Customer ID format" });
    }

    const orders = await Order.find({ customer: req.params.id }).populate("customer", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Single Customer
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Customer ID format" });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
