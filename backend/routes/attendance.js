const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { sendAbsenceAlert } = require('../utils/emailService');
const { sendAbsenceWhatsApp } = require('../utils/whatsappService');

router.use(protect);

// ── POST /api/attendance/mark — mark attendance (bulk for a class) ──
router.post('/mark', authorize('superadmin', 'teacher'), async (req, res) => {
  try {
    // records = [ { studentId, status, remarks }, ... ]
    const { records, date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    const emailErrors = [];

    for (const record of records) {
      const student = await Student.findById(record.studentId);
      if (!student) continue;

      // Upsert attendance record
      const attendance = await Attendance.findOneAndUpdate(
        { student: record.studentId, date: attendanceDate },
        {
          status: record.status,
          markedBy: req.user._id,
          remarks: record.remarks || ''
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Send absence email if absent and not already sent
      if (record.status === 'Absent' && !attendance.emailSent) {
        try {
          await sendAbsenceAlert({
            parentEmail: student.parentEmail,
            parentName: student.parentName,
            studentName: student.name,
            studentClass: `${student.class} ${student.section}`,
            date: attendanceDate
          });
          attendance.emailSent = true;
          await attendance.save();
        } catch (emailErr) {
          emailErrors.push({ student: student.name, error: emailErr.message });
        }

        // Also send WhatsApp (non-blocking — failure won't stop attendance save)
        sendAbsenceWhatsApp({
          parentPhone: student.parentPhone,
          parentName: student.parentName,
          studentName: student.name,
          studentClass: `${student.class} ${student.section}`,
          date: attendanceDate
        }).catch(err => console.error(`WhatsApp to ${student.parentPhone} failed:`, err.message));
      }

      results.push({ student: student.name, status: record.status });
    }

    res.json({
      success: true,
      message: `Attendance marked for ${results.length} students`,
      results,
      emailErrors: emailErrors.length ? emailErrors : undefined
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/attendance?class=10&date=2025-06-01 ────────────
router.get('/', async (req, res) => {
  try {
    const { class: cls, date, studentId } = req.query;
    const query = {};

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const d2 = new Date(d); d2.setDate(d2.getDate() + 1);
      query.date = { $gte: d, $lt: d2 };
    }
    if (studentId) query.student = studentId;

    let records = await Attendance.find(query).populate('student', 'name rollNumber class section');

    // Filter by class via populated student
    if (cls) records = records.filter(r => r.student && r.student.class === cls);

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/attendance/summary/:studentId — monthly summary ──
router.get('/summary/:studentId', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId });
    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'Present').length,
      absent: records.filter(r => r.status === 'Absent').length,
      late: records.filter(r => r.status === 'Late').length
    };
    summary.percentage = summary.total > 0
      ? ((summary.present / summary.total) * 100).toFixed(1)
      : '0';

    res.json({ success: true, summary, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
