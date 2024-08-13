const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const orderSchema = new mongoose.Schema({
  customerName: String,
  address: String,
  contactNumber: String,
  product: String,
  price: Number,
  status: { type: String, default: 'Pending Delivery' },
  createdAt: { type: Date, default: Date.now }
});


const Order = mongoose.model('Order', orderSchema);

app.post('/orders', async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.send(order);
});

app.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});

app.put('/orders/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(order);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
