using CoreXT.MVC.Components.Old;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components.Old
{
    public class LightBox : WebViewComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        public LightBox(ICoreXTServiceProvider sp) : base(sp)
        {
        }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        public LightBox Configure()
        {
            return this;
        }
       
        // --------------------------------------------------------------------------------------------------------------------
    }
}


