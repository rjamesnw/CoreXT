using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.MVC.Views
{

    /// <summary> Interface for a base view page type.  This is mainly used by the toolkit. </summary>
    public interface IViewPage : IRazorPage
    {
        ViewHelper XT { get; }
        ViewDataDictionary ViewData { get; set; }
        HttpContext Context { get; }
        int NestingingLevel { get; }
        int ActivationSequence { get; }
    }
}
