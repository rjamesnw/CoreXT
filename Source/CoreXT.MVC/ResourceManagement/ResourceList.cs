using CoreXT.ASPNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Collections;

namespace CoreXT.MVC.ResourceManagement
{

    // ########################################################################################################################

    /// <summary>
    /// Contains a list of resources to be rendered.
    /// </summary>
    public class ResourceList : IResourceList // TODO: Consider implementing a custom IDictionary<string, ResourceInfo>, instead of just relying on Add().
    {
        // --------------------------------------------------------------------------------------------------------------------

        List<ResourceInfo> _Resources = new List<ResourceInfo>();

        ActionContext _ActionContext;

        public ResourceList(IActionContextAccessor actionContextAccessor)
            : this(actionContextAccessor.ActionContext)
        {
        }
        public ResourceList(ActionContext actionContext)
        {
            _ActionContext = actionContext ?? throw new ArgumentNullException("actionContext");
        }

        // --------------------------------------------------------------------------------------------------------------------

        bool _AlreadyAdded(string name, string fileLocation)
        {
            return _Resources.Any(r => r.Equals(null, fileLocation, _ActionContext));
        }

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the matching resource is returned instead.
        /// </summary>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environmentName">The environment in which to render the resource.</param>
        /// <param name="debug">If true, outputs debug information as comments during rendering, otherwise nothing is output.</param>
        /// <returns>An existing resource if one matches, or a new resource if not.</returns>
        public virtual ResourceInfo Add(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null, bool debug = false)
        {
            // ... check if this exists first ...

            var resinfo = Find(null, resourcePath, _ActionContext);
            if (resinfo == null)
                _Resources.Add(resinfo = new ResourceInfo(resourcePath, resourceType, renderTarget, sequence, environmentName, debug));

            return resinfo;
        }

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the matching resource is returned instead.
        /// </summary>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environment">One or more environments in which to render the resource.</param>
        /// <param name="debug">If true, outputs debug information as comments during rendering, otherwise nothing is output.</param>
        /// <returns>An existing resource if one matches, or a new resource if not.</returns>
        public virtual ResourceInfo Add(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment = Environments.Any, bool debug = false)
        {
            // ... check if this exists first ...

            var resinfo = Find(null, resourcePath, _ActionContext);
            if (resinfo == null)
                _Resources.Add(resinfo = new ResourceInfo(resourcePath, resourceType, renderTarget, sequence, environment, debug));

            return resinfo;
        }

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the matching resource is returned instead.
        /// </summary>
        /// <param name="name">An name to use to represent this resource.  Typically this should be the file name and extension of the resource (minus any path information).
        /// You can use the other overloaded method to skip adding a name, and the resource path and file name (if any) will be used instead.</param>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environmentName">The environment in which to render the resource.</param>
        /// <param name="debug">If true, outputs debug information as comments during rendering, otherwise nothing is output.</param>
        /// <returns>An existing resource if one matches, or a new resource if not.</returns>
        public virtual ResourceInfo Add(string name, string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null, bool debug = false)
        {
            // ... check if this exists first ...

            var resinfo = Find(name, resourcePath, _ActionContext);
            if (resinfo == null)
                _Resources.Add(resinfo = new ResourceInfo(resourcePath, resourceType, renderTarget, sequence, environmentName, debug));

            return resinfo;
        }

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the matching resource is returned instead.
        /// </summary>
        /// <param name="name">An name to use to represent this resource.  Typically this should be the file name and extension of the resource (minus any path information).
        /// You can use the other overloaded method to skip adding a name, and the resource path and file name (if any) will be used instead.</param>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environment">One or more environments in which to render the resource.</param>
        /// <param name="debug">If true, outputs debug information as comments during rendering, otherwise nothing is output.</param>
        /// <returns>An existing resource if one matches, or a new resource if not.</returns>
        public virtual ResourceInfo Add(string name, string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment = Environments.Any, bool debug = false)
        {
            // ... check if this exists first ...

            var resinfo = Find(name, resourcePath, _ActionContext);
            if (resinfo == null)
                _Resources.Add(resinfo = new ResourceInfo(resourcePath, resourceType, renderTarget, sequence, environment, debug));

            return resinfo;
        }

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the request is merged.
        /// </summary>
        public ResourceInfo Add(ResourceInfo resourceInfo)
        {
            // ... check if this exists first ...

            var resinfo = Find(resourceInfo, _ActionContext);
            if (resinfo == null)
                _Resources.Add(resinfo = resourceInfo);
            else
                resinfo.CopyFrom(resourceInfo);

            return resinfo;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Find another resource that matches the given resource object.
        /// If no existing resource is a match, then 'null' is returned.
        /// </summary>
        public ResourceInfo Find(ResourceInfo resinfo, ActionContext actionContext = null)
        {
            return _Resources.Where(r => r.Equals(resinfo, actionContext)).FirstOrDefault();
        }

        /// <summary>
        /// Find another resource that matches the given resource object given a name and/or resource path.
        /// If no existing resource is found, then 'null' is returned.
        /// </summary>
        /// <param name="actionContext">If supplied, then 'MapPath() will be used to map the resource path to a
        /// file path in order to have a more accurate match.</param>
        public ResourceInfo Find(string name, string resourcePath, ActionContext actionContext = null)
        {
            return _Resources.Where(r => r.Equals(name, resourcePath, actionContext)).FirstOrDefault();
        }

        // --------------------------------------------------------------------------------------------------------------------

        public IEnumerator<ResourceInfo> GetEnumerator()
        {
            return ((IEnumerable<ResourceInfo>)_Resources).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return _Resources.GetEnumerator();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################
}
