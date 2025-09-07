const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },
    customerType: {
      type: String,
      enum: ["individual", "business"],
      default: "individual",
    },
    businessInfo: {
      companyName: { type: String, trim: true },
      gstNumber: { type: String, trim: true },
      panNumber: { type: String, trim: true },
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    paymentTerms: {
      type: String,
      enum: ["cash", "net15", "net30", "net45", "net60"],
      default: "cash",
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: 500,
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

// Index for better search performance
customerSchema.index({ name: "text", email: "text" })
customerSchema.index({ email: 1 }, { unique: true })
customerSchema.index({ isActive: 1 })

// Virtual for available credit
customerSchema.virtual("availableCredit").get(function () {
  return Math.max(0, this.creditLimit - this.currentBalance)
})

module.exports = mongoose.model("Customer", customerSchema)
