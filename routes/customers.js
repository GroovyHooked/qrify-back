const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Customer = require("../models/customers");

/* enregistrement nouveau client */
router.post("/new", async (req, res) => {
  console.log(req.body);
  try {
    /* Verification des champs */
    if (
      !checkBody(req.body, ["firstname", "lastname", "email", "phoneNumber"])
    ) {
      res.json({ result: false, error: "Tous les champs doivent être saisis" });
      return;
    }

    const { lastname, firstname, email, phoneNumber } = req.body;

    /* Recherche de l'utilisateur avec l'email utilisé lors de l'inscription */
    const customer = await Customer.findOne({ email });

    /* Si l'utilisateur existe déjà */
    if (customer) {
      res.json({
        result: false,
        error: "Le client existe déjà en base de données",
      });
    } else {
      // /* Ajout en base de données */ est-ce necessaire???
      const customerId = uid2(32);

      const newCustomer = new Customer({
        firstname,
        lastname,
        email,
        phoneNumber,
        customerId,
        userId,
      });

      const savedCustomer = await newCustomer.save();

      /* Si l'inscription du client a bien eu lieu en base de données on renvoie le token sinon envoi d'un message d'erreur */
      if (savedCustomer) {
        res.json({ result: true, message: "Nouveau client enregistré" });
      } else {
        res.json({
          result: false,
          error:
            "Un problème est survenu lors de l'enregistrement en base de données",
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Un problème est survenu lors de l'enregistrement" });
  }
});

module.exports = router;
