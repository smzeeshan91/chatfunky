
(function ($) {

    $(function () {

        // Markup for userOptions
        var userOptions = "<div class='userOptions'><img src='Javascript:void(0)' class='userPhoto' alt='UserPhoto'><div style='clear:both'></div></div>";
        var options = "<div class='options'><p class='userPvtChat'>Private Chat</p><p class='userPvtChatBlock'>Block User</p></div>";
        var userKick = "<p class='userKick'>Kick User</p>";
        var modKick = "<p class='modKick'>Kick Mod</p>";

        ChatOptions = {

            createUserOptions: function (scope) {
                $(".userOptions").remove();
                var HTML = $(userOptions);
                $(options).insertAfter(HTML.children(".userPhoto"));
                $(HTML).insertAfter(".roomTab").show();

                $(".userOptions").children(".userPhoto").attr("src", scope.children(".userImg").attr("src"));

                if ($(window).width() > 639)
                    $(".userOptions").position({
                        of: scope,
                        my: "right-10 top-15",
                        at: "left center"
                    });

                if ($(window).width() <= 639)
                    $(".userOptions").position({
                        of: scope,
                        my: "right top",
                        at: "right bottom"
                    });

                var selectedUsername = Common.getUserName(scope);

                if (CHATVARIABLES.user.Username.toLowerCase() == "admin") {
                    $(".userPvtChatBlock").remove();
                    if (scope.hasClass("mod")) {
                        var markup = $(modKick);
                        $(".userOptions .options").append(markup);
                        $(markup).click(function (e) { ChatOptions.modKick(scope) });
                    }
                    else {
                        var markup = $(userKick);
                        $(".userOptions .options").append(markup);
                        $(markup).click(function (e) { ChatOptions.userKick(scope) });
                    }
                }
                else if (CHATVARIABLES.user.IsMod == 1) {
                    $(".userPvtChatBlock").remove();
                    if (!scope.hasClass("admin")) {
                        var markup = $(userKick);
                        $(".userOptions .options").append(markup);
                        $(markup).click(function (e) { ChatOptions.userKick(scope) });
                    }
                }
                else if (scope.hasClass("admin") || scope.hasClass("mod") || Common.isUserBlock(selectedUsername) == 1) {
                    $(".userOptions").remove();
                }

                ChatOptions.userChat();
                ChatOptions.userLeft();
                $(HTML).on("mouseleave", function () { $(this).remove() });
                $(".userPvtChat").click(function () { ChatOptions.pvtChat(scope) });
                $(".userPvtChatBlock").click(function () { ChatOptions.blockChat(scope) });
            },

            userChat: function () {

                // When User Opens Private Chat to other User(s)
                this.pvtChat = function (scope) {
                    var username = Common.getUserName(scope);
                    var chatOpened = Common.checkChatOpened(username);
                    if (chatOpened > 0) {
                        Common.openChat(chatOpened);
                        CHATVARIABLES.chatSlider.moveToSlide();
                        return;
                    };

                    var subName = Common.getSubName(username);
                    var markup = $(CHATVARIABLES.newChatType.replace("data", "data-userName='" + username + "'")
                                 .replace("userimg", scope.children(".userImg").attr("src"))
                                 .replace("<em>", "<em>" + subName));
                    $(".chatMsg").hide();
                    $(".startedChat").removeClass("startedChatSelected");
                    $(".messageArea").append(CHATVARIABLES.newChatMsg);
                    $(".chatType").append(markup);

                    //For hiding rightBox
                    if ($(window).width() <= 639)
                        $(".showRightBox").trigger("click");

                    CHATVARIABLES.totalChats++;
                    CHATVARIABLES.currentChatIndex = $(".startedChat").length - 1;
                    $(".startedChat").eq(CHATVARIABLES.currentChatIndex).addClass("startedChatSelected");

                    $(markup).click(function () { ChatOptions.openChat($(this)) });
                    $(markup).children("span").click(function () { ChatOptions.closeChat($(this)) });

                    CHATVARIABLES.chatSlider.moveLast();
                }

                // When User Block other User
                this.blockChat = function (scope) {
                    var username = Common.getUserName(scope);
                    CHATVARIABLES.user.Blocks += username + ";";

                    var slashIndex = scope.children(".userImg").attr("src").lastIndexOf('/') + 1;
                    var dotIndex = scope.children(".userImg").attr("src").lastIndexOf('.');
                    var path = scope.children(".userImg").attr("src").substring(0, slashIndex);
                    var userGender = scope.children(".userImg").attr("src").substring(slashIndex, dotIndex);

                    scope.children(".userImg").attr("src", path + "block" + userGender + ".png");

                    var index = Common.checkChatOpened(username)
                    if (index > 0) {
                        var markupUser = $(CHATVARIABLES.newMsg).removeClass("msgPara").addClass("msgParaBlockUser")
                                         .append("<span>You have blocked user " + username + ". Hence you cannot communicate any further to this user.</span>");
                        $(".chatMsg").eq(index).append(markupUser);
                        Common.setScroll(index);
                    }
                    CHATVARIABLES.server.userBlocked(username);
                }

                // When User Navigate to Public and Private Chats

                $(".startedChat").click(function () { ChatOptions.openChat($(this)) });
                this.openChat = function (scope) {
                    var index = scope.index();
                    Common.openChat(index);
                }

                this.closeChat = function (scope) {
                    var index = scope.parent().index();
                    scope.parent().remove();
                    $(".chatMsg").eq(index).remove();
                    CHATVARIABLES.totalChats--;
                    if (index == CHATVARIABLES.currentChatIndex) {
                        CHATVARIABLES.currentChatIndex = (CHATVARIABLES.currentChatIndex - 1) < 0 ? 0 : --CHATVARIABLES.currentChatIndex;
                        $(".chatMsg").hide();
                        $(".startedChat").removeClass("startedChatSelected");
                        $(".chatMsg").eq(CHATVARIABLES.currentChatIndex).show();
                        $(".startedChat").eq(CHATVARIABLES.currentChatIndex).addClass("startedChatSelected").removeClass("gotMsg");
                    }
                    else
                        CHATVARIABLES.currentChatIndex = (CHATVARIABLES.currentChatIndex - 1) < 0 ? 0 : --CHATVARIABLES.currentChatIndex;
                    CHATVARIABLES.chatSlider.movePrev();
                }

            },

            userLeft: function () {

                // On Kick

                this.userKick = function (scope) {
                    var userName = Common.getUserName(scope);
                    CHATVARIABLES.server.userKicked(userName);
                }

                this.modKick = function (scope) {
                    var userName = Common.getUserName(scope);
                    CHATVARIABLES.server.userKicked(userName);
                }

            },

        }

    });

})(jQuery);