const Product = require("../models/Product")

class ProductController {
  // Get all products with filtering and pagination
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 10, category, minPrice, maxPrice, inStock, search } = req.query

      // Build filter object
      const filter = {}

      if (category) filter.category = category
      if (minPrice || maxPrice) {
        filter.price = {}
        if (minPrice) filter.price.$gte = Number.parseFloat(minPrice)
        if (maxPrice) filter.price.$lte = Number.parseFloat(maxPrice)
      }
      if (inStock === "true") filter.quantity = { $gt: 0 }
      if (search) {
        filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
      }

      const products = await Product.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })

      const total = await Product.countDocuments(filter)

      res.json({
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get single product
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id)

      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      res.json(product)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Create new product
  async createProduct(req, res) {
    try {
      const product = new Product({
        ...req.body,
        createdBy: req.user.userId,
      })

      await product.save()
      res.status(201).json({ message: "Product created successfully", product })
    } catch (error) {
      res.status(400).json({ message: "Validation error", error: error.message })
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user.userId },
        { new: true, runValidators: true },
      )

      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      res.json({ message: "Product updated successfully", product })
    } catch (error) {
      res.status(400).json({ message: "Validation error", error: error.message })
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id)

      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      res.json({ message: "Product deleted successfully" })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Update stock
  async updateStock(req, res) {
    try {
      const { quantity, operation } = req.body // operation: 'add' or 'subtract'

      const product = await Product.findById(req.params.id)
      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      if (operation === "add") {
        product.quantity += quantity
      } else if (operation === "subtract") {
        if (product.quantity < quantity) {
          return res.status(400).json({ message: "Insufficient stock" })
        }
        product.quantity -= quantity
      }

      await product.save()
      res.json({ message: "Stock updated successfully", product })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get low stock products
  async getLowStockProducts(req, res) {
    try {
      const products = await Product.find({
        $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
      })

      res.json(products)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get product categories
  async getCategories(req, res) {
    try {
      const categories = await Product.distinct("category")
      res.json(categories)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
}

module.exports = new ProductController()
