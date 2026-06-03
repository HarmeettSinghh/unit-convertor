import express from 'express';
import {
  createProduct,
  getProducts,
  calculatePrice,
  purchaseProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.post('/calculate', calculatePrice);
router.post('/purchase', purchaseProduct);

export default router;
