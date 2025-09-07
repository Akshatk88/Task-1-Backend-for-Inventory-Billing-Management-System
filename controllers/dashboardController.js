const Transaction = require("../models/Transaction")
const Product = require("../models/Product")
const Customer = require("../models/Customer")
const Vendor = require("../models/Vendor")

class DashboardController {
  // Get dashboard overview
  async getDashboardOverview(req, res) {
    try {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const startOfYear = new Date(today.getFullYear(), 0, 1)

      // Sales metrics
      const totalSales = await Transaction.aggregate([
        { $match: { type: "sale", status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])

      const monthlySales = await Transaction.aggregate([
        {
          $match: {
            type: "sale",
            status: { $ne: "cancelled" },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])

      // Purchase metrics
      const totalPurchases = await Transaction.aggregate([
        { $match: { type: "purchase", status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])

      // Inventory metrics
      const totalProducts = await Product.countDocuments()
      const lowStockProducts = await Product.countDocuments({
        $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
      })

      // Customer metrics
      const totalCustomers = await Customer.countDocuments()
      const outstandingReceivables = await Customer.aggregate([
        { $match: { balance: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ])

      // Vendor metrics
      const totalVendors = await Vendor.countDocuments()
      const outstandingPayables = await Vendor.aggregate([
        { $match: { payable: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$payable" } } },
      ])

      // Recent transactions
      const recentTransactions = await Transaction.find()
        .populate("customer", "name")
        .populate("vendor", "name")
        .sort({ createdAt: -1 })
        .limit(5)

      res.json({
        sales: {
          total: totalSales[0]?.total || 0,
          monthly: monthlySales[0]?.total || 0,
        },
        purchases: {
          total: totalPurchases[0]?.total || 0,
        },
        inventory: {
          totalProducts,
          lowStockProducts,
        },
        customers: {
          total: totalCustomers,
          outstandingReceivables: outstandingReceivables[0]?.total || 0,
        },
        vendors: {
          total: totalVendors,
          outstandingPayables: outstandingPayables[0]?.total || 0,
        },
        recentTransactions,
      })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get sales analytics
  async getSalesAnalytics(req, res) {
    try {
      const { period = "month" } = req.query

      let groupBy, dateRange
      const now = new Date()

      switch (period) {
        case "week":
          groupBy = { $dayOfWeek: "$createdAt" }
          dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "year":
          groupBy = { $month: "$createdAt" }
          dateRange = new Date(now.getFullYear(), 0, 1)
          break
        default: // month
          groupBy = { $dayOfMonth: "$createdAt" }
          dateRange = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      const salesData = await Transaction.aggregate([
        {
          $match: {
            type: "sale",
            status: { $ne: "cancelled" },
            createdAt: { $gte: dateRange },
          },
        },
        {
          $group: {
            _id: groupBy,
            totalSales: { $sum: "$total" },
            transactionCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])

      res.json(salesData)
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get inventory report
  async getInventoryReport(req, res) {
    try {
      const inventoryData = await Product.aggregate([
        {
          $project: {
            name: 1,
            category: 1,
            quantity: 1,
            price: 1,
            lowStockThreshold: 1,
            totalValue: { $multiply: ["$quantity", "$price"] },
            isLowStock: { $lte: ["$quantity", "$lowStockThreshold"] },
          },
        },
        {
          $group: {
            _id: "$category",
            products: { $push: "$$ROOT" },
            totalValue: { $sum: "$totalValue" },
            lowStockCount: {
              $sum: { $cond: ["$isLowStock", 1, 0] },
            },
          },
        },
      ])

      const totalInventoryValue = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
          },
        },
      ])

      res.json({
        categories: inventoryData,
        totalValue: totalInventoryValue[0]?.totalValue || 0,
      })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }

  // Get financial summary
  async getFinancialSummary(req, res) {
    try {
      const { startDate, endDate } = req.query

      const dateFilter = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate)

      const matchFilter = {
        status: { $ne: "cancelled" },
      }

      if (Object.keys(dateFilter).length > 0) {
        matchFilter.createdAt = dateFilter
      }

      // Sales summary
      const salesSummary = await Transaction.aggregate([
        { $match: { ...matchFilter, type: "sale" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalDiscount: { $sum: "$discountAmount" },
            totalTax: { $sum: "$taxAmount" },
            transactionCount: { $sum: 1 },
            paidAmount: { $sum: "$paidAmount" },
          },
        },
      ])

      // Purchase summary
      const purchaseSummary = await Transaction.aggregate([
        { $match: { ...matchFilter, type: "purchase" } },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: "$total" },
            transactionCount: { $sum: 1 },
            paidAmount: { $sum: "$paidAmount" },
          },
        },
      ])

      const sales = salesSummary[0] || {}
      const purchases = purchaseSummary[0] || {}

      res.json({
        sales: {
          revenue: sales.totalRevenue || 0,
          discount: sales.totalDiscount || 0,
          tax: sales.totalTax || 0,
          count: sales.transactionCount || 0,
          paid: sales.paidAmount || 0,
          outstanding: (sales.totalRevenue || 0) - (sales.paidAmount || 0),
        },
        purchases: {
          expense: purchases.totalExpense || 0,
          count: purchases.transactionCount || 0,
          paid: purchases.paidAmount || 0,
          outstanding: (purchases.totalExpense || 0) - (purchases.paidAmount || 0),
        },
        profit: (sales.totalRevenue || 0) - (purchases.totalExpense || 0),
      })
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
}

module.exports = new DashboardController()
