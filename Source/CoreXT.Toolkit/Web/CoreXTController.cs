using CoreXT.ASPNet;
using CoreXT.Toolkit.Controls;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.MVC
{
    public class CoreXTController : CoreXTBaseController
    {
        /// <summary>
        /// Get a control with a dummy view context in order to be rendered directly from a controller.
        /// </summary>
        /// <typeparam name="T">The type of control to create.</typeparam>
        /// <param name="controller">The controller to create the control for.</param>
        public T GetControl<T>() where T : class, IControlBase
        {
            return ControlBaseExtensions.GetControl<T>(this);
        }
    }
}
