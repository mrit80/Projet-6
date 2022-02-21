const Sauce = require('../models/sauce');
const fs = require('fs');

// Récupérer une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Récupérer toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Créer une nouvelle sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauceAsauver = {
    userId: sauceObject.userId,
    name: sauceObject.name,
    manufacturer: sauceObject.manufacturer,
    description: sauceObject.description,
    mainPepper: sauceObject.mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    heat: sauceObject.heat,
    likes: 0,
    dislikes: 0,
    userLiked: [],
    userDisliked: [],
  };

  const sauce = new Sauce(sauceAsauver);
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: 'Sauce modifié !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Liker une sauce
exports.setLikeDislike = (req, res, next) => {
  //recuperer la sauce a ajourner
  Sauce.findById(req.params.id)
    .then((sauceObj) => {
      // Default = 0
      // Vérifier que l'utilisateur n'a pas déjà liker la sauce
      if (req.body.like == 0) {
        if (sauceObj.userLiked.includes(req.body.userId)) {
          sauceObj.likes -= 1;
          sauceObj.userLiked.splice(req.body.userId, 1);
          Sauce.updateOne({ _id: req.params.id }, sauceObj)
            .then(() => {
              res
                .status(201)
                .json({ message: 'Ton avis a été pris en compte!' });
            })
            .catch((error) => {
              res.status(400).json({ error: error });
            });
        }
        // Vérifier que l'utilisateur n'a pas déjà disliker la sauce
        if (sauceObj.userDisliked.includes(req.body.userId)) {
          sauceObj.dislikes -= 1;
          sauceObj.userDisliked.splice(req.body.userId, 1);
          Sauce.updateOne({ _id: req.params.id }, sauceObj)
            .then(() => {
              res
                .status(201)
                .json({ message: 'Ton avis a été pris en compte!' });
            })
            .catch((error) => {
              res.status(400).json({ error: error });
            });
        }
        // Mise à jour des likes. likes = 1
      } else if (req.body.like == 1) {
        sauceObj.likes += 1;
        sauceObj.userLiked.push(req.body.userId, 1);
        Sauce.updateOne({ _id: req.params.id }, sauceObj)
          .then(() => {
            res.status(201).json({ message: 'Ton like a été pris en compte!' });
          })
          .catch((error) => {
            res.status(400).json({ error: error });
          });
        // Mise à jour des dislikes. dislikes = -1
      } else if (req.body.like == -1) {
        sauceObj.dislikes += 1;
        sauceObj.userDisliked.push(req.body.userId, 1);
        Sauce.updateOne({ _id: req.params.id }, sauceObj)
          .then(() => {
            res
              .status(201)
              .json({ message: 'Ton dislike a été pris en compte!' });
          })
          .catch((error) => {
            res.status(400).json({ error: error });
          });
      } else {
        console.error('mauvaise requête');
      }
    })
    .catch((error) => {
      res.status(404).json({ error: error });
    });
};
