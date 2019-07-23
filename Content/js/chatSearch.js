
(function ($) {

    $(function () {

        ChatSearch = {

            setUsers: function () {
                CHATVARIABLES.users = [];
                for (var i = 0; i < $(".user").length; i++) {
                    var user = { markup: $($(".user").eq(i).prop("outerHTML")) };
                    CHATVARIABLES.users.push(user);
                }
            },

            generateUserMarkup: function (user) {
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
                    if (user.YouUser != null)
                        $(CHATVARIABLES.youUser).insertAfter(markup.find(".userInfo"));
                    else
                        $(markup).on("mouseenter click", function (e) { SignalrClient.userClickOptions($(this), e) });
                }
                return markup;
            },

            appendSearchedUsers: function (user) {
                var markup = ChatSearch.generateUserMarkup(user);
                $(".roomTab").append(markup);
            },

            prependSearchedUsers: function (user) {
                var markup = ChatSearch.generateUserMarkup(user);
                $(".roomTab").prepend(markup);
            },

            events: function () {

                $(".searchBox").keyup(function () {
                    var flag = false;
                    $(".roomTab .user").css("opacity", "0");
                    var searchedText = $(this).val().toLowerCase();
                    var markup = "";
                    for (var i = 0; i < CHATVARIABLES.users.length; i++) {
                        var slashIndex = CHATVARIABLES.users[i].markup.children(".userImg").attr("src").lastIndexOf('/') + 1;
                        var dotIndex = CHATVARIABLES.users[i].markup.children(".userImg").attr("src").lastIndexOf('.');
                        var path = CHATVARIABLES.users[i].markup.children(".userImg").attr("src").substring(0, slashIndex);
                        var userGender = CHATVARIABLES.users[i].markup.children(".userImg").attr("src").substring(slashIndex, dotIndex);

                        var user = {
                            Username: CHATVARIABLES.users[i].markup.attr("data-userName"),
                            Photo: CHATVARIABLES.users[i].markup.children(".userImg").attr("src"),
                            Gender: userGender == "male" || userGender == "female" ? userGender : "",
                            Age: CHATVARIABLES.users[i].markup.children("p > span").length > 0 ? CHATVARIABLES.users[i].markup.children("p > span") : 0,
                            YouUser: CHATVARIABLES.users[i].markup.children(".youUser").length > 0 ? CHATVARIABLES.users[i].markup.children(".youUser") : null
                        }
                        if (searchedText != "") {
                            if (CHATVARIABLES.users[i].markup.attr("data-userName").toLowerCase().match("^" + searchedText)) {
                                $(".user").eq(CHATVARIABLES.users.length - 1).remove();
                                ChatSearch.prependSearchedUsers(user);
                            }
                        }
                        else {
                            if (!flag)
                                $(".roomTab").html("");
                            ChatSearch.appendSearchedUsers(user);
                            flag = true;
                        }
                    }
                });

            }

        }

        ChatSearch.events();

        setInterval(function () {
            ChatSearch.setUsers();
        }, 120000);

    });

})(jQuery);