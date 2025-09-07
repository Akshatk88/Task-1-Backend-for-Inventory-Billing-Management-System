const mongoose = require("mongoose")

const transactionItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
})

// Virtual for line total
transactionItemSchema.virtual("lineTotal").get(function () {
  const subtotal = this.quantity * this.unitPrice
  const discountAmount = (subtotal * this.discount) / 100
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * this.taxRate) / 100
  return taxableAmount + taxAmount
})

const transactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["sale", "purchase"],
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: function () {
        return this.type === "sale"
      },
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: function () {
        return this.type === "purchase"
      },
    },
    items: [transactionItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "partial", "overdue", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "cheque", "upi", "credit"],
      default: "cash",
    },
    dueDate: {
      type: Date,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    isStockUpdated: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Index for better performance
transactionSchema.index({ transactionNumber: 1 })
transactionSchema.index({ type: 1, status: 1 })
transactionSchema.index({ customer: 1 })
transactionSchema.index({ vendor: 1 })
transactionSchema.index({ transactionDate: -1 })

// Virtual for balance due
transactionSchema.virtual("balanceDue").get(function () {
  return Math.max(0, this.totalAmount - this.paidAmount)
})

// Virtual for payment status
transactionSchema.virtual("paymentStatus").get(function () {
  if (this.paidAmount === 0) return "unpaid"
  if (this.paidAmount >= this.totalAmount) return "paid"
  return "partial"
})

// Pre-save middleware to generate transaction number
transactionSchema.pre("save", async function (next) {
  if (this.isNew) {
    const prefix = this.type === "sale" ? "INV" : "PUR"
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    // Find the last transaction number for this type and month
    const lastTransaction = await this.constructor
      .findOne({
        type: this.type,
        transactionNumber: new RegExp(`^${prefix}${year}${month}`),
      })
      .sort({ transactionNumber: -1 })

    let sequence = 1
    if (lastTransaction) {
      const lastSequence = Number.parseInt(lastTransaction.transactionNumber.slice(-4))
      sequence = lastSequence + 1
    }

    this.transactionNumber = `${prefix}${year}${month}${sequence.toString().padStart(4, "0")}`
  }
  next()
})

module.exports = mongoose.model("Transaction", transactionSchema)
