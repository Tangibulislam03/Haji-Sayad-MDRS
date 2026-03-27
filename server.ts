import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Email Configuration ---
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // --- API Routes ---

  // Contact Form Submission
  app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message, notificationEmail, notificationPhone } = req.body;

    const adminEmails = notificationEmail || process.env.ADMIN_EMAIL || 'tangibulislam02@gmail.com';
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: adminEmails,
      subject: `[মাদ্রাসা যোগাযোগ] নতুন বার্তা: ${subject}`,
      text: `
নতুন যোগাযোগ বার্তা এসেছে!

প্রেরকের নাম: ${name}
ইমেইল: ${email}
বিষয়: ${subject}

বার্তা:
${message}

---
এই বার্তাটি হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা কমপ্লেক্স ওয়েবসাইট থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।
      `,
    };

    try {
      // Send Email
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        await transporter.sendMail(mailOptions);
      } else {
        console.warn('Gmail credentials not configured. Skipping email notification.');
      }
      
      // WhatsApp Alert (Optional, if API key provided)
      const wsPhone = notificationPhone || process.env.WHATSAPP_PHONE;
      if (process.env.WHATSAPP_API_KEY && wsPhone) {
        try {
          const text = encodeURIComponent(`*নতুন যোগাযোগ বার্তা!*\n\n*নাম:* ${name}\n*বিষয়:* ${subject}\n*বার্তা:* ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
          const url = `https://api.callmebot.com/whatsapp.php?phone=${wsPhone}&text=${text}&apikey=${process.env.WHATSAPP_API_KEY}`;
          await fetch(url);
        } catch (wsErr) {
          console.error('WhatsApp notification failed:', wsErr);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
  });

  // Admission Form Submission
  app.post('/api/admission', async (req, res) => {
    const { 
      studentName, 
      dob, 
      department, 
      type, 
      fatherName, 
      motherName, 
      mobile, 
      address, 
      previousMadrasah, 
      bloodGroup,
      notificationEmail,
      notificationPhone
    } = req.body;

    const adminEmails = notificationEmail || process.env.ADMIN_EMAIL || 'tangibulislam02@gmail.com';

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: adminEmails,
      subject: `[মাদ্রাসা ভর্তি] নতুন আবেদন: ${studentName}`,
      text: `
নতুন ভর্তি আবেদন জমা পড়েছে!

শিক্ষার্থীর তথ্য:
----------------
নাম: ${studentName}
জন্ম তারিখ: ${dob}
বিভাগ: ${department}
ধরণ: ${type}
রক্তের গ্রুপ: ${bloodGroup || 'N/A'}

অভিভাবকের তথ্য:
---------------
পিতার নাম: ${fatherName}
মাতার নাম: ${motherName}
মোবাইল: ${mobile}

অন্যান্য:
--------
ঠিকানা: ${address}
পূর্ববর্তী মাদ্রাসা: ${previousMadrasah || 'N/A'}

---
এই বার্তাটি হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা কমপ্লেক্স ওয়েবসাইট থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।
      `,
    };

    try {
      // Send Email
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        await transporter.sendMail(mailOptions);
      } else {
        console.warn('Gmail credentials not configured. Skipping email notification.');
      }

      // WhatsApp Alert (Optional, if API key provided)
      const wsPhone = notificationPhone || process.env.WHATSAPP_PHONE;
      if (process.env.WHATSAPP_API_KEY && wsPhone) {
        try {
          const text = encodeURIComponent(`*নতুন ভর্তি আবেদন!*\n\n*শিক্ষার্থী:* ${studentName}\n*বিভাগ:* ${department}\n*মোবাইল:* ${mobile}\n*ধরণ:* ${type}`);
          const url = `https://api.callmebot.com/whatsapp.php?phone=${wsPhone}&text=${text}&apikey=${process.env.WHATSAPP_API_KEY}`;
          await fetch(url);
        } catch (wsErr) {
          console.error('WhatsApp notification failed:', wsErr);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
