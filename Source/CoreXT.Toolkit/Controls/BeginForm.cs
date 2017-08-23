using System;
using System.IO;

namespace CoreXT.Toolkit.Controls
{
    public class BeginForm : ControlBase
    {
        public string Action
        {
            set { Attributes.MergeString("action", value); }
        }

        public string ActionName { protected get; set; }

        public string ControllerName { protected get; set; }

        public FormMethod Method
        {
            set { Attributes.MergeString("method", HtmlHelper.GetFormMethodString(value)); }
        }

        public object Values { protected get; set; }

        public BeginForm(ViewContext viewContext)
            : base("form", TagRenderMode.StartTag, viewContext)
        {
            if (viewContext == null)
            {
                throw new ArgumentNullException("viewContext");
            }

            UrlHelper urlHelper = new UrlHelper(new RequestContext(viewContext.HttpContext, viewContext.RouteData));
            Attributes.MergeString("action", urlHelper.GenerateUrl(null /* routeName */, ActionName, ControllerName, new RouteValueDictionary(Values)));

            Method = FormMethod.Post;
        }
    }
}
