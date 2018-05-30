using CoreXT.ASPNet;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.MVC
{
    public class Controller : Microsoft.AspNetCore.Mvc.Controller
    {
        public Uri RequestURL => _RequestURL ?? (_RequestURL = HttpContext.Request.GetUrl());
        Uri _RequestURL;

        protected T GetService<T>() where T : class
        {
            return HttpContext.GetService<T>();
        }
  }
}
