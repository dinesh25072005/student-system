// ============================================================
// FREE WhatsApp Automation — whatsapp-web.js
// ============================================================
// HOW IT WORKS:
// - Uses YOUR OWN WhatsApp number (school's phone)
// - Scans a QR code once → stays connected
// - Sends messages like a real person — 100% FREE
// - No API key, no Twilio, no cost ever
//
// INSTALL: npm install whatsapp-web.js qrcode-terminal
// ============================================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Student = require('../models/Student');

const SCHOOL = process.env.SCHOOL_NAME || 'Our School';

// Global client instance
let waClient = null;
let waReady  = false;
let waQR     = null;   // latest QR string (for frontend display)
let waStatus = 'disconnected'; // disconnected | qr | ready | auth_failure

// ── Initialize WhatsApp Client ───────────────────────────────
const initWhatsApp = () => {
  if (waClient) return; // already initialised

  waClient = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

  waClient.on('qr', (qr) => {
    waQR     = qr;
    waReady  = false;
    waStatus = 'qr';
    console.log('\n📱 Scan this QR with WhatsApp on your school phone:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n(Also available at GET /api/whatsapp/qr)\n');
  });

  waClient.on('authenticated', () => {
    waStatus = 'authenticated';
    waQR     = null;
    console.log('✅ WhatsApp authenticated!');
  });

  waClient.on('ready', () => {
    waReady  = true;
    waStatus = 'ready';
    waQR     = null;
    console.log('✅ WhatsApp is READY — messages can now be sent!');
  });

  waClient.on('auth_failure', (msg) => {
    waReady  = false;
    waStatus = 'auth_failure';
    console.error('❌ WhatsApp auth failed:', msg);
  });

  waClient.on('disconnected', (reason) => {
    waReady  = false;
    waStatus = 'disconnected';
    waClient = null;
    console.log('📴 WhatsApp disconnected:', reason);
  });

  waClient.initialize();
  console.log('⏳ WhatsApp client initialising...');
};

// Auto-start on module load
initWhatsApp();

// ── Helpers ──────────────────────────────────────────────────
const getStatus = () => ({ ready: waReady, status: waStatus, qr: waQR });

// Format Indian phone number to WhatsApp chat ID
// WhatsApp ID format: 919876543210@c.us
const formatNumber = (phone) => {
  let p = phone.replace(/[\s\-\(\)\+]/g, '');
  if (p.startsWith('0')) p = '91' + p.slice(1);
  if (!p.startsWith('91') && p.length === 10) p = '91' + p;
  return `${p}@c.us`;
};

// Core send function — throws if not ready
const sendMessage = async (phone, text) => {
  if (!waReady || !waClient) {
    throw new Error('WhatsApp not connected. Scan the QR code first at GET /api/whatsapp/qr');
  }
  const chatId = formatNumber(phone);
  return waClient.sendMessage(chatId, text);
};

// ── 1. Absence Alert ─────────────────────────────────────────
exports.sendAbsenceWhatsApp = async ({ parentPhone, parentName, studentName, studentClass, date }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const msg =
`🏫 *${SCHOOL}*
━━━━━━━━━━━━━━━━━━━━
⚠️ *ABSENCE ALERT*

Dear *${parentName}*,

Your child *${studentName}* (Class ${studentClass}) was marked *ABSENT* on:

📅 *${formattedDate}*

Please contact the school if this is incorrect.

Thank you 🙏
━━━━━━━━━━━━━━━━━━━━
_Automated alert from ${SCHOOL}_`;

  return sendMessage(parentPhone, msg);
};

// ── 2. Fee Reminder ──────────────────────────────────────────
exports.sendFeeReminderWhatsApp = async ({ parentPhone, parentName, studentName, studentClass, dueAmount, dueDate }) => {
  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'As soon as possible';

  const msg =
`🏫 *${SCHOOL}*
━━━━━━━━━━━━━━━━━━━━
💰 *FEE REMINDER*

Dear *${parentName}*,

This is a gentle reminder that the school fee for *${studentName}* (Class ${studentClass}) is due.

💵 *Outstanding Amount:* ₹${dueAmount}
📅 *Due Date:* ${formattedDate}

Please pay at the school office to avoid any late charges.

Thank you 🙏
━━━━━━━━━━━━━━━━━━━━
_Automated reminder from ${SCHOOL}_`;

  return sendMessage(parentPhone, msg);
};

// ── 3. Fee Payment Confirmation ──────────────────────────────
exports.sendPaymentConfirmationWhatsApp = async ({ parentPhone, parentName, studentName, amount, receiptNumber, paymentMethod, paymentDate }) => {
  const formattedDate = new Date(paymentDate).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const msg =
`🏫 *${SCHOOL}*
━━━━━━━━━━━━━━━━━━━━
✅ *PAYMENT CONFIRMED*

Dear *${parentName}*,

We have received the fee payment for *${studentName}*. Thank you!

🧾 *Receipt Details:*
• Receipt No: *${receiptNumber}*
• Student: ${studentName}
• Amount Paid: *₹${amount}*
• Payment Mode: ${paymentMethod}
• Date: ${formattedDate}

Please save this message as your payment record.

Thank you! 🙏
━━━━━━━━━━━━━━━━━━━━
_${SCHOOL} Accounts Department_`;

  return sendMessage(parentPhone, msg);
};

// ── 4. Custom Announcement ───────────────────────────────────
exports.sendAnnouncementWhatsApp = async ({ parentPhone, parentName, subject, body }) => {
  const msg =
`🏫 *${SCHOOL}*
━━━━━━━━━━━━━━━━━━━━
📢 *${subject.toUpperCase()}*

Dear *${parentName}*,

${body}

━━━━━━━━━━━━━━━━━━━━
_${SCHOOL} Administration_`;

  return sendMessage(parentPhone, msg);
};

// ── 5. Bulk fee reminders (cron) ─────────────────────────────
exports.sendBulkFeeRemindersWhatsApp = async () => {
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);

  const students = await Student.find({
    feeStatus: { $in: ['Pending', 'Overdue'] },
    feeDueDate: { $lte: threeDaysLater },
    isActive: true
  });

  const results = { sent: 0, failed: 0, errors: [] };

  for (const s of students) {
    try {
      await exports.sendFeeReminderWhatsApp({
        parentPhone: s.parentPhone,
        parentName: s.parentName,
        studentName: s.name,
        studentClass: s.class,
        dueAmount: s.feeAmount - s.feePaid,
        dueDate: s.feeDueDate
      });
      results.sent++;
      // Small delay to avoid WhatsApp spam detection
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      results.failed++;
      results.errors.push({ student: s.name, error: err.message });
    }
  }

  console.log(`📱 Bulk WA reminders: ${results.sent} sent, ${results.failed} failed`);
  return results;
};

// ── 6. Test message ──────────────────────────────────────────
exports.testWhatsApp = async (phone) => {
  const msg =
`🏫 *${SCHOOL}*
━━━━━━━━━━━━━━━━
✅ *WhatsApp automation is working!*

This is a test message from your Student Automation System.

Everything is set up correctly 🎉
━━━━━━━━━━━━━━━━
_EduAdmin System_`;

  return sendMessage(phone, msg);
};

// ── 7. Restart / reconnect ───────────────────────────────────
exports.restartWhatsApp = async () => {
  if (waClient) {
    await waClient.destroy();
    waClient = null;
    waReady  = false;
    waStatus = 'disconnected';
  }
  initWhatsApp();
};

exports.getWhatsAppStatus = getStatus;
exports.sendRawMessage    = sendMessage;
