const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const Customer = require("../models/customers");
const User = require("../models/users");

/* enregistrement nouveau client */
router.post("/new", async (req, res) => {
  try {
    /* Verification des champs */
    if (
      !checkBody(req.body, ["firstname", "lastname", "email", "phoneNumber"])
    ) {
      res.status(400).json({ result: false, error: "Tous les champs doivent être saisis" });
      return;
    }

    const { lastname, firstname, email, phoneNumber, merchantMail } = req.body;

    /* Recherche de l'utilisateur avec l'email utilisé lors de l'inscription */
    const customer = await Customer.findOne({ email });

    /* Si l'utilisateur existe déjà on le renvoie */
    if (customer) {
      res.status(200).json({ result: true, customer });

    } else {
      // récupérer l'objectId du commercant sur la back-end
      User.findOne({ email: merchantMail }).then(async (data) => {
        const newCustomer = new Customer({
          firstname,
          lastname,
          email,
          phoneNumber,
          userId: data._id,
        });

        // /* Ajout en base de données */
        const savedCustomer = await newCustomer.save();

        /* Si l'inscription du client a bien eu lieu en base de données on renvoie le document fraichement enregistré sinon envoi d'un message d'erreur */
        if (savedCustomer) {
          res.status(200).json({ result: true, customer: savedCustomer });
        } else {
          res.status(500).json({
            result: false,
            error:
              "Un problème est survenu lors de l'enregistrement en base de données",
          });
        }
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Un problème est survenu lors de l'enregistrement" });
  }
});

router.post("/list", async (req, res) => {

  const { token } = req.body

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({result: false, message: "Utilisateur introuvable pour ce token." })
    }

    const customers = await Customer.find({ userId: user._id });

    res.status(200).json({ result: true, customers });

  } catch (error) {
    res.status(500).json({
      error:
        "Un problème est survenu lors la récupération de la liste des clients",
    });
  }
});

router.post("/onecustomer", async (req, res) => {

  const { lastname, token } = req.body

  try {

    const user = await User.findOne({ token: token });

    if (!user) {
      return { result: false, message: "Utilisateur introuvable pour ce token." };
    }

    const customers = await Customer.findOne({ userId: user._id, lastname });

    if (customers) {
      res.status(200).json({ result: true, customers });
    } else {
      res.status(404).json({ result: false, message: "Le client n'existe pas" });
    }

  } catch (error) {
    res.status(500).json({
      error: "Un problème est survenu lors de la requête en base de données",
    });
  }
});

module.exports = router;
