using CoreXT.ASPNet;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.MVC
{
    public class CoreXTBaseController : Controller
    {
        public  T GetService<T>() where T : class
        {
            return HttpContext.GetService<T>();
        }
  }
}
