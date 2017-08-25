using CoreXT.Services.DI;
using CoreXT.MVC;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CoreXT.Toolkit.Controls;
using CoreXT.ASPNet;

namespace OneCMS.Controllers
{
    interface ICdsController
    {
        //IActionResult GetConfirmView(string action_link, string message, string type, string data_target);
        IActionResult GetEditView(int id, string data_target, string return_url);
    }

    public class HomeController : CoreXTController
    {
        CDSAppSettings _AppSettings;

        public HomeController(ICoreXTServiceProvider sp) : base(sp)
        {
            _AppSettings = ServiceProvider.GetCDSSettings();
        }

        public IActionResult Index()
        {
            var context = ServiceProvider.GetCDSReadOnlyContext();
            context.Database.EnsureCreated(); // (this is code-first related - if the database doesn't exist, the system will try to create it using the entity classes and configurations, along with the )
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }

        public IActionResult ControlDemos()
        {
            var context = GetService<ICDSContext>();
            context.Database.EnsureCreated(); // (this is code-first related - if the database doesn't exist, the system will try to create it using the entity classes and the configurations I put on them)
            var apps = context.Applications.Include("Subscription_Models_Applications_Maps.SubscriptionModel").ToArray();
            var subMods = apps[0].SubscriptionModels.ToArray();

            return View();
        }

        public JsonResult GetJSONDataExample()
        {
            return Json("");
        }
    }
}
