const express = require("express");
const router = express.Router();
const Card = require("../models/cards");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");

const QRCode = require("qrcode");
const Customer = require("../models/customers");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const os = require("os");
const BASE_URL = " http://localhost:3001";
// const BASE_URL = "https://d50e-2a01-cb16-2038-69d8-80fe-8437-bd0d-9383.ngrok-free.app"

router.post("/newcard", async function (req, res, next) {
  try {
    if (!checkBody(req.body, ["recipient", "totalValue", "message"])) {
      return res.status(400).json({
        result: false,
        error: "Tous les champs doivent être saisis",
      });
    }

    const {
      totalValue,
      recipient,
      message,
      customerId,
      merchantMail,
      color,
      backgroundColor,
    } = req.body;
    const cardId = uid2(32);
    const date = new Date();

    const merchant = await User.findOne({ email: merchantMail });
    console.log({ merchant });

    if (!merchant) {
      return res
        .status(500)
        .json({ result: false, error: "L'utiisateur n'existe pas en bdd" });
    }

    // Chemin vers le répertoire temporaire
    const tempDir = os.tmpdir();

    // Chemin pour le fichier temporaire
    const cardPath = path.join(tempDir, `${cardId}.png`);

    // On créé le code qr à l'endroit défini par le chemin fichier en y stockant un chemin d'url (/displaycard/${cardId})
    QRCode.toFile(
      cardPath,
      `/displaycard/${cardId}`,
      {
        color: {
          dark: color,
          light: backgroundColor,
        },
      },
      function (err) {
        if (err) throw err;
      }
    );

    const { cloudinaryObj, error } = await retryUpload(cardPath, 0);

    if (error) {
      return res.status(500).json({ error });
    }

    const newCard = new Card({
      path: cloudinaryObj.secure_url,
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
      return res.json({
        result: true,
        card: savedCard,
        url: cloudinaryObj.secure_url,
      });
    } else {
      return res.status(500).json({
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

router.post("/allcards", async (req, res, next) => {
  const { token } = req.body;

  const user = await User.findOne({ token: token });

  const cards = await Card.find({ userId: user._id })
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

      res.json({ result: true, cardPath: card.path });
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

const retryUpload = async (filePath, counter) => {
  if (counter >= 10) {
    return {
      error: `L’opération d’upload sur Cloudinary a échoué à 10 reprises consécutives.`,
    };
  }

  const cloudinaryObj = await cloudinary.uploader.upload(filePath);

  if (cloudinaryObj === undefined) {
    return retryUpload(filePath, counter + 1);
  }

  fs.unlinkSync(filePath);
  return { cloudinaryObj };
};
