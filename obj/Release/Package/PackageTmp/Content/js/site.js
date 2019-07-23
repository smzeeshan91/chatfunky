
(function ($) {

    $(function () {

        $(".fbLink").mouseenter(function () {
            $(this).attr("src", "../content/images/fb2.png");
        }).mouseleave(function () {
            $(this).attr("src", "../content/images/fb.png");
        });

        $(".msgSend").click(function () {
            var email = $(".emailMsg").val();
            var emailregex = /^([a-zA-Z]{1})+([0-9]{0,})([._a-zA-Z]{0,})+([0-9]{0,})+@[a-zA-Z.-]+\.[a-zA-Z]{2,3}$/;
            var msg = $(".messageMsg").val();
            if (email.length == 0 || !emailregex.test(email)) {
                alert("Please enter valid email address.");
                return;
            }
            if (msg.length == 0) {
                alert("Please enter valid message.");
                return;
            }

            $.post("/api/globalapi/formsubmission", { Email: email, Message: msg }, null, "json");
            $(".emailMsg, .messageMsg").val("");
            alert("Your feedback has been collected! Thank you.");
        });

    });

})(jQuery);

$(window).on("load", function () {
    //Facebook Javascript SDK
    $.getScript("/content/js/fbsdk.js", function () { });

    //Google Javascript SDK
    $.getScript("https://apis.google.com/js/platform.js", function () { });

    //LinkedIn Javascript SDK
    $.getScript("//platform.linkedin.com/in.js?async=true", function () {
        IN.init({
            api_key: '81joegbpiwn1bw'
        });
    });
})