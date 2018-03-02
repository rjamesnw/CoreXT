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
using System.Web;

namespace CoreXT.Toolkit.TagComponents.Bootstrap
{
    /// <summary> Selects the style of a button component. </summary>
    public enum ButtonStyles
    {
        /// <summary> Standard outline button. </summary>
        Default,
        /// <summary> Provides extra visual weight and identifies the primary action in a set of buttons. </summary>
        Primary,
        /// <summary> Indicates a successful or positive action. </summary>
        Success,
        /// <summary> Contextual button for informational alert messages. </summary>
        Info,
        /// <summary> Indicates caution should be taken with this action. </summary>
        Warning,
        /// <summary> Indicates a dangerous or potentially negative action. </summary>
        Danger,
        /// <summary> Deemphasize a button by making it look like a link while maintaining button behavior. </summary>
        Link
    }


    /// <summary> A button component behavior type. </summary>
    public enum ButtonTypes
    {
        /// <summary> A simple button with no default behavior. </summary>
        Button,
        /// <summary> A button with a default behavior of submitting a form. </summary>
        Submit,
        /// <summary> A button with a default behavior of resetting a form. </summary>
        Reset
    }

    /// <summary> Renders an input control. Use the 'type' attribute to select the input type. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.WebComponent"/>
    [HtmlTargetElement(ToolkitComponentPrefix + "button")]
    public class Button : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Selects the style of this button. </summary>
        public ButtonStyles ButtonStyle { get; set; }

        /// <summary> The button behavior type. </summary>
        public ButtonTypes ButtonType { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Renders a bootstrap form group. </summary>
        /// <param name="services"> The services. </param>
        public Button(ICoreXTServiceProvider services) : base(services)
        {
        }

        /// <summary> Synchronously processes the tag and renders output. </summary>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.CoreXTTagHelper.Process(TagHelperContext,TagHelperOutput)"/>
        public async override Task ProcessAsync()
        {
            // ... try rendering any view or explicitly set content first ...
            if (!await ProcessContent(false, (viewContext, childContent) =>
            {
                // ... anything here just before the view is rendered ...
            }))
            {
                //var container = (InputContainer)TagContext.Items[typeof(InputContainer)];
                TagOutput.TagName = "button";
                this.AddClass("btn", "btn-" + PascalNameToAttributeName(ButtonStyle));
                //this.SetAttribute("id", container?.InputID, false); // (override with any container ID, but ONLY if a value is set)
                this.SetAttribute("type", PascalNameToAttributeName(ButtonType));
                /// ... no view, and no content set, so assume finally that this is a normal tag component with possibly other nested components/tags ...
                var content = await TagOutput.GetChildContentAsync();
                TagOutput.Content.SetHtmlContent(content);
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
