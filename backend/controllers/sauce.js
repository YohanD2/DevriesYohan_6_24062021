const Sauce = require('../models/Sauce');
const fs = require('fs');
const { exit } = require('process');
const jwt = require('jsonwebtoken');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    userId: sauceObject.userId
  });
  sauce.save()
    .then(() => res.status(201).json({
      message: sauceObject
    }))
    .catch(error => res.status(400).json({
      error
    }));
};

exports.deleteSauce = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
  const userId = decodedToken.userId;

  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      
      if(userId == sauce.userId){
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      } else {
        res.status(401).json({message : 'Unauthorized'});
      }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;

    if(userId == sauce.userId){
      const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
    } else {
      res.status(401).json({message : 'Unauthorized'});
    }
  })
  .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({
      error
    }));   
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const usersLiked = sauce.usersLiked;
    const usersDisliked = sauce.usersDisliked;
    const like = req.body.like;
    const userId = sauce.userId;
    var likes = sauce.likes;
    var dislikes = sauce.dislikes;
    let stop = false;

    const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
    } : { ...req.body };

    if (like == 1 ) {
      if( usersLiked.length != 0 ) {
        usersLiked.forEach(function(currentValue) {
          if (currentValue == userId) {
            stop = true;
          }
          if (stop == false ) {
            likes++;
            usersLiked.push(userId);
          }
        });
      } else {
        likes++;
        usersLiked.push(userId);
      }
      
    } else if (like == -1) {
      if (usersDisliked.length != 0 ) {
        usersDisliked.forEach(function(currentValue) {
          if (currentValue == userId) {
            stop == true;
          }
          if (stop == false ) {
            dislikes++;
            usersDisliked.push(userId);
          }
        });
      } else {
        dislikes++;
        usersDisliked.push(userId);
      }
    } else {
      for(var i in usersLiked){
        if(usersLiked[i] == userId){
          usersLiked.splice(i,1);
          likes--;
          stop == true;
        }
      }
      if ( stop == false ) {
        for(var i in usersDisliked){
          if(usersDisliked[i] == userId){
            usersDisliked.splice(i,1);
            dislikes = dislikes - 1;
          }
        }
      }
    }
    Sauce.updateOne({ _id: req.params.id }, {
      ...sauceObject,
      likes: likes,
      dislikes: dislikes,
      usersLiked: usersLiked,
      usersDisliked: usersDisliked,
    })
    .then(() => res.status(200).json({ message: 'Vote pris en compte !'}))
    .catch(error => res.status(400).json({ error }));
  });
};