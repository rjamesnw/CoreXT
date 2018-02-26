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
using System.Web;

namespace CoreXT.Toolkit.TagHelpers.Bootstrap
{
    [HtmlTargetElement("input-container", ParentTag = "form-group")]
    public class InputContainerTagHelper : CoreXTTagHelper
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The ID for this input. </summary>
        public string InputID { get; set; }

        /// <summary> The label for the control. </summary>
        public string Label { get; set; }

        /// <summary> A help tip for this input. </summary>
        public string Tip { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders a bootstrap form group.
        /// </summary>
        public InputContainerTagHelper(IHttpContextAccessor contextAccessor) : base(contextAccessor)
        {
        }

        private static string _Encode(string value) => HttpUtility.HtmlAttributeEncode(value);

        public async override Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            context.Items[typeof(InputContainerTagHelper)] = this;

            output.TagName = "div";

            if (Label != null)
                output.PreContent.SetHtmlContent(new HtmlString("<label for=\"" + _Encode(InputID) + "\">" + Label + "</label>"));

            var content = await output.GetChildContentAsync();
            output.Content.SetHtmlContent(content);

            if (Tip != null)
                output.PostContent.SetHtmlContent(new HtmlString("<small id=\"" + _Encode(InputID) + "Help\" class=\"form-text text-muted\">" + Tip + "</small>"));

            output.Attributes.SetAttribute("class", "form-control");
            output.TagMode = TagMode.SelfClosing;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
