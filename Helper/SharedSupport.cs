using ChatApp.Web.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Timers;
using System.Web;

namespace ChatApp.Web.Helper
{
    public static class SharedSupport
    {
        // App Settings

        public static string Domain
        {
            get
            {
                return ConfigurationManager.AppSettings["Domain"].ToString();
            }
        }

        public static string SharedImagesPath
        {
            get
            {
                return ConfigurationManager.AppSettings["SharedImagesPath"].ToString();
            }
        }

        public static string SharedAudiosPath
        {
            get
            {
                return ConfigurationManager.AppSettings["SharedAudiosPath"].ToString();
            }
        }

        // Methods

        internal static SignupUser FilterSignupUser(SignupUser user)
        {
            string username = user.Username.Trim();
            username = username[0].ToString().ToUpper() + username.Substring(1);
            if (!IsUsernameValid(username))
                return null;

            int id = new Random().Next(9999, 99999);
            while (DBSupport.IsSignupIdExist(id))
                id = new Random().Next(9999, 99999);

            return new SignupUser
            {
                Id = id,
                Username = username,
                Password = user.Password,
                Gender = !string.IsNullOrEmpty(user.Gender) ? user.Gender : string.Empty,
                Age = user.Age,
            };
        }

        internal static ChatUser FilterUser(User user, string photoWebPath)
        {
            // In case if user type admin as nick 
            if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
                return null;

            string username = user.Username.Trim();
            username = username[0].ToString().ToUpper() + username.Substring(1);
            if (!IsUsernameValid(username))
                return null;

            int id = new Random().Next(9999, 99999);
            while (DBSupport.IsIdExist(id))
                id = new Random().Next(9999, 99999);

            return new ChatUser
            {
                Id = id,
                Username = username,
                Gender = !string.IsNullOrEmpty(user.Gender) ? user.Gender : null,
                Age = user.Age,
                IsMod = 0,
                Photo = photoWebPath
            };
        }

        internal static ChatUser FilterMod(Mod mod)
        {
            string username = mod.Username.Trim();
            username = username[0].ToString().ToUpper() + username.Substring(1).ToLower();
            if (!IsUsernameValid(username))
                return null;
            return new ChatUser { Username = username, IsMod = 1 };
        }

        internal static bool IsUsernameValid(string username)
        {
            if (!Regex.IsMatch(username, "^[A-z ]+$") || username.Contains("\\") || username.Contains("^"))
            {
                HttpContext.Current.Session["usernameError"] = "Please enter alphabetic name i.e. " + usernameWithAlphabets(username);
                return false;
            }
            return true;
        }

        internal static string usernameWithAlphabets(string username)
        {
            string name = string.Empty;
            foreach (char nameCharacter in username)
            {
                if (char.IsLetter(nameCharacter))
                    name += nameCharacter;
            }
            return name;
        }

        internal static string MD5Encrypt(string x)
        {
            MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider();
            byte[] data = Encoding.ASCII.GetBytes(x);
            data = md5.ComputeHash(data);
            string md5Hash = Encoding.ASCII.GetString(data).Substring(0, 12).Replace("-", "").ToLower();
            return md5Hash;
        }

        internal static void RemoveSignedOffUsersService()
        {
            Timer stateTimer = new Timer(1000 * 60 * 2);
            stateTimer.Elapsed += DBSupport.DeleteSignedOffUsers;
            stateTimer.Enabled = true;
        }

        internal static string[] ExceptUsers(ChatUser chatClient)
        {
            List<string> blockedUsersOfClient = chatClient.Blocks.Split(';').ToList();
            blockedUsersOfClient.Remove("");
            string[] blockedUsers = DBSupport.GetUsers().Where(x => blockedUsersOfClient.Any(y => y.Equals(x.Username))).Select(x => x.ConnectionId).ToArray();
            string[] usersWhoBlockedClient = DBSupport.GetUsers().Where(x => x.Blocks.Contains(chatClient.Username)).Select(x => x.ConnectionId).ToArray();
            string[] client = new string[1] { chatClient.ConnectionId };
            string[] exceptUsers = blockedUsers.Concat(usersWhoBlockedClient).Concat(client).Distinct().ToArray();
            return exceptUsers;
        }

        internal static string GetImageFolderPath()
        {
            string fileSystemPath = new HttpRequest("chat", SharedSupport.Domain, null).MapPath(SharedImagesPath.Replace("..", string.Empty));
            return fileSystemPath;
        }

        internal static string GetAudioFolderPath()
        {
            string fileSystemPath = new HttpRequest("chat", SharedSupport.Domain, null).MapPath(SharedAudiosPath.Replace("..", string.Empty));
            return fileSystemPath;
        }

        internal static ChatUser GetCookieUser()
        {
            HttpCookie funkyCookie = HttpContext.Current.Request.Cookies["FunkyUser"];
            if (funkyCookie != null)
                return new ChatUser
                {
                    Id = Convert.ToInt32(funkyCookie.Values["Id"]),
                    Username = funkyCookie.Values["Username"],
                    Photo = funkyCookie.Values["Photo"],
                    Gender = funkyCookie.Values["Gender"],
                    Age = Convert.ToInt32(funkyCookie.Values["Age"]),
                    IsMod = 0
                };
            return null;
        }

        internal static void SetCookieUser(ChatUser user)
        {
            if (HttpContext.Current.Request.Cookies["FunkyUser"] == null)
            {
                HttpCookie funkyCookie = new HttpCookie("FunkyUser");
                funkyCookie.Values.Add("Username", user.Username);
                funkyCookie.Values.Add("Id", user.Id.ToString());
                funkyCookie.Values.Add("Photo", user.Photo);
                funkyCookie.Values.Add("Gender", user.Gender);
                funkyCookie.Values.Add("Age", user.Age.ToString());
                funkyCookie.Values.Add("Expiry", DateTime.UtcNow.AddDays(7).ToString("dd MMM yyyy"));
                HttpContext.Current.Response.SetCookie(funkyCookie);
            }
            else if (Convert.ToDateTime(HttpContext.Current.Request.Cookies["FunkyUser"].Values["Expiry"]) < DateTime.UtcNow)
            {
                HttpCookie funkyCookie = new HttpCookie("FunkyUser");
                funkyCookie.Values.Add("Username", user.Username);
                funkyCookie.Values.Add("Id", user.Id.ToString());
                funkyCookie.Values.Add("Photo", user.Photo);
                funkyCookie.Values.Add("Gender", user.Gender);
                funkyCookie.Values.Add("Age", user.Age.ToString());
                funkyCookie.Values.Add("Expiry", DateTime.UtcNow.AddDays(7).ToString("dd MMM yyyy"));
                HttpContext.Current.Response.SetCookie(funkyCookie);
            }
        }
    }
}