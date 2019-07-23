using ChatApp.Web.Helper;
using ChatApp.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ChatApp.Web.Controllers
{
    public class ModController : Controller
    {
        private readonly string sessionExpired = "Your session has been expired! Please login again.";

        public ActionResult Mod()
        {
            // Meta Tags
            ViewBag.Title = "Chatfunky - Mod Login";
            // Meta Tags

            ViewBag.TotalUsers = DBSupport.GetUsersCount();

            if (TempData["error"] != null)
                ViewBag.Error = TempData["error"];

            return View(new Mod());
        }

        [HttpPost]
        public ActionResult ModForm(Mod mod)
        {
            TempData["user"] = SharedSupport.FilterMod(mod);

            if (TempData["user"] != null)
            {
                if (DBSupport.ValidateMod(mod))
                {
                    return RedirectToAction("Chat", "Main");
                }
                TempData["error"] = "Invalid Modname or Password!";
                return RedirectToAction("Mod");
            }

            TempData["error"] = Request.UrlReferrer != null ? (HttpContext.Session["usernameError"] != null ?
                                HttpContext.Session["usernameError"].ToString() : sessionExpired) : sessionExpired;
            HttpContext.Session.Remove("usernameError");
            return RedirectToAction("Mod");
        }
	}
}