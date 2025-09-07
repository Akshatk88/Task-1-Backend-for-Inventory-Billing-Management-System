const express = require("express")
const { auth, authorize } = require("../middleware/auth")
const customerController = require("../controllers/customerController")

const router = express.Router()

router.get("/getAllCustomers", auth, customerController.getAllCustomers)
router.get("/reports/outstanding", auth, authorize("admin", "manager"), customerController.getOutstandingBalances)
router.get("/getCustomer/:id", auth, customerController.getCustomer)

router.post("/create", auth, authorize("admin", "manager", "employee"), customerController.createCustomer)
router.put("/update/:id", auth, authorize("admin", "manager", "employee"), customerController.updateCustomer)
router.delete("/delete/:id", auth, authorize("admin", "manager"), customerController.deleteCustomer)

module.exports = router
