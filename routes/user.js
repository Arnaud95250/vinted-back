const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
// *********************************************
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

//-----Début du POST pour créer un nouvelle user---------
router.post("/user/create_user", async (req,res) => {
    try {
        // SIGNUP
        const password =req.fields.password;
        const salt = uid2(64); // générer un salt
        const hash = SHA256(password + salt).toString(encBase64);// générer un hash
        const token = uid2(64); // générer un token (n'a rien à voir avec la gestion du mot de passe)
        const checkUserName = req.fields.username;
        const checkEmail = await Users.findOne({
            email: req.fields.email
        });
        
        if(!checkEmail){
            if(checkUserName){
                const newUser = new Users({
                    email: req.fields.email,
                    account: { 
                    username:req.fields.username, 
                    phone:req.fields.phone
                    },
                    token: token,
                    hash: hash,
                    salt: salt
                });
                // Etape 3 : sauvegarde de l'utilisateur
                console.log(newUser);
                await newUser.save();
                // Etape 4 : répondre au client
                res.status(200).json({
                    _id: newUser._id,
                    token: newUser.token,
                    account: {
                      username: newUser.account.username,
                      phone: newUser.account.phone,
                    },
                  });
            } else {
                console.log(checkUserName);
                res.status(400).json("le username n'est pas renseigné");
            }
        } else {
            res.status(400).json("l'email renseigné lors de l'inscription existe déjà dans la base de données");
        }
    } catch (error) {
        res.status(400).json({error: message.error});
    }
});
//-----Fin du POST pour créer un nouvelle user---------
//*****************************************************
//-----Début du POST Login user------------------------
router.post("/user/post_login", async (req, res) => {
  try {
    // Trouve dans la BDD le user qui veut se connecter
    const user = await Users.findOne({ email: req.fields.email });
    if (user) {
      //   console.log(user);
      // Est-ce qu'il a rentré le bon mot de passe ?
      // générer un nouveau hash avec le password rentré + le salt du user trouvé
      const newHash = SHA256(req.fields.password + user.salt).toString(encBase64);
      // Si ce hash est le même que le hash du user trouvé => OK
      if (newHash === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: {
            username: user.account.username,
            phone: user.account.phone,
          },
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//-----Fin du POST Login user------------------------

module.exports = router;