using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    public class Link : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        public string Href
        {
            get { return GetAttribute("href"); }
            set { SetAttribute("href", value); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty link control.
        /// </summary>
        public Link(ICoreXTServiceProvider sp) : base(sp)
        {
        }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a link control for rendering on a web view page.
        /// </summary>
        /// <param name="page"></param>
        /// <param name="text"></param>
        /// <param name="href"></param>
        public Link Configure(string text, string href)
        {
            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentException("Value cannot be null, empty, or whitespace.", "text");

            InnerHtml = text;

            Href = UrlHelper.Content(href);

            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
