using System.Threading.Tasks;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;

namespace CoreXT.Toolkit.Components
{
    public class Label : WebComponent
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

        public Label(ICoreXTServiceProvider sp) : base(sp) { }

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
