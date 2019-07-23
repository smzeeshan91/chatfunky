
(function ($) {

    $(function () {

        Load = {

            pageLoad: function () {

                //Condition to check whether the same loggedin user tries to duplicate tab
                //if (sessionStorage.allUsernames != undefined && sessionStorage.allUsernames.indexOf(CHATVARIABLES.user.Username) >= 0) {
                //    sessionStorage.clear();
                //    CHATVARIABLES.secondTab = true;
                //    document.location.href = "/";
                //}

                //For Loader
                $(".leftBox, .rightBox, .showRightBox").hide();
                $(".chatBox").addClass("chatBoxInitial");
                Common.setChatBoxInitialHeight();

                $(".chatBox").append($(CHATVARIABLES.chatBoxLoading));

            },

            signalrLoad: function () {

                //Starting Hub to start communication
                $.connection.hub.logging = true;
                $.connection.hub.start({ transport: ['webSockets', 'longPolling'] }).done(function () { hubReadyEvents() });

                function hubReadyEvents() {
                    //Setting User
                    CHATVARIABLES.user.ConnectionId = $.connection.hub.id;
                    CHATVARIABLES.signalrConnected = true;
                    CHATVARIABLES.clientConnectedFirst = true;
                    CHATVARIABLES.server.newUserJoining(CHATVARIABLES.user);
                    //Removing Loader
                    Common.removeConnecting();
                }

            },

            signalrReload: function () {

                //When Signalr disconnected
                $.connection.hub.disconnected(function () {
                    CHATVARIABLES.signalrConnected = false;
                });

                //If communication breaks then on signalr reconnecting event stoping hub and then start it from all over again
                //This has been done because it takes time for hub to recoonect
                //On starting again Hub id changes
                $.connection.hub.reconnecting(function () {
                    CHATVARIABLES.signalrConnected = false;
                    $.connection.hub.stop();
                    $.connection.hub.start({ transport: ['webSockets', 'longPolling'] }).done(function () { Load.hubRejoinedEvents() });
                });

                this.hubRejoinedEvents = function () {
                    //Resetting User
                    CHATVARIABLES.user.ConnectionId = $.connection.hub.id;
                    CHATVARIABLES.signalrConnected = true;
                    CHATVARIABLES.server.joinedOnReconnected(CHATVARIABLES.user);
                    Common.removeConnecting();
                }

            },

            signalrLoadSameSession: function () {
                $.connection.hub.start({ transport: ['webSockets', 'longPolling'] }).done(function () { sameSession() });

                function sameSession() {
                    CHATVARIABLES.user.ConnectionId = $.connection.hub.id;
                    CHATVARIABLES.signalrConnected = true;
                    CHATVARIABLES.clientConnectedFirst = true;
                    CHATVARIABLES.server.loadSameSession();
                    Common.removeConnecting();
                }
            },

        };

        SignalrClient = {

            userJoin: function () {

                // When New Users Joins Chat

                CHATVARIABLES.client.newUserJoined = function (user) {
                    var isUserExist = false;
                    $(".user").each(function () {
                        if ($(this).find("em").text() == user.Username) {
                            isUserExist = true;
                            return;
                        }
                    });
                    if (isUserExist) return;
                    SignalrClient.putUserMarkup(user);
                    Common.userJoinedIndicate(user.Username + " Joined");
                }

                CHATVARIABLES.client.youJoined = function (chatUsers) {
                    sessionStorage.allUsernames = "";
                    $(".roomTab").html("");
                    for (var i = 0; i < chatUsers.length; i++) {
                        SignalrClient.putUserMarkup(chatUsers[i]);
                        if (chatUsers[i].Username == CHATVARIABLES.user.Username)
                            $(CHATVARIABLES.youUser).insertAfter($(".user").eq(i).find(".userInfo"));
                        sessionStorage.allUsernames += chatUsers[i].Username + ";";
                    }
                    $(".user").last().unbind("mousedown");
                    Common.userJoinedIndicate("Welcome " + CHATVARIABLES.user.Username);
                    //For Searching Users
                    ChatSearch.setUsers();
                }

                CHATVARIABLES.client.totalUsers = function (counter) {
                    $(".totalNo span").text(counter);
                }

                this.putUserMarkup = function (user) {
                    var markup;
                    if (user.Username.toLowerCase() == "admin")
                        markup = $(CHATVARIABLES.newUser.replace("user", "user admin").replace("data", "data-userName='" + user.Username + "'").replace("userimg", "admin")
                                 .replace("<em>", "<em>" + user.Username));
                    else if (user.IsMod == 1)
                        markup = $(CHATVARIABLES.newUser.replace("user", "user mod").replace("data", "data-userName='" + user.Username + "'").replace("userimg", "mod")
                                 .replace("<em>", "<em>" + user.Username));
                    else {
                        markup = $(CHATVARIABLES.newUser.replace("data", "data-userName='" + user.Username + "'")
                                 .replace("../content/images/userimg.png", user.Photo != "" ? user.Photo :
                                 (user.Gender != "" ? "../content/images/" + user.Gender.toLowerCase() + ".png" : "../content/images/unknownuser.png"))
                                 .replace("<em>", "<em>" + user.Username).replace("<span>", user.Age != 0 ? "<span>Age: " + user.Age : ""));
                        if (user.Age == 0)
                            markup.children("span:first").remove();
                    }
                    $(markup).on("mouseenter click", function (e) { SignalrClient.userClickOptions($(this), e) });
                    $(".roomTab").append(markup);
                }

                this.userClickOptions = function (scope, e) {
                    var selectedUsername = Common.getUserName(scope);
                    if (e.button == 0 && CHATVARIABLES.user.Username != selectedUsername) {
                        $(".user").removeClass("userSelected");
                        scope.addClass("userSelected");
                        ChatOptions.createUserOptions(scope);
                    }
                }

            },

            chat: function () {

                $(".txtBoxMsg").keypress(function (e) {
                    CHATVARIABLES.userTypeMsg += e.key;
                });

                $(".txtBoxMsg").keyup(function (e) {
                    var recipentUsername = $(".startedChatSelected").attr("data-userName");
                    if ((e.keyCode === 13 || e.keyCode === undefined) && $(this).val().length > 0) {
                        var msg = $(this).val();
                        var markupUser = $(CHATVARIABLES.newMsg).append("<span>" + CHATVARIABLES.user.Username + "</span> : ");
                        var markupText = $("<span></span>");
                        var finalMsg = "";

                        for (var i = 0; i < msg.length;) {
                            if (i < msg.length - 1 && ChatSmileys.getSmileyHTML([msg[i], msg[i + 1]]) != null) {
                                var emotionImage = ChatSmileys.getSmileyHTML([msg[i], msg[i + 1]]);
                                if (finalMsg.length > 0)
                                    markupText = $(markupText).append("<em>" + finalMsg + "</em>");
                                markupText = $(markupText).append(emotionImage.length > 0 ? emotionImage : "<em>" + msg[i] + msg[i + 1] + "</em>");
                                finalMsg = "";
                                i = i + 2;
                                continue;
                            }
                            finalMsg += msg[i];
                            i = i + 1;
                            if (finalMsg == "[::Image]" || finalMsg == " [::Image]" || finalMsg == "[::Image] " || finalMsg == " [::Image] ") {
                                markupText = $(markupText).append("<a href='" + CHATVARIABLES.sharedImage + "' target='_blank'><img src='" + CHATVARIABLES.sharedImage + "' class='sharedImage' /></a>");
                                finalMsg = "";
                            }
                            else if (finalMsg.indexOf("[::Image]") >= 0) {
                                var beforeText = finalMsg.substring(0, finalMsg.indexOf("[::Image]"));
                                var afterText = finalMsg.substring(finalMsg.indexOf("[::Image]") + 9);

                                if (beforeText.length > 0)
                                    markupText = $(markupText).append("<em>" + beforeText + "</em>");

                                markupText = $(markupText).append("<a href='" + CHATVARIABLES.sharedImage + "' target='_blank'><img src='" + CHATVARIABLES.sharedImage + "' class='sharedImage' /></a>");

                                if (afterText.length > 0)
                                    markupText = $(markupText).append("<em>" + afterText + "</em>");
                                finalMsg = "";
                            }
                            else if (finalMsg == "[::Audio]" || finalMsg == " [::Audio]" || finalMsg == "[::Audio] " || finalMsg == " [::Audio] ") {
                                markupText = $(markupText).append($("<audio></audio>").attr({ 'src': CHATVARIABLES.sharedAudio, 'volume': 1, 'controls': true }));
                                finalMsg = "";
                            }
                            else if (finalMsg.indexOf("[::Audio]") >= 0) {
                                var beforeText = finalMsg.substring(0, finalMsg.indexOf("[::Audio]"));
                                var afterText = finalMsg.substring(finalMsg.indexOf("[::Audio]") + 9);

                                if (beforeText.length > 0)
                                    markupText = $(markupText).append("<em>" + beforeText + "</em>");

                                markupText = $(markupText).append($("<audio></audio>").attr({ 'src': CHATVARIABLES.sharedAudio, 'volume': 1, 'controls': true }));

                                if (afterText.length > 0)
                                    markupText = $(markupText).append("<em>" + afterText + "</em>");
                                finalMsg = "";
                            }
                        }

                        if (CHATVARIABLES.signalrConnected || CHATVARIABLES.websocketConnected) {
                            markupText = $(markupText).append("<em>" + finalMsg + "</em>");
                            msgMarkup = markupUser.append(markupText).append("<span>" + new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3") + "</span>");
                            $(".chatMsg").eq(CHATVARIABLES.currentChatIndex).append($(msgMarkup.prop('outerHTML')));
                            Common.setScroll(CHATVARIABLES.currentChatIndex);
                            if ($(".msgParaUserTyping").length > 0) {
                                $(".msgParaUserTyping").remove();
                                if (CHATVARIABLES.currentChatIndex != 0) {
                                    $(".chatMsg").eq(CHATVARIABLES.currentChatIndex).append($(CHATVARIABLES.userTyping));
                                    Common.setScroll(CHATVARIABLES.currentChatIndex);
                                }
                            }
                        } else {
                            $(".msgSending").addClass("msgSendingDoing");
                            netChecker();
                            return;
                        }

                        if (CHATVARIABLES.signalrConnected) {
                            if (CHATVARIABLES.currentChatIndex == 0)
                                CHATVARIABLES.server.newMessage(msgMarkup.prop('outerHTML'));
                            else if (CHATVARIABLES.currentChatIndex != 0 && !Common.isUserBlock(recipentUsername))
                                CHATVARIABLES.server.newPrivateMessage(msgMarkup.prop('outerHTML'), recipentUsername);
                        }
                        if (CHATVARIABLES.websocketConnected) {
                            if (CHATVARIABLES.currentChatIndex == 0) {
                                var msg = JSON.stringify({ Markup: msgMarkup.prop('outerHTML'), Type: 2, SR: CHATVARIABLES.signalrConnected });
                                CHATVARIABLES.websocketConnection.send(msg);
                            }
                            else if (CHATVARIABLES.currentChatIndex != 0 && !Common.isUserBlock(recipentUsername)) {
                                var msg = JSON.stringify({ Markup: msgMarkup.prop('outerHTML'), Sender: CHATVARIABLES.user.Username, Recipent: recipentUsername, Type: 3, SR: CHATVARIABLES.signalrConnected });
                                CHATVARIABLES.websocketConnection.send(msg);
                            }
                        }

                        CHATVARIABLES.userTypeMsg = "";
                        $(".txtBoxMsg").val("");
                        sharedImage = null;
                    }
                    else if (CHATVARIABLES.currentChatIndex != 0 && CHATVARIABLES.signalrConnected && !Common.isUserBlock(recipentUsername)) {
                        CHATVARIABLES.server.userTyping(true, recipentUsername);
                        setTimeout(function () {
                            if (CHATVARIABLES.userTypeMsg == $(".txtBoxMsg").val())
                                CHATVARIABLES.server.userTyping(false, recipentUsername);
                        }, 2000);
                    }
                });

                CHATVARIABLES.client.userIsTyping = function (isUserTyping, username) {
                    if (isUserTyping) {
                        var index = Common.checkChatOpened(username);
                        if (index > 0 && $(".msgParaUserTyping").length == 0) {
                            $(".chatMsg").eq(index).append($(CHATVARIABLES.userTyping));
                            Common.setScroll(index);
                        }
                    }
                    else {
                        $(".msgParaUserTyping").remove();
                    }
                }

                CHATVARIABLES.client.newUserMessage = function (msgMarkup) {
                    Common.addGotMsg(0);
                    $(".chatMsg").eq(0).append($(msgMarkup));
                    Common.setScroll(0);
                    Common.isHTML5Supported();
                }

                CHATVARIABLES.client.newUserPrivateMessage = function (msgMarkup, fromUsername) {
                    var index = Common.checkChatOpened(fromUsername);
                    if (index == 0) {
                        CHATVARIABLES.client.newUserPrivateChat(fromUsername);
                        index = Common.checkChatOpened(fromUsername);
                    }
                    var notify = $(msgMarkup).children("span:nth-child(1)").text() + " messaged you";
                    Common.addGotMsg(index, notify);
                    $(".msgParaUserTyping").remove();
                    $(".chatMsg").eq(index).append($(msgMarkup).attr("style", "float:right"));
                    Common.setScroll(index);
                    Common.isHTML5Supported();
                }

                CHATVARIABLES.client.newUserPrivateChat = function (username) {
                    var subName = Common.getSubName(username);
                    $(".messageArea").append($(CHATVARIABLES.newChatMsg).hide());
                    var markup = $(CHATVARIABLES.newChatType.replace("data", "data-userName='" + username + "'")
                                 .replace("userimg", $(".user[data-userName='" + username + "']").children(".userImg").attr("src"))
                                 .replace("<em>", "<em>" + subName));
                    $(".chatType").append(markup);
                    CHATVARIABLES.totalChats++;

                    ChatOptions.userChat();
                    $(markup).click(function () { ChatOptions.openChat($(this)) });
                    $(markup).children("span").click(function () { ChatOptions.closeChat($(this)) });

                    CHATVARIABLES.chatSlider.moveLast();
                }

            },

            events: function () {

                $(".btnSend").click(function () {
                    $(".txtBoxMsg").trigger("keyup");
                    CHATVARIABLES.userTypeMsg = "";
                });

                // When User Wants to See all Available Online Users Using Mobile or Tablet Device

                $(".showRightBox, #mobileClose").click(function () {
                    if ($(".user").length >= 8)
                        if ($(window).width() <= 639)
                            $(".roomTab").css("height", "298px");
                        else if ($(window).width() <= 400)
                            $(".roomTab").css("height", "268px");
                    $(".rightBox").addClass("animated bounceIn").show();
                    $(".leftBox").addClass("dimBody");
                    if (CHATVARIABLES.showUsers) {
                        $(".showRightBox").val("Show Users");
                        $(".rightBox").removeClass("animated bounceIn").hide();
                        $(".leftBox").removeClass("dimBody");
                        CHATVARIABLES.showUsers = false;
                    }
                    else {
                        $(".showRightBox").val("Hide Users");
                        CHATVARIABLES.showUsers = true;
                    }
                });

                $(".rightBox").on("scroll", function () {
                    $(".userOptions").remove();
                });

            },

            userDisconnect: function () {

                // On Leave

                CHATVARIABLES.client.userLeft = function (username) {
                    $(".user").each(function () {
                        if ($(this).attr("data-userName") == username) {
                            $(this).remove();
                            return false;
                        }
                    });
                    if (!Common.isUserBlock(username)) {
                        var index = Common.checkChatOpened(username);
                        if (index > 0) {
                            $(".msgParaUserTyping").remove();
                            Common.userLeftIndicate("<b>" + username + "</b> Left the Chat", 0);
                            Common.setScroll(index);
                            CHATVARIABLES.chatSlider.moveLast();
                        }
                        Common.userLeftIndicate("<b>" + username + "</b> Left the Chat Room", index);
                        Common.setScroll(0);
                    }
                }

                CHATVARIABLES.client.forceDisconnect = function () {
                    $.connection.hub.stop();
                    document.location.href = "/home?logout=true";
                }

                CHATVARIABLES.client.dcUserSessions = function (username) {
                    if (CHATVARIABLES.user.Username == username)
                        document.location.href = "/home?logout=true";
                }

            }

        };

    });

})(jQuery);