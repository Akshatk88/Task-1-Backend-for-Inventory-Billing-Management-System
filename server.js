const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const customerRoutes = require("./routes/customers")
const vendorRoutes = require("./routes/vendors")
const transactionRoutes = require("./routes/transactions")
const dashboardRoutes = require("./routes/dashboard")

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" })) // Increased JSON payload limit for bulk operations
app.use(express.urlencoded({ extended: true })) // Added URL encoded support

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/inventory_billing", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/vendors", vendorRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Inventory & Billing API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

app.use((err, req, res, next) => {
  console.error(`Error ${err.status || 500}: ${err.message}`)
  console.error(err.stack)

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  })
})

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})
