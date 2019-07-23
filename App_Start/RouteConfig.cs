using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ChatApp.Web
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.LowercaseUrls = true;
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Mod",
                url: "Mod/{action}",
                defaults: new { controller = "Mod", action = "Mod" }
            );

            routes.MapRoute(
                name: "Panel",
                url: "Panel/{action}",
                defaults: new { controller = "Panel", action = "Login" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{action}",
                defaults: new { controller = "Main", action = "Home" }
            );

            routes.MapRoute(
                name: "Original",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Main", action = "Home", id = UrlParameter.Optional }
            );
        }

        public static void RegisterViewEngines(ICollection<IViewEngine> engines)
        {
            engines.Clear();

            engines.Add(new RazorViewEngine()
            {
                ViewLocationFormats = new[] { "~/Views/Pages/{0}.cshtml", "~/Views/Panel/Pages/{0}.cshtml" },
                MasterLocationFormats = new[] { "~/Views/Master/{0}.cshtml", "~/Views/Panel/Master/{0}.cshtml" },
                PartialViewLocationFormats = new[] { "~/Views/Partial/{0}.cshtml" }
            });
        }
    }
}