
(function ($) {

    $(function () {

        var uploader = null;

        ChatFileUploader = {

            createUploader: function () {
                //File Uploader (Pulpload) Load
                uploader = new plupload.Uploader({
                    runtimes: "html5,flash,silverlight,html4",
                    browse_button: "imageOption",
                    url: "/global/savesharedimage",
                    filters: {
                        max_file_size: "4mb",
                        mime_types: [{ title: "Image files", extensions: "jpg,gif,png,bmp" }]
                    },

                    init: {
                        PostInit: function () {
                            Common.isHTML5Supported();
                        },

                        FilesAdded: function (up, files) {

                            if ($(".txtBoxMsg").val().indexOf("[::Image]") >= 0) {
                                uploader.stop();
                                alert("You cannot send more then 1 image in a single chat message!");
                            }
                            else
                                uploader.start();

                            if (uploader.state == 2) {
                                var size = plupload.formatSize(files[0].size);
                                var sizeShow = size != "N/A" ? " (" + size + ")" : "";
                                $(".uploadify-queue-item, .cancel").show();
                                $(".fileName").text(files[0].name + sizeShow);
                            }
                            else
                                uploader.removeFile(files[0]);

                        },

                        UploadProgress: function (up, file) {
                            if (file.percent == 100) {
                                $(".cancel").hide();
                                $(".data").text("Completed");
                            }
                            else
                                $(".data").text(file.percent + "%");
                            $(".uploadify-progress-bar").css("width", file.percent + "%");
                        },

                        FileUploaded: function (up, file, data) {
                            $(".uploadify-queue-item").delay(1300).fadeOut(500, function () {
                                $(".uploadify-progress-bar").css("width", "0%");
                            });
                            $(".txtBoxMsg").val($(".txtBoxMsg").val() + "[::Image]");
                            CHATVARIABLES.sharedImage = data.response;
                        },

                        Error: function (up, err) {
                            alert("Invalid Image File!");
                            $(".data").text("Error #" + err.code + ": " + err.message);
                        }
                    }
                });

                $(".uploadify-queue-item").hide();
                uploader.init();
            },

        }

        ChatFileOptions = {

            createFileOptions: function () {
                $(".fileOptions").position({
                    of: $(".btnSendFile"),
                    my: "right bottom",
                    at: "left top"
                });
            },

            events: function () {
                $(".btnSendFile").click(function () {
                    $(".fileOptions").show().position({
                        of: $(".btnSendFile"),
                        my: "right+10 bottom-10",
                        at: "center top"
                    });
                });

                $(".cancel").click(function () {
                    uploader.stop();
                    $(".uploadify-queue-item").fadeOut(0);
                    $(".uploadify-progress-bar").css("width", "0%");
                });

                $(".fileOptions").mouseleave(function () {
                    Common.isHTML5Supported();
                });
            }

        },

        ChatFileUploader.createUploader();
        ChatFileOptions.createFileOptions();
        ChatFileOptions.events();

    });

})(jQuery);