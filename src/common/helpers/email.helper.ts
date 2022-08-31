import nodemailer from 'nodemailer';
import debug from 'debug';

const log: debug.IDebugger = debug('app:email-helper');
import { MailOptions } from '../types/mail-options';

class EmailHelper {

    /**
     * @description This function sets up smtp transporter.
     * @returns nodemailer.Transporter<SMTPTransport.SentMessageInfo>
     */
    private _setupSmtpTransport() {
        const smtpTransport = nodemailer.createTransport({
            // @ts-ignore
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD
            }
        });
        return smtpTransport;
    }

    /**
     * @description This function sends email through gmail.
     * @returns Promise<any>
     */
    sendEmail(mailOptions: MailOptions) {
        const smtpTransport = this._setupSmtpTransport();
        return new Promise((resolve, reject) => {
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    log('FATAL Error: ', error);
                    reject(error);
                } else {
                    log('Email sent successfully');
                    resolve('Email sent successfully');
                }
                smtpTransport.close();
            });
        });
    }
}

export default new EmailHelper();