
(function ($) {

    $(function () {

        var emoIcons = [":C", ":P", ":O", ":|", "%(", ":)", ";D", ":D", ":d", "*)", ":X", ":("];

        // Markup for emoticonPanel
        var emoticonPanel = "<table class='emoticonPanel'></table>";
        var emoticonRow = "<tr></tr>";
        var emoticonCol = "<td class='emoticonIcon'><em class='smiley smiley1'></em></td>";

        // Object

        ChatSmileys = {

            createEmoticonPanel: function () {
                var HTML = $(emoticonPanel);
                var current = 1;
                for (var i = 1; i <= 3; i++) {
                    var row = $(emoticonRow);
                    for (var j = 1; j <= 4; j++) {
                        var col = $(emoticonCol.replace("smiley1", "smiley" + current));
                        row.append(col);
                        current++;
                    }
                    HTML = HTML.append(row);
                }

                $(HTML).hide().insertBefore(".fileOptions");

                $(".emoticonIcon").each(function () {
                    $(this).click(function () { ChatSmileys.emoticonIconClick($(this)) });
                });
            },

            emoticonIconClick: function (scope) {
                var clas = scope.children("em").attr("class");
                var text = $(".txtBoxMsg").val();
                for (var i = 1; i <= emoIcons.length; i++) {
                    if (clas.match("smiley" + i + "$") != null) {
                        text = text + emoIcons[i - 1];
                        break;
                    }
                }
                $(".emoticonPanel").hide();
                $(".txtBoxMsg").val(text).focus();
            },

            getSmileyClass: function (emo) {
                for (var i = 0; i < emoIcons.length; i++) {
                    if (emoIcons[i] === emo) {
                        return ".smiley" + (i + 1);
                    }
                }
            },

            getSmileyHTML: function (emo) {
                if (emo[0] === ':' || emo[0] === ';' || emo[0] === '%' || emo[0] === '*') {
                    if (emo[1] === 'C' || emo[1] === 'P' || emo[1] === 'O' || emo[1] === '|' || emo[1] === '('
                        || emo[1] === ')' || emo[1] === 'D' || emo[1] === 'd' || emo[1] === 'X') {
                        var emoicon = emo[0] + emo[1];
                        var emotionImage = $(ChatSmileys.getSmileyClass(emoicon)).first().clone();
                        return emotionImage;
                    }
                }
                return null;
            },

            events: function () {
                $(".emoticonsBtn").click(function () {
                    $(".emoticonPanel").toggle().position({
                        of: $(".emoticonsBtn"),
                        my: "left bottom",
                        at: "right top"
                    });
                });
            }

        }

        ChatSmileys.createEmoticonPanel();
        ChatSmileys.events();

    });

})(jQuery);