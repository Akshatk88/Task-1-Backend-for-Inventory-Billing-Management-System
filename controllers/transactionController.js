const Transaction = require("../models/Transaction")
const Product = require("../models/Product")
const Customer = require("../models/Customer")
const Vendor = require("../models/Vendor")

class TransactionController {
  // Get all transactions
  async getAllTransactions(req, res) {
    try {
      const { page = 1, limit = 10, type, status, startDate, endDate } = req.query

      const filter = {}
      if (type) filter.type = type
      if (status) filter.status = status
      if (startDate || endDate) {
        filter.date = {}
        if (startDate) filter.date.$gte = new Date(startDate)
        if (endDate) filter.date.$lte = new Date(endDate)
      }

      const transactions = await Transaction.find(filter)
        .populate("customer", "name email")
        .populate("vendor", "name email")
        .populate("items.product", "name price")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })

      const total = await Transaction.countDocuments(filter)

      res.json({
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get single transaction
  async getTransaction(req, res) {
    try {
      const transaction = await Transaction.findById(req.params.id)
        .populate("customer", "name email phone address")
        .populate("vendor", "name email phone address")
        .populate("items.product", "name price category")

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" })
      }

      res.json(transaction)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Create new transaction
  async createTransaction(req, res) {
    try {
      const { type, customer, vendor, items, discount = 0, tax = 0 } = req.body

      // Calculate totals
      let subtotal = 0
      for (const item of items) {
        const product = await Product.findById(item.product)
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` })
        }

        // Check stock for sales
        if (type === "sale" && product.quantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`,
          })
        }

        item.price = product.price
        item.total = item.quantity * item.price
        subtotal += item.total
      }

      const discountAmount = (subtotal * discount) / 100
      const taxAmount = ((subtotal - discountAmount) * tax) / 100
      const total = subtotal - discountAmount + taxAmount

      // Generate transaction number
      const count = await Transaction.countDocuments({ type })
      const prefix = type === "sale" ? "INV" : "BILL"
      const transactionNumber = `${prefix}-${String(count + 1).padStart(6, "0")}`

      const transaction = new Transaction({
        transactionNumber,
        type,
        customer: type === "sale" ? customer : undefined,
        vendor: type === "purchase" ? vendor : undefined,
        items,
        subtotal,
        discount,
        discountAmount,
        tax,
        taxAmount,
        total,
        createdBy: req.user.userId,
      })

      await transaction.save()

      // Update inventory and balances
      for (const item of items) {
        const product = await Product.findById(item.product)
        if (type === "sale") {
          product.quantity -= item.quantity
        } else {
          product.quantity += item.quantity
        }
        await product.save()
      }

      // Update customer/vendor balance
      if (type === "sale" && customer) {
        await Customer.findByIdAndUpdate(customer, {
          $inc: { balance: total },
        })
      } else if (type === "purchase" && vendor) {
        await Vendor.findByIdAndUpdate(vendor, {
          $inc: { payable: total },
        })
      }

      res.status(201).json({
        message: "Transaction created successfully",
        transaction,
      })
    } catch (error) {
      res.status(400).json({ message: "Validation error", error: error.message })
    }
  }

  // Update transaction status
  async updateTransactionStatus(req, res) {
    try {
      const { status } = req.body

      const transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        { status, updatedBy: req.user.userId },
        { new: true },
      )

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" })
      }

      res.json({ message: "Transaction status updated", transaction })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Record payment
  async recordPayment(req, res) {
    try {
      const { amount, method, reference } = req.body

      const transaction = await Transaction.findById(req.params.id)
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" })
      }

      if (transaction.paidAmount + amount > transaction.total) {
        return res.status(400).json({ message: "Payment amount exceeds total" })
      }

      transaction.payments.push({
        amount,
        method,
        reference,
        date: new Date(),
      })

      transaction.paidAmount += amount

      if (transaction.paidAmount >= transaction.total) {
        transaction.status = "paid"
      } else {
        transaction.status = "partial"
      }

      await transaction.save()

      // Update customer/vendor balance
      if (transaction.type === "sale" && transaction.customer) {
        await Customer.findByIdAndUpdate(transaction.customer, {
          $inc: { balance: -amount },
        })
      } else if (transaction.type === "purchase" && transaction.vendor) {
        await Vendor.findByIdAndUpdate(transaction.vendor, {
          $inc: { payable: -amount },
        })
      }

      res.json({ message: "Payment recorded successfully", transaction })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
}

module.exports = new TransactionController()
