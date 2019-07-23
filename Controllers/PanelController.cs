using ChatApp.Web.Helper;
using ChatApp.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using System.Web.Mvc;

namespace ChatApp.Web.Controllers
{
    public class PanelController : Controller
    {
        public ActionResult Login()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky - Admin Login";
            // Meta Tags

            if (Session["admin"] != null)
                return RedirectToAction("ModList");
            ViewBag.Error = TempData["error"];
            return View();
        }

        [HttpPost]
        public ActionResult Login(string code)
        {
            if (SharedSupport.MD5Encrypt(code) == "vp??f?????")
            {
                Session["admin"] = true;
                return RedirectToAction("ModList");
            }
            TempData["error"] = "Invalid code entered!";
            return RedirectToAction("Login");
        }

        public ActionResult ModList()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky - Admin Panel";
            // Meta Tags

            if (Session["admin"]!=null)
            {
                IEnumerable<string> mods = DBSupport.GetMods();
                return View(mods);
            }
            return RedirectToAction("Login");
        }

        public ActionResult AddNew()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky - Admin Panel";
            // Meta Tags

            if (Session["admin"] != null)
                return View();
            return RedirectToAction("Login");
        }

        [HttpPost]
        public bool AddNew(Mod mod)
        {
            if (Session["admin"] != null)
                return DBSupport.AddNewMod(mod);
            return false;
        }

        [HttpPost]
        public bool DeleteMod(string modName)
        {
            if (Session["admin"] != null)
                return DBSupport.DeleteMod(modName);
            return false;
        }

        public ActionResult LogOut()
        {
            if (Session["admin"] != null)
            {
                Session.Abandon();
                return RedirectToAction("Login");
            }
            return RedirectToAction("Login");
        }
    }
}