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

    // On récupère le commerçant en base de données
    const merchant = await User.findOne({ email: merchantMail });

    // Si aucun commerçant n'est trouvé on renvoie une erreur
    if (!merchant) {
      return res.status(500).json({ result: false, error: "L'utiisateur n'existe pas en bdd" })
    }

    // Chemin vers le répertoire temporaire
    const tempDir = os.tmpdir();

    // Chemin pour le fichier temporaire
    const cardPath = path.join(tempDir, `${cardId}.png`);

    // On créé le code qr à l'endroit défini par le chemin fichier en y stockant un chemin d'url (/displaycard/${cardId})
    QRCode.toFile(cardPath, `/displaycard/${cardId}`, {
      color: {
        dark: color,
        light: backgroundColor
      }
    }, function (err) {
      if (err) throw err
    })
    // Upload du fichier code QR sur Cloudinary
    const { cloudinaryObj, error } = await retryUpload(cardPath)

    if (error) {
      return res.status(500).json({ error });
    }
    // Préparation de l'enregistrement de la nouvelle carte en bdd
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

    // Enregistrement de la nouvelle carte en base de données 
    const savedCard = await newCard.save();

    // Si la carte a correctement été enregistrée en bdd on renvoie les données enregistrées ainsi que l'url Cloudinary du code QR
    if (savedCard) {
      return res.status(200).json({
        result: true,
        card: savedCard,
        url: cloudinaryObj.secure_url,
      });
    } else {
      // Sinon on retourne un message d'erreur
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

  try {

    const { token } = req.body

    if (token) {
      // On récupère les données du commerçant
      const user = await User.findOne({ token: token });

      // On récupère toutes les cartes et les données client liée à chaque carte 
      const cards = await Card.find({ userId: user._id })
        .populate({
          path: "customerId", // Champ référencé dans la collection Card
          model: "customers", // Modèle Mongoose associé
        })
        .exec();

      res.status(200).json({ result: true, cards });

    } else {
      res.status(401).json({ result: false });
    }

  } catch (e) {

    res.status(500).json({ result: false, error: e });

  }

});

// Envoi d'un code QR au front sous forme d'uri
router.get("/download/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;

    if (cardId) {
      const card = await Card.findOne({ cardId });

      if (!card) {
        return res.status(404).json({ error: "Carte non trouvée" });
      }

      res.status(200).json({ result: true, cardPath: card.path })

    } else {
      res.status(400).json({ result: false });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la carte :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération de la carte",
    });
  }
});

// Renvoi des données d'un code qr (carte + client)
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

    res.status(200).json({ cardData, customer });

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

    const { cardId } = req.params;

    const dataCard = await Card.findOne({ _id: cardId });

    if (dataCard) {

      const { customerId } = dataCard;

      const customer = await Customer.findOne({ _id: customerId });

      res.status(200).json({ result: true, dataCard, customer });

    } else {

      res.status(404).json({ result: false });

    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ result: false });
  }
});


module.exports = router;


const retryUpload = async (filePath, counter = 0) => {
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
