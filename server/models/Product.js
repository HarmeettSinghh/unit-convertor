import mongoose from 'mongoose';
import { normalizeProduct } from '../utils/conversion.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      unique: true,
      trim: true,
    },
    baseUnit: {
      type: String,
      required: [true, 'Base unit is required'],
      enum: {
        values: ['g', 'kg', 'mL', 'L', 'unit'],
        message: '{VALUE} is not a supported unit. Choose from: g, kg, mL, L, unit',
      },
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to normalize units (e.g. kg -> g, L -> mL)
productSchema.pre('save', function () {
  // Normalize if any conversion-sensitive fields were modified
  if (this.isModified('baseUnit') || this.isModified('pricePerUnit') || this.isModified('stockQuantity')) {
    const normalized = normalizeProduct(this.baseUnit, this.pricePerUnit, this.stockQuantity);
    this.baseUnit = normalized.baseUnit;
    this.pricePerUnit = normalized.pricePerUnit;
    this.stockQuantity = normalized.stockQuantity;
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
