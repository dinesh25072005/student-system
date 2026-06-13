const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes require login
router.use(protect);

// ── GET /api/students  — list all students (with search & filter) ──
router.get('/', async (req, res) => {
  try {
    const { search, class: cls, feeStatus, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } }
    ];
    if (cls) query.class = cls;
    if (feeStatus) query.feeStatus = feeStatus;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ class: 1, rollNumber: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/students/:id — get one student ──────────────────
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/students — add new student ────────────────────
router.post('/', authorize('superadmin', 'teacher'), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, message: 'Student added successfully', student });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Roll number already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/students/:id — update student ──────────────────
router.put('/:id', authorize('superadmin', 'teacher'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student updated', student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/students/:id — soft delete ──────────────────
router.delete('/:id', authorize('superadmin'), async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Student removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
