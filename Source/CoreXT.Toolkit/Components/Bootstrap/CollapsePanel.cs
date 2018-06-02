using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    /// <summary>
    /// Renders a bootstrap close button - typically for modal windows, alerts, etc.
    /// </summary>
    [HtmlTargetElement(ComponentPrefix + "collapse-panel")]
    public class CollapsePanel : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        public string ParentID { get; set; }

        public string TargetID { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty link control.
        /// </summary>
        public CollapsePanel(ICoreXTServiceProvider services) : base(services)
        {
        }

        public override void Process()
        {
            TagName = "div";
            this.SetAttribute("id", ID);
            this.SetAttribute("class", "panel-collapse collapse in");
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
