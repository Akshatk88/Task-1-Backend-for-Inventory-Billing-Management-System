const Vendor = require("../models/Vendor")

class VendorController {
  // Get all vendors
  async getAllVendors(req, res) {
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

      const vendors = await Vendor.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })

      const total = await Vendor.countDocuments(filter)

      res.json({
        vendors,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get single vendor
  async getVendor(req, res) {
    try {
      const vendor = await Vendor.findById(req.params.id)

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" })
      }

      res.json(vendor)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Create new vendor
  async createVendor(req, res) {
    try {
      const vendor = new Vendor({
        ...req.body,
        createdBy: req.user.userId,
      })

      await vendor.save()
      res.status(201).json({ message: "Vendor created successfully", vendor })
    } catch (error) {
      res.status(400).json({ message: "Validation error", error: error.message })
    }
  }

  // Update vendor
  async updateVendor(req, res) {
    try {
      const vendor = await Vendor.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user.userId },
        { new: true, runValidators: true },
      )

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" })
      }

      res.json({ message: "Vendor updated successfully", vendor })
    } catch (error) {
      res.status(400).json({ message: "Validation error", error: error.message })
    }
  }

  // Delete vendor
  async deleteVendor(req, res) {
    try {
      const vendor = await Vendor.findByIdAndDelete(req.params.id)

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" })
      }

      res.json({ message: "Vendor deleted successfully" })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get vendors with payables
  async getPayables(req, res) {
    try {
      const vendors = await Vendor.find({ payable: { $gt: 0 } }).sort({ payable: -1 })

      res.json(vendors)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
}

module.exports = new VendorController()
