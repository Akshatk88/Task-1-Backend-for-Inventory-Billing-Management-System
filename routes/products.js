const express = require("express")
const { auth, authorize } = require("../middleware/auth")
const productController = require("../controllers/productController")

const router = express.Router()

router.get("/getAllProducts", auth, productController.getAllProducts)
router.get("/categories/list", auth, productController.getCategories)
router.get("/alerts/low-stock", auth, productController.getLowStockProducts)
router.get("/getProduct/:id", auth, productController.getProduct)

router.post("/create", auth, authorize("admin", "manager"), productController.createProduct)
router.put("/updateProduct/:id", auth, authorize("admin", "manager"), productController.updateProduct)
router.patch("/updateStock/:id", auth, authorize("admin", "manager", "employee"), productController.updateStock)
router.delete("/deleteProduct/:id", auth, authorize("admin", "manager"), productController.deleteProduct)

module.exports = router
