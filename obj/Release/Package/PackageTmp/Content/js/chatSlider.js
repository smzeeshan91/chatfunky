
(function ($) {

    $(function () {

        $.fn.slider = function (obj) {

            //Slider Creation

            var slider = $('<div class="slider"></div>');
            var sliderWrapper = $('<div class="slider-wrapper"></div>');
            $(slider).append(sliderWrapper);
            $(this).addClass("slides").wrapAll(slider);
            $(".slider-wrapper").append('<p style="clear:both" class="clear"></p>');

            //CSS Styling

            $(".slider").css("width", obj.sliderWidth);

            //Events

            $("#" + obj.nextClass).click(function () {
                var sliderTotalWidth = obj.slideWidth * $(".slides").children().length;
                obj.pointer = obj.pointer < sliderTotalWidth ? obj.pointer + obj.slideWidth : obj.pointer;
                if (obj.pointer <= sliderTotalWidth)
                    $(".slides").animate({ "margin-left": "-" + (obj.pointer - obj.sliderWidth) + "px" }, 350);
            });

            $("#" + obj.prevClass).click(function () {
                if (obj.pointer >= obj.sliderWidth) {
                    obj.pointer = obj.pointer - obj.slideWidth;
                    $(".slides").animate({ "margin-left": "-" + (obj.pointer - obj.sliderWidth) + "px" }, 350);
                }
            });

            $.fn.moveNext = function () {
                $("#" + obj.nextClass).trigger("click");
            }

            $.fn.movePrev = function () {
                $("#" + obj.prevClass).trigger("click");
            }

            $.fn.moveFirst = function () {
                obj.pointer = 0;
                $(".slides").animate({ "margin-left": "0px" }, 350);
            }

            $.fn.moveLast = function () {
                var sliderTotalWidth = $(".slides").children().length * obj.slideWidth;
                obj.pointer = sliderTotalWidth;
                $(".slides").animate({ "margin-left": "-" + (obj.pointer - obj.sliderWidth) + "px" }, 350);
            }

            $.fn.moveToSlide = function () {
                var slideToPoint = ($(".slides").children("[class='startedChat startedChatSelected']").index() + 1) * obj.slideWidth;
                obj.pointer = slideToPoint;
                pointer = obj.pointer - (obj.slideWidth * obj.totalSlides) < 0 ? (obj.pointer - obj.slideWidth) : obj.pointer - (obj.slideWidth * obj.totalSlides);
                $(".slides").animate({ "margin-left": "-" + pointer + "px" }, 350);
            }

            $.fn.reloadSlider = function (sliderWidth, slideWidth) {
                obj.sliderWidth = sliderWidth;
                obj.slideWidth = slideWidth;
                //obj.pointer = slideWidth;
                $(".slider").css("width", sliderWidth);
            }

            return this;
        }

        ChatFunkySlider = {

            slideWidth: 0,
            sliderWidth: 0,
            totalSlides: 0,

            loadSlider: function () {

                ChatFunkySlider.setSliderPosition();
                CHATVARIABLES.chatSlider = $(".chatType").slider({
                    sliderWidth: ChatFunkySlider.sliderWidth,
                    slideWidth: ChatFunkySlider.slideWidth,
                    pointer: ChatFunkySlider.slideWidth,
                    totalSlides: ChatFunkySlider.totalSlides,
                    nextClass: "slider-next",
                    prevClass: "slider-prev",
                });
            },

            setSliderPosition: function () {

                ChatFunkySlider.slideWidth = 167;
                ChatFunkySlider.totalSlides = 5;
                ChatFunkySlider.sliderWidth = (ChatFunkySlider.slideWidth * ChatFunkySlider.totalSlides);

                if ($(window).width() <= 1200 && $(window).width() > 1020) {
                    ChatFunkySlider.totalSlides = 4;
                    ChatFunkySlider.sliderWidth = (ChatFunkySlider.slideWidth * ChatFunkySlider.totalSlides);
                }
                else if ($(window).width() <= 1020 && $(window).width() > 979) {
                    ChatFunkySlider.totalSlides = 3;
                    ChatFunkySlider.sliderWidth = (ChatFunkySlider.slideWidth * ChatFunkySlider.totalSlides);
                }
                else if ($(window).width() <= 979 && $(window).width() > 799) {
                    ChatFunkySlider.slideWidth = 123;
                    ChatFunkySlider.totalSlides = 4;
                    ChatFunkySlider.sliderWidth = (ChatFunkySlider.slideWidth * ChatFunkySlider.totalSlides);
                }
                else if ($(window).width() <= 799 && $(window).width() > 639) {
                    ChatFunkySlider.slideWidth = 123;
                    ChatFunkySlider.totalSlides = 3;
                    ChatFunkySlider.sliderWidth = (ChatFunkySlider.slideWidth * ChatFunkySlider.totalSlides);
                }
                else if ($(window).width() <= 639 && $(window).width() > 400) {
                    ChatFunkySlider.slideWidth = 113;
                    ChatFunkySlider.totalSlides = 2;
                    ChatFunkySlider.sliderWidth = (ChatFunkySlider.slideWidth * ChatFunkySlider.totalSlides);
                }
                else if ($(window).width() <= 400) {
                    ChatFunkySlider.slideWidth = 113;
                    ChatFunkySlider.totalSlides = 2;
                    ChatFunkySlider.sliderWidth = (ChatFunkySlider.slideWidth * ChatFunkySlider.totalSlides);
                }

            },

            reloadSlider: function () {
                ChatFunkySlider.setSliderPosition();
                CHATVARIABLES.chatSlider.reloadSlider(ChatFunkySlider.sliderWidth, ChatFunkySlider.slideWidth);
            },

        }

        ChatFunkySlider.loadSlider();

    });

})(jQuery);