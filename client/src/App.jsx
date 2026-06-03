import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  calculatePrice,
  purchaseProduct
} from './services/api';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    baseUnit: 'g',
    pricePerUnit: '',
    category: 'Grains & Staples',
    stockQuantity: ''
  });

  const [calcForm, setCalcForm] = useState({
    productId: '',
    quantity: '',
    unit: ''
  });
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (calcForm.productId) {
      const selectedProduct = products.find(p => p._id === calcForm.productId);
      if (selectedProduct) {
        setCalcForm(prev => ({ ...prev, unit: selectedProduct.baseUnit }));
      }
    } else {
      setCalcForm(prev => ({ ...prev, unit: '' }));
    }
    setCalcResult(null);
  }, [calcForm.productId, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCalcInputChange = (e) => {
    const { name, value } = e.target;
    setCalcForm(prev => ({ ...prev, [name]: value }));
    setCalcResult(null);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.pricePerUnit) {
      setError('Please provide product name and price');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...productForm,
        pricePerUnit: parseFloat(productForm.pricePerUnit),
        stockQuantity: productForm.stockQuantity ? parseFloat(productForm.stockQuantity) : 0
      };

      await createProduct(payload);
      setSuccess(`Product "${productForm.name}" created successfully!`);
      setProductForm({
        name: '',
        baseUnit: 'g',
        pricePerUnit: '',
        category: 'Grains & Staples',
        stockQuantity: ''
      });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!calcForm.productId || !calcForm.quantity || !calcForm.unit) {
      setError('Please complete all calculator fields');
      return;
    }

    setCalcLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await calculatePrice({
        productId: calcForm.productId,
        quantity: parseFloat(calcForm.quantity),
        unit: calcForm.unit
      });
      setCalcResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
      setCalcResult(null);
    } finally {
      setCalcLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!calcResult) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await purchaseProduct({
        productId: calcResult.productId,
        quantity: calcResult.enteredQuantity,
        unit: calcResult.enteredUnit
      });
      setSuccess(`Success: Purchased ${calcResult.enteredQuantity} ${calcResult.enteredUnit} of ${calcResult.product}!`);
      setCalcResult(null);
      setCalcForm({ productId: '', quantity: '', unit: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const getProductCategoryUnits = (baseUnit) => {
    if (baseUnit === 'g') return ['g', 'kg'];
    if (baseUnit === 'mL') return ['mL', 'L'];
    if (baseUnit === 'unit') return ['unit'];
    return [];
  };

  const selectedProductInfo = products.find(p => p._id === calcForm.productId);
  const eligibleUnits = selectedProductInfo ? getProductCategoryUnits(selectedProductInfo.baseUnit) : [];

  return (
    <div className="app-container">
      <nav className="navbar">
        <span className="brand-name">Unit Converter</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {loading && <div className="loading-spinner"></div>}
          <button className="btn btn-accent" onClick={fetchProducts} style={{ width: 'auto' }}>
            Refresh
          </button>
        </div>
      </nav>

      {error && <div className="alert alert-danger mb-4">⚠️ {error}</div>}
      {success && <div className="alert alert-success mb-4">✅ {success}</div>}

      <div className="dashboard-grid">
        <div className="space-y-6">
          
          <div className="panel">
            <h2 className="panel-title">Add Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductInputChange}
                  className="form-input"
                  placeholder="e.g. Rice, Milk, Egg"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductInputChange}
                    className="form-select"
                  >
                    <option value="Grains & Staples">Grains & Staples</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Pantry & Spices">Pantry & Spices</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Unit</label>
                  <select
                    name="baseUnit"
                    value={productForm.baseUnit}
                    onChange={handleProductInputChange}
                    className="form-select"
                  >
                    <option value="g">grams (g)</option>
                    <option value="kg">kilograms (kg)</option>
                    <option value="mL">milliliters (mL)</option>
                    <option value="L">liters (L)</option>
                    <option value="unit">unit (Count)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price per Unit (₹)</label>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={productForm.pricePerUnit}
                    onChange={handleProductInputChange}
                    className="form-input"
                    placeholder="e.g. 0.05"
                    step="any"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={productForm.stockQuantity}
                    onChange={handleProductInputChange}
                    className="form-input"
                    placeholder="e.g. 5000"
                    step="any"
                    min="0"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Adding...' : 'Add to Inventory'}
              </button>
            </form>
          </div>

          <div className="panel">
            <h2 className="panel-title">Price Calculator</h2>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Select Product</label>
                <select
                  name="productId"
                  value={calcForm.productId}
                  onChange={handleCalcInputChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={calcForm.quantity}
                    onChange={handleCalcInputChange}
                    className="form-input"
                    placeholder="e.g. 2"
                    step="any"
                    min="0"
                    required
                    disabled={!calcForm.productId}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    name="unit"
                    value={calcForm.unit}
                    onChange={handleCalcInputChange}
                    className="form-select"
                    required
                    disabled={!calcForm.productId}
                  >
                    {!calcForm.productId ? (
                      <option value="">Choose Product first</option>
                    ) : (
                      eligibleUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={calcLoading || !calcForm.productId || !calcForm.quantity}
                className={`btn btn-primary ${(!calcForm.productId || !calcForm.quantity) ? 'btn-disabled' : ''}`}
              >
                {calcLoading ? 'Calculating...' : 'Calculate'}
              </button>
            </form>

            {calcResult && (
              <div className="calculation-result">
                <div className="result-row">
                  <span className="result-label">Base Storage:</span>
                  <span className="result-value">
                    {calcResult.convertedQuantity} {calcResult.baseUnit}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Conversion:</span>
                  <span className="result-value">
                    {calcResult.enteredQuantity} {calcResult.enteredUnit} → {calcResult.convertedQuantity} {calcResult.baseUnit}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Stock Status:</span>
                  <span className="result-value">
                    {calcResult.hasEnoughStock ? (
                      <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>In Stock</span>
                    ) : (
                      <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                        Low Stock ({calcResult.availableStock} {calcResult.baseUnit})
                      </span>
                    )}
                  </span>
                </div>
                <div className="result-row" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span className="result-label" style={{ fontWeight: 'bold' }}>Total Price:</span>
                  <span className="result-price">₹{calcResult.totalPrice}</span>
                </div>

                {calcResult.hasEnoughStock && (
                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="btn btn-primary mt-4"
                  >
                    Complete Purchase
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="panel" style={{ height: 'fit-content' }}>
          <h2 className="panel-title">Live Inventory</h2>
          {products.length === 0 ? (
            <div className="text-center py-4 text-muted">
              {loading ? 'Loading...' : 'No products found.'}
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</td>
                      <td>
                        <span className="badge badge-category">{p.category}</span>
                      </td>
                      <td>
                        ₹{parseFloat(p.pricePerUnit.toFixed(4))} /{' '}
                        <span className="badge badge-category">{p.baseUnit}</span>
                      </td>
                      <td>
                        {p.stockQuantity} {p.baseUnit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
