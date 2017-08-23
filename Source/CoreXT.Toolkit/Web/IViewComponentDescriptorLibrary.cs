using Microsoft.AspNetCore.Mvc.ViewComponents;
using System;
using System.Collections.Generic;

namespace CoreXT.Toolkit.Controls
{
    // ########################################################################################################################

    public interface IViewComponentDescriptorLibrary : IDictionary<Type, ViewComponentDescriptor> { }

    // ########################################################################################################################
}
