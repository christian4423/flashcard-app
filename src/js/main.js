var $currentMenu = null,
    renameID = "",
    port = 4000,
    cardCount = 0;

$(function () {
    var $openDeckMenu = $("[data-action=open-menu]"),
        $closeDeckMenu = $("[data-action=close-menu]"),
        $renameDeck = $("[data-action=rename-menu]"),
        $deleteDeck = $("[data-action=delete-menu]"),
        $saveID = $("[data-action=save-id]"),
        $addDeck = $("[data-action=add-deck]"),
        owl = $("#thumbnail-container");



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
   


    $("[data-action=add-card]").bind("click", function (e) {
        e.preventDefault();
        cardCount += 1;
        var content = '<div class="card __thumb"></div>'

        owl.data('owlCarousel').addItem(content);

    })


    owl.owlCarousel({
        items: 3,
        slideSpeed: 200,
        paginationSpeed: 800,
        rewindSpeed: 1000,
        autoPlay: false,
        pagination: true,
        paginationNumbers: false,
    });


    $('[data-action=load-editor]').on("click", function () {
        var $this = $(this),
            $id = $this.data('id');

        $.get({
            url: `http://localhost:${port}/getDeck/${$id}`,
            data: "",
            error: function (err) {
                console.log(err)
            },
            success: function (data) {
                updateEditor(data)
            }
        })

    })

});

function updateEditor(data) {
    console.log(data.cards)
    var obj = {
        title: data.title
    }


    console.log(obj.title);


}