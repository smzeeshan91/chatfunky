using ChatApp.Web.Hubs;
using ChatApp.Web.Models;
using Microsoft.Web.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Helper
{
    public static class WebSocket
    {
        public static void BroadcastExcept(this WebSocketCollection ws, WebSocketCollection collection, ChatUser user, string message)
        {
            WebSocketCollection tempCollection = new WebSocketCollection();
            foreach (ChatSocket item in collection)
            {
                if (!item.user.Username.Equals(user.Username))
                    tempCollection.Add(item);
            }
            tempCollection.Broadcast(message);
        }
    }
}