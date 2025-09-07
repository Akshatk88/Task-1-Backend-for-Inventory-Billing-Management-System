const express = require("express")
const { auth } = require("../middleware/auth")
const authController = require("../controllers/authController")

const router = express.Router()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/profile", auth, authController.getProfile)
router.put("/update-profile", auth, authController.updateProfile)
router.put("/change-password", auth, authController.changePassword)

module.exports = router
