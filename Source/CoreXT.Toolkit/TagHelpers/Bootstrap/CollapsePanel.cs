using CoreXT.Services.DI;
using CoreXT.Toolkit.TagHelpers;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagHelpers.Bootstrap
{
    /// <summary>
    /// Renders a bootstrap close button - typically for modal windows, alerts, etc.
    /// </summary>
    [HtmlTargetElement(ToolkitComponentPrefix + "collapse-panel")]
    public class CollapsePanel : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        public string ID { get; set; }

        public string ParentID { get; set; }

        public string TargetID { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty link control.
        /// </summary>
        public CollapsePanel(ICoreXTServiceProvider services) : base(services)
        {
        }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "div";
            output.Attributes.SetAttribute("id", ID);
            output.Attributes.SetAttribute("class", "panel-collapse collapse in");
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
