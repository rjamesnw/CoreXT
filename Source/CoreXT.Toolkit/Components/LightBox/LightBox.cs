using CoreXT.Toolkit.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;
using CoreXT.Services.DI;

namespace CoreXT.Toolkit.Components
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


