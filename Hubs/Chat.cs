using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using ChatApp.Web.Models;
using System.Data.SqlClient;
using System.Configuration;
using ChatApp.Web.Helper;

namespace ChatApp.Web.Hubs
{
    public class Chat : Hub
    {
        public override Task OnConnected()
        {
            return base.OnConnected();
        }

        public bool Ping()
        {
            return true;
        }

        public void NewUserJoining(ChatUser user)
        {
            if (DBSupport.IsIdExist(user.Id))
                DBSupport.UpdateUser(user);
            else
                DBSupport.AddNewUser(user);
            Clients.Others.newUserJoined(user);
            Clients.Caller.youJoined(DBSupport.GetAllUsers());
            Clients.All.totalUsers(DBSupport.GetUsersCount());
        }

        //Called from client in case of duplicate tab in order to retreive the same session for same client
        public void LoadSameSession()
        {
            Clients.Caller.youJoined(DBSupport.GetAllUsers());
            Clients.All.totalUsers(DBSupport.GetUsersCount());
        }

        public void JoinedOnReconnected(ChatUser user)
        {
            if (DBSupport.IsIdExist(user.Id))
                DBSupport.UpdateUser(user);
        }

        public void UserTyping(bool isUserTyping, string username)
        {
            try
            {
                ChatUser pvtChatClient = DBSupport.GetUser(new ChatUser { ConnectionId = Context.ConnectionId });
                ChatUser pvtChatRecipent = DBSupport.GetUser(new ChatUser { Username = username });
                if (!pvtChatClient.Blocks.Contains(pvtChatRecipent.Username) && !pvtChatRecipent.Blocks.Contains(pvtChatClient.Username))
                    Clients.Client(pvtChatRecipent.ConnectionId).userIsTyping(isUserTyping, pvtChatClient.Username);
            }
            catch { }
        }

        public void NewMessage(string msgMarkup)
        {
            ChatUser chatClient = DBSupport.GetUser(new ChatUser { ConnectionId = Context.ConnectionId });
            string[] exceptUsers = null;
            if (chatClient == null)
            {
                string username = Context.RequestCookies["FunkyUser"].Value.Substring(0, Context.RequestCookies["FunkyUser"].Value.IndexOf('&'));
                username = username.Substring(username.IndexOf('=') + 1);
                chatClient = DBSupport.GetUser(new ChatUser { Username = username });
                exceptUsers = SharedSupport.ExceptUsers(chatClient);
                exceptUsers = exceptUsers.Concat(new string[] { Context.ConnectionId }).ToArray();
                exceptUsers = exceptUsers.ToList().Where(x => !x.Equals(chatClient.ConnectionId)).ToArray();
            }
            else
                exceptUsers = SharedSupport.ExceptUsers(chatClient);

            //For updating context user connect time
            DBSupport.UpdateUser(chatClient);

            Clients.AllExcept(exceptUsers).newUserMessage(msgMarkup);
        }

        public void NewPrivateMessage(string msgMarkup, string username)
        {
            if (DBSupport.GetUser(new ChatUser { Username = username }) == null)
                return;

            ChatUser pvtChatClient = DBSupport.GetUser(new ChatUser { ConnectionId = Context.ConnectionId });
            ChatUser pvtChatRecipent = DBSupport.GetUser(new ChatUser { Username = username });

            //For updating context user connect time
            DBSupport.UpdateUser(pvtChatClient);

            if (!pvtChatClient.Blocks.Contains(pvtChatRecipent.Username) && !pvtChatRecipent.Blocks.Contains(pvtChatClient.Username))
                Clients.Client(pvtChatRecipent.ConnectionId).newUserPrivateMessage(msgMarkup, pvtChatClient.Username);
        }

        public void UserBlocked(string username)
        {
            ChatUser currentUser = DBSupport.GetUser(new ChatUser { ConnectionId = Context.ConnectionId });
            currentUser.Blocks += username + ";";

            DBSupport.BlockUser(currentUser);
        }

        public void userKicked(string username)
        {
            ChatUser currentUser = DBSupport.GetUser(new ChatUser { Username = username });
            DBSupport.DeleteUser(currentUser.Username);
            Clients.AllExcept(currentUser.ConnectionId).userLeft(currentUser.Username);
            Clients.Client(currentUser.ConnectionId).forceDisconnect();
            Clients.All.totalUsers(DBSupport.GetUsersCount());
            Clients.All.dcUserSessions(currentUser.Username);
        }

        public void Stop()
        {
            try
            {
                ChatUser currentUser = DBSupport.GetUser(new ChatUser { ConnectionId = Context.ConnectionId });
                if (currentUser == null)
                {
                    string username = Context.RequestCookies["FunkyUser"].Value.Substring(0, Context.RequestCookies["FunkyUser"].Value.IndexOf('&'));
                    username = username.Substring(username.IndexOf('=') + 1);
                    currentUser = DBSupport.GetUser(new ChatUser { Username = username });
                }
                DBSupport.DeleteUser(currentUser.Username);
                Clients.Others.userLeft(currentUser.Username);
                Clients.All.totalUsers(DBSupport.GetUsersCount());
                Clients.All.dcUserSessions(currentUser.Username);
            }
            catch { }
        }

        public override Task OnDisconnected(bool s)
        {
            return base.OnDisconnected(true);
        }
    }
}