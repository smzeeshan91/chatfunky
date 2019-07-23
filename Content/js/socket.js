
$(function () {

    SocketConnection = {

        connect: function () {

            var User = {
                Id: CHATVARIABLES.user.Id.toString(),
                IsMod: CHATVARIABLES.user.IsMod,
                Username: CHATVARIABLES.user.Username,
                Gender: CHATVARIABLES.user.Gender,
                Age: CHATVARIABLES.user.Age,
                Photo: CHATVARIABLES.user.Photo
            };

            CHATVARIABLES.websocketConnection = new WebSocket('wss://www.chatfunky.com/api/globalapi/connectwebsockets?user=' + encodeURIComponent(JSON.stringify(User)));

            // When the websocketConnection is open, send some data to the server
            CHATVARIABLES.websocketConnection.onopen = function () {
                if (CHATVARIABLES.websocketConnection.readyState == WebSocket.OPEN) {
                    CHATVARIABLES.websocketConnected = true;
                    CHATVARIABLES.clientConnectedFirst = true;
                    //Removing Loader
                    Common.removeConnecting();
                }
            };

            // Log messages from the server
            CHATVARIABLES.websocketConnection.onmessage = function (socMsg) {
                var msg = JSON.parse(socMsg.data);
                if (msg.Type == 0 && CHATVARIABLES.user.Username != msg.Packetizer.User.Username) {
                    CHATVARIABLES.client.newUserJoined(msg.Packetizer.User);
                    CHATVARIABLES.client.totalUsers(msg.Packetizer.UsersCount);
                }
                else if (msg.Type == 1 && !CHATVARIABLES.signalrConnected) {
                    youJoined(msg.Packetizer.Users);
                    CHATVARIABLES.client.totalUsers(msg.Packetizer.UsersCount);
                }
                else if (msg.Type == 2 && (!msg.SR || !CHATVARIABLES.signalrConnected)) {
                    //to check whether the sender who broadcast the message is the one who is in current session so dont show him/her new msg.
                    if ($(msg.Markup).children("span:first").text() != CHATVARIABLES.user.Username)
                        CHATVARIABLES.client.newUserMessage(msg.Markup);
                }
                else if (msg.Type == 3 && (!msg.SR || !CHATVARIABLES.signalrConnected)) {
                    CHATVARIABLES.client.newUserPrivateMessage(msg.Markup, msg.Sender);
                }
            };

            // Log errors
            CHATVARIABLES.websocketConnection.onerror = function (error) {
                console.log('WebSocket Error ' + error);
            };

            CHATVARIABLES.websocketConnection.onclose = function (evt) {
                CHATVARIABLES.websocketConnected = false;
                CHATVARIABLES.websocketConnection.close();
            };

            function youJoined(chatUsers) {
                sessionStorage.allUsernames = "";
                $(".roomTab").html("");
                for (var i = 0; i < chatUsers.length; i++) {
                    SignalrClient.putUserMarkup(chatUsers[i]);
                    if (chatUsers[i].Username == CHATVARIABLES.user.Username)
                        $(CHATVARIABLES.youUser).insertAfter($(".user").eq(i).find(".userInfo"));
                    sessionStorage.allUsernames += chatUsers[i].Username + ";";
                }
                //For Searching Users
                ChatSearch.setUsers();
            }
        },

    }

});