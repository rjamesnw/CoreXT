using CoreXT.Toolkit.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CoreXT.Toolkit.Web;

namespace CoreXT.Toolkit.Controls
{
    public class LightBox : ControlBase
    {
        public LightBox(IViewPageRenderStack pageRenderStack) : base(pageRenderStack)
        {
        }

        public LightBox Configure()
        {
            return this;
        }
    }
}


