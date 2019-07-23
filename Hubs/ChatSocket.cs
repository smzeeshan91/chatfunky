using Microsoft.AspNet.SignalR;
using Microsoft.Web.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using System.Text;
using ChatApp.Web.Helper;
using ChatApp.Web.Models;

namespace ChatApp.Web.Hubs
{
    public class ChatSocket : WebSocketHandler
    {
        private static WebSocketCollection chatClients = new WebSocketCollection();
        public ChatUser user;

        public ChatSocket(ChatUser cUser)
        {
            user = cUser;
        }

        public override void OnOpen()
        {
            if (DBSupport.GetUser(user) == null)
                DBSupport.AddNewUser(user);

            SocketMessage socMsg = new SocketMessage()
            {
                Type = SocketMessage.MessageType.JoinedPub,
                Packetizer = new SocketMessage.DataGram
                {
                    User = user,
                    UsersCount = DBSupport.GetUsersCount()
                }
            };
            chatClients.BroadcastExcept(chatClients, this.user, JsonConvert.SerializeObject(socMsg));

            socMsg = new SocketMessage()
            {
                Type = SocketMessage.MessageType.JoinedPvt,
                Packetizer = new SocketMessage.DataGram
                {
                    User = null,
                    Users = DBSupport.GetAllUsers(),
                    UsersCount = DBSupport.GetUsersCount()
                }
            };
            this.Send(JsonConvert.SerializeObject(socMsg));
            chatClients.Add(this);
        }

        public override void OnMessage(string msg)
        {
            SocketMessage socMsg = JsonConvert.DeserializeObject<SocketMessage>(msg);

            if (socMsg.Type == SocketMessage.MessageType.Public)
                chatClients.Broadcast(msg);
            else if (socMsg.Type == SocketMessage.MessageType.Private)
                chatClients.SingleOrDefault(x => ((ChatSocket)x).user.Username.Equals(socMsg.Recipent)).Send(msg);
        }

        public override void OnClose()
        {
            // Free resources, close connections, etc.
            chatClients.Remove(this);
            //DBSupport.DeleteUser(this.user.Username);
            base.OnClose();
        }
    }
}