
//$(function () {

netCheckerInterval = null;

//For Checking Internet Connection

function netChecker() {
    if (netCheckerInterval != null) {
        //Clearing all previous netChecker intervals in order to notify only for the latest one
        for (var i = 1; i <= netCheckerInterval; i++)
            clearInterval(i);
    }
    netCheckerInterval = setInterval(function () {
        if (CHATVARIABLES.clientConnectedFirst)
            checkConnection();
        else {
            internetError();
            checkConnection();
        }
    }, 3000);
}

checkConnection = function () {
    $.post("/api/globalapi/isConnected")
    .done(function (result) {
        //for connecting websockets after internet reconnection
        if (result && !CHATVARIABLES.websocketConnected) {
            CHATVARIABLES.internetErrorShow = false;
            SocketConnection.connect();
        }
        //for connecting signalr after internet reconnection
        if (result && !CHATVARIABLES.signalrConnected) {
            CHATVARIABLES.internetErrorShow = false;
            $.connection.hub.stop();
            $.connection.hub.start({ transport: ['webSockets', 'longPolling'] })
                .done(function () {
                    internetErrorShow(false);
                    CHATVARIABLES.signalrConnected = true;
                    if (CHATVARIABLES.clientConnectedFirst == false) {
                        CHATVARIABLES.user.ConnectionId = $.connection.hub.id;
                        CHATVARIABLES.clientConnectedFirst = true;
                        CHATVARIABLES.server.newUserJoining(CHATVARIABLES.user);
                    }
                    else
                        Load.hubRejoinedEvents();
                });
        }
        //else if (CHATVARIABLES.signalrConnected)
        //    CHATVARIABLES.internetErrorShow = false;
    })
    .fail(function () { internetError() });
}

// On Internet Error

internetError = function () {
    if (CHATVARIABLES.internetErrorShow == false) {
        CHATVARIABLES.signalrConnected = false;
        CHATVARIABLES.websocketConnected = false;
        setTimeout(function () {
            if (!CHATVARIABLES.signalrConnected && !CHATVARIABLES.internetErrorShow) {
                CHATVARIABLES.internetErrorShow = true;
                CHATVARIABLES.websocketConnection.close();
                internetErrorShow(true);
            }
        }, 3000);
    }
}

internetErrorShow = function (todo) {
    if (todo) {
        $(".leftBox, .rightBox, .showRightBox").hide();
        $(".chatBox").addClass("chatBoxInitial");
        Common.setChatBoxInitialHeight();
        $(".chatBoxLoading").remove();
        var markup = $(CHATVARIABLES.internetError);
        $(markup).find("a").click(function () { document.location.href = "/" });
        $("section").append(markup);
        Common.showConnecting("Reconnecting", 1000);
    }
    else
        Common.removeConnecting();
}

$(window).on("error", (function (e) {
    e.preventDefault();
}));

netChecker();

//});