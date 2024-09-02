"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const utils_1 = require("../utils/utils");
const env_1 = require("../utils/env");
class Mail {
    constructor(recipientEmail) {
        if (!(0, utils_1.isValidEmail)(recipientEmail))
            throw new Error("Invalid recipient email address");
        this.recipientEmail = recipientEmail;
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'swepproject@gmail.com',
                pass: String(env_1.env.MAIL_APP_PASSWORD)
            }
        });
    }
    async sendCreatorsCode(code) {
        let mailOptions = {
            from: '"Swep 7 Project" swepproject@gmail.com',
            to: this.recipientEmail,
            subject: `Registration code`,
            //text: '',                      
            html: `<p>Use this code to complete your account's verification.</p><p><b>Code: ${code}</b></p><p>The code will expire in 1 hour.</p>`
        };
        this.send(mailOptions);
    }
    async sendVotersCode(code, title) {
        // Setup email data
        let mailOptions = {
            from: '"Swep 7 Project" swepproject@gmail.com',
            to: this.recipientEmail,
            subject: `Voters code for '${title}'`,
            //text: '',                      
            html: `<p>Use this code to verify your login for voting in the election.</p><p><b>Code: ${code}</b></p><p>This code will expire after the election or after you have voted.</p>`
        };
        this.send(mailOptions);
    }
    async send(mailOptions) {
        try {
            let info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
        }
        catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
exports.default = Mail;
//# sourceMappingURL=Mail.js.map