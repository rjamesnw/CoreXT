using CoreXT.Services.DI;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.MVC.Views
{
    /// <summary>
    ///     A utility class used to render views ('.cshtml' files).
    ///     <para>Note: The razor view engine associated with the application is used to locate the view, so any specified file
    ///     providers are respected. If using embedded file providers, make sure to use base paths that do not have drive/volume
    ///     letters/names.</para>
    /// </summary>
    /// <seealso cref="T:CoreXT.Toolkit.Web.IViewRenderer"/>
    public class ViewRenderer : IViewRenderer
    {
        private readonly ICoreXTServiceProvider _ServiceProvider;

        //x protected RazorViewEngineOptions RazorViewEngineOptions => _RazorViewEngineOptions ?? (_RazorViewEngineOptions = _ServiceProvider.GetService<IOptions<RazorViewEngineOptions>>().Value);
        //x RazorViewEngineOptions _RazorViewEngineOptions;

        protected IServiceProvider ASPServiceProvider => _ASPServiceProvider ?? (_ASPServiceProvider = _ServiceProvider.GetService<IServiceProvider>());
        IServiceProvider _ASPServiceProvider;

        //x protected IHostingEnvironment HostingEnvironment => _HostingEnvironment ?? (_HostingEnvironment = _ServiceProvider.GetService<IHostingEnvironment>());
        //x IHostingEnvironment _HostingEnvironment;

        protected IRazorViewEngine ViewEngine => _ViewEngine ?? (_ViewEngine = _ServiceProvider.GetService<IRazorViewEngine>());
        IRazorViewEngine _ViewEngine;

        protected ITempDataProvider TempDataProvider => _TempDataProvider ?? (_TempDataProvider = _ServiceProvider.GetService<ITempDataProvider>());
        ITempDataProvider _TempDataProvider;

        public ViewRenderer(ICoreXTServiceProvider serviceProvider)
        {
            _ServiceProvider = serviceProvider;
        }

        /// <summary>
        ///     Renders a view asynchronously.
        ///     <para> Note: If 'required' is false, and the view cannot be found, a null string
        ///     will be returned. </para>
        /// </summary>
        /// <exception cref="ArgumentException"> Thrown when one or more arguments have unsupported or illegal values. </exception>
        /// <param name="searchPaths"> The locations to search under (without the filename). </param>
        /// <param name="name"> Name of the view. If no extension is added, then the default '.cshtml' extension is assumed.</param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="onBeforeRender"> (Optional) A callback to trigger just before the view is rendered. </param>
        /// <returns> An asynchronous result that yields the rendered html. </returns>
        public async Task<string> RenderAsync(IEnumerable<string> searchPaths, string name, bool required = true, Action<ViewContext> onBeforeRender = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Cannot be null or empty.", nameof(name));

            return await RenderAsync<string>(searchPaths, name, null, required, onBeforeRender);
        }

        /// <summary>
        ///     Renders a view asynchronously.
        ///     <para> Note: If 'required' is false, and the view cannot be found, a null string
        ///     will be returned. </para>
        /// </summary>
        /// <exception cref="ArgumentException"> Thrown when one or more arguments have unsupported or illegal values. </exception>
        /// <typeparam name="TModel"> Type of the model. </typeparam>
        /// <param name="searchPaths"> The locations to search under (without the filename). </param>
        /// <param name="name"> Name of the view. If no extension is added, then the default '.cshtml' extension is assumed. </param>
        /// <param name="model"> A model to pass to the view. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="onBeforeRender"> (Optional) A callback to trigger just before the view is rendered. </param>
        /// <returns>
        ///     An asynchronous result that yields the rendered html, or null if required is true and the view cannot be found.
        /// </returns>
        /// <seealso cref="M:CoreXT.Toolkit.Web.IViewRenderer.RenderAsync{TModel}(string,string,TModel,bool)"/>
        public async Task<string> RenderAsync<TModel>(IEnumerable<string> searchPaths, string name, TModel model, bool required = true, Action<ViewContext> onBeforeRender = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Cannot be null or empty.", nameof(name));

            var actionContext = GetActionContext();
            var viewEngineResult = _FindView(searchPaths, name, required);
            if (viewEngineResult?.Success != true) return null;
            var view = viewEngineResult.View;

            using (var output = new StringWriter())
            {
                var viewContext = new ViewContext(
                    actionContext,
                    view,
                    new ViewDataDictionary<TModel>(
                        metadataProvider: new EmptyModelMetadataProvider(),
                        modelState: new ModelStateDictionary())
                    {
                        Model = model
                    },
                    new TempDataDictionary(
                        actionContext.HttpContext,
                        TempDataProvider),
                    output,
                    new HtmlHelperOptions());

                onBeforeRender?.Invoke(viewContext);

                await view.RenderAsync(viewContext);

                return output.ToString();
            }
        }

        private ActionContext GetActionContext()
        {
            var httpContext = new DefaultHttpContext { RequestServices = ASPServiceProvider };
            return new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
        }

        ///// <summary> Find a view by a specific path and filename. </summary>
        ///// <param name="filepath"> The filepath. </param>
        ///// <returns> The found view. </returns>
        //x private IFileInfo _FindView(string filepath)
        //{
        //    IFileInfo result = null;
        //    foreach (var fp in RazorViewEngineOptions.FileProviders)
        //    {
        //        result = fp.GetFileInfo(filepath);
        //        if (result?.Exists == true) return result;
        //    }
        //    return result ?? new NotFoundFileInfo(filepath);
        //}

        /// <summary> Using a base path and type name find a view file. </summary>
        /// <exception cref="FileNotFoundException"> Thrown when the requested file is not present. </exception>
        /// <param name="searchPaths"> The locations to search under (without the filename). </param>
        /// <param name="name"> Name of the type to find a nested view for. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <returns> The found view. </returns>
        private ViewEngineResult _FindView(IEnumerable<string> searchPaths, string name, bool required = true)
        {
            List<string> filenames = new List<string>();

            filenames.Add(Path.ChangeExtension(name, "cshtml")); // (put the most likely one first)
            filenames.Add(Path.ChangeExtension(name, "cs.cshtml"));
            filenames.Add(name);

            List<string> locationsSearched = new List<string>();

            ViewEngineResult result = null;

            // ... detect if this is a base path, or path with a file name ...
            // ('GetView()' expects the base path to end with '/', otherwise the last path name will be truncated off)

            var _searchPaths = searchPaths.ToArray();

            for (int i = 0, n = _searchPaths.Length; i < n; ++i)
            {
                var searchPath = _searchPaths[i];

                if (string.IsNullOrWhiteSpace(Path.GetExtension(searchPath)) && !searchPath.EndsWith("/"))
                    searchPath += "/";

                foreach (var filename in filenames)
                {
                    result = ViewEngine.GetView(searchPath, filename, false);
                    if (result.Success)
                        return result;
                    else
                        locationsSearched.AddRange(result.SearchedLocations);
                }
            }

            if (required)
                throw new FileNotFoundException("Failed to find view '" + name + "'. Locations searched: " + Environment.NewLine + " > " + string.Join(Environment.NewLine + " > ", locationsSearched));
            else
                return null;
        }
    }

    /// <summary>
    ///     A utility class used to render views ('.cshtml' files).
    ///     <para>Note: The razor view engine associated with the application is used to locate the view, so any specified file
    ///     providers are respected. If using embedded file providers, make sure to use base paths that do not have drive/volume
    ///     letters/names.</para>
    /// </summary>
    /// <seealso cref="T:CoreXT.Toolkit.Web.ViewRenderer"/>
    public interface IViewRenderer
    {
        /// <summary>
        ///     Renders a view asynchronously.
        ///     <para> Note: If 'required' is false, and the view cannot be found, a null string
        ///     will be returned. </para>
        /// </summary>
        /// <exception cref="ArgumentException"> Thrown when one or more arguments have unsupported or illegal values. </exception>
        /// <param name="searchPaths"> The locations to search under (without the filename). </param>
        /// <param name="name"> Name of the view. If no extension is added, then the default '.cshtml' extension is assumed. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="onBeforeRender"> (Optional) A callback to trigger just before the view is rendered. </param>
        /// <returns> An asynchronous result that yields the rendered html. </returns>
        Task<string> RenderAsync(IEnumerable<string> searchPaths, string name, bool required = true, Action<ViewContext> onBeforeRender = null);

        /// <summary>
        ///     Renders a view asynchronously.
        ///     <para> Note: If 'required' is false, and the view cannot be found, a null string
        ///     will be returned. </para>
        /// </summary>
        /// <exception cref="ArgumentException"> Thrown when one or more arguments have unsupported or illegal values. </exception>
        /// <typeparam name="TModel"> Type of the model. </typeparam>
        /// <param name="searchPaths"> The locations to search under (without the filename). </param>
        /// <param name="name"> Name of the view. If no extension is added, then the default '.cshtml' extension is assumed. </param>
        /// <param name="model"> A model to pass to the view. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="onBeforeRender"> (Optional) A callback to trigger just before the view is rendered. </param>
        /// <returns> An asynchronous result that yields the rendered html. </returns>
        Task<string> RenderAsync<TModel>(IEnumerable<string> searchPaths, string name, TModel model, bool required = true, Action<ViewContext> onBeforeRender = null);
    }
}

// Notes:
//   https://stackoverflow.com/questions/38247080/using-razor-outside-of-mvc-in-net-core
