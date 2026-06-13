const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { sendPaymentConfirmation, sendFeeReminder } = require('../utils/emailService');
const { sendPaymentConfirmationWhatsApp } = require('../utils/whatsappService');

router.use(protect);

// ── POST /api/fees/collect — record a fee payment ───────────
router.post('/collect', authorize('superadmin', 'accountant'), async (req, res) => {
  try {
    const { studentId, amount, paymentMethod, month, remarks } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Create fee record
    const fee = await Fee.create({
      student: studentId,
      amount,
      paymentMethod,
      month,
      remarks,
      collectedBy: req.user._id
    });

    // Update student fee totals
    student.feePaid += amount;
    if (student.feePaid >= student.feeAmount) {
      student.feeStatus = 'Paid';
    } else {
      student.feeStatus = 'Pending';
    }
    await student.save();

    // Send payment confirmation email
    try {
      await sendPaymentConfirmation({
        parentEmail: student.parentEmail,
        parentName: student.parentName,
        studentName: student.name,
        amount,
        receiptNumber: fee.receiptNumber,
        paymentDate: fee.paymentDate
      });
    } catch (emailErr) {
      console.error('Payment confirmation email error:', emailErr.message);
    }

    // Also send WhatsApp confirmation (non-blocking)
    sendPaymentConfirmationWhatsApp({
      parentPhone: student.parentPhone,
      parentName: student.parentName,
      studentName: student.name,
      amount,
      receiptNumber: fee.receiptNumber,
      paymentMethod,
      paymentDate: fee.paymentDate
    }).catch(err => console.error(`WhatsApp payment receipt failed:`, err.message));

    res.status(201).json({
      success: true,
      message: 'Payment recorded & confirmation email sent!',
      receipt: fee.receiptNumber,
      fee,
      student: { name: student.name, feeStatus: student.feeStatus, feePaid: student.feePaid, feeAmount: student.feeAmount }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/fees — all fee records ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const { studentId, month, page = 1, limit = 20 } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (month) query.month = { $regex: month, $options: 'i' };

    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('student', 'name rollNumber class')
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, fees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/fees/defaulters — students with pending/overdue fees ──
router.get('/defaulters', async (req, res) => {
  try {
    const defaulters = await Student.find({
      feeStatus: { $in: ['Pending', 'Overdue'] },
      isActive: true
    }).select('name rollNumber class parentName parentEmail feeAmount feePaid feeStatus feeDueDate');

    res.json({ success: true, count: defaulters.length, defaulters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/fees/send-reminders — manually trigger reminders ──
router.post('/send-reminders', authorize('superadmin', 'accountant'), async (req, res) => {
  try {
    const { studentIds } = req.body; // optional array; if empty → all defaulters
    const query = { feeStatus: { $in: ['Pending', 'Overdue'] }, isActive: true };
    if (studentIds && studentIds.length) query._id = { $in: studentIds };

    const students = await Student.find(query);
    let sent = 0;
    for (const s of students) {
      await sendFeeReminder({
        parentEmail: s.parentEmail,
        parentName: s.parentName,
        studentName: s.name,
        studentClass: s.class,
        dueAmount: s.feeAmount - s.feePaid,
        dueDate: s.feeDueDate
      });
      sent++;
    }
    res.json({ success: true, message: `Fee reminders sent to ${sent} parents.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
