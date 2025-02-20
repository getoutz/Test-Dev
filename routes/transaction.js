const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const router = express.Router();

console.log("🔥 transactions.js loaded!");

// Create Transaction (เพิ่มรายการรายรับ/รายจ่าย)
router.post("/", async (req, res) => {
  try {
    const { name, type, amount } = req.body;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "❌ Type must be 'income' or 'expense'" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "❌ Amount must be a positive number" });
    }

    const newTransaction = new Transaction({ name, type, amount });
    await newTransaction.save();

    res.status(201).json({ message: "✅ Transaction created", transaction: newTransaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Transaction (อัปเดตข้อมูลรายรับ/รายจ่าย)
router.put("/:id", async (req, res) => {
  try {
    const { name, type, amount } = req.body;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "❌ Type must be 'income' or 'expense'" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "❌ Amount must be a positive number" });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "📛 Transaction not found" });
    }

    transaction.name = name || transaction.name;
    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;

    await transaction.save();

    res.json({ message: "✅ Transaction updated", transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Transaction (ลบรายการรายรับ/รายจ่าย)
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "📛 Transaction not found" });
    }

    await transaction.deleteOne();
    res.json({ message: "✅ Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Transactions (แสดงรายการรายรับรายจ่าย พร้อมฟิลเตอร์วันที่และประเภท)
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let filter = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lt: new Date(new Date(`${endDate}T23:59:59.999Z`).setDate(new Date(`${endDate}T23:59:59.999Z`).getDate() + 1))
      };
    } else {
      res.status(400).json({ message: "startDate or endDate is missing!"});
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Dashboard Data
router.get("/dashboard", async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
    
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
    
        const transactionsByMonth = await Transaction.aggregate([
            {
            $match: { date: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } }
            },
            {
            $group: {
                _id: { month: { $month: "$date" }, type: "$type" },
                total: { $sum: "$amount" }
            }
            }
        ]);
    
        let incomeData = {};
        let expenseData = {};
    
        // set 0
        months.forEach((month) => {
            incomeData[month] = 0;
            expenseData[month] = 0;
        });
    
        transactionsByMonth.forEach((t) => {
            let monthName = months[t._id.month - 1];
            if (t._id.type === "income") {
            incomeData[monthName] = t.total;
            } else {
            expenseData[monthName] = t.total;
            }
        });
    
        const transactionsLastYear = await Transaction.aggregate([
            {
            $match: { date: { $gte: new Date(`${lastYear}-01-01`), $lte: new Date(`${lastYear}-12-31`) } }
            },
            {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" }
            }
            }
        ]);
    
        let incomeLastYear = transactionsLastYear.find(t => t._id === "income")?.total || 0;
        let expenseLastYear = transactionsLastYear.find(t => t._id === "expense")?.total || 0;
    
        let totalIncomeThisYear = Object.values(incomeData).reduce((acc, val) => acc + val, 0);
        let totalExpenseThisYear = Object.values(expenseData).reduce((acc, val) => acc + val, 0);
    
        const incomeGrowth = incomeLastYear > 0 ? ((totalIncomeThisYear - incomeLastYear) / incomeLastYear) * 100 : 100;
        const expenseGrowth = expenseLastYear > 0 ? ((totalExpenseThisYear - expenseLastYear) / expenseLastYear) * 100 : 100;
    
        res.json({
            incomeData,
            expenseData,
            totalIncomeThisYear,
            totalExpenseThisYear,
            incomeGrowth,
            expenseGrowth
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

  
module.exports = router;
