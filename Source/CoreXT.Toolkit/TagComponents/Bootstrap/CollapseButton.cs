using CoreXT.Services.DI;
using CoreXT.Toolkit.TagComponents;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagComponents.Bootstrap
{
    /// <summary>
    /// Renders a bootstrap close button - typically for modal windows, alerts, etc.
    /// </summary>
    [HtmlTargetElement(ToolkitComponentPrefix + "collapse-button")]
    public class CollapseButton : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        public string Href { get; set; }

        public string ParentID { get; set; }

        public string TargetID { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty link control.
        /// </summary>
        public CollapseButton(ICoreXTServiceProvider services) : base(services)
        {
        }

        public override void Process()
        {
            TagName = "a";
            this.SetAttribute("data-toggle", "collapse");
            this.SetAttribute("data-parent", "#" + ParentID);
            this.SetAttribute("href", "#" + TargetID);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
