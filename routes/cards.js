const express = require("express");
const router = express.Router();
const Card = require("../models/cards");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");

router.post("/card", async function (req, res, next) {
  try {
    if (!checkBody(req.body, ["recipient", "totalValue"])) {
      return res.status(400).json({
        result: false,
        error: "Tous les champs doivent être saisis",
      });
    }

    const { path, totalValue, recipient, message } = req.body;

    const cardId = uid2(32);

    // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const date = new Date();
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

    const newCard = new Card({
      path,
      totalValue,
      date: date,
      recipient,
      message,
      cardId,
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
