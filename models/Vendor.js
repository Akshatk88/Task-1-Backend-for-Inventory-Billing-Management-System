const mongoose = require("mongoose")

const vendorSchema = new mongoose.Schema(
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
    businessInfo: {
      companyName: { type: String, required: true, trim: true },
      gstNumber: { type: String, trim: true },
      panNumber: { type: String, trim: true },
      registrationNumber: { type: String, trim: true },
    },
    contactPerson: {
      name: { type: String, trim: true },
      designation: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },
    paymentTerms: {
      type: String,
      enum: ["immediate", "net15", "net30", "net45", "net60"],
      default: "net30",
    },
    bankDetails: {
      accountName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
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
vendorSchema.index({ name: "text", "businessInfo.companyName": "text" })
vendorSchema.index({ email: 1 }, { unique: true })
vendorSchema.index({ category: 1 })
vendorSchema.index({ isActive: 1 })

module.exports = mongoose.model("Vendor", vendorSchema)
