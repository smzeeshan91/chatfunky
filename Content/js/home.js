
(function ($) {

    $(function () {

        //For more options & Photo Upload

        var sharedImage = null;

        $(".moreOptions").click(function () {
            if ($(this).text().match("set")) {
                $(this).text($(this).text().replace("set", "hide"));
                var gender = $("<select></select>").attr("class", "gender").attr("id", "Gender").attr("name", "Gender");
                gender.append(new Option("Gender", "")).append(new Option("Male", "Male")).append(new Option("Female", "Female"));
                var age = $("<select></select>").attr("class", "age").attr("id", "Age").attr("name", "Age");
                age.append(new Option("Age", ""));
                for (var i = 12; i <= 60; i++) {
                    age.append(new Option(i, i));
                }
                $(".opt").append($(gender));
                $(".opt").append($(age));
            }
            else {
                $(this).text($(this).text().replace("hide", "set"));
                $(".gender, .age").remove();
            }
        });

        $(".btnUpload").click(function () {
            $("#photo").trigger("click");
        });

        $("#photo").change(function () {
            verifyPhoto($(this));
        });

        function verifyPhoto($photo) {
            var fileInput = $photo;
            var supportedFormats = ["image/jpg", "image/jpeg", "image/gif", "image/png", "image/bmp"];

            if (fileInput.get(0).files == null) {
                $(".lblUpload").text("Uploaded").addClass("lblUploadedie");
            }
            else if (fileInput.get(0).files.length > 0 && supportedFormats.indexOf(fileInput.get(0).files[0].type) < 0) {
                alert("Invalid Image File!");
                $(".lblUpload").text("Photo").css("background-image", "none").removeClass("lblUploaded");
            }
            else if (fileInput.get(0).files.length > 0) {
                var file = fileInput.get(0).files[0];
                var fileSize = file.size;
                if (fileSize / 1024 > 500) {
                    alert("Please select image less than 500 kb!");
                    $("#photo, #sendPhoto").value = "";
                }
                else {
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            sharedImage = e.target.result;
                            $(".lblUpload").text("").css("background-image", "url('" + sharedImage + "')").addClass("lblUploaded");
                        };
                    })(file);
                    reader.readAsDataURL(file);
                }
            }
            else
                $(".lblUpload").text("Photo").css("background-image", "none").removeClass("lblUploaded");
        }

        //When click on join button

        $(".mainJoinBtn").click(function () {
            $("body").animate({ scrollTop: $(".loginArea").offset().top }, 'slow');
        });

        $(".joinBtn").click(function (e) {
            if ($(this).attr("class").indexOf("fbLogin") < 0 && $(this).attr("class").indexOf("googleLogin") < 0
                && $(this).attr("class").indexOf("linkedinLogin") < 0) {
                var username = $(".txtBoxUserName").val().trim();
                if (username.length > 14 || username.length == 0) {
                    e.preventDefault();
                    alert("please enter username max upto 14 characters!");
                }
            }
        });

        //When click on social login/join buttons

        //FB

        $(".fbLogin").click(function () {
            FB.login(function (response) {
                if (response.status === 'connected') {
                    FB.api('/me?fields=name,gender,age_range,picture', function (response) {
                        $(".lblUpload").text("").css("background-image", "url('" + response.picture.data.url + "')").addClass("lblUploaded");
                        $("#SocialProfilePicture").val(response.picture.data.url);
                        $(".txtBoxUserName").val(response.name);
                        $(".moreOptions").trigger("click");
                        $(".gender").val(response.gender[0].toUpperCase() + response.gender.substring(1));
                        $(".age").val(response.age_range.min);
                        $("#loginForm").submit();
                    });
                }
            }, { scope: 'public_profile', return_scopes: true });
        });

        //Google

        var googleFlag = false;

        $(".googleLogin").click(function () {
            $.getScript("https://apis.google.com/js/api:client.js", function () {
                gapi.load('auth2', function () {
                    var googleUser = {};
                    auth2 = gapi.auth2.init({
                        client_id: '481167216357-oi8f6fa765f1mqqtuss9mjlnnc6kehti.apps.googleusercontent.com',
                    });
                    auth2.attachClickHandler("googleLogin", {},
                        function (googleUser) {
                            $(".lblUpload").text("").css("background-image", "url('" + googleUser.getBasicProfile().getImageUrl() + "')").addClass("lblUploaded");
                            $("#SocialProfilePicture").val(googleUser.getBasicProfile().getImageUrl());
                            $(".txtBoxUserName").val(googleUser.getBasicProfile().getName());
                            $("#loginForm").submit();
                        });
                });
                if (!googleFlag) {
                    googleFlag = true;
                    setTimeout(function () {
                        $(".googleLogin").trigger("click");
                    }, 1000);
                }
            });
        });

        //LinkedIn

        $(".linkedinLogin").click(function () {
            IN.User.authorize(function () {
                IN.API.Profile("me").fields(["lastName", "pictureUrl"]).result(function (data) {
                    $(".lblUpload").text("").css("background-image", "url('" + data.values[0].pictureUrl + "')").addClass("lblUploaded");
                    $("#SocialProfilePicture").val(data.values[0].pictureUrl);
                    $(".txtBoxUserName").val(data.values[0].lastName);
                    $("#loginForm").submit();
                });
            });
        });

    });

})(jQuery);