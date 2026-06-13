const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("DNS:", dns.getServers());
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/fees',       require('./routes/fees'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/whatsapp',   require('./routes/whatsapp'));

// ── Health check ────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '🎓 Student Automation API Running!' }));

// ── Connect to MongoDB ──────────────────────────────────────
console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("PORT =", process.env.PORT);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // ── Scheduled Jobs ────────────────────────────────────────
    // Run every day at 8:00 PM - send fee reminder emails
    cron.schedule('0 20 * * *', async () => {
      console.log('⏰ Running daily fee reminder job...');
      const { sendFeeReminders } = require('./utils/emailService');
      await sendFeeReminders();
    });

    // Run every day at 8:30 PM - send WhatsApp fee reminders
    cron.schedule('30 20 * * *', async () => {
      console.log('📱 Running daily WhatsApp fee reminder job...');
      try {
        const { sendBulkFeeRemindersWhatsApp } = require('./utils/whatsappService');
        await sendBulkFeeRemindersWhatsApp();
      } catch (err) {
        console.error('WhatsApp cron error:', err.message);
      }
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
