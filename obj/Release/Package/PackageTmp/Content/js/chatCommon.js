
(function ($) {

    $(function () {

        CHATVARIABLES = {

            // Global Variables

            // Markup

            newUserIndication: "<p class='msgParaNewUser'></p>",
            youUser: "<span class='youUser'>you</span>",
            newUser: "<div class='user' data><img src='../content/images/userimg.png' class='userImg'><p class='userInfo'><em></em><span></span></p><img src='../content/images/useropt.png' class='userOptImg'><p style='clear:both'></p></div>",
            newMsg: "<p class='msgPara'></p>",
            userTyping: "<p class='msgParaUserTyping'><img src='../content/images/typing.gif' alt='Typing' /></p>",
            newChatType: "<p class='startedChat' data><img src='userimg' alt='Room' /><em></em><span>x</span></p>",
            newChatMsg: "<div class='chatMsg'></div>",
            chatBoxLoading: "<div class='chatBoxLoading'><img src='../content/images/loading.gif' class='loadingImg'/></div>",
            internetError: "<div class='internetError'><div><p class='errorHeading'>Low Internet Connection!</p><p>You may face interruptions due to low internet speed.</p><p class='reconnectingTxt'>Trying to reconnect ...</p><a class='closeError'>Go Back</a></div></div>",

            // Support

            totalChats: 1,
            currentChatIndex: 0,
            user: {},
            clientConnectedFirst: false,
            signalrConnected: false,
            websocketConnected: false,
            websocketConnection: null,
            secondTab: false,
            showUsers: true,
            chatSlider: null,
            internetErrorShow: false,
            userTypeMsg: "",
            gotMsgIntervalId: null,
            isWindowBlur: false,
            sharedImage: null,
            sharedAudio: null,
            users: [],

            // Signalr

            client: $.connection.chat.client,
            server: $.connection.chat.server,

        }

        Common = {

            showConnecting: function (text, milliSec) {
                var sec = 0;
                var connectingInterval = setInterval(function () {
                    if (CHATVARIABLES.signalrConnected)
                        clearInterval(connectingInterval);
                    $(".reconnectingTxt").append(".");
                    sec++;
                    if (sec == 4) {
                        sec = 0;
                        $(".reconnectingTxt").html(text);
                    }
                }, milliSec);
            },

            removeConnecting: function () {
                $(".leftBox, .showRightBox").show().removeAttr("style");
                if (CHATVARIABLES.showUsers)
                    $(".rightBox").show().removeAttr("style");
                if ($(window).width() <= 639)
                    CHATVARIABLES.showUsers = false;
                $(".chatBox").removeClass("chatBoxInitial").removeAttr("style");
                $(".leftBox").removeClass("dimBody");
                $(".chatBoxLoading, .internetError, .audioMessage").remove();
                //We downloaded the gif at chat room login and now on Signalr connect we removing the background
                //because this msgSendingDoing gif must be shown at the time of internet disconnects only
                $(".msgSending").css("background-image", "none");
                //In order to show user that internet is disconnected and message is trying to be send
                if ($(".msgSending").hasClass("msgSendingDoing")) {
                    $(".msgSending").removeClass("msgSendingDoing");
                    $(".txtBoxMsg").trigger("keyup");
                }
            },

            userJoinedIndicate: function (para) {
                var markupUser = $(CHATVARIABLES.newUserIndication).append("<span class='newUserName'>" + para + "</span>");
                $(".chatMsg").eq(0).append(markupUser);
            },

            checkChatOpened: function (username) {
                var index = 0;
                $(".startedChat").each(function () {
                    if ($(this).attr("data-userName") != undefined && $(this).attr("data-userName") == username) {
                        index = $(this).index();
                        return false;
                    }
                });
                return index;
            },

            openChat: function (index) {
                if (CHATVARIABLES.currentChatIndex != index) {
                    $(".chatMsg").hide();
                    $(".startedChat").removeClass("startedChatSelected");
                    $(".chatMsg").eq(index).show();
                    $(".startedChat").eq(index).addClass("startedChatSelected").removeClass("gotMsg");
                    CHATVARIABLES.currentChatIndex = index;
                }
            },

            addGotMsg: function (index, notify) {
                if ($(".startedChat").eq(index).is(".startedChatSelected") == false)
                    $(".startedChat").eq(index).addClass("gotMsg");

                if (CHATVARIABLES.isWindowBlur && notify != undefined) {
                    //Clearing all previous pvt chat notification intervals in order to notify only for the latest one
                    for (var i = 1; i <= CHATVARIABLES.gotMsgIntervalId; i++)
                        clearInterval(i);
                    var blink = true;
                    CHATVARIABLES.gotMsgIntervalId = setInterval(function () {
                        if (blink) {
                            document.title = "(1)Chatfunky";
                            blink = false;
                        } else {
                            document.title = notify;
                            blink = true;
                        }
                    }, 2000);
                }
            },

            getDivArea: function (area) {
                return parseInt(area);
            },

            isNodeExist: function (node) {
                return node.length > 0 ? true : false;
            },

            isHTML5Supported: function () {
                //For PlupLoad
                if (Common.isNodeExist($(".moxie-shim-html5")))
                    $(".fileOptions").hide();
                else {
                    $(".fileOptions").css("opacity", "0");
                    $(".sharedImage").css({
                        "width": "100%",
                        "height": "100%",
                    });
                }
            },

            setScroll: function (index) {
                setTimeout(function () {
                    if (index != CHATVARIABLES.currentChatIndex)
                        $(".chatMsg").eq(index).show();
                    var currentChatMsg = document.getElementsByClassName("chatMsg")[index];
                    currentChatMsg.scrollTop = currentChatMsg.scrollHeight;
                    if (index != CHATVARIABLES.currentChatIndex)
                        $(".chatMsg").eq(index).hide();
                }, 1000);
            },

            getUserName: function (scope) {
                return scope.attr("data-userName");
            },

            isUserBlock: function (username) {
                var blockUsers = CHATVARIABLES.user.Blocks.split(';');
                for (var i = 0; i < blockUsers.length - 1; i++) {
                    if (blockUsers[i].match(username) != null)
                        return 1;
                }
                return 0;
            },

            getSubName: function (username) {
                var subName = username.substring(0, 8);
                subName = username.length > subName.length ? subName + "." : username;
                return subName;
            },

            setChatBoxInitialHeight: function () {
                if (CHATVARIABLES.maxSlides <= 2)
                    $(".chatBoxInitial").height(Common.getDivArea($(".leftBox").css("height")) + Common.getDivArea($(".rightBox").css("height") + 60));
                else
                    $(".chatBoxInitial").height(Common.getDivArea($(".leftBox").css("height")));
            },

            userLeftIndicate: function (para, index) {
                var markupUser = $(CHATVARIABLES.newUserIndication).addClass("msgParaUserLeft").append("<span>User " + para + ".</span>");
                $(".chatMsg").eq(index).append(markupUser);
            },

            events: function () {

                // Other Events

                $('body').click(function (evt) {
                    if (evt.target.className == "emoticonsBtn" || evt.target.className == "emoticonIcon" || evt.target.className == "user userSelected" ||
                        evt.target.className == "user mod userSelected" || evt.target.className == "user admin userSelected" || evt.target.nodeName == "SPAN" ||
                        evt.target.nodeName == "IMG" || evt.target.nodeName == "EM" || evt.target.className == "btnSendFile")
                        return;
                    $(".emoticonPanel").hide();
                    $(".userOptions").remove();
                    //In case of making fileoptions invisible bcoz hiding it not allow plupload to run properly in html4 browsers
                    Common.isHTML5Supported();
                    $(".user").removeClass("userSelected");
                });

                $(window).resize(function () {
                    if (!CHATVARIABLES.internetErrorShow)
                        $(".leftBox").removeAttr("style");
                    if (!CHATVARIABLES.showUsers && $(window).width() > 639)
                        $(".rightBox").show();
                    ChatFunkySlider.reloadSlider();
                });

                // Checks if browser window is active then removes any newly received msgs notifications

                $(window).focus(function () {
                    for (var i = 1; i <= CHATVARIABLES.gotMsgIntervalId; i++)
                        clearInterval(i);
                    document.title = "Chatfunky: Live Chat";
                    CHATVARIABLES.isWindowBlur = false;
                }).blur(function () {
                    CHATVARIABLES.isWindowBlur = true;
                });

                // When user just close browser window & left finally

                $("#logout").click(function () {
                    sessionStorage.clear();
                    $(window).unbind("unload");
                    if (CHATVARIABLES.signalrConnected) {
                        CHATVARIABLES.server.stop();
                    }
                    else {
                        $.ajax({
                            url: "/global/deletereconnectinguser",
                            data: { username: CHATVARIABLES.user.Username },
                            type: "Post",
                            async: false,
                            success: function () {
                                window.close();
                                document.location.href = "/home?logout=true";
                            }
                        });
                    }
                });

                $(window).on("unload", function () {
                    if (CHATVARIABLES.secondTab != true) {
                        sessionStorage.clear();
                        if (CHATVARIABLES.signalrConnected) {
                            CHATVARIABLES.server.stop();
                            //$.connection.hub.stop();
                        }
                        else {
                            $.ajax({
                                url: "/global/deletereconnectinguser",
                                data: { username: CHATVARIABLES.user.Username },
                                type: "Post",
                                async: false,
                                success: function () {
                                    window.close();
                                }
                            });
                        }
                    }
                });

            }

        }

        Common.events();

    });

})(jQuery);