using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ChatApp.Web.Models
{
    /// <summary>
    ///  Model used in Mobile Signup page for user signup
    /// </summary>
    public class SignupUser
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public string Password { get; set; }

        public string Gender { get; set; }

        public int Age { get; set; }
    }

    /// <summary>
    ///  Model used in Home page for user login
    /// </summary>
    public class User
    {
        public string Username { get; set; }

        public string Gender { get; set; }

        public int Age { get; set; }

        public string SocialProfilePicture { get; set; }
    }

    /// <summary>
    /// Model used for chat by Signalr
    /// </summary>
    public class ChatUser
    {
        public int Id { get; set; }
        public int IsMod { get; set; }
        public string ConnectionId { get; set; }
        public string Username { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public string Photo { get; set; }
        public string Blocks { get; set; }
        public DateTime ConnectTime { get; set; }
    }

    /// <summary>
    /// Model used for mod to login
    /// </summary>
    public class Mod
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    /// <summary>
    /// Model used for chat by Websockets
    /// </summary>
    public class SocketMessage
    {
        /// <summary>
        /// This struct us used to take the values if users joins from websocket
        /// </summary>
        public struct DataGram
        {
            public IEnumerable<ChatUser> Users { get; set; }
            public int UsersCount { get; set; }
            public ChatUser User { get; set; }
        }

        /// <summary>
        /// This enum is used to contains the type of the message
        /// </summary>
        public enum MessageType
        {
            JoinedPub,
            JoinedPvt,
            Public,
            Private,
        }

        public MessageType Type { get; set; }
        public DataGram Packetizer { get; set; }
        public string Markup { get; set; }
        public string Sender { get; set; }
        public string Recipent { get; set; }
        public bool SR { get; set; }
    }
}