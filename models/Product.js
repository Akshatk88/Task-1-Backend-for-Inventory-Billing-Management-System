const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["piece", "kg", "liter", "meter", "box", "pack"],
      default: "piece",
    },
    supplier: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
productSchema.index({ name: "text", description: "text", sku: "text" })
productSchema.index({ category: 1 })
productSchema.index({ isActive: 1 })

// Virtual for profit margin
productSchema.virtual("profitMargin").get(function () {
  return ((this.price - this.costPrice) / this.costPrice) * 100
})

// Virtual for low stock alert
productSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.minStockLevel
})

module.exports = mongoose.model("Product", productSchema)
