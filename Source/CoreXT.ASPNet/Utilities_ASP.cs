using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

namespace CoreXT.ASPNet
{
    public static class Utilities_ASP
    {

        // --------------------------------------------------------------------------------------------------------------------

        public static string StripHTMLTags(string text)
        {
            return WebUtility.HtmlDecode(Regex.Replace(text, @"(<[^>]+>)", "")); //Regex.Replace(, @"&[^;]+?;", " ");
        }


        // --------------------------------------------------------------------------------------------------------------------
    }
}
