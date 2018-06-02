using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    /// <summary>
    /// Renders a bootstrap close button - typically for modal windows, alerts, etc.
    /// </summary>
    [HtmlTargetElement(ComponentPrefix + "collapse-button")]
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
