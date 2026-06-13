const express = require('express');
const router  = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getWhatsAppStatus,
  restartWhatsApp,
  testWhatsApp,
  sendAnnouncementWhatsApp,
  sendBulkFeeRemindersWhatsApp,
  sendFeeReminderWhatsApp,
  sendAbsenceWhatsApp
} = require('../utils/whatsappService');

// Generate QR code image from string (no extra package needed)
const qrImageUrl = (qr) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;

// ── GET /api/whatsapp/status ─────────────────────────────────
router.get('/status', protect, (req, res) => {
  const s = getWhatsAppStatus();
  res.json({
    success: true,
    status:  s.status,         // disconnected | qr | authenticated | ready
    ready:   s.ready,
    qrAvailable: !!s.qr,
    message: s.ready
      ? '✅ WhatsApp connected & ready to send messages'
      : s.status === 'qr'
        ? '📱 QR code ready — scan with your phone'
        : '⏳ WhatsApp not connected'
  });
});

// ── GET /api/whatsapp/qr ─────────────────────────────────────
// Returns QR code as an image URL (scan with school phone)
router.get('/qr', protect, (req, res) => {
  const s = getWhatsAppStatus();
  if (s.status === 'ready') {
    return res.json({ success: true, connected: true, message: '✅ Already connected!' });
  }
  if (!s.qr) {
    return res.json({ success: false, message: 'QR not generated yet. Wait 10 seconds and retry.' });
  }
  res.json({
    success: true,
    connected: false,
    qrString:  s.qr,
    qrImageUrl: qrImageUrl(s.qr),
    instruction: 'Open WhatsApp on your school phone → tap ⋮ → Linked Devices → Link a Device → scan this QR'
  });
});

// ── POST /api/whatsapp/restart ───────────────────────────────
router.post('/restart', protect, authorize('superadmin'), async (req, res) => {
  await restartWhatsApp();
  res.json({ success: true, message: '🔄 WhatsApp client restarting. Check /qr in ~15 seconds.' });
});

// ── POST /api/whatsapp/test ──────────────────────────────────
router.post('/test', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });
    await testWhatsApp(phone);
    res.json({ success: true, message: `✅ Test WhatsApp sent to ${phone}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/whatsapp/announce ──────────────────────────────
router.post('/announce', protect, authorize('superadmin', 'teacher'), async (req, res) => {
  try {
    const { subject, body, class: cls, section } = req.body;
    if (!subject || !body) return res.status(400).json({ success: false, message: 'Subject and body required' });

    const query = { isActive: true };
    if (cls)     query.class   = cls;
    if (section) query.section = section;

    const students = await Student.find(query).select('parentName parentPhone name');
    const results  = { sent: 0, failed: 0, total: students.length, errors: [] };

    for (const s of students) {
      try {
        await sendAnnouncementWhatsApp({ parentPhone: s.parentPhone, parentName: s.parentName, subject, body });
        results.sent++;
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        results.failed++;
        results.errors.push({ student: s.name, error: err.message });
      }
    }
    res.json({ success: true, message: `📱 Sent to ${results.sent}/${results.total} parents`, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/whatsapp/fee-reminders ────────────────────────
router.post('/fee-reminders', protect, authorize('superadmin', 'accountant'), async (req, res) => {
  try {
    const results = await sendBulkFeeRemindersWhatsApp();
    res.json({ success: true, message: `📱 Fee reminders sent to ${results.sent} parents`, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/whatsapp/individual ────────────────────────────
router.post('/individual', protect, authorize('superadmin', 'teacher'), async (req, res) => {
  try {
    const { studentId, type, customMessage } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (type === 'fee_reminder') {
      await sendFeeReminderWhatsApp({
        parentPhone: student.parentPhone, parentName: student.parentName,
        studentName: student.name, studentClass: student.class,
        dueAmount: student.feeAmount - student.feePaid, dueDate: student.feeDueDate
      });
    } else if (type === 'absence') {
      await sendAbsenceWhatsApp({
        parentPhone: student.parentPhone, parentName: student.parentName,
        studentName: student.name, studentClass: student.class, date: new Date()
      });
    } else if (type === 'custom' && customMessage) {
      await sendAnnouncementWhatsApp({
        parentPhone: student.parentPhone, parentName: student.parentName,
        subject: 'Message from School', body: customMessage
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    res.json({ success: true, message: `📱 WhatsApp sent to ${student.parentName} (${student.parentPhone})` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
