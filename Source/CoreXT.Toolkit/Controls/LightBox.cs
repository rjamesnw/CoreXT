using CoreXT.Toolkit.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;

namespace CoreXT.Toolkit.Controls
{
    public class LightBox : ControlBase
    {
        // --------------------------------------------------------------------------------------------------------------------

        public LightBox(IViewPageRenderStack pageRenderStack) : base(pageRenderStack)
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


