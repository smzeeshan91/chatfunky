using ChatApp.Web.Helper;
using ChatApp.Web.Hubs;
using ChatApp.Web.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Filters;
using Microsoft.Web.WebSockets;

namespace ChatApp.Web.WebApi
{
    public class AllowCrossSiteJsonAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            if (actionExecutedContext.Response != null)
                actionExecutedContext.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            base.OnActionExecuted(actionExecutedContext);
        }
    }

    public class AllowCrossSiteJsonMethodsAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            if (actionExecutedContext.Response != null)
                actionExecutedContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST");
            base.OnActionExecuted(actionExecutedContext);
        }
    }

    public class CordovaAPIController : ApiController
    {
        private readonly string usernameExists = "The name username is already taken.";
        private readonly string invalidUsername = "Invalid username or password entered.";

        [HttpGet]
        [AllowCrossSiteJson]
        public bool IsConnected()
        {
            return true;
        }

        [HttpGet]
        [AllowCrossSiteJson]
        public string GetTotalUsers()
        {
            return DBSupport.GetUsersCount().ToString();
        }

        [HttpPost]
        [AllowCrossSiteJson]
        [AllowCrossSiteJsonMethods]
        public string UserSignup(SignupUser data)
        {
            SignupUser filteredSignupUser = SharedSupport.FilterSignupUser(data);

            if (DBSupport.IsSignupUserExist(filteredSignupUser))
                return usernameExists.Replace("username", data.Username);
            else if (DBSupport.SignupNewUser(filteredSignupUser))
                return "True";

            return "False";
        }

        [HttpPost]
        [AllowCrossSiteJson]
        [AllowCrossSiteJsonMethods]
        public string UserForm(SignupUser data)
        {
            SignupUser user = DBSupport.GetSignupUser(data);
            if (user == null)
                return invalidUsername;
            else
            {
                ChatUser chatUser = new ChatUser { Id = user.Id, IsMod = 0, Username = user.Username, Gender = user.Gender, Age = user.Age };
                return JsonConvert.SerializeObject(chatUser);
            }
        }

        [HttpGet]
        [AllowCrossSiteJson]
        [AllowCrossSiteJsonMethods]
        public HttpResponseMessage ConnectWebSockets(string user)
        {
            ChatUser cUser = JsonConvert.DeserializeObject<ChatUser>(user);
            cUser.ConnectionId = string.Empty;
            cUser.Blocks = string.Empty;
            if (HttpContext.Current.IsWebSocketRequest)
            {
                HttpContext.Current.AcceptWebSocketRequest(new ChatSocket(cUser));
                return Request.CreateResponse(HttpStatusCode.SwitchingProtocols);
            }
            return null;
        }

        //Depreciated Method
        private string UserForm(User data)
        {
            string webpath = string.Empty;
            if (!string.IsNullOrEmpty(data.SocialProfilePicture))
            {
                byte[] binaryData = Convert.FromBase64String(data.SocialProfilePicture
                    .Replace("data:image/jpg;base64,", "")
                    .Replace("data:image/jpeg;base64,", "")
                    .Replace("data:image/gif;base64,", "")
                    .Replace("data:image/png;base64,", "")
                    .Replace("data:image/bmp;base64,", "")
                    );

                string slashSubStr = data.SocialProfilePicture.Substring(data.SocialProfilePicture.IndexOf('/') + 1);
                string fileExtension = slashSubStr.Substring(0, slashSubStr.IndexOf(';'));
                webpath = SharedSupport.SharedImagesPath + data.Username + "." + fileExtension;
                string fileSystemPath = SharedSupport.GetImageFolderPath() + data.Username + "." + fileExtension;
                Stream sampleStream = new MemoryStream(binaryData);
                using (FileStream writerStream = File.Open(fileSystemPath, FileMode.Append))
                {
                    Byte[] byteData = new Byte[binaryData.Count()];
                    for (byte i = 0; i < 100; i++)
                    {
                        Int32 readeDataLength = sampleStream.Read(byteData, 0, byteData.Count());
                        writerStream.Write(byteData, 0, readeDataLength);
                    }
                }
            }

            ChatUser filteredUser = SharedSupport.FilterUser(data, webpath);
            if (DBSupport.GetUser(filteredUser) != null)
                return usernameExists.Replace("username", data.Username);

            return JsonConvert.SerializeObject(filteredUser);
        }
    }
}