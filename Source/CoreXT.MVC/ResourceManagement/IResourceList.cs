using CoreXT.ASPNet;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace CoreXT.MVC.ResourceManagement
{
    /// <summary>
    /// Contains a list of resources to be rendered.
    /// </summary>
    public interface IResourceList: IEnumerable<ResourceInfo>
    {
        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the request is ignored.
        /// </summary>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environmentName">The environment in which to render the resource.</param>
        ResourceInfo Add(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null, bool debug = false);

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the request is ignored.
        /// </summary>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environment">One or more environments in which to render the resource.</param>
        ResourceInfo Add(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment = Environments.Any, bool debug = false);

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the request is ignored.
        /// </summary>
        /// <param name="name">An name to use to represent this resource.  Typically this should be the file name and extension of the resource (minus any path information).
        /// You can use the other overloaded method to skip adding a name, and the resource path and file name (if any) will be used instead.</param>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environmentName">The environment in which to render the resource.</param>
        ResourceInfo Add(string name, string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null, bool debug = false);

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the request is ignored.
        /// </summary>
        /// <param name="name">An name to use to represent this resource.  Typically this should be the file name and extension of the resource (minus any path information).
        /// You can use the other overloaded method to skip adding a name, and the resource path and file name (if any) will be used instead.</param>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        /// <param name="sequence">The order in which to render the resource in relation to other resources.</param>
        /// <param name="environment">One or more environments in which to render the resource.</param>
        ResourceInfo Add(string name, string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment = Environments.Any, bool debug = false);

        /// <summary>
        /// Adds a resource to be output to the page.
        /// If the resource is already added then the request is ignored.
        /// </summary>
        ResourceInfo Add(ResourceInfo resourceInfo);

        /// <summary>
        /// Find another resource that matches the given resource object.
        /// If no existing resource is a match, then 'null' is returned.
        /// </summary>
        ResourceInfo Find(ResourceInfo resinfo, ActionContext actionContext = null);

        /// <summary>
        /// Find another resource that matches the given resource object given a name and/or resource path.
        /// If no existing resource is found, then 'null' is returned.
        /// </summary>
        /// <param name="actionContext">If supplied, then 'MapPath() will be used to map the resource path to a
        /// file path in order to have a more accurate match.</param>
        ResourceInfo Find(string name, string resourcePath, ActionContext actionContext = null);
    }
}
