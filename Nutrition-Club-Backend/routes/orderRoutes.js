const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, superAdminOnly } = require('../middleware/auth');

// CREATE order (public)
router.post('/', async (req, res) => {
  try {
    const { customer, items, notes, paymentMethod } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'No items in order' });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      if (!product.isAvailable) return res.status(400).json({ success: false, message: `${product.name} is not available` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity, subtotal });
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const order = new Order({ customer, items: orderItems, totalAmount, paymentMethod: paymentMethod || 'Online', notes });
    await order.save();
    res.status(201).json({ success: true, data: order, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET all orders (admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('items.product', 'name image');
    res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ⚠️ SPECIFIC routes BEFORE /:id to avoid param conflicts

// GET order stats (admin)
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalOrders    = await Order.countDocuments();
    const pendingOrders  = await Order.countDocuments({ status: 'Pending' });
    const deliveredOrders= await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders= await Order.countDocuments({ status: 'Cancelled' });
    const revenueResult  = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    res.json({ success: true, data: { totalOrders, pendingOrders, deliveredOrders, cancelledOrders, totalRevenue, todayOrders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BULK update status (admin) — BEFORE /:id
router.put('/bulk/status', protect, async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status }, $push: { statusHistory: { status, note: `Bulk updated to ${status}` } } }
    );
    res.json({ success: true, message: `${orderIds.length} orders updated to ${status}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// BULK DELETE orders — superadmin only — BEFORE /:id
router.delete('/bulk/delete', protect, superAdminOnly, async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || orderIds.length === 0)
      return res.status(400).json({ success: false, message: 'No order IDs provided' });

    const result = await Order.deleteMany({ _id: { $in: orderIds } });
    res.json({ success: true, message: `${result.deletedCount} order(s) deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single order (admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE order status (admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    await order.save();
    res.json({ success: true, data: order, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE single order — superadmin only
router.delete('/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: `Order ${order.orderNumber} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
