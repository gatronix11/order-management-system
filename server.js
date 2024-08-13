const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/order-management';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: String,
  address: String,
  contactNumber: String,
  product: String,
  price: Number,
  status: { type: String, enum: ['Scheduled for Delivery', 'Sent for Delivery', 'Delivered', 'Returned'] },
  orderDate: { type: Date, default: Date.now }
});

// Order Model
const Order = mongoose.model('Order', orderSchema);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Get all orders or filter by date
app.get('/api/orders', async (req, res) => {
  try {
    const { date } = req.query;
    const query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.orderDate = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, address, contactNumber, product, price, status, orderDate } = req.body;
    const newOrder = new Order({
      customerName,
      address,
      contactNumber,
      product,
      price,
      status,
      orderDate
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve add_order.html
app.get('/addOrder', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'addOrder.html'));
});

// Serve view_orders.html
app.get('/viewOrders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewOrders.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
