/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(8);

/***/ },

/***/ 8:
/***/ function(module, exports) {

	
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
	        $renameCard = $('[data-action=rename-card]');



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

	    $renameCard.on("click", function (e) {
	        let $this = $(this),
	            $cardInput = $('.renameCardInput'),
	            $renameCardModal = $('#rename-card-modal');


	        //TODO add validation
	        $.post({
	            url: `http://localhost:${port}/updateCard/${cardID}`,
	            data: {
	                title: $cardInput.val().trim()
	            },
	            error: function (err) {
	                console.log(err);
	            },
	            success: function (data) {
	                cardID = "";
	                $cardInput.val('');
	                $renameCardModal.hide();
	                clearCarousel();
	                getFlashCardsInDeck(tempID);
	                debug ? console.log(`Flashcard renamed.`) : $.noop();
	            }
	        });
	    });


	    function bindCardRenameClick() {
	        debug ? console.log('saving card ID') : $.noop();
	        $('[data-action="save-card-id"]').on("click", function (e) {
	            let $this = $(this),
	                $id = $this.data("id");
	            cardID = $id;
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
	            <div class="card __thumb">
	                <span class="__upperRightIcon glyphicon glyphicon-pencil" 
	                    data-toggle="modal" 
	                    data-target="#rename-card-modal" 
	                    data-action="save-card-id" 
	                    data-id="${card.id}">
	                </span>
	                <div class="__text">
	                    ${card.title}
	                </div>
	            </div>`;

	            owl.data('owlCarousel').addItem(content, 0);

	        };

	        bindCardRenameClick()


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
	        })
	    }

	    bindCardRenameClick();

	});





/***/ }

/******/ });