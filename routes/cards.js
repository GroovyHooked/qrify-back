const express = require("express");
const router = express.Router();
const Card = require("../models/cards");
const User = require("../models/users")
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const QRCode = require('qrcode')
const path = require('path');


router.post("/newcard", async function (req, res, next) {
  try {
    if (!checkBody(req.body, ["recipient", "totalValue", "message"])) {
      return res.status(400).json({
        result: false,
        error: "Tous les champs doivent être saisis",
      });
    }

    const { totalValue, recipient, message, customerId, merchantMail } = req.body;

    const cardId = uid2(32);

    const date = new Date();

    const merchant = await User.findOne({ email: merchantMail })
    console.log({ merchant });


    QRCode.toFile(`./cards/${cardId}.png`, `http://localhost:3000/${cardId}.png`, {
      color: {
        dark: '#d4a373',  // Blue dots
        light: '#bde0fe' // Transparent background
      }
    }, function (err) {
      if (err) throw err
    })


    const newCard = new Card({
      path: `./cards/${cardId}.png`,
      totalValue,
      date: date,
      recipient,
      message,
      cardId,
      customerId,
      userId: merchant._id
    });

    const savedCard = await newCard.save();

    if (savedCard) {
      res.json({
        result: true,
        card: savedCard,
      });
    } else {
      res.status(500).json({
        result: false,
        error: "La carte n'a pas pu être enregistrée",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création de la carte :", error);
    res.status(500).json({
      result: false,
      error: "Un problème est survenu lors de la création de la carte",
    });
  }
});

module.exports = router;

// router.get('/download', (req, res) => {
//   const filePath = path.join(__dirname, 'files', 'example.pdf'); // Chemin du fichier
//   res.download(filePath); // Télécharge le fichier
// });

// const filePath = path.join(__dirname, '../cards', `./${cardId}.png`);
// res.download(filePath); 

// const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


// const options = {
//   timeZone: timeZone,
//   year: "numeric",
//   month: "2-digit",
//   day: "2-digit",
//   hour: "2-digit",
//   minute: "2-digit",
//   second: "2-digit",
//   //   weekday: "long",
// };
// const formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(
//   date
// );