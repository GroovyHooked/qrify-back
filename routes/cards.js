const express = require("express");
const router = express.Router();
const Card = require("../models/cards");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const QRCode = require("qrcode");
const path = require("path");
const Customer = require("../models/customers");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const BASE_URL = " http://localhost:3001"
// const BASE_URL = "https://d50e-2a01-cb16-2038-69d8-80fe-8437-bd0d-9383.ngrok-free.app"

router.post("/newcard", async function (req, res, next) {
  try {
    if (!checkBody(req.body, ["recipient", "totalValue", "message"])) {
      return res.status(400).json({
        result: false,
        error: "Tous les champs doivent être saisis",
      });
    }

    const { totalValue, recipient, message, customerId, merchantMail } =
      req.body;

    const cardId = uid2(32);

    const date = new Date();

    const merchant = await User.findOne({ email: merchantMail });
    console.log({ merchant });

    const cardPath = `./cards/${cardId}.png`

    QRCode.toFile(cardPath, `/displaycard/${cardId}`, {
      // color: {
      //   dark: '#d4a373',  // Blue dots
      //   light: '#bde0fe' // Transparent background
      // }
    }, function (err) {
      if (err) throw err
    })
  

    const resultCloudinary = await cloudinary.uploader.upload(cardPath).catch(err => {
      res.json({ result: false, error: err });
    });

    fs.unlinkSync(cardPath);

    const newCard = new Card({
      path: resultCloudinary.secure_url,
      totalValue,
      remainingValue: totalValue,
      date: date,
      recipient,
      message,
      cardId,
      customerId,
      userId: merchant._id,
    });

    const savedCard = await newCard.save();

    if (savedCard) {
      res.json({
        result: true,
        card: savedCard,
        url: resultCloudinary.secure_url
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

router.get("/allcards", async (req, res, next) => {
  const cards = await Card.find()
    .populate({
      path: "customerId", // Champ référencé dans Card
      model: "customers", // Modèle Mongoose associé
    })
    .exec();

  res.json({ result: true, cards });
});

// Envoi d'un code QR au front sous forme de fichier
router.get("/download/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;

    if (cardId) {
      const card = await Card.findOne({ cardId });

      if (!card) {
        return res.status(404).json({ error: "Carte non trouvée" });
      }

      res.json({ result: true, cardPath: card.path })

    } else {
      res.json({ result: false });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la carte :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération de la carte",
    });
  }
});

// Envoi des données (enregistrées en bdd) d'un code qr
router.get("/datacard/:cardId", async (req, res) => {
  console.log("DEBUG");

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
    console.error(
      "Erreur lors de la récupération des données de la carte :",
      error
    );
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la récupération des données de la carte",
    });
  }
});

router.get("/cardData/:cardId", async (req, res) => {
  try {
    console.log("Dans la route");

    const { cardId } = req.params;

    const dataCard = await Card.findOne({ _id: cardId });

    if (dataCard) {
      const { customerId } = dataCard;
      const customer = await Customer.findOne({ _id: customerId });
      console.log({ dataCard, customer });

      res.json({ result: true, dataCard, customer });
    } else {
      res.json({ result: false });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
