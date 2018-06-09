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
using CoreXT.Toolkit.Components;
using CoreXT.ASPNet;
using CoreXT.Demos.Models;
using CoreXT.Models;

namespace CoreXT.Demos.Controllers
{
    public class HomeController : CoreXTController
    {
        CoreXTDemoAppSettings _AppSettings;

        public HomeController(ICoreXTServiceProvider sp) : base(sp)
        {
            _AppSettings = ServiceProvider.GetCoreXTDemoAppSettings();
        }

        public IActionResult Index()
        {
            //var context = ServiceProvider.GetCoreXTDemoReadOnlyContext();
            //context.Database.EnsureCreated(); // (this is code-first related - if the database doesn't exist, the system will try to create it using the entity classes and configurations, along with the )
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
            //var context = GetService<ICoreXTDemoContext>();
            //context.Database.EnsureCreated(); // (this is code-first related - if the database doesn't exist, the system will try to create it using the entity classes and the configurations I put on them)

            return View();
        }

        public JsonResult GetJSONDataExample()
        {
            return Json("");
        }
    }
}
