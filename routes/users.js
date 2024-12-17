const express = require('express');
const router = express.Router();
const User = require("../models/users")
const path = require('path');

/* GET users listing. */
router.get('/profile/:email', async (req, res, next) => {
  const { email } = req.params

  try {

    const user = await User.findOne({ email })

    if (user) {

      res.json({ result: true, user })

    } else {
      res.json({ result: false, error: 'Utilisateur non trouvé' })
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
      return res.json({ result: false });
    }

    res.json({ result: true });

  } catch (e) {
    console.log('une erreur est survenue lors de la mise à jour', e);
  }

})


module.exports = router;
