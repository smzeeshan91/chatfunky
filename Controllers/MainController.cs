using ChatApp.Web.Helper;
using ChatApp.Web.Hubs;
using ChatApp.Web.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ChatApp.Web.Controllers
{
    public class MainController : Controller
    {
        private readonly string usernameExists = "The name username is already taken.";
        private readonly string sessionExpired = "Your session has been expired! Please login again.";
        //private readonly string oneInstance = "Only one session can be made via one browser window for specific user!";

        //[OutputCache(Duration = 0, Location = System.Web.UI.OutputCacheLocation.Server, NoStore = true)]
        public ActionResult Home(string logout)
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky: Live Chat | Free Text & Media Messages";
            ViewBag.MetaDescription = "Join the funky network of Chatfunky. Live chat online, send instant text messages, share photos, connect & collaborate with people across the globe.";
            ViewBag.MetaKeywords = "online, chat, online chat, live, live chat, chat room, chatfunky";
            // Meta Tags

            ViewBag.TotalUsers = DBSupport.GetUsersCount();
            ViewBag.Error = TempData["error"];

            // If User press logout button then its clears the user info cookie

            if (logout == "true")
            {
                Response.Cookies["FunkyUser"].Values["Expiry"] = DateTime.UtcNow.AddDays(-1).ToString("dd MMM yyyy");
                return View(new User());
            }

            // Checking if User info cookie exists at first then fetch User information from it and then make him/her automatic login to chatroom
            if (SharedSupport.GetCookieUser() != null && Convert.ToDateTime(Request.Cookies["FunkyUser"].Values["Expiry"]) > DateTime.UtcNow)
            {
                TempData["user"] = SharedSupport.GetCookieUser();
                return RedirectToAction("Chat");
            }
            else
                return View(new User());
        }

        [HttpPost]
        public ActionResult UserForm(User user)
        {
            string webpath = null;
            if (Request.Files.Count > 0 && !string.IsNullOrEmpty(Request.Files[0].FileName))
            {
                HttpPostedFileBase file = Request.Files[0];
                string fname = file.FileName.Substring(file.FileName.LastIndexOf('.'));
                webpath = SharedSupport.SharedImagesPath + user.Username + fname;
                string fileSystemPath = SharedSupport.GetImageFolderPath() + user.Username + fname;
                file.SaveAs(fileSystemPath);
            }
            else if (!string.IsNullOrEmpty(user.SocialProfilePicture))
                webpath = user.SocialProfilePicture;

            TempData["user"] = SharedSupport.FilterUser(user, webpath);
            return RedirectToAction("Chat");
        }

        public ActionResult Chat()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky: Live Chat";
            ViewBag.MetaDescription = "Chatfunky allows you to live chat, communicate with people and make friends online.";
            ViewBag.MetaKeywords = "online, chat, online chat, live, live chat, chat room, public chat, common, common chat, chatfunky";
            // Meta Tags

            ChatUser user = TempData["user"] as ChatUser;
            if (user != null)
            {
                if (DBSupport.GetUser(user) != null)
                {
                    if (SharedSupport.GetCookieUser() == null || (SharedSupport.GetCookieUser() != null &&
                         SharedSupport.GetCookieUser().Id != DBSupport.GetUser(user).Id))
                    {
                        TempData["error"] = usernameExists.Replace("username", user.Username);
                        return RedirectToAction("Home", new { logout = "true" });
                    }
                }
                ViewBag.TotalUsers = DBSupport.GetUsersCount();
                if (SharedSupport.GetCookieUser() != null && DBSupport.GetUser(user) != null)
                    ViewBag.DuplicateTab = SharedSupport.GetCookieUser().Id == DBSupport.GetUser(user).Id ? true : false;
                SharedSupport.SetCookieUser(user);
                return View(user);
            }

            TempData["error"] = Request.UrlReferrer != null ? (HttpContext.Session["usernameError"] != null ?
                                HttpContext.Session["usernameError"].ToString() : sessionExpired) : sessionExpired;
            HttpContext.Session.Remove("usernameError");
            return RedirectToAction("Home");
        }

        public ActionResult Terms()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky: Terms of Service";
            ViewBag.MetaDescription = "Chatfunky terms of service for users.";
            ViewBag.MetaKeywords = "terms, conditions, terms and conditions, service, terms of service, chatfunky";
            // Meta Tags

            ViewBag.TotalUsers = DBSupport.GetUsersCount();

            return View();
        }

        public ActionResult Privacy()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky: Privacy Policy";
            ViewBag.MetaDescription = "Chatfunky privacy policy for users.";
            ViewBag.MetaKeywords = "privacy, policy, privacy policy, chatfunky";
            // Meta Tags

            ViewBag.TotalUsers = DBSupport.GetUsersCount();

            return View();
        }

        public ActionResult SiteMap()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky: Sitemap";
            ViewBag.MetaDescription = "Chatfunky sitemap for users to navigate easily all the links of the website.";
            ViewBag.MetaKeywords = "sitemap, map, chatfunky";
            // Meta Tags

            ViewBag.TotalUsers = DBSupport.GetUsersCount();

            return View();
        }
    }
}