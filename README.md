# Inventory & Billing Management System

A comprehensive Node.js/Express.js backend API for managing inventory, billing, customers, vendors, and transactions with JWT authentication.

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, manager, employee, user)
- Secure password hashing with bcrypt
- User profile management

### Product Management
- Complete CRUD operations for products
- Stock level tracking and low stock alerts
- Category management
- Bulk operations and price updates
- Product search and filtering

### Customer & Vendor Management
- Customer relationship management
- Vendor/supplier management
- Balance tracking and credit limits
- Outstanding receivables and payables

### Transaction Management
- Sales and purchase transaction processing
- Automatic inventory updates
- Payment tracking and status management
- Transaction numbering system
- Multi-item transactions with tax and discount support

### Reporting & Analytics
- Dashboard with key business metrics
- Financial reports and profit/loss analysis
- Inventory reports and stock analysis
- Sales analytics and customer insights
- Export functionality (CSV)

## Architecture

### MVC Pattern
The application follows the Model-View-Controller (MVC) architectural pattern:

- **Models**: MongoDB schemas using Mongoose (`/models`)
- **Controllers**: Business logic handlers (`/controllers`)
- **Routes**: API endpoint definitions (`/routes`)
- **Middleware**: Authentication and authorization (`/middleware`)

### Project Structure
\`\`\`
├── controllers/          # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── customerController.js
│   ├── vendorController.js
│   ├── transactionController.js
│   └── dashboardController.js
├── models/              # Database schemas
│   ├── User.js
│   ├── Product.js
│   ├── Customer.js
│   ├── Vendor.js
│   └── Transaction.js
├── routes/              # API routes
│   ├── auth.js
│   ├── products.js
│   ├── customers.js
│   ├── vendors.js
│   ├── transactions.js
│   └── dashboard.js
├── middleware/          # Custom middleware
│   └── auth.js
├── server.js           # Application entry point
├── package.json
└── .env.example
\`\`\`

## Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd inventory-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration**
   Create a `.env` file based on `.env.example`:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/inventory_billing
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   \`\`\`

4. **Start the server**
   \`\`\`bash
   # Development
   npm run dev

   # Production
   npm start
   \`\`\`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Product Endpoints
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Update stock levels
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories/list` - Get product categories
- `GET /api/products/alerts/low-stock` - Get low stock products

### Customer Endpoints
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/reports/outstanding` - Get outstanding balances

### Vendor Endpoints
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get single vendor
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor
- `GET /api/vendors/reports/payables` - Get payables report

### Transaction Endpoints
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create new transaction
- `PATCH /api/transactions/:id/status` - Update transaction status
- `POST /api/transactions/:id/payments` - Record payment

### Dashboard Endpoints
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/financial` - Get financial summary
- `GET /api/dashboard/inventory` - Get inventory reports
- `GET /api/dashboard/sales` - Get sales analytics

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Environment**: dotenv for configuration
- **CORS**: Cross-origin resource sharing support

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based authorization middleware
- Input validation and sanitization
- Error handling and logging
- CORS configuration

## Development

### Running in Development Mode
\`\`\`bash
npm run dev
\`\`\`

### Environment Variables
Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Testing
The API can be tested using tools like Postman, Insomnia, or curl. Import the provided API collection for quick testing.
