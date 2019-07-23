using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using ChatApp.Web.App_Start;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin.Cors;

[assembly: OwinStartup(typeof(HubStartup))]

namespace ChatApp.Web.App_Start
{
    public class HubStartup
    {
        public void Configuration(IAppBuilder app)
        {
            GlobalHost.Configuration.KeepAlive = TimeSpan.FromSeconds(3);
            //var config = new HubConfiguration();
            //config.EnableJSONP = true;
            //app.MapSignalR(config);

            // Branch the pipeline here for requests that start with "/signalr"
            app.Map("/signalr", map =>
            {
                map.UseCors(CorsOptions.AllowAll);
                var hubConfiguration = new HubConfiguration
                {
                    EnableJSONP = true
                };
                map.RunSignalR(hubConfiguration);
            });
        }
    }
}
