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
    public class FormGroupTagHelper : CoreXTTagHelper
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders a bootstrap form group.
        /// </summary>
        public FormGroupTagHelper(IHttpContextAccessor contextAccessor) : base(contextAccessor)
        {
        }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "div";
            output.Attributes.SetAttribute("class", "form-group");
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
