
var $currentMenu = null,
    renameID = "",
    port = 4000,
    tempID = "",
    cardID = "",
    debug = false,
    $cardContainer = $('.card-container');

var cardCount = 0,
    owl = $("#thumbnail-container");

var $testContainer = $('.test-body'),
testCardCount = 0;

var modals = {
    newDeckModal : $('#new-deck-modal')
}


$(function () {
    var $openDeckMenu = $("[data-action=open-menu]"),
        $closeDeckMenu = $("[data-action=close-menu]"),
        $renameDeck = $("[data-action=rename-menu]"),
        $deleteDeck = $("[data-action=delete-menu]"),
        $saveID = $("[data-action=save-id]"),
        $addDeck = $("[data-action=add-deck]"),
        $clearCards = $("[data-action=clear-owl]"),
        $clearTest = $("[data-action=clear-test]"),
        $addCard = $("[data-action=add-card]"),
        $loadEditor = $('[data-action=load-editor]'),
        $renameCard = $('[data-action=rename-card]'),
        $hideCardContainer = $('[data-action=hide-container]'),
        $cardsFrontBack = $('[data-action=save-card]'),
        $starTest = $('[data-action=start-test]');


    owl.owlCarousel({
        items: 6,
        slideSpeed: 200,
        rewindSpeed: 1000,
        dots: true
    });

    $testContainer.owlCarousel({
        items: 1,
        slideSpeed: 200,
        rewindSpeed: 1000,
        lazyLoad: true
    });

    //adds deck to DB
    $addDeck.bind('click', function (e) {
        e.preventDefault();

        let $val = $('.newFolderName').val()
        addDeck($val);

        return false;
    })

    $openDeckMenu.bind('click', function (e) {
        e.preventDefault();
        let $this = $(this),
            $thisID = $this.data("id"),
            $targetID = $(`#${$thisID}--menu`);

        if ($currentMenu) {
            let $cID = $currentMenu.attr("id"),
                $tID = $targetID.attr("id");

            if ($cID != $tID) {
                $currentMenu.hide();
                $targetID.show();
                $currentMenu = $targetID;
            } else if ($cID === $tID) {
                $currentMenu.hide();
                $currentMenu = null;
            }
        } else {
            $targetID.show();
            $currentMenu = $targetID;
        }

        return false;
    })

    $closeDeckMenu.bind('click', function (e) {
        e.preventDefault();

        let $this = $(this),
            $thisID = $this.data("id"),
            $targetMenu = $(`#${$thisID}`);

        $targetMenu.hide();
        $currentMenu = null;

        debug ? console.log('Menu closed.') : $.noop();
        return false;
    })

    $saveID.bind('click', function (e) {

        let $this = $(this),
            $thisID = $this.data("id");


        renameID = $thisID;
        debug ? console.log('Deck ID saved') : $.noop();

    });

    $renameDeck.bind('click', function (e) {
        let $id = renameID,
            $val = $('.renameDeckInput').val();

        renameDeck($id, $val);
    });

    $deleteDeck.bind('click', function (e) {
        let $id = renameID;

        deleteDeck($id);
    });

    $clearCards.bind('click', function (e) {
        clearCarousel();
        let cFront = $('.card--front'),
            cBack = $('.card--back');

        cardID = "";
        tempID = ""
        cFront.find('textarea').val('');
        cBack.find('textarea').val('');
        $cardContainer.slideUp();

    });

    $clearTest.bind('click', function (e) {
        clearTest();
    });

    $addCard.bind("click", function (e) {
        e.preventDefault();

        let $id = tempID;

        addCard($id);

        return false;
    });

    $loadEditor.on("click", function (e) {
        var $this = $(this),
            $id = $this.data('id');
        getFlashCardsInDeck($id);
    });

    $hideCardContainer.on('click', function (e) {
        e.preventDefault();

        $cardContainer.slideUp();

        return false;
    });

    $cardsFrontBack.on("blur", function (e) {
        let cFront = $('.card--front'),
            cBack = $('.card--back');

        let obj = {
            front: cFront.find('textarea').val(),
            back: cBack.find('textarea').val()
        }


        console.log(obj)





        $.post({
            url: `http://localhost:${port}/cards/updateCard/${cardID}`,
            data: {
                front: obj.front,
                back: obj.back
            },
            error: function (err) {
                console.log(err);
            },
            success: function (data) {
                console.log('saved');
            }
        });


    });

    $starTest.on("click", function (e) {
        var $this = $(this),
            $id = $this.data('id');
        startTest($id);
    });


});


/*
*  All Things Deck Related 
*/

//add
function addDeck(title) {

    $.post({
        url: `http://localhost:${port}/deck/add`,
        data: { title: title },
        error: function (err) {
            console.log(err)
            modals.newDeckModal.modal('hide');
            alert("There was an issue trying to add the deck.")
        },
        success: function () {
            modals.newDeckModal.modal('hide');
            location.reload();
        }
    });
};

//update
function renameDeck(id, value) {
    $.post({
        url: `http://localhost:${port}/deck/update/${id}`,
        data: { title: value },
        error: function (err) {
            console.log(err)
        },
        success: function () {
            location.reload()
            renameID = "";
            debug ? console.log('Deck Renamed') : $.noop();
        }
    });
};

//delete
function deleteDeck(id) {
    $.post({
        url: `http://localhost:${port}/deck/delete/${id}`,
        data: "",
        error: function (err) {
            console.log(err);
        },
        success: function () {
            renameID = "";
            location.reload();
            debug ? console.log('Deck Deleted') : $.noop();
        }
    });
};

//get
function getFlashCardsInDeck(id) {
    $.get({
        url: `http://localhost:${port}/deck/getDeck/${id}`,
        data: "",
        error: function (err) {
            console.log(err);
        },
        success: function (data) {
            updateEditor(data);
            tempID = id;
        }
    });
};



/*
*  All Things Card Related 
*/

//add
function addCard(id) {

    cardCount += 1;
    let $id = tempID;

    $.post({
        url: `http://localhost:${port}/cards/addCard/${id}`,
        data: {
            title: "new card",
            front: "edit me",
            back: "edit me"
        },
        error: function (err) {
            console.log(err);
        },
        success: function (data) {
            console.log(data)
            for (i = cardCount; i > 0; i--) {
                owl.data('owlCarousel').removeItem();
            };
            cardCount = 0;
            debug ? console.log('Flashcard added') : $.noop();
            updateEditor(data);
        }
    });
};

//get
function showCard() {
    $('[data-action=show-cards]').on("click", function (e) {
        e.preventDefault();

        let $this = $(this),
            $id = $this.data('id');

        $cardContainer.slideDown();
        $.get({
            url: `http://localhost:${port}/cards/getCard/${tempID}`,
            data: {
                cardID: $id
            },
            error: function (err) {
                console.log(err);
            },
            success: function (data) {
                updateCards(data[0], $id);
            }
        })


        return false;
    })
};

//update
function bindCardRenameClick() {
    debug ? console.log('saving card ID') : $.noop();
    $('[data-action="save-card-id"]').on("click", function (e) {
        let $this = $(this),
            $id = $this.data("id"),
            $text2switch = $this.next($('.__text')),
            $text2switchText = $text2switch.text(),
            $input2switch = $text2switch.next($('.__input'));

        cardID = $id;
        $text2switch.hide();
        $input2switch.attr('placeholder', $text2switchText);
        $input2switch.show();
        $input2switch.focus();

        bindCardRenameBlurSubmit();

    });
};

//delete
function bindCardDeleteClick() {
    $('[data-action="delete-card"]').on("click", function (e) {
        let $this = $(this),
            $id = $this.data("id");

        cardID = $id;

        $.post({
            url: `http://localhost:${port}/cards/deleteCard/${tempID}`,
            data: {
                cardID: cardID
            },
            error: function (err) {
                console.log(err);
            },
            success: function (data) {
                cardID = "";
                clearCarousel();
                getFlashCardsInDeck(tempID);
            }
        });
    });
};

//update & event listeners
function bindCardRenameBlurSubmit() {
    $('[data-action=rename-card]').blur(function (e) {
        e.preventDefault();
        let $this = $(this),
            $val = $this.val();

        submitFlashcardRename($val);
        return false;
    });

    $('[data-action=rename-card]').on("keypress", function (e) {
        if (e.which == 13) {
            e.preventDefault();
            let $this = $(this);
            $this.blur();
            return false;
        };
    });
};
function submitFlashcardRename(val) {
    if (val.length <= 0) {
        alert("You need to enter a value")
    } else {
        $.post({
            url: `http://localhost:${port}/cards/updateCardTitle/${cardID}`,
            data: {
                title: val.trim()
            },
            error: function (err) {
                console.log(err);
            },
            success: function (data) {
                cardID = "";
                clearCarousel();
                getFlashCardsInDeck(tempID);
                debug ? console.log(`Flashcard renamed.`) : $.noop();
            }
        });
    }


};






/*
* All things editor
*/

//clears owl carousel
function clearCarousel() {
    debug ? console.log('clearing editor') : $.noop();
    for (i = cardCount; i > 0; i--) {
        owl.data('owlCarousel').removeItem();
    };
    cardCount = 0;
};

//loads owl carousel
function updateEditor(data) {

    let $thumbnailContainer = $("#thumbnail-container");
    let obj = {
        title: data.title,
        cards: data.cards
    };

    for (let card of obj.cards) {
        cardCount += 1;
        let content = `
            <div class="card __thumb" data-action="show-cards" data-id="${card.id}">
                <span class="__icon __icon--upperLeft glyphicon glyphicon-remove"
                    data-action="delete-card"
                    data-id="${card.id}">
                </span>
                <span class="__icon __icon--upperRight glyphicon glyphicon-pencil"
                    data-action="save-card-id"
                    data-id="${card.id}">
                </span>
                <div class="__text">
                    ${card.title}
                </div>
                <input class="__input" val="" placeholder="" data-action="rename-card" />
            </div>`;

        owl.data('owlCarousel').addItem(content, 0);

    };

    bindCardRenameClick();
    bindCardDeleteClick();
    showCard();


};

//updates card face on blur
function updateCards(data, id) {

    let cFront = $('.card--front'),
        cBack = $('.card--back');
    cardID = id


    let obj = {
        front: data.front,
        back: data.back
    }



    cFront.find('textarea').val(obj.front);
    cBack.find('textarea').val(obj.back);

}



/*
* All things test
*/

//flips cards 
function flipTestCard() {
    $('[data-action=flip-card]').on("click", function (e) {
        let $this = $(this),
            $answer = $this.find('.__answer'),
            $question = $this.find('.__question'),
            $label = $this.find('.__label');

        $this.addClass('pulse');
        $question.toggle();
        $answer.toggle();
        setTimeout(function () { $this.removeClass('pulse') }, 250);
        if ($label.text() === "Question") {
            $label.text("Answer");
            return false;
        } else {
            $label.text("Question");
            return false;
        };
    });
};

function clearTest() {
    for (i = testCardCount; i > 0; i--) {
        $testContainer.data('owlCarousel').removeItem();
    };
    testCardCount = 0;
};

function startTest(id) {
    debug ? console.log('fetching flashcards') : $.noop();
    $.get({
        url: `http://localhost:${port}/deck/getDeck/${id}`,
        data: "",
        error: function (err) {
            console.log(err);
        },
        success: function (data) {
            loadTest(data);
            tempID = id;
        }
    });
};

function loadTest(data) {


    let count = 0;
    let obj = {
        title: data.title,
        cards: data.cards
    };

    for (let card of obj.cards) {
        testCardCount += 1;
        let content = `
            <div class="card __test" data-action="flip-card">
                <div class="__label">Question</div>
                <div class="__line"></div>
                <div class="__text">
                    <div class="__question">
                        ${card.front}
                    </div>
                    <div class="__answer">
                        ${card.back}
                    </div>
                </div>
            </div>`;


        $testContainer.data('owlCarousel').addItem(content);
    };
    flipTestCard();
};