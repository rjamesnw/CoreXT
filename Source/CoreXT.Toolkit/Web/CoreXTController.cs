using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreXT.MVC
{
    public class CoreXTController : CoreXTBaseController
    {
        public ICoreXTServiceProvider ServiceProvider { get; private set; }

        public CoreXTController(ICoreXTServiceProvider sp)
        {
            ServiceProvider = sp;
        }

        /// <summary>
        /// Get a control with a dummy view context in order to be rendered directly from a controller.
        /// </summary>
        /// <typeparam name="T">The type of control to create.</typeparam>
        /// <param name="controller">The controller to create the control for.</param>
        protected T GetControl<T>() where T : class, IWebComponent
        {
            return ComponentBaseExtensions.GetComponent<T>(this);
        }
    }
}
