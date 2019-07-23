using ChatApp.Web.Helper;
using ChatApp.Web.Hubs;
using ChatApp.Web.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using Microsoft.Web.WebSockets;
using Newtonsoft.Json;

namespace ChatApp.Web.WebApi
{
    public class GlobalAPIController : ApiController
    {
        [System.Web.Http.HttpPost]
        public void FormSubmission(Form formData)
        {
            string fromEmail = System.Configuration.ConfigurationManager.AppSettings["Email"];
            string password = System.Configuration.ConfigurationManager.AppSettings["Password"];
            string smtpClient = System.Configuration.ConfigurationManager.AppSettings["SMTPClient"];
            int port = Convert.ToInt32(System.Configuration.ConfigurationManager.AppSettings["Port"]);

            string body = "<h3>From: " + formData.Email + "</h3><p>" + formData.Message.Replace("\n\n", "<br />").Replace("\n", "<br />") + "</p>";
            MailMessage mail = new MailMessage(fromEmail, fromEmail, "New Feedback from User!", body);
            using (SmtpClient smtpServer = new SmtpClient(smtpClient, port))
            {
                mail.IsBodyHtml = true;
                smtpServer.Credentials = new System.Net.NetworkCredential(fromEmail, password);
                smtpServer.EnableSsl = true;
                smtpServer.Send(mail);
            }
        }

        public bool IsConnected()
        {
            return true;
        }

        [System.Web.Http.HttpGet]
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
    }

    public class GlobalController : Controller
    {
        [System.Web.Mvc.HttpPost]
        public void DeleteReconnectingUser(string username)
        {
            ChatUser currentUser = DBSupport.GetUser(new ChatUser { Username = username });
            if (currentUser == null)
            {
                username = HttpContext.Request.Cookies["FunkyUser"].Value.Substring(0, HttpContext.Request.Cookies["FunkyUser"].Value.IndexOf('&'));
                username = username.Substring(username.IndexOf('=') + 1);
                currentUser = DBSupport.GetUser(new ChatUser { Username = username });
            }
            DBSupport.DeleteUser(username);
            IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<Chat>();
            hubContext.Clients.All.userLeft(currentUser.Username);
            hubContext.Clients.All.totalUsers(DBSupport.GetUsersCount());
            hubContext.Clients.All.dcUserSessions(currentUser.Username);
        }

        [System.Web.Mvc.HttpPost]
        public string SaveSharedImage()
        {
            string filePath = null;
            if (!string.IsNullOrEmpty(Request.Files[0].FileName))
            {
                HttpPostedFileBase file = Request.Files[0];
                string ext = file.FileName.Substring(file.FileName.LastIndexOf('.'));
                string imageName = "Image_" + DateTime.Now.Ticks + ext;
                filePath = SharedSupport.SharedImagesPath + imageName;
                string webpath = SharedSupport.GetImageFolderPath() + imageName;
                file.SaveAs(webpath);
            }
            return filePath;
        }

        [System.Web.Mvc.HttpPost]
        public string UploadAudio()
        {
            string mp3 = null;
            string filePath = null;

            if (!string.IsNullOrEmpty(Request.Files[0].FileName))
            {
                HttpPostedFileBase file = Request.Files[0];
                BinaryReader b = new BinaryReader(file.InputStream);
                byte[] binData = b.ReadBytes(Convert.ToInt32(file.InputStream.Length));
                mp3 = System.Text.Encoding.UTF8.GetString(binData);
                byte[] binaryData = Convert.FromBase64String(mp3.Replace("data:audio/mp3;base64,", ""));
                Stream sampleStream = new MemoryStream(binaryData);
                string audioName = "Audio_" + DateTime.Now.Ticks + ".mp3";
                filePath = SharedSupport.SharedAudiosPath + audioName;
                string webpath = SharedSupport.GetAudioFolderPath() + audioName;
                using (FileStream writerStream = System.IO.File.Open(webpath, FileMode.CreateNew))
                {
                    Byte[] data = new Byte[binaryData.Count()];
                    for (byte i = 0; i < 100; i++)
                    {
                        Int32 readeDataLength = sampleStream.Read(data, 0, data.Count());
                        writerStream.Write(data, 0, readeDataLength);
                    }
                }
            }
            return filePath;
        }
    }
}