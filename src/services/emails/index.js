require("dotenv").config();
const nodemailer = require("nodemailer");

const courier = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "axaladyx@gmail.com",
    clientId: process.env.G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    refreshToken: process.env.G_REFRESH_TOKEN,
  },
});

const sendVerificationEmail = async ({ recipient, subject, username, url }) => {
  try {
    const mail = {
      from: "Account Verification <axaladyx@gmail.com> ",
      to: recipient,
      subject,
      html: `<h2>Hi ${username}, Thanks for registering. please click the link to verify your account</h2>
        <a href=${url}> Click Here </a>
      `,
    };
    const result = await courier.sendMail(mail);
  } catch (error) {
    console.log({ error });
  }
};

module.exports = { sendVerificationEmail };
