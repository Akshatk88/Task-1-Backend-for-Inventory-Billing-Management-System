const express = require("express")
const { auth, authorize } = require("../middleware/auth")
const transactionController = require("../controllers/transactionController")

const router = express.Router()

router.get("/getAllTransactions", auth, transactionController.getAllTransactions)
router.get("/getTransaction/:id", auth, transactionController.getTransaction)

router.post("/createTransaction", auth, authorize("admin", "manager", "employee"), transactionController.createTransaction)
router.patch("/updateTransaction/:id/status", auth, authorize("admin", "manager"), transactionController.updateTransactionStatus)
router.post("/recordPayment/:id", auth, authorize("admin", "manager", "employee"), transactionController.recordPayment)

module.exports = router
