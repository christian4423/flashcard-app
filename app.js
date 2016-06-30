'use strict';
var express = require('express'),
    hbs = require('hbs'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');


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
    mongoose.connect('mongodb://localhost/flashcards');
}

var Schema = new mongoose.Schema({
    title: String,
    cards: Array
})

var flashcard = mongoose.model('flashcard', Schema)

app.post('/add', function (req, res) {
    var title = req.body.title;
    new flashcard({
        title: title,
        cards: [
            {
                "title": "new card",
                "front": "edit me",
                "back": "edit me"
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
app.post('/update/:id', function (req, res) {
    var id = req.params.id;
    console.log(id)
    mongoose.model('flashcard').findOne({ _id: id }, function (err, foundObj) {
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

app.get('/getDeck/:id', function (req, res) {
    var id = req.params.id;
    console.log(id)
    mongoose.model('flashcard').findOne({ _id: id }, function (err, foundObj) {
        if (err) {
            console.log(err)
            res.status(500).send();
        } else {
            if (!foundObj) {
                res.status(404).send();
            } else {

                let baseCard = {
                    "title": "new card",
                    "front": "edit me",
                    "back": "edit me"
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
app.post('/delete/:id', function (req, res) {
    var id = req.params.id;
    mongoose.model('flashcard').findOneAndRemove({ _id: id }, function (err, foundObj) {
        if (err) {
            console.log(err)
            res.status(500).send();
        }
        console.log(`Item ${id} has been deleted.`)
        return res.status(200).send();
    });

});

module.exports = app;
