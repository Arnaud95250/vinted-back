const express = require("express");
const cloudinary = require("cloudinary").v2; // package qui permet de charger des photo dans le cloud de cloudinary (https://cloudinary.com/console/c-b92b4dab313c2a4266c1e9e47fce19)
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated"); // je charge mon fichier isAuthenticated ou je vais checker si un membre existe en bdd
// MODELS
const Offers = require("../models/Offers"); // La route qui me dirige dans mon model ce qui me permttra de créer de nouvelles annonces

//*************************************** Début POST créer de nouvelles annonces*****************************
router.post("/offer/publish_annonce",isAuthenticated, async (req, res)=>{ // ma route puis j'accede au fichier isAuthenticated.js ou je check les membre et je reviens dans offer .js si c'est le cas sinon je retourne un msg d'erreur
    try {
        // const pictureToUpload = req.files.picture.path;
        // const uploadImg = await cloudinary.uploader.upload(pictureToUpload, {// me permet de charger une photo dans cloudinary
        //     folder: "/Vinted/offerts", // `/Vinted/offerts/${newOffer._id}`me créé un dossier si il n'éxiste pas sinon il stock dans le dossier si il éxiste
        // });
        const {title,description,price,size,brand,condition,city,color,} = req.fields;
        const newOffer = new Offers({               // Je créé une nouvelle annonce
            product_name: title,                    //req.fields.product_name,
            product_description: description,       //req.fields.product_description,
            product_price: price,                   //req.fields.product_price,
            product_details: [                      // il s'agit d'un tableau d'objets
                {MARQUE: brand},                    //req.fields.brand,
                {TAILLE: size},                     //req.fields.size,
                {ETAT: condition},                  //req.fields.condition,
                {COULEUR: color},                   //req.fields.color,
                {EMPLACEMENT: city},                //req.fields.city,
            ],
            owner:  req.user,
        });


        // Envoyer l'image à cloudinary
    const uploadImg = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/Vinted/offers/${newOffer.product_name}`, // créé un dossier vinted puis un dossier offers et un dossier pour chaque annonce avec le nom de l'annonce ${newOffer.product_name}
      });
  
      // Aujouter le uploadImgat de l'upload dans newOffer
      newOffer.product_image = uploadImg;

        console.log(newOffer);
        await newOffer.populate("owner"); // permet d'afficher les sous dossier en lien et connecté avec la création de mon annonce 
        await newOffer.save(); // Sauvegarde le model en BDD (MongoDb)
        res.status(200).json(newOffer); // Retourne le contenue de newOffer coté front
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});
//*************************************** Fin du POST créer de nouvelles annonces*****************************

router.get("/offer/offer_filter", async (req, res)=>{
    try {
        const filters = {}; // un objet vide que je vais renplir avec des {Clés: Value}

        if(req.query.title){
            filters.product_name = new RegExp(req.query.title, "i");
        }  // Objet.clés         = value    ==>> j'attribut à mon ojbet vide une key et value   

        if(req.query.priceMin){ //Si j'ai rentré dans ma route priceMin=40 (ou autre valeur)je peut rentrer dans la condition
            filters.product_price = {$gte: Number(req.query.priceMin)}; // $gte >= | ou  $gt > 
        }   //Objet.clés          = value

        if(req.query.priceMax){
            if(req.query.priceMin){
               filters.product_price.$lte = Number(req.query.priceMax); // $slt <= | ou  $lt <
               //Objet.clés               = value
            } else{
                filters.product_price = {$lte: Number(req.query.priceMax)}; // $slt <= | ou  $lt <
            }   //Objet.clés          = value  
        }

        //Fonction .sort() que je vais appeler dans filterOffer avec .sort(triSort)
        const triSort = {};
        if(req.query.sort === "price_desc"){
            triSort.product_price = -1 // tri les annonce par prix du plus petit au plus grand
        }
        if(req.query.sort === "price-asc"){
            triSort.product_price === 1; // tri les annonce par prix du plus grand au plus petit
        }
        
        let nbPage;
        // forcer à afficher la page 1 si la query page n'est pas envoyée ou est envoyée avec 0 ou < -1
        if (req.query.page < 1) {
            nbPage = 1;
        } else {
          // sinon, page est égale à ce qui est demandé
          nbPage = Number(req.query.page);
        }

        // Fonction .limit() variable limit que je vais appeller dans filterOffer avec .limit(filterlimit)
        const filterlimit = Number(req.query.limit);

         // Renvoie le nombre de résultats trouvés en fonction des filters
        const count = await Offers.countDocuments(filters);

        const filterOffer = await Offers.find(filters) // je filtre les données provenant de la BDD
        .sort(triSort) // en fonction de ma demande je tri les annonce par prix decroissant ou croissant
        .skip((nbPage - 1) * filterlimit) // définir le nombre de premier resultat je ne veux pas affichicher en fonction de la page active explication ci-dessous 
        .limit(filterlimit) // permet de décider combien d'annonce seront affiché sur une page
        .select("product_name product_price"); // je décide ce que je veux afficher (le nom de l'annonce et le prix)
        console.log(filterOffer);    

        // SKIP = ignorer les n premiers résultats
        // L'utilisateur demande la page 1 (on ignore les 0 premiers résultats)
        // (page - 1) * limit = 0

        // L'utilisateur demande la page 2 (on ignore les limit premiers résultats)
        // (page - 1) * limit = 5 (si limit = 5)

        res.status(200).json({count: count, offers: filterOffer});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

module.exports = router;
