const express = require('express');
const router = express.Router();
const EventPlan = require('../models/EventPlan');
const { protect } = require('../middleware/auth');

// GET plans by eventType (public)
router.get('/', async (req, res) => {
  try {
    const { eventType } = req.query;
    const query = { isActive: true };
    if (eventType) query.eventType = eventType;
    const plans = await EventPlan.find(query).sort({ sortOrder: 1, tier: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all plans for admin (grouped by eventType)
router.get('/admin/all', protect, async (req, res) => {
  try {
    const plans = await EventPlan.find().sort({ eventType: 1, sortOrder: 1, tier: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await EventPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE plan (admin)
router.post('/', protect, async (req, res) => {
  try {
    const plan = new EventPlan(req.body);
    await plan.save();
    res.status(201).json({ success: true, data: plan, message: 'Plan created successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: `A ${req.body.tier} plan already exists for ${req.body.eventType}. Delete it first to replace.` });
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE plan (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const plan = await EventPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, data: plan, message: 'Plan updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE plan (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const plan = await EventPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
