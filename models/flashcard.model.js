'use-strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FlashcardSchema = new Schema({
    title: String,
    cards: {
        type: Array,
        ref: "Cards"
    },
    created: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Flashcard", FlashcardSchema);