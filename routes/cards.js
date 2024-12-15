const express = require("express");
const router = express.Router();
const Card = require("../models/cards");
const User = require("../models/users")
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const QRCode = require('qrcode')
const path = require('path');
const Customer = require("../models/customers");
const BASE_URL = " http://localhost:3001"


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


    QRCode.toFile(`./cards/${cardId}.png`, `/displaycard/${cardId}`, {
      // color: {
      //   dark: '#d4a373',  // Blue dots
      //   light: '#bde0fe' // Transparent background
      // }
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

// Envoi d'un code QR au front sous forme de fichier
router.get('/download/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findOne({ cardId });

    if (!card) {
      return res.status(404).json({ error: "Carte non trouvée" });
    }

    const filePath = path.join(__dirname, '../cards', `${cardId}.png`);

    res.download(filePath, `card_${cardId}.png`, (err) => {
      if (err) {
        console.error("Erreur lors du téléchargement du fichier :", err);
        return res.status(500).json({ error: "Erreur lors du téléchargement du fichier" });
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la carte :", error);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération de la carte" });
  }
});


// Envoi des données (enregistrées en bdd) d'un code qr
router.get('/datacard/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;

    const cardData = await Card.findOne({ cardId });

    if (!cardData) {
      return res.status(404).json({ error: "Carte non trouvée" });
    }

    const customerId = cardData.customerId;

    const customer = await Customer.findOne({ _id: customerId });

    if (!customer) {
      return res.status(404).json({ error: "Client non trouvé" });
    }

    res.json({ cardData, customer });
  } catch (error) {
    console.error("Erreur lors de la récupération des données de la carte :", error);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des données de la carte" });
  }
});


module.exports = router;


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