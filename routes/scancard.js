const express = require("express");
const router = express.Router();
const Card = require("../models/cards");

router.put("/updateValue/:cardId", (req, res) => {
  try {
    const { cardId } = req.params;
    Card.updateOne({ cardId }, { $set: { totalValue: 0 } }).then((data) => {
      if (!data) {
        return res.status(404).json({ error: "Carte non trouvée" });
      }

      if (data.modifiedCount === 0) {
        res.json({ result: false, error: "La carte est déjà utilisé" });
      } else {
        res.json({ result: true });
      }
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
