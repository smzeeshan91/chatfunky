using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace ChatApp.Web.App_Start
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            // For Inline Minification
            bundles.Add(new ScriptBundle("~/script/inline"));
            bundles.Add(new StyleBundle("~/css/inline"));

            // For External Minification
            bundles.Add(
                new StyleBundle("~/mainCss").Include(
                "~/content/css/fonts.css",
                "~/content/css/main.css",
                "~/content/css/main.responsive.css"
                )
                );

            bundles.Add(
                new ScriptBundle("~/mainJquery").Include(
                "~/content/js/jquery-3.1.1.min.js",
                "~/content/js/site.js"
                )
                );

            bundles.Add(
                new ScriptBundle("~/homeJquery").Include(
                "~/content/js/home.js"
                )
                );

            bundles.Add(
                new StyleBundle("~/chatPluginCss").Include(
                "~/content/plugins/plupLoad/plupload.css"
                )
                );

            bundles.Add(
                new StyleBundle("~/chatCss").Include(
                "~/content/css/animate.css",
                "~/content/css/chat.css",
                "~/content/css/chat.responsive.css",
                "~/content/css/smiley.css"
                )
                );

            bundles.Add(
                new ScriptBundle("~/chatPluginJquery").Include(
                "~/content/js/jquery-ui.min.js",
                "~/content/js/chatCommon.js",
                "~/content/js/chatSlider.js",
                "~/Content/js/chatSearch.js",
                "~/content/js/chatOptions.js",
                "~/content/plugins/plupLoad/plupload.full.min.js",
                "~/content/js/chatFileOptions.js",
                "~/content/js/chatSmileys.js"
                )
                );

            bundles.Add(
                new ScriptBundle("~/chatAudio").Include(
                "~/content/js/audio/recordmp3.js",
                "~/content/js/audio/chatAudioMsg.js"
                )
                );

            bundles.Add(
                new ScriptBundle("~/chatJquery").Include(
                "~/content/js/jquery.signalR-2.2.0.min.js",
                "~/content/js/jquery.signalR-hubs.js",
                "~/content/js/chat.js",
                "~/content/js/socket.js",
                "~/content/js/netSync.js"
                )
                );

            // Code removed for clarity.
            BundleTable.EnableOptimizations = true;
        }
    }
}