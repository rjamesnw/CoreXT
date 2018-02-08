using CoreXT.ASPNet;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.MVC
{
    public class CoreXTBaseController : Controller
    {
        public Uri RequestURL => _RequestURL ?? (_RequestURL = HttpContext.Request.GetUrl());
        Uri _RequestURL;

        protected T GetService<T>() where T : class
        {
            return HttpContext.GetService<T>();
        }
  }
}
