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
      res.json({ result: false, error: "Tous les champs doivent être saisis" });
      return;
    }

    const { lastname, firstname, email, phoneNumber, merchantMail } = req.body;
    console.log({ lastname, firstname, email, phoneNumber });

    /* Recherche de l'utilisateur avec l'email utilisé lors de l'inscription */
    const customer = await Customer.findOne({ email });
    console.log({ customer });

    /* Si l'utilisateur existe déjà on le renvoie */
    if (customer) {
      console.log("if customer");
      res.json({ result: true, customer });

    } else {
      console.log("else");
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
        console.log({ savedCustomer });

        /* Si l'inscription du client a bien eu lieu en base de données on renvoie le document fraichement enregistré sinon envoi d'un message d'erreur */
        if (savedCustomer) {
          res.json({ result: true, customer: savedCustomer });
        } else {
          res.json({
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

router.get("/list", (req, res) => {
  try {
    Customer.find().then((data) => {
      console.log(data);
      res.json({ result: true, customers: data });
    });
  } catch (error) {
    res.status(500).json({
      error:
        "Un problème est survenu lors la récupération de la liste des clients",
    });
  }
});
module.exports = router;
