'use strict';
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Guid = require('guid'),
    bodyParser = require('body-parser'),
    Flashcard = require('../models/flashcard.model.js');



router.get('/getCard/:id', function (req, res) {
    var id = req.params.id;
    let cID = req.query.cardID;
    console.log(id)

    Flashcard.findOne({ _id: id }, { cards: { $elemMatch: { id: cID } } }, function (err, obj) {

        if (err) {
            console.log(err)
            res.status(500).send();
        };

        if (!obj) {
            console.log(`obj not found`);
            res.status(404).send
        }
        else {
            res.send(obj.cards);
            console.log(obj.cards)

        }
        res.end()
    });
});

router.post('/deleteCard/:id', function (req, res) {
    var id = req.params.id,
        cID = req.body.cardID;

    Flashcard.update({ '_id': id },
        { $pull: { "cards": { id: cID } } }, function (err, result) {
            if (err) {
                console.log(err);
                res.send(err)
            } else {
                res.send(result)
            }

            res.end();
        })
});

router.post('/updateCardTitle/:id', function (req, res) {
    let id = req.params.id,
        title = req.body.title;

    Flashcard.update({ 'cards.id': id }, {
        '$set': {
            'cards.$.id': id,
            'cards.$.title': title
        }
    }, function (err, obj) {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.send(obj)
        }
        res.end();
    });
});

router.post('/updateCard/:id', function (req, res) {
    let id = req.params.id,
        front = req.body.front,
        back = req.body.back;


    Flashcard.update({ 'cards.id': id }, {
        '$set': {
            'cards.$.id': id,
            'cards.$.front': front,
            'cards.$.back': back

        }
    }, function (err, obj) {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.send(obj)
        }
        res.end();
    });
});

router.post('/addCard/:id', function (req, res) {
    var id = req.params.id,
        title = req.body.title,
        front = req.body.front,
        back = req.body.back;


    Flashcard.findOne({ _id: id }, function (err, foundObj) {
        if (err) {
            console.log(err)
            res.status(500).send();
        } else {
            if (!foundObj) {
                res.status(404).send();
            } else {
                let card = {
                    id: new Guid.create().value,
                    title: title,
                    front: front,
                    back: back
                };

                foundObj.cards.push(card);
                foundObj.save(function (err, updateObj) {
                    if (err) {
                        console.log(err)
                        res.status(500).send();
                    } else {
                        console.log("success")
                    };
                });
                res.send(foundObj);
                res.end();
            }
        }
    });




});





module.exports = router;
