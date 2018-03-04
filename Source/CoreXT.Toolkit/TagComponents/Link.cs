﻿using CoreXT.MVC;
using CoreXT.Services.DI;
using CoreXT.Toolkit.TagComponents;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.AspNetCore.Routing;
using System;
using System.Threading.Tasks;
using System.Web;

namespace CoreXT.Toolkit.TagComponents.Bootstrap
{
    /// <summary> Renders an input control. Use the 'type' attribute to select the input type. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.WebComponent"/>
    [HtmlTargetElement(ToolkitComponentPrefix + "a")]
    public class Link : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets or sets the 'href' attribute value. </summary>
        /// <value> The 'href' attribute value. </value>
        public string Href { get; set; }

        /// <summary> Something to render immediately after the link start tag. </summary>
        public string Prefix { get; set; }

        /// <summary> Something to render immediately before the end tag. </summary>
        public string Postfix { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Renders a bootstrap form group. </summary>
        /// <param name="services"> The services. </param>
        public Link(ICoreXTServiceProvider services) : base(services)
        {
        }

        /// <summary> Synchronously processes the tag and renders output. </summary>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.CoreXTTagHelper.Process(TagHelperContext,TagHelperOutput)"/>
        public async override Task ProcessAsync()
        {
            if (!await ProcessContent())
            {
                TagOutput.TagName = "a";
                TagOutput.PreContent.SetHtmlContent(RenderContent(Prefix));
                TagOutput.PostContent.SetHtmlContent(RenderContent(Postfix));
                this.SetAttribute("href", Href);
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Something to render immediately after the link start tag.
        /// </summary>
        public Link SetPrefix(string content)
        {
            Prefix = content;
            return this;
        }

        /// <summary>
        /// Something to render immediately before the end tag.
        /// </summary>
        public Link SetPostfix(string content)
        {
            Postfix = content;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
