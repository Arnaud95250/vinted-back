const Users = require("../models/Users"); // je charge le model User dans mon fichier ce qui me permettra de parcourir les membre en BDD

const isAuthenticated = async (req, res, next) => { // en lien avec ma fonction router.post("/"publish_annonce", isAuthenticated... dans offer.js
    if(req.headers.authorization){ // Je check si le token en BDD est true
      const checkToken = req.headers.authorization.replace("Bearer ", "");
      const user = await Users.findOne({token: checkToken}).select();  // Je vais checker en BDD si un membre correspond au token qui à été rentré dans postman(Authorization => type = Bearer token) et avec le select je n'affiche que le token et non le hash et le salt et j'affiche les elements du .select("account email token")
    
      if(user){ // si mon user est true je rentre dasn la condition (si il existe en BDD)
        req.user = user; // elle permet de d'ajouter une clés a req.user qui correspond a ma variable user (le membre retrouveé en bdd)
        // console.log(user);
        return next(); // je sors de la fonction isAuthenticated et je continue la fonction router.post("/"publish_annonce", isAuthenticated... dans offer.js
      } else {
        res.status(401).json("le compte ne correspond pas") // Sinon je renvoie un message d'erreur avec le stauts (401) & le json
      }
    } else {
      res.status(401).json({ error: "Unauthorized"});
    }
}

module.exports = isAuthenticated; // j'export min fichier pour le recharger dans un fichier de mon choix (actuellemnt dans offer.js)
  


