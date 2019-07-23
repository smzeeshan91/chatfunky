
(function ($) {

    $(function () {

        // Markup for audio
        var audioRecording = "<div class='audioMessage'><div><p class='reconnectingTxt recording'>Recording audio ...</p><p class='closeBtn'>End</p><p style='clear:both'></p></div></div>"
        var isRecording = false;
        var recordingInterval = null;
        var audio_context = null;
        var recorder = null;

        ChatAudioMessage = {

            showRecording: function () {
                $(".leftBox, .rightBox, .showRightBox").hide();
                $(".chatBox").addClass("chatBoxInitial");
                Common.setChatBoxInitialHeight();
                var markup = $(audioRecording);
                $(markup).find(".closeBtn").click(ChatAudioMessage.stopRecording);
                $("section").append(markup);
                ChatAudioMessage.showAudioing(".reconnectingTxt", "Recording audio ");
            },

            showAudioing: function (clas, text) {
                var sec = 0;
                recordingInterval = setInterval(function () {
                    $(clas).append(".");
                    sec++;
                    if (sec == 4) {
                        sec = 0;
                        $(clas).html(text);
                    }
                }, 800);
            },

            stopRecording: function () {
                recorder && recorder.stop();
                isRecording = false;
                recorder.clear();
                Common.removeConnecting();
                clearInterval(recordingInterval);
                $(".fileName, .data").text("");
                $(".fileName").text("Converting audio ...");
                $(".uploadify-queue-item, .cancel").show();
                ChatAudioMessage.showAudioing(".fileName", "Converting audio ");
            },

            createUploader: function () {
                clearInterval(recordingInterval);
                audioUploader = new plupload.Uploader({
                    runtimes: "html5,flash,silverlight,html4",
                    browse_button: "audio",
                    url: "/global/uploadaudio",
                    filters: {
                        max_file_size: '1mb',
                        mime_types: [
                            { title: "Text files", extensions: "txt" }
                        ]
                    },

                    init: {
                        PostInit: function () {
                            Common.isHTML5Supported();
                        },

                        FilesAdded: function (up, files) {

                            if ($(".txtBoxMsg").val().indexOf("[::Audio]") >= 0) {
                                audioUploader.stop();
                                alert("You cannot send more then 1 audio in a single chat message!");
                            }
                            else
                                audioUploader.start();

                            if (audioUploader.state == 2) {
                                var size = plupload.formatSize(files[0].size);
                                var sizeShow = size != "N/A" ? " (" + size + ")" : "";
                                $(".uploadify-queue-item, .cancel").show();
                                $(".fileName").text("Audio message " + sizeShow);
                            }
                            else
                                audioUploader.removeFile(files[0]);

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
                                $(".uploadify-progress-bar").css("width", "2%");
                            });
                            $(".txtBoxMsg").val($(".txtBoxMsg").val() + "[::Audio]");
                            $(".fileName, .data").text("");
                            CHATVARIABLES.sharedAudio = data.response;
                        },

                        Error: function (up, err) {
                            alert("Invalid Audio File!");
                            $(".data").text("Error #" + err.code + ": " + err.message);
                        }
                    }
                });

                audioUploader.init();

                window.webkitRequestFileSystem(window.TEMPORARY, 5 * 1024, function (fs) {
                    fs.root.getFile('audio.txt', { create: true }, function (fileEntry) {
                        fileEntry.isFile === true
                        fileEntry.name == 'audio.txt'
                        fileEntry.fullPath == '/audio.txt'
                        fileEntry.createWriter(function (fileEntry) {
                            var blob = new Blob([CHATVARIABLES.sharedAudio], { type: 'text/plain' });
                            fileEntry.write(blob);
                            audioUploader.addFile(blob, "audio.txt");
                            audioUploader.start();
                        });
                    }, ChatAudioMessage.uploadingError());
                }, function () { ChatAudioMessage.uploadingError() });
            },

            uploadingError: function () {
                clearInterval(recordingInterval);
                $(".fileName, .data").text("");
                $(".data").text("#Error occured");
                $(".uploadify-queue-item").delay(1300).fadeOut(500, function () {
                    $(".uploadify-progress-bar").css("width", "2%");
                });
            },

            events: function () {
                $(".audioMsg").click(function () {
                    try {
                        window.AudioContext = window.AudioContext || window.webkitAudioContext;
                        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
                        audio_context = new AudioContext();
                        navigator.getUserMedia({ audio: true }, function (stream) {
                            var input = audio_context.createMediaStreamSource(stream);
                            recorder = new Recorder(input, {
                                numChannels: 1
                            });
                            recorder && recorder.record();
                            isRecording = true;
                            ChatAudioMessage.showRecording();
                            setTimeout(function () {
                                return isRecording ? ChatAudioMessage.stopRecording() : null;
                            }, 60000);
                        }, function (e) {
                            alert('No web audio device is not compatible!');
                        });
                    } catch (e) {
                        alert('No web audio support in this browser!');
                    }
                });
            }

        }

        ChatAudioMessage.events();

    });

})(jQuery);