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
using System.Web;

namespace CoreXT.Toolkit.TagHelpers.Bootstrap
{
    [HtmlTargetElement("input-box", ParentTag = "input-container", TagStructure = TagStructure.WithoutEndTag)]
    public class InputBoxTagHelper : CoreXTTagHelper
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> A name for this input. </summary>
        public string Name { get; set; }

        /// <summary> The type of input (text, date, email, etc.). </summary>
        public string Type { get; set; }

        /// <summary> Gets or sets the label. </summary>
        public string PlaceHolder { get; set; }

        /// <summary> An initial value for this input. </summary>
        public string Value { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders a bootstrap form group.
        /// </summary>
        public InputBoxTagHelper(ICoreXTServiceProvider services) : base(services)
        {
        }

        private static string _Encode(string value) => HttpUtility.HtmlAttributeEncode(value);

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {

            var container = (InputContainerTagHelper)context.Items[typeof(InputContainerTagHelper)];
            output.TagName = "input";
            output.Attributes.SetAttribute("id", container.InputID);
            output.Attributes.SetAttribute("name", Name);
            output.Attributes.SetAttribute("type", Type);
            output.Attributes.SetAttribute("aria-describedby", container.InputID + "Help");
            output.Attributes.SetAttribute("class", "form-control");
            output.Attributes.SetAttribute("placeholder", PlaceHolder);
            output.Attributes.SetAttribute("value", Value);
            output.TagMode = TagMode.SelfClosing;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
