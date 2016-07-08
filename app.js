'use strict';
var express = require('express'),
    hbs = require('hbs'),
    path = require('path'),
    Guid = require('guid'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    guid = Guid.create(),
    localDB = 'mongodb://localhost/flashcards',
    Flashcard = require('./models/flashcard.model.js');


var routes = require('./routes/index');
var app = express();





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
    mongoose.connect(localDB);
}


app.post('/add', function (req, res) {
    var title = req.body.title;
    new Flashcard({
        title: title,
        cards: [
            {
                id: new Guid.create().value,
                title: "new card",
                front: "edit me",
                back: "edit me"
            }
        ]
    }).save(function (err, doc) {
        if (!err) {
            console.log(`The new deck ${title} has been added to the database`);
        } else {
            res.send(err)
        }
    })
    res.end("yes")
});


app.post('/addCard/:id', function (req, res) {
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

app.post('/update/:id', function (req, res) {
    var id = req.params.id;
    console.log(id)
    Flashcard.findOne({ _id: id }, function (err, foundObj) {
        if (err) {
            console.log(err)
            res.status(500).send();
        } else {
            if (!foundObj) {
                res.status(404).send();
            } else {
                if (req.body.title) {
                    foundObj.title = req.body.title;
                }

                foundObj.save(function (err, updateObj) {
                    if (err) {
                        console.log(err)
                        res.status(500).send();
                    } else {
                        console.log(updateObj);
                    };
                });
                res.end("yes")
            }
        }
    });

});

app.post('/updateCardTitle/:id', function (req, res) {
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

app.post('/updateCard/:id', function (req, res) {
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




app.post('/deleteCard/:id', function (req, res) {
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

app.get('/getDeck/:id', function (req, res) {
    var id = req.params.id;
    Flashcard.findOne({ _id: id }, function (err, foundObj) {
        if (err) {
            console.log(err)
            res.status(500).send();
        } else {
            if (!foundObj) {
                res.status(404).send();
            } else {

                let baseCard = {
                    id: new Guid.create().value,
                    title: "new card",
                    front: "edit me",
                    back: "edit me"
                };

                if (!foundObj.cards) {
                    console.log('no cards found')
                    foundObj.cards = baseCard

                    foundObj.save(function (err) {
                        if (err) {
                            console.log(err)
                        }
                    });
                } else if (foundObj.cards.length == 0) {
                    foundObj.cards = baseCard
                    foundObj.save(function (err) {
                        if (err) {
                            console.log(err)
                        }
                    });
                }
                res.send(foundObj)
                res.end()

            }
        }
    });

});

app.get('/getCard/:id', function (req, res) {
    var id = req.params.id;
    let cID = req.query.cardID;
    console.log(id)

    Flashcard.findOne({ _id: id}, {cards: {$elemMatch: {id: cID}}}, function (err, obj) {

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

app.post('/delete/:id', function (req, res) {
    var id = req.params.id;
    Flashcard.findOneAndRemove({ _id: id }, function (err, foundObj) {
        if (err) {
            console.log(err)
            res.status(500).send();
        }
        console.log(`Item ${id} has been deleted.`)
        return res.status(200).send();
    });

});

module.exports = app;

