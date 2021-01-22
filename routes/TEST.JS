const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");

router.get("/offers", async (req, res) => {
    try {
        const offers = await Offer.findOne();
        // console.log(offers);

        // const offer = await Offer.findOne({
        //     product_name: new RegExp(req.query.title, "i"),
        //     product_price: {
        //         $gte: req.query.priceMin,
        //         $lte: req.query.priceMax,
        //     },
        // });
        // console.log(offer);
        // res.json(offer);

        // If query title

        if (offers) {
            if (req.query.title && req.query.priceMin && req.query.priceMax) {
                const offer = await Offer.findOne({
                    product_name: new RegExp(req.query.title, "i"),
                    product_price: {
                        $gte: req.query.priceMin,
                        $lte: req.query.priceMax,
                    },
                });
                res.json(offer);
            }

            if (req.query.title) {
                // Get element with this title
                const offer = await Offer.findOne({
                    product_name: new RegExp(req.query.title, "i"),
                });
                // console.log(offer);

                res.json(offer);
            }
            if (req.query.priceMin && req.query.priceMax) {
                // Get element with priceMin & priceMax
                const offer = await Offer.find({
                    product_price: {
                        $gte: req.query.priceMin,
                        $lte: req.query.priceMax,
                    },
                });
                // console.log(offer);
                res.json(offer);
            }

            if (req.query.priceMin) {
                // Get element with priceMin & priceMax
                const offer = await Offer.find({
                    product_price: {
                        $gte: req.query.priceMin,
                    },
                });
                // console.log(offer);
                res.json(offer);
            }
            if (req.query.priceMax) {
                // Get element with priceMin & priceMax
                const offer = await Offer.find({
                    product_price: {
                        $lte: req.query.priceMax,
                    },
                });
                // console.log(offer);
                res.json(offer);
            }
        } else {
            res.status(400).json("No offers here");
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;