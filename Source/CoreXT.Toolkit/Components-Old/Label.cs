using CoreXT.MVC.Components.Old;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components.Old
{
    public class Label : WebViewComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        private string AssociatedControlID
        {
            set { Attributes.MergeString("for", value); }
        }

        protected string Text
        {
            get { return (Content as string) ?? Content?.ToString() ?? string.Empty; }
            private set { Content = value; }
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
