using CoreXT;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Text.RegularExpressions;

namespace CoreXT.Toolkit.TagHelpers
{
    /// <summary>
    /// By default, for better SEO protection, this tag helper adds a 'rel=nofollow' attribute to prevent search engines
    /// from considering external links towards page ranking, which can be detrimental in cases where public users can
    /// post context (opening up to spamming by bots).
    /// </summary>
    [HtmlTargetElement("a", Attributes = "href")]
    public class NoFollowTagHelper : CoreXTTagHelper
    {
        /// <summary>
        /// This is the pattern template for matching links in order to apply the 'rel=nofollow' attribute on external links.
        /// <para>The process will replace '{DOMAIN}' with the site's actual domain name (or you can hard code it here).</para>
        /// </summary>
        public static string NoFollowMatchPattern = "^[A-Za-z]*?://.*\b{DOMAIN}\b|^/|^[^:]*$";

        public NoFollowTagHelper(IHttpContextAccessor contextAccessor) : base(contextAccessor) { }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            var href = output.Attributes["href"]?.Value.ND().ToLower();
            if (!string.IsNullOrWhiteSpace(href))
            {
                if (!Regex.IsMatch(href, NoFollowMatchPattern.Replace("{DOMAIN}", Request.Host.Host)))
                {
                    output.Attributes.Add("rel", "nofollow"); // (this is not a local site link, so must be external)
                }
            }

            base.Process(context, output);
        }
    }
}

// (http://josephwoodward.co.uk/2016/05/asp-net-core-tag-helpers-with-great-power-comes-great-responsibility)
// (see also: @tagHelperPrefix)
