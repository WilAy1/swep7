import nodemailer from 'nodemailer';
import { isValidEmail } from '../utils/utils';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { env } from '../utils/env';

export default class Mail {
    readonly recipientEmail: string;
    private readonly transporter: nodemailer.Transporter<SentMessageInfo>;

    constructor(recipientEmail: string){
        if(!isValidEmail(recipientEmail)) throw new Error("Invalid recipient email address");
        this.recipientEmail = recipientEmail;


        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'swepproject@gmail.com',   
                pass: String(env.MAIL_APP_PASSWORD)
            }
        });
    }

    async sendCreatorsCode(code: number) {
        let mailOptions = {
            from: '"Swep 7 Project" swepproject@gmail.com',
            to: this.recipientEmail,            
            subject: `Registration code`,
            //text: '',                      
            html: `<p>Use this code to complete your account's verification.</p><p><b>Code: ${code}</b></p><p>The code will expire in 1 hour.</p>`
        };

        this.send(mailOptions);
    }

    async sendVotersCode(code: number | string, title: string) {
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
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
