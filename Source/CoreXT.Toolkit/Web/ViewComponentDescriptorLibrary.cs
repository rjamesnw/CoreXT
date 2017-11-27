using Microsoft.AspNetCore.Mvc.ViewComponents;
using System;
using System.Collections.Generic;

namespace CoreXT.Toolkit.Components
{
    // ########################################################################################################################

    /// <summary>
    /// The default implementation which holds a global registry of CDS control (view component) descriptors.
    /// </summary>
    public class ViewComponentDescriptorLibrary : Dictionary<Type, ViewComponentDescriptor>, IViewComponentDescriptorLibrary
    {
    }

    // ########################################################################################################################
}

// (WebComponent is base on the ViewComponent concepts: https://www.youtube.com/watch?v=zxQBIfwqVoA)

// Special thanks to the original source that helped jump start the controls section:
// https://www.codeproject.com/Articles/32356/Custom-controls-in-ASP-NET-MVC
// The final code, however, is a rewrite specific to CDS purposes (rather than retyping the same typical code). The rewrite
// also focuses on using editor and display templates, rather than hard coding the control designs. This gives more design
// power to developers.
