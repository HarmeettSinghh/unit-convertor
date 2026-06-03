# MERN Inventory and Unit Conversion Management System

This is a full-stack inventory and unit conversion system built using the MERN stack. The application allows admins to add products in multiple units and manages their storage internally in standard base units (Weight in `g`, Liquid in `mL`, Count in `unit`), performing real-time conversions and dynamic price calculations.

---

## Key Features

1. **Internal Standardized Storage**: Products created in non-standard units (e.g. `kg` or `L`) are automatically normalized to their base units (`g` or `mL`) pre-save in MongoDB, adjusting prices and stock levels proportionally.
2. **REST API Architecture**: Dedicated endpoints for inventory management, price calculations, and stock deductions.
3. **Unit Conversion Engine**: Robust utility that handles weight, liquid, and count conversions while preventing incompatible conversions (e.g., weight to volume).
4. **Dynamic Price Calculator**: Interactive dashboard tool that displays live conversion ratios, calculates pricing, checks stock availability, and allows mock purchases to deduct inventory.
5. **Glassmorphic Responsive UI**: Modern dashboard built with vanilla CSS featuring mesh gradient backdrops, sleek inputs, responsive tables, loading animations, and notifications.

---

## Project Structure

```
unit-converter/
│
├── server/                    # Express backend
│   ├── config/
│   │   └── db.js              # Database connection configuration
│   ├── controllers/
│   │   └── productController.js # Controllers for products & calculations
│   ├── models/
│   │   └── Product.js         # Mongoose schema and pre-save normalization hooks
│   ├── routes/
│   │   └── productRoutes.js   # Route mappings
│   ├── utils/
│   │   └── conversion.js      # Unit conversion logic and constants
│   ├── middleware/
│   │   └── errorMiddleware.js # Centralized express error handler
│   ├── .env                   # Environmental variables
│   ├── package.json           # Backend dependency configuration
│   └── server.js              # Express app entry point
│
├── client/                    # Vite + React frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js         # Centralized Axios API request interface
│   │   ├── App.jsx            # Main dashboard component
│   │   ├── index.css          # Glassmorphism styling and custom animations
│   │   └── main.jsx           # App wrapper
│   └── package.json           # Frontend dependency configuration
│
└── README.md                  # Documentation (This file)
```

---

## Running the Application Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or a local MongoDB instance running)

### Setup the Backend Server
1. Navigate into the `server/` directory:
   ```bash
   cd server
   ```
2. Make sure you configure the `.env` file with your Mongo URI:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   ```
3. Start the server in development mode:
   ```bash
   npm run dev
   ```

### Setup the React Client
1. Navigate into the `client/` directory:
   ```bash
   cd ../client
   ```
2. Start the Vite client:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the local address displayed in your terminal (usually `http://localhost:5173` or `http://localhost:5174`).

---

## API Endpoints

### 1. Create a Product
- **URL**: `POST /api/products`
- **Body**:
  ```json
  {
    "name": "Rice",
    "category": "Grains",
    "baseUnit": "kg",
    "pricePerUnit": 10.00,
    "stockQuantity": 5
  }
  ```
  *(Note: This is automatically normalized to `5000g` at `$0.01` per gram in the database)*

### 2. Get Products List
- **URL**: `GET /api/products`

### 3. Calculate Prices & Conversions
- **URL**: `POST /api/products/calculate`
- **Body**:
  ```json
  {
    "productId": "[PRODUCT_MONGO_ID]",
    "quantity": 2.5,
    "unit": "kg"
  }
  ```
- **Response**:
  ```json
  {
    "productId": "...",
    "product": "Rice",
    "enteredQuantity": 2.5,
    "enteredUnit": "kg",
    "convertedQuantity": 2500,
    "baseUnit": "g",
    "totalPrice": 25.00,
    "hasEnoughStock": true,
    "availableStock": 5000
  }
  ```

### 4. Deduct Inventory (Purchase Product)
- **URL**: `POST /api/products/purchase`
- **Body**: Same as calculation. Deducts quantity from product stock in standard base unit.
