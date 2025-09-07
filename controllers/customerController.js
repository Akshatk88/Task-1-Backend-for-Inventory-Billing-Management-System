const Customer = require("../models/Customer")

class CustomerController {
  // Get all customers
  async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query

      const filter = {}
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ]
      }

      const customers = await Customer.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })

      const total = await Customer.countDocuments(filter)

      res.json({
        customers,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get single customer
  async getCustomer(req, res) {
    try {
      const customer = await Customer.findById(req.params.id)

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" })
      }

      res.json(customer)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Create new customer
  async createCustomer(req, res) {
    try {
      const customer = new Customer({
        ...req.body,
        createdBy: req.user.userId,
      })

      await customer.save()
      res.status(201).json({ message: "Customer created successfully", customer })
    } catch (error) {
      res.status(400).json({ message: "Validation error", error: error.message })
    }
  }

  // Update customer
  async updateCustomer(req, res) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user.userId },
        { new: true, runValidators: true },
      )

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" })
      }

      res.json({ message: "Customer updated successfully", customer })
    } catch (error) {
      res.status(400).json({ message: "Validation error", error: error.message })
    }
  }

  // Delete customer
  async deleteCustomer(req, res) {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id)

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" })
      }

      res.json({ message: "Customer deleted successfully" })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get customers with outstanding balance
  async getOutstandingBalances(req, res) {
    try {
      const customers = await Customer.find({ balance: { $gt: 0 } }).sort({ balance: -1 })

      res.json(customers)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
}

module.exports = new CustomerController()
