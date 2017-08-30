using System.Threading.Tasks;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;

namespace CoreXT.Toolkit.Controls
{
    public class Label : ControlBase
    {
        // --------------------------------------------------------------------------------------------------------------------

        private string AssociatedControlID
        {
            set { Attributes.MergeString("for", value); }
        }

        protected string Text
        {
            get { return InnerHtml; }
            private set { InnerHtml = value; }
        }

        // --------------------------------------------------------------------------------------------------------------------

        public Label(IViewPageRenderStack pageRenderStack) : base(pageRenderStack) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        public Label Configure(string associatedControlID, string text)
        {
            AssociatedControlID = associatedControlID;
            Text = text;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
