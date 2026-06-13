const nodemailer = require('nodemailer');
const Student = require('../models/Student');

// Create transporter (works with Gmail + App Password)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const SCHOOL = process.env.SCHOOL_NAME || 'Our School';

// ── 1. Absence Alert Email ───────────────────────────────────
exports.sendAbsenceAlert = async ({ parentEmail, parentName, studentName, studentClass, date }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
      <div style="background:#4F46E5;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">🎓 ${SCHOOL}</h1>
        <p style="color:#c7d2fe;margin:8px 0 0;">Attendance Notification</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1e293b;">Dear ${parentName},</h2>
        <p style="color:#475569;font-size:16px;line-height:1.6;">
          We would like to inform you that your child <strong style="color:#4F46E5">${studentName}</strong>
          of Class <strong>${studentClass}</strong> was marked <strong style="color:#ef4444">ABSENT</strong> on:
        </p>
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#b91c1c;font-size:18px;font-weight:bold;">📅 ${formattedDate}</p>
        </div>
        <p style="color:#475569;">If this absence was unintentional or you have any queries, please contact the school office immediately.</p>
        <p style="color:#475569;margin-top:24px;">Thank you for your cooperation.</p>
        <p style="color:#1e293b;font-weight:bold;">Warm regards,<br/>${SCHOOL} Administration</p>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${SCHOOL}" <${process.env.EMAIL_USER}>`,
    to: parentEmail,
    subject: `⚠️ Absence Alert: ${studentName} — ${formattedDate}`,
    html
  });
};

// ── 2. Fee Reminder Email ────────────────────────────────────
exports.sendFeeReminder = async ({ parentEmail, parentName, studentName, studentClass, dueAmount, dueDate }) => {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
      <div style="background:#f59e0b;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">🎓 ${SCHOOL}</h1>
        <p style="color:#fef3c7;margin:8px 0 0;">Fee Reminder Notice</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1e293b;">Dear ${parentName},</h2>
        <p style="color:#475569;font-size:16px;line-height:1.6;">
          This is a gentle reminder that the school fee for
          <strong style="color:#f59e0b">${studentName}</strong> (Class ${studentClass}) is due soon.
        </p>
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;border-radius:6px;margin:20px 0;">
          <p style="margin:0 0 8px;color:#92400e;"><strong>Outstanding Amount:</strong> ₹${dueAmount}</p>
          <p style="margin:0;color:#92400e;"><strong>Due Date:</strong> ${formattedDate}</p>
        </div>
        <p style="color:#475569;">Kindly pay the fee before the due date to avoid any late charges. You may pay at the school office.</p>
        <p style="color:#1e293b;font-weight:bold;">Warm regards,<br/>${SCHOOL} Accounts Department</p>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${SCHOOL}" <${process.env.EMAIL_USER}>`,
    to: parentEmail,
    subject: `💰 Fee Reminder: ₹${dueAmount} due for ${studentName}`,
    html
  });
};

// ── 3. Fee Payment Confirmation ──────────────────────────────
exports.sendPaymentConfirmation = async ({ parentEmail, parentName, studentName, amount, receiptNumber, paymentDate }) => {
  const formattedDate = new Date(paymentDate).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
      <div style="background:#10b981;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">🎓 ${SCHOOL}</h1>
        <p style="color:#d1fae5;margin:8px 0 0;">Payment Confirmation</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1e293b;">Dear ${parentName},</h2>
        <p style="color:#475569;font-size:16px;">We have received the fee payment for <strong>${studentName}</strong>. Thank you!</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#065f46;margin:0 0 16px;">✅ Payment Receipt</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#374151;"><strong>Receipt No.:</strong></td><td style="color:#059669;">${receiptNumber}</td></tr>
            <tr><td style="padding:6px 0;color:#374151;"><strong>Student:</strong></td><td>${studentName}</td></tr>
            <tr><td style="padding:6px 0;color:#374151;"><strong>Amount Paid:</strong></td><td><strong style="color:#059669;">₹${amount}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#374151;"><strong>Date:</strong></td><td>${formattedDate}</td></tr>
          </table>
        </div>
        <p style="color:#1e293b;font-weight:bold;">Warm regards,<br/>${SCHOOL} Accounts Department</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${SCHOOL}" <${process.env.EMAIL_USER}>`,
    to: parentEmail,
    subject: `✅ Payment Confirmed: ₹${amount} — ${receiptNumber}`,
    html
  });
};

// ── 4. Cron job: Send reminders to all overdue students ──────
exports.sendFeeReminders = async () => {
  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const students = await Student.find({
      feeStatus: { $in: ['Pending', 'Overdue'] },
      feeDueDate: { $lte: threeDaysLater }
    });

    for (const student of students) {
      await exports.sendFeeReminder({
        parentEmail: student.parentEmail,
        parentName: student.parentName,
        studentName: student.name,
        studentClass: student.class,
        dueAmount: student.feeAmount - student.feePaid,
        dueDate: student.feeDueDate
      });
      console.log(`📧 Fee reminder sent to ${student.parentEmail}`);
    }
  } catch (err) {
    console.error('Fee reminder cron error:', err.message);
  }
};
