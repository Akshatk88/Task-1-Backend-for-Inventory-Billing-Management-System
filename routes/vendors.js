const express = require("express")
const { auth, authorize } = require("../middleware/auth")
const vendorController = require("../controllers/vendorController")

const router = express.Router()

router.get("/getAllVendors", auth, vendorController.getAllVendors)
router.get("/reports/payables", auth, authorize("admin", "manager"), vendorController.getPayables)
router.get("/getVendor/:id", auth, vendorController.getVendor)

router.post("/createVendor", auth, authorize("admin", "manager"), vendorController.createVendor)
router.put("/updateVendor/:id", auth, authorize("admin", "manager"), vendorController.updateVendor)
router.delete("/deleteVendor/:id", auth, authorize("admin", "manager"), vendorController.deleteVendor)

module.exports = router
