
var $currentMenu = null,
    renameID = "",
    port = 4000,
    tempID = "",
    cardID = "",
    debug = true;

var cardCount = 0,
    owl = $("#thumbnail-container");





$(function () {
    var $openDeckMenu = $("[data-action=open-menu]"),
        $closeDeckMenu = $("[data-action=close-menu]"),
        $renameDeck = $("[data-action=rename-menu]"),
        $deleteDeck = $("[data-action=delete-menu]"),
        $saveID = $("[data-action=save-id]"),
        $addDeck = $("[data-action=add-deck]"),
        $clearCards = $("[data-action=clear-owl]"),
        $addCard = $("[data-action=add-card]"),
        $loadEditor = $('[data-action=load-editor]'),
        $renameCard = $('[data-action=rename-card]'),
        $cardContainer = $('.card-container'),
        $hideCardContainer = $('[data-action=hide-container]');



    owl.owlCarousel({
        items: 6,
        slideSpeed: 200,
        rewindSpeed: 1000,
        dots: true
    });


    $addDeck.bind('click', function (e) {
        e.preventDefault();

        let $val = $('.newFolderName').val(),
            $newDeckModal = $('#new-deck-modal');

        $.post({
            url: `http://localhost:${port}/add`,
            data: { title: $val },
            error: function (err) {
                console.log(err)
                $newDeckModal.modal('hide');
                alert("There was an issue trying to add the deck.")
            },
            success: function () {
                $newDeckModal.modal('hide');
                location.reload();
            }
        })
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

        debug ? console.log('Deck menu opened.') : $.noop();
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

        $.post({
            url: `http://localhost:${port}/update/${$id}`,
            data: { title: $val },
            error: function (err) {
                console.log(err)
            },
            success: function () {
                location.reload()
                renameID = "";
                debug ? console.log('Deck Renamed') : $.noop();
            }
        });
    });

    $deleteDeck.bind('click', function (e) {
        let $id = renameID;

        $.post({
            url: `http://localhost:${port}/delete/${$id}`,
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
    });

    $clearCards.bind('click', function (e) {
        clearCarousel();
    });

    $addCard.bind("click", function (e) {
        e.preventDefault();
        cardCount += 1;
        let $id = tempID,
            newCardObj = {
                title: "new card",
                front: "edit me",
                back: "edit me"
            };

        $.post({
            url: `http://localhost:${port}/addCard/${$id}`,
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
    })






    function bindCardRenameClick() {
        debug ? console.log('saving card ID') : $.noop();
        $('[data-action="save-card-id"]').on("click", function (e) {
            let $this = $(this),
                $id = $this.data("id");
            cardID = $id;

            var $text2switch = $this.next($('.__text'));
            var $text2switchText = $text2switch.text();
            var $input2switch = $text2switch.next($('.__input'));
            $text2switch.hide();
            $input2switch.attr('placeholder', $text2switchText);
            $input2switch.show();
            $input2switch.focus();

            bindCardRenameBlurSubmit();

        });
    };

    function bindCardDeleteClick() {
        $('[data-action="delete-card"]').on("click", function (e) {
            let $this = $(this),
                $id = $this.data("id");

            cardID = $id;
            //alert(tempID)
            $.post({
                url: `http://localhost:${port}/deleteCard/${tempID}`,
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
                    console.log(data)
                    debug ? console.log(`Flashcard deleted.`) : $.noop();
                }
            });
        });
    };

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

    function updateEditor(data) {
        debug ? console.log('updating editor') : $.noop();
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

    function clearCarousel() {
        debug ? console.log('clearing editor') : $.noop();
        for (i = cardCount; i > 0; i--) {
            owl.data('owlCarousel').removeItem();
        };
        cardCount = 0;
    };

    function getFlashCardsInDeck(id) {
        debug ? console.log('fetching flashcards') : $.noop();
        $.get({
            url: `http://localhost:${port}/getDeck/${id}`,
            data: "",
            error: function (err) {
                console.log(err);
            },
            success: function (data) {
                updateEditor(data);
                tempID = id;
            }
        });
    }

    function submitFlashcardRename(val) {
        if (val.length <= 0) {
            alert("You need to enter a value")
        } else {
            $.post({
                url: `http://localhost:${port}/updateCard/${cardID}`,
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


    }


    function showCard() {
        $('[data-action=show-cards]').on("click", function (e) {
            e.preventDefault();

            let $this = $(this),
                $id = $this.data('id');

            $cardContainer.slideDown();
            $.get({
                url: `http://localhost:${port}/getCard/${tempID}`,
                data: {
                    cardID: $id
                },
                error: function (err) {
                    console.log(err);
                },
                success: function (data) {
                    console.log(data);
                }
            })


            return false;
        })
    };

});



