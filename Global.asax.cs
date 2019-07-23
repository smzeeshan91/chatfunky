using ChatApp.Bots.BotManager;
using ChatApp.Web.App_Start;
using ChatApp.Web.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;

namespace ChatApp.Web
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_PreSendRequestHeaders()
        {
            Response.Headers.Remove("Server");
        }

        protected void Application_Start(object sender, EventArgs e)
        {
            AreaRegistration.RegisterAllAreas();

            //For ASP.NET HTTPS Redirection
            //GlobalFilters.Filters.Add(new RequireHttpsAttribute());

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            RouteConfig.RegisterViewEngines(ViewEngines.Engines);

            MvcHandler.DisableMvcResponseHeader = true;

            // Wait a maximum of 30 seconds after a transport connection is lost
            // before raising the Disconnected event to terminate the SignalR connection.
            Microsoft.AspNet.SignalR.GlobalHost.Configuration.KeepAlive = TimeSpan.FromSeconds(3);

            // Service for deleting signed off users whose record still exists in db
            SharedSupport.RemoveSignedOffUsersService();

            //Chat Bot
            new ABotManager(2);
        }
    }
}