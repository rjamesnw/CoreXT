using Microsoft.AspNetCore.Html;
using System;
using System.Globalization;
using System.Net;
using System.Threading;

namespace CoreXT.Toolkit.Utility
{
    public static class LocalizationHelper //?
    {
        [Obsolete("specifying the language through <meta http-equiv=\"content-language\" content= > is obsolete. Use <html lang=> instead")]
        public static IHtmlContent MetaContentLanguage(this IHtmlContent html)
        {
            var acceptLang = WebUtility.UrlEncode(CultureInfo.CurrentUICulture.ToString());
            return new HtmlString(string.Format("<meta http-equiv=\"content-language\" content=\"{0}\"/>", acceptLang));
        }

        public static string Lang
        {
            get
            {
                return WebUtility.UrlEncode(CultureInfo.CurrentUICulture.ToString());
            }
        }
    }
}
