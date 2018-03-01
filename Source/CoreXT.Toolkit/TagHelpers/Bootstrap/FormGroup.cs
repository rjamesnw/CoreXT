﻿using CoreXT.Services.DI;
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
    [HtmlTargetElement(ToolkitComponentPrefix + "form-group")]
    public class FormGroup : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders a bootstrap form group.
        /// </summary>
        public FormGroup(ICoreXTServiceProvider services) : base(services)
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