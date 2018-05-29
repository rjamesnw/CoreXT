using CoreXT.Toolkit.Components;
using CoreXT.ASPNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Hosting;

namespace CoreXT.Toolkit.Web
{
    /// <summary>
    /// Used to render the control resources to the output before sending to the client.
    /// <para>A new instance of this is created once per scope.</para>
    /// </summary>
    public class ContentTagProcessingService : IContentTagProcessingService
    {
        // --------------------------------------------------------------------------------------------------------------------

        IUrlHelperFactory _UrlHelperFactory;
        IActionContextAccessor _ActionContextAccessor;
        IUrlHelper _UrlHelper;
        ActionContext _ActionContext;
        HttpContext _HttpContext;
        IResourceList _ResourceList;
        IHostingEnvironment _HostingEnvironment;

        // --------------------------------------------------------------------------------------------------------------------

        public ContentTagProcessingService(IUrlHelperFactory urlHelperFactory, IActionContextAccessor actionContextAccessor,
            IResourceList resourceList, IHostingEnvironment hostingEnvironment)
        {
            _UrlHelperFactory = urlHelperFactory;
            _ActionContextAccessor = actionContextAccessor;
            _ActionContext = _ActionContextAccessor.ActionContext;
            _HttpContext = _ActionContext.HttpContext;
            _UrlHelper = urlHelperFactory.GetUrlHelper(_ActionContext);
            _ResourceList = resourceList;
            _HostingEnvironment = hostingEnvironment;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public virtual string Process(string input)
        {
            var context = _UrlHelper.ActionContext.HttpContext;

            string headerCSS = "", headerScripts = "", footerScripts = "";

            if (_ResourceList != null)
            {
                // ... iterate over the resource list, in descending order as the start and layout views are always inserted first in sequence,
                // and inner partial views are rendered in view activation order (keeps scripts grouped in order added, and by nested view level) ...

                foreach (var resource in (from r in _ResourceList
                                          where r.IsForThisEnvironment(_HostingEnvironment)
                                          orderby r.Sequence
                                          select r))
                {
                    switch (resource.Type)
                    {
                        case ResourceTypes.Script:
                            if (resource.RenderTarget == RenderTargets.Footer)
                                footerScripts += RenderResourceElement(resource);
                            else
                                headerScripts += RenderResourceElement(resource);
                            break;

                        case ResourceTypes.CSS:
                            headerCSS += RenderResourceElement(resource);
                            break;

                        default:
                            throw new InvalidOperationException("Resource type value is not supported.");
                    }
                }
            }

            input = input.Replace("<COREXT_HEADER_STYLES/>", headerCSS);
            input = input.Replace("<COREXT_HEADER_SCRIPTS/>", headerScripts);
            input = input.Replace("<COREXT_FOOTER_SCRIPTS/>", footerScripts);

            return input;
        }

        // --------------------------------------------------------------------------------------------------------------------

        string _RenderCSS(string uri)
        {
            var tag = new TagBuilder("link");
            tag.Attributes.Add("rel", "stylesheet");
            tag.Attributes.Add("type", "text/css");
            tag.Attributes.Add("href", uri);
            tag.TagRenderMode = TagRenderMode.SelfClosing;
            return tag.Render();
        }

        string _RenderScript(string uri)
        {
            var tag = new TagBuilder("script");
            tag.Attributes.Add("type", "text/javascript");
            tag.Attributes.Add("src", uri);
            return tag.Render();
        }

        public virtual string RenderResourceElement(ResourceInfo resource)
        {
            var text = string.Empty;
            var fallbackTestExpr = resource.FallbackTestExpression;
            string fallbackElement = null;

            switch (resource.Type)
            {
                case ResourceTypes.CSS:
                    text = _RenderCSS(resource.GetURI(_UrlHelper));

                    if (!string.IsNullOrWhiteSpace(resource.FallbackPath))
                    {
                        if (!string.IsNullOrWhiteSpace(resource.FallbackTestClass))
                            text += Environment.NewLine + "<meta name=\"x-stylesheet-fallback-test\" class=\"" + resource.FallbackTestClass + "\" />";

                        if (fallbackTestExpr == null)
                            fallbackTestExpr = @"(function (a, b, c) { var e = _d.getElementsByTagName('meta'), meta = e[e.length-1]; return _d.defaultView.getComputedStyle(meta)[a] === b;})('" + resource.FallbackTestProperty + @"', '" + resource.FallbackTestPropertyValue + @"', '" + resource.FallbackPath + @"')";

                        fallbackElement = _RenderCSS(resource.GetFallbackURI(_UrlHelper));
                    }
                    break;

                case ResourceTypes.Script: // (or Scripts.Render() can be used)
                    text = _RenderScript(resource.GetURI(_UrlHelper));

                    if (!string.IsNullOrWhiteSpace(resource.FallbackPath))
                        fallbackElement = _RenderScript(resource.GetFallbackURI(_UrlHelper));
                    break;

                default:
                    throw new InvalidOperationException("ResourceInfo: Invalid resource type value for URI '" + resource.Path + "'.");
            }

            if (!string.IsNullOrWhiteSpace(text))
            {
                text += Environment.NewLine;

                if (!string.IsNullOrEmpty(fallbackTestExpr) && !string.IsNullOrEmpty(fallbackElement))
                {
                    text += @"
<script>
    (function () {
        var _d = document, test = (" + fallbackTestExpr + @");
        (test || _d.write('" + fallbackElement.Replace("<", "\\u003c").Replace(">", "\\u003e") + @"'));
    })();
</script>
" + Environment.NewLine;
                }
            }

            return text ?? string.Empty;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
