const nodemailer = require("nodemailer");




const sendEmail = async (options) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Multitenant 03",
    to: options.email,
    subject: options.subject,
    text: `You are invited the organization ${options.invitationLink}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;