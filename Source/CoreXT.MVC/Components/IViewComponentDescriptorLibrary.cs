using Microsoft.AspNetCore.Mvc.ViewComponents;
using System;
using System.Collections.Generic;

namespace CoreXT.MVC.Components
{
    // ########################################################################################################################

    public interface IViewComponentDescriptorLibrary : IDictionary<Type, ViewComponentDescriptor> { }

    // ########################################################################################################################
}
