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
    /// <summary>
    ///     Renders elements around an input control, such as an optional label and help block. Set 'input-id' to the ID to use
    ///     for this input (this overrides the input element's 'id'). Other elements need to know the ID, so this keeps things
    ///     consistent.
    /// </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.WebComponent"/>
    [HtmlTargetElement(ToolkitComponentPrefix + "input-container", ParentTag = ToolkitComponentPrefix + "form-group")]
    public class InputContainer : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The ID for this input. </summary>
        public string InputID { get; set; }

        /// <summary> The label for the control. </summary>
        public string Label { get; set; }

        /// <summary> A help tip for this input. </summary>
        public string HelpMessage { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The type of input (text, date, email, etc.). </summary>
        /// <value> The type. </value>
        [HtmlAttributeNotBound]
        public InputTypes InputType { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders a bootstrap form group.
        /// </summary>
        public InputContainer(ICoreXTServiceProvider services) : base(services)
        {
        }

        public async override Task ProcessAsync()
        {
            var content = await TagOutput.GetChildContentAsync();
            TagOutput.Content.SetHtmlContent(content);

            if (InputType == InputTypes.Checkbox)
            {
                PreContent.SetHtmlContent(new HtmlString("<label for=\"" + EncodeAttribute(InputID) + "\">"));
                PostContent.SetHtmlContent(new HtmlString(EncodeHTML(Label) + "</label>"));
                TagName = "div";
                this.AddClass("checkbox");
            }
            else
            {
                if (Label != null)
                    PreElement.SetHtmlContent(new HtmlString("<label for=\"" + EncodeAttribute(InputID) + "\">" + Label + "</label>"));
            }

            if (HelpMessage != null)
                PostElement.SetHtmlContent(new HtmlString("<small id=\"" + EncodeAttribute(InputID) + "Help\" class=\"form-text text-muted\">" + HelpMessage + "</small>"));
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
