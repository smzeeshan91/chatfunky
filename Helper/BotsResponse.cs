using ChatApp.Web.Hubs;
using ChatApp.Web.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ChatApp.Web.Helper
{
    public class BotsResponse
    {
        public void LogIn(object user)
        {
            ChatUser botUser = new ChatUser();

            foreach (System.Reflection.PropertyInfo pInfo in user.GetType().GetProperties())
            {
                string pName = pInfo.Name;
                foreach (System.Reflection.PropertyInfo pbInfo in botUser.GetType().GetProperties())
                    if (pName.Equals(pbInfo.Name))
                    {
                        pbInfo.SetValue(botUser, pInfo.GetValue(user, null));
                        break;
                    }
            }

            DBSupport.AddNewUser(botUser);
            IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<Chat>();
            hubContext.Clients.All.newUserJoined(botUser);
            hubContext.Clients.All.totalUsers(DBSupport.GetUsersCount());
        }

        public void Message(object[] parameters)
        {
            string response = String.Format("<p class='msgPara'><span>{0}</span> : <span><em>{1}</em></span><span>{2}</span></p>",
                parameters[0], parameters[1], String.Format("{0:t}", DateTime.UtcNow.AddHours(5)));

            IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<Chat>();
            hubContext.Clients.All.newUserMessage(response);
        }

        public void SignOff(object user)
        {
            ChatUser botUser = new ChatUser();

            foreach (System.Reflection.PropertyInfo pInfo in user.GetType().GetProperties())
            {
                string pName = pInfo.Name;
                foreach (System.Reflection.PropertyInfo pbInfo in botUser.GetType().GetProperties())
                    if (pName.Equals(pbInfo.Name))
                    {
                        pbInfo.SetValue(botUser, pInfo.GetValue(user, null));
                        break;
                    }
            }

            DBSupport.DeleteUser(botUser.Username);
            IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<Chat>();
            hubContext.Clients.All.userLeft(botUser.Username);
            hubContext.Clients.All.totalUsers(DBSupport.GetUsersCount());
        }
    }
}
