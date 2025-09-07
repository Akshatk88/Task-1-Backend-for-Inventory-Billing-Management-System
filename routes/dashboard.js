const express = require("express")
const { auth, authorize } = require("../middleware/auth")
const dashboardController = require("../controllers/dashboardController")

const router = express.Router()

router.get("/overview", auth, dashboardController.getDashboardOverview)
router.get("/financial", auth, authorize("admin", "manager"), dashboardController.getFinancialSummary)
router.get("/inventory", auth, dashboardController.getInventoryReport)
router.get("/sales", auth, authorize("admin", "manager"), dashboardController.getSalesAnalytics)

module.exports = router
