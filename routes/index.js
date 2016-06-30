var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var context = require('../views/data/index.json');

router.get('/', function (req, res, next) {
  mongoose.model('flashcard').find(function (err, flashcard) {
    if (!err) {
      res.render('index', {
        page_title: "Flashcards",
        items: flashcard,
        newFolderModal: context.new_deck,
        renameModal: context.rename
      });
    } else {
      res.send(err)
    }
  })

});




module.exports = router;
