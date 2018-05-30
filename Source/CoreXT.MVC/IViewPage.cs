using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.MVC
{
    public interface IViewPage : IRazorPage
    {
        ViewDataDictionary ViewData { get; set; }
        HttpContext Context { get; }
        int NestingingLevel { get; }
        int ActivationSequence { get; }
    }
}
