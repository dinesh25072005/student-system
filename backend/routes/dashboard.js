const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalStudents,
      todayPresent,
      todayAbsent,
      totalFeePaid,
      pendingFees,
      recentPayments
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Attendance.countDocuments({ status: 'Present', date: { $gte: today, $lt: tomorrow } }),
      Attendance.countDocuments({ status: 'Absent',  date: { $gte: today, $lt: tomorrow } }),
      Fee.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Student.countDocuments({ feeStatus: { $in: ['Pending', 'Overdue'] } }),
      Fee.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name class')
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        todayPresent,
        todayAbsent,
        totalFeePaid: totalFeePaid[0]?.total || 0,
        pendingFees
      },
      recentPayments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
