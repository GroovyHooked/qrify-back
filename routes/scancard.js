const express = require("express");
const router = express.Router();
const Card = require("../models/cards");

router.put("/updateValue/:cardId", (req, res) => {
  try {
    const { cardId } = req.params;
    const { totalValue } = req.body;
    Card.updateOne({ cardId }, { totalValue }).then((data) => {
      if (!totalValue) {
        return res.status(404).json({ error: "Carte non trouvée" });
      }
      res.json({ result: true, totalValue: data.totalValue });
    });
  } catch (error) {
    console.error("Erreur  :", error);
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la mise à jour du statut de la carte",
    });
  }
});

module.exports = router;
