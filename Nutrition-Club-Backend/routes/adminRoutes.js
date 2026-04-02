const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect, superAdminOnly } = require('../middleware/auth');
const PasswordResetRequest = require('../models/PasswordResetRequest');

// ─────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Please provide username and password' });

    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!admin.isActive)
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact Super Admin.' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role, name: admin.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin._id, username: admin.username, name: admin.name, role: admin.role },
      message: 'Login successful'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify token
router.get('/verify', protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ─────────────────────────────────────────
// OWN PROFILE (any logged-in admin)
// ─────────────────────────────────────────

// Update own password only (admin & superadmin)
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    // Superadmin can also update their own name
    if (name !== undefined && req.admin.role === 'superadmin') {
      admin.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ success: false, message: 'Current password is required' });
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch)
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      if (newPassword.length < 6)
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      admin.password = newPassword;
    }

    await admin.save();

    res.json({
      success: true,
      admin: { id: admin._id, username: admin.username, name: admin.name, role: admin.role },
      message: 'Profile updated successfully'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// SUPER ADMIN ONLY — Admin Management
// ─────────────────────────────────────────

// Get all admins
router.get('/all', protect, superAdminOnly, async (req, res) => {
  try {
    const admins = await Admin.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new admin
router.post('/create', protect, superAdminOnly, async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const exists = await Admin.findOne({ username });
    if (exists)
      return res.status(400).json({ success: false, message: 'Username already exists' });

    const admin = new Admin({
      username: username.trim(),
      name: name?.trim() || '',
      password,
      role: role === 'superadmin' ? 'superadmin' : 'admin'
    });
    await admin.save();

    res.status(201).json({
      success: true,
      data: { id: admin._id, username: admin.username, name: admin.name, role: admin.role, isActive: admin.isActive },
      message: `Admin "${username}" created successfully`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update another admin's name
router.put('/:id/update-name', protect, superAdminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim())
      return res.status(400).json({ success: false, message: 'Name is required' });

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, select: '-password' }
    );
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    res.json({ success: true, data: admin, message: 'Name updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Reset another admin's password
router.put('/:id/reset-password', protect, superAdminOnly, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: `Password reset for "${admin.username}"` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle active/inactive
router.put('/:id/toggle-status', protect, superAdminOnly, async (req, res) => {
  try {
    // Prevent superadmin from deactivating themselves
    if (req.params.id === req.admin.id)
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });

    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({
      success: true,
      data: { isActive: admin.isActive },
      message: `"${admin.username}" has been ${admin.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete admin
router.delete('/:id', protect, superAdminOnly, async (req, res) => {
  try {
    if (req.params.id === req.admin.id)
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    res.json({ success: true, message: `Admin "${admin.username}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ─────────────────────────────────────────
// FORGOT PASSWORD (public)
// ─────────────────────────────────────────

// Admin submits a password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username?.trim())
      return res.status(400).json({ success: false, message: 'Username is required' });

    const admin = await Admin.findOne({ username: username.trim() });
    if (!admin)
      return res.status(404).json({ success: false, message: 'No account found with this username' });

    if (admin.role === 'superadmin')
      return res.status(400).json({ success: false, message: 'Super Admin accounts cannot use this feature' });

    if (!admin.isActive)
      return res.status(403).json({ success: false, message: 'This account is deactivated. Contact Super Admin directly.' });

    // Check if a pending request already exists
    const existing = await PasswordResetRequest.findOne({ admin: admin._id, status: 'Pending' });
    if (existing)
      return res.status(400).json({ success: false, message: 'A reset request is already pending for this account. Please wait for Super Admin to resolve it.' });

    await PasswordResetRequest.create({ admin: admin._id, username: admin.username });

    res.json({ success: true, message: 'Reset request sent! Super Admin has been notified and will reset your password shortly.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────
// RESET REQUESTS — Super Admin only
// ─────────────────────────────────────────

// Get all pending reset requests
router.get('/reset-requests', protect, superAdminOnly, async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find({ status: 'Pending' })
      .populate('admin', 'username name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dismiss / mark resolved (without resetting password — superadmin uses existing reset-password route)
router.put('/reset-requests/:id/resolve', protect, superAdminOnly, async (req, res) => {
  try {
    const request = await PasswordResetRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Request marked as resolved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Promote admin to superadmin — superadmin only
router.put('/:id/promote', protect, superAdminOnly, async (req, res) => {
  try {
    if (req.params.id === req.admin.id)
      return res.status(400).json({ success: false, message: 'You are already a Super Admin' });
 
    const admin = await Admin.findById(req.params.id);
    if (!admin)
      return res.status(404).json({ success: false, message: 'Admin not found' });
    if (admin.role === 'superadmin')
      return res.status(400).json({ success: false, message: `@${admin.username} is already a Super Admin` });
 
    admin.role = 'superadmin';
    await admin.save();
 
    res.json({
      success: true,
      data: { id: admin._id, username: admin.username, name: admin.name, role: admin.role },
      message: `@${admin.username} has been promoted to Super Admin`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// Demote superadmin to admin — superadmin only
router.put('/:id/demote', protect, superAdminOnly, async (req, res) => {
  try {
    if (req.params.id === req.admin.id)
      return res.status(400).json({ success: false, message: 'You cannot demote yourself' });
 
    const admin = await Admin.findById(req.params.id);
    if (!admin)
      return res.status(404).json({ success: false, message: 'Admin not found' });
    if (admin.role !== 'superadmin')
      return res.status(400).json({ success: false, message: `@${admin.username} is not a Super Admin` });
 
    admin.role = 'admin';
    await admin.save();
 
    res.json({
      success: true,
      data: { id: admin._id, username: admin.username, name: admin.name, role: admin.role },
      message: `@${admin.username} has been demoted to Admin`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
