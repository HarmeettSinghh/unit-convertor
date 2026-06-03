import Product from '../models/Product.js';
import { convert } from '../utils/conversion.js';

// 1. Create a new Product
export const createProduct = async (req, res) => {
  try {
    const { name, baseUnit, pricePerUnit, category, stockQuantity } = req.body;

    // Check if required fields are provided
    if (!name || !baseUnit || pricePerUnit === undefined) {
      return res.status(400).json({ message: 'Product name, unit, and price are required' });
    }

    // Check if a product with the same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product name already exists' });
    }

    // Create and save the new product
    const product = new Product({
      name,
      baseUnit,
      pricePerUnit,
      category,
      stockQuantity: stockQuantity || 0
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Calculate Price based on unit conversion
export const calculatePrice = async (req, res) => {
  try {
    const { productId, quantity, unit } = req.body;

    // Validate inputs
    if (!productId || !quantity || !unit) {
      return res.status(400).json({ message: 'Please provide productId, quantity, and unit' });
    }

    // Find the product in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Convert the customer's entered quantity into the product's base unit
    // Example: Convert 2 kg into 2000 g (since product is stored in grams)
    let convertedQuantity;
    try {
      convertedQuantity = convert(Number(quantity), unit, product.baseUnit);
    } catch (conversionError) {
      return res.status(400).json({ message: conversionError.message });
    }

    // Calculate total price: Quantity in base unit * Price per base unit
    const totalPrice = convertedQuantity * product.pricePerUnit;

    // Check if we have enough stock available
    const hasEnoughStock = product.stockQuantity >= convertedQuantity;

    // Return the detailed calculation results
    res.status(200).json({
      productId: product._id,
      product: product.name,
      enteredQuantity: Number(quantity),
      enteredUnit: unit,
      convertedQuantity: Number(convertedQuantity.toFixed(4)),
      baseUnit: product.baseUnit,
      totalPrice: Number(totalPrice.toFixed(2)),
      hasEnoughStock,
      availableStock: product.stockQuantity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Complete Purchase & Deduct Stock
export const purchaseProduct = async (req, res) => {
  try {
    const { productId, quantity, unit } = req.body;

    if (!productId || !quantity || !unit) {
      return res.status(400).json({ message: 'Please provide productId, quantity, and unit' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Convert the purchase quantity to the product's base unit
    let convertedQuantity;
    try {
      convertedQuantity = convert(Number(quantity), unit, product.baseUnit);
    } catch (conversionError) {
      return res.status(400).json({ message: conversionError.message });
    }

    // Check if there is enough stock to fulfill the purchase
    if (product.stockQuantity < convertedQuantity) {
      const availableStockInEnteredUnit = convert(product.stockQuantity, product.baseUnit, unit);
      return res.status(400).json({
        message: `Insufficient stock. Only ${availableStockInEnteredUnit.toFixed(2)} ${unit} available.`
      });
    }

    // Deduct stock and save the product back to the database
    product.stockQuantity -= convertedQuantity;
    await product.save();

    res.status(200).json({
      message: 'Purchase completed successfully',
      product: product.name,
      purchasedQuantity: Number(quantity),
      purchasedUnit: unit,
      remainingStock: Number(product.stockQuantity.toFixed(4)),
      baseUnit: product.baseUnit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
