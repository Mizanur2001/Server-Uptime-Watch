require("dotenv").config();
const nodemailer = require("nodemailer");
const { serverDownTemplate } = require("../public/template/mail/alert.template");

const transpoter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});


module.exports = {
    sendServerDownEmail: async (name, ip) => {
        try {
            const option = {
                from: "Server Alert <" + process.env.EMAIL_USER + ">",
                to: process.env.ALERT_EMAIL,
                subject: `🚨 Server DOWN: ${name} (${ip})`,
                html: serverDownTemplate(name, ip),
            };
            const info = await transpoter.sendMail(option);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
};
