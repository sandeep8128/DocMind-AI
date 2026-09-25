const SupportMessage = require("../models/SupportMessage");
const nodemailer = require("nodemailer");

const submitSupportMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    const supportMessage = await SupportMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    // Email notification
    if (
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.SUPPORT_EMAIL
    ) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.SUPPORT_EMAIL,
        replyTo: email,
        subject: `DocMind Support - ${name}`,
        text: `
New support request received.

Name: ${name}
Email: ${email}

Message:
${message}

You can reply directly to this email.
        `,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Your support request has been submitted successfully.",
      supportMessage: {
        id: supportMessage._id,
        name: supportMessage.name,
        email: supportMessage.email,
        status: supportMessage.status,
      },
    });
  } catch (error) {
    console.error("Support Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit support request",
    });
  }
};

module.exports = {
  submitSupportMessage,
};