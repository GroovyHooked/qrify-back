const express = require('express');
const router = express.Router();
const User = require("../models/users")

/* GET users listing. */
router.get('/profile/:email', async (req, res, next) => {
  const { email } = req.params

  try {

    const user = await User.findOne({ email })

    if (user) {

      res.status(200).json({ result: true, user })

    } else {
      res.status(404).json({ result: false, error: 'Utilisateur non trouvé' })
    } 

  } catch (e) {

    console.error("Erreur lors de la récupération de l'utilisateur en base de données :", e);
    res.status(500).json({
      result: false,
      error: "Un problème est survenu lors de la récupération de l'utilisateur en base de données",
    });

  }

});

router.put('/avatarupdate/', async (req, res) => {

  const { avatarPath, token } = req.body

  try {
    const result = await User.findOneAndUpdate(
      { token: token },
      { avatarPath: avatarPath },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ result: false, error: "Utilisateur non trouvé en bdd" });
    }

    res.status(200).json({ result: true });

  } catch (e) {
    console.log("une erreur est survenue lors de la mise à jour de l'avatar", e);
    res.status(500).json({
      result: false,
      error: "une erreur est survenue lors de la mise à jour de l'avatar",
    });
  }

})


router.put('/updateemail', async (req, res) => {
  const { email, token } = req.body

  try {
    const result = await User.findOneAndUpdate(
      { token: token },
      { email },
      { new: true }
    );

    if (!result) {
      return res.status(500).json({ result: false, error: "une erreur est survenue en bdd" });
    }

    res.json({ result: true });

  } catch (e) {
    console.log("une erreur est survenue lors de la mise à jour de l'email", e);
    res.status(500).json({
      result: false,
      error: "une erreur est survenue lors de la mise à jour de l'email",
    });
  }
})

router.put('/updatecolors', async (req, res) => {

  const { color, type, token } = req.body

  try {

    await User.findOneAndUpdate(
      { token: token },
      type === 'main' ? { qrCodeMainColor: color } : { qrCodeBackgroundColor: color },
    );
    res.status(200).json({ result: true })

  } catch (e) {
    console.log("Une erreur est survenue lors de la mise à jour des couleurs");
    res.status(500).json({
      result: false,
      error: "Une erreur est survenue lors de la mise à jour des couleurs",
    });
  }
})

module.exports = router;
