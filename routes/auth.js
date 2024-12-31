const express = require("express");
const router = express.Router();
const { checkBody } = require("../modules/checkBody");
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* Inscription */
router.post("/signup", async (req, res) => {
  try {
    /* Verification des champs */
    if (
      !checkBody(req.body, [
        "lastname",
        "firstname",
        "company",
        "email",
        "password",
      ])
    ) {
      res.status(400).json({ result: false, error: "Tous les champs doivent être saisis" });
      return;
    }


    const { lastname, firstname, company, email, password } = req.body;

    /* Recherche de l'utilisateur avec l'email utilisé lors de l'inscription */
    const user = await User.findOne({ email });

    /* Si l'utilisateur existe déjà */
    if (user) {
      res.status(400).json({
        result: false,
        error: "L'utilisateur existe déjà en base de données",
      });
    } else {
      /* Ajout en base de données */
      const hash = bcrypt.hashSync(password, 10);
      const token = uid2(32);
      const userId = uid2(32);

      const newUser = new User({
        firstname,
        lastname,
        email,
        company,
        password: hash,
        token,
        userId,
        avatarPath: "/avatars/avatar1.svg",
        qrCodeMainColor: '#000000',
        qrCodeBackgroundColor: '#ffffff'
      });

      const savedUser = await newUser.save();

      /* Si l'inscription a bien eu lieu en base de données on renvoie true envoi d'un message d'erreur */
      if (savedUser) {
        res.status(200).json({
          result: true,
        });
      } else {
        res.status(500).json({
          result: false,
          error:
            "Un problème est survenu lors de l'enregistrement en base de données",
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Un problème est survenu lors de l'inscription" });
  }
});

/* Connection */
router.post("/signin", async (req, res, next) => {
  try {
    /* Verification des champs */
    if (!checkBody(req.body, ["email", "password"])) {
      res.status(400).json({ result: false, error: "Tous les champs doivent être saisis" });
      return;
    }

    const { email, password } = req.body;

    /* Recherche de l'utilisateur avec l'email utilisé lors de la connexion */
    const user = await User.findOne({ email });

    /* Si l'utilisateur n'existe pas */
    if (!user) {
      res.status(404).json({ result: false, error: "Vous n'êtes pas inscrit" });
      return;
    }

    /* Si l'utilisateur existe mais mot de passe incorrect */
    if (user && !bcrypt.compareSync(password, user.password)) {
      res.status(400).json({ result: false, error: "Le mot de passe est inccorect" });
      return;
    }

    /* Si l'utilisateur existe et le mot de passe est correct */
    res.status(200).json({
      result: true,
      token: user.token,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      avatarPath: user.avatarPath,
      qrCodeMainColor: user.qrCodeMainColor,
      qrCodeBackgroundColor: user.qrCodeBackgroundColor
    });
  } catch (error) {
    res.status(500).json({ error: "La connexion a échoué" });
  }
});

module.exports = router;
