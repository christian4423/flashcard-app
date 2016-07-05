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
	    cardID = "";







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
	        $renameCard = $('[data-action="renameCard"]');

	    var cardCount = 0,
	        owl = $("#thumbnail-container");

	    owl.owlCarousel({
	        items: 6,
	        slideSpeed: 200,
	        rewindSpeed: 1000,
	        dots: true
	    });


	    $addDeck.bind('click', function (e) {
	        e.preventDefault();
	        var $val = $('.newFolderName').val()
	        $.post({
	            url: `http://localhost:${port}/add`,
	            data: { title: $val },
	            error: function (err) {
	                console.log(err)
	                $('#new-folder-modal').modal('hide');
	                alert("There was an issue trying to add the deck.")
	            },
	            success: function () {
	                $('#new-folder-modal').modal('hide');
	                location.reload()
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
	        return false;
	    })

	    $closeDeckMenu.bind('click', function (e) {
	        e.preventDefault();

	        let $this = $(this),
	            $thisID = $this.data("id"),
	            $targetMenu = $(`#${$thisID}`);

	        $targetMenu.hide();
	        $currentMenu = null;
	        return false;
	    })

	    $saveID.bind('click', function (e) {

	        let $this = $(this),
	            $thisID = $this.data("id");


	        renameID = $thisID;


	    })

	    $renameDeck.bind('click', function (e) {

	        let $id = renameID,
	            $val = $('.renameDeckInput').val()
	        $.post({
	            url: `http://localhost:${port}/update/${$id}`,
	            data: { title: $val },
	            error: function (err) {
	                console.log(err)
	            },
	            success: function () {
	                location.reload()
	                renameID = "";
	            }
	        })

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
	            }
	        })

	    });

	    $clearCards.bind('click', function (e) {
	        clearCarousel();
	    });

	    $addCard.bind("click", function (e) {
	        e.preventDefault();
	        cardCount += 1;
	        let $id = tempID;

	        let newCardObj = {
	            title: "new card",
	            front: "edit me",
	            back: "edit me"
	        }


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

	                updateEditor(data);
	            }
	        })


	        return false;
	    });

	    $loadEditor.on("click", function (e) {
	        var $this = $(this),
	            $id = $this.data('id');


	        $.get({
	            url: `http://localhost:${port}/getDeck/${$id}`,
	            data: "",
	            error: function (err) {
	                console.log(err);
	            },
	            success: function (data) {
	                updateEditor(data);
	                tempID = $id;
	            }
	        })

	    });

	    bindCardRenameClick();

	    function updateEditor(data) {

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
	                    data-action="renameCard" 
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
	        for (i = cardCount; i > 0; i--) {
	            owl.data('owlCarousel').removeItem();
	        };
	        cardCount = 0;
	    };
	});


	function bindCardRenameClick() {
	    $('[data-action="renameCard"]').on("click", function (e) {
	        let $this = $(this),
	            $id = $this.data("id");
	        cardID = $id

	        $.post({
	            url: `http://localhost:${port}/updateCard/${tempID}`,
	            data: {
	                cardID: $id
	            },
	            error: function (err) {
	                console.log(err);
	            },
	            success: function (data) {
	                console.log(data)
	            }
	        })

	    });
	}



/***/ }

/******/ });