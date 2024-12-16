require('dotenv').config()
const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer')
const path = require('path'); 


router.post('/sendmail', async (req, res) => {
    const { to, subject, text, cardId } = req.body;

    try {

        // Configure le transporteur SMTP
        const transporter = nodemailer.createTransport({
            service: 'Yahoo',
            port: 587,
            secure: false,
            auth: {
                user: process.env.YAHOO_EMAIL,
                pass: process.env.YAHOO_PASSWORD,
            },
        });

        // Options de l'email
        var mailOptions = {
            from: 'dafrenchie2002@yahoo.fr',
            to,
            subject,
            text,
            attachments: [
                {   // file on disk as an attachment
                    filename: `${cardId}.png`,
                    path: path.join(__dirname, `../cards/${cardId}.png`)
                },
            ]
        };

        // Envoi l'email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email envoyé avec succès !" });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
    }
})

module.exports = router