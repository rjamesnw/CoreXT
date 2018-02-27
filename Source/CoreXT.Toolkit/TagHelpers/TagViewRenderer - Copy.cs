using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Razor.Language;
using Microsoft.AspNetCore.Razor.Language.Extensions;
using Microsoft.AspNetCore.Routing;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.ObjectPool;
using Microsoft.Extensions.Options;

namespace CoreXT.Toolkit.TagHelpers
{
    public class ViewRenderer : IViewRender
    {
        private readonly ICoreXTServiceProvider _ServiceProvider;

        protected RazorViewEngineOptions RazorViewEngineOptions => _RazorViewEngineOptions ?? (_RazorViewEngineOptions = _ServiceProvider.GetService<IOptions<RazorViewEngineOptions>>().Value);
        RazorViewEngineOptions _RazorViewEngineOptions;

        protected IServiceProvider ASPServiceProvider => _ASPServiceProvider ?? (_ASPServiceProvider = _ServiceProvider.GetService<IServiceProvider>());
        IServiceProvider _ASPServiceProvider;

        protected IHostingEnvironment HostingEnvironment => _HostingEnvironment ?? (_HostingEnvironment = _ServiceProvider.GetService<IHostingEnvironment>());
        IHostingEnvironment _HostingEnvironment;

        public ViewRenderer(ICoreXTServiceProvider serviceProvider)
        {
            _ServiceProvider = serviceProvider;
        }

        public async Task<IHtmlContent> RenderAsync(string name)
        {
            return await RenderAsync<object>(name, null);
        }

        public async Task<IHtmlContent> RenderAsync<TModel>(string name, TModel model)
        {
        }

        private ActionContext GetActionContext()
        {
            var httpContext = new DefaultHttpContext { RequestServices = ASPServiceProvider };
            return new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
        }

        /// <summary> Find a view by a specific path and filename. </summary>
        /// <param name="filepath"> The filepath. </param>
        /// <returns> The found view. </returns>
        private IFileInfo _FindView(string filepath)
        {
            IFileInfo result = null;
            foreach (var fp in RazorViewEngineOptions.FileProviders)
            {
                result = fp.GetFileInfo(filepath);
                if (result?.Exists == true) return result;
            }
            return result ?? new NotFoundFileInfo(filepath);
        }

        /// <summary> Using a base path and type name find a view file. </summary>
        /// <exception cref="FileNotFoundException"> Thrown when the requested file is not present. </exception>
        /// <param name="basePath"> Full pathname of the base path to search under. </param>
        /// <param name="typeName"> Name of the type to find a nested view for. </param>
        /// <param name="foundFilePath"> [out] Full pathname of the found file. </param>
        /// <returns> The found view. </returns>
        private IFileInfo _FindView(string basePath, string typeName, out string foundFilePath)
        {
            List<string> filePathsChecked = new List<string>();
            var filepath = Path.Combine(basePath, Path.ChangeExtension(typeName, "cshtml")); // (in most cases this will be the name, so it is normally faster to assume this first)
            var fileInfo = _FindView(filepath);
            if (!fileInfo.Exists)
            {
                filePathsChecked.Add(filepath);
                filepath = Path.Combine(basePath, typeName);
                if (!fileInfo.Exists)
                {
                    filePathsChecked.Add(filepath);
                    throw new FileNotFoundException("Failed to find view '" + filepath + "'. Locations searched: " + Environment.NewLine + " > " + string.Join(Environment.NewLine + " > ", filePathsChecked));
                }
            }
            foundFilePath = filepath;
            return fileInfo;
        }

        private void _Init(string templateNamespace, string typeName, string basePath)
        {
            if (string.IsNullOrWhiteSpace(templateNamespace))
                throw new ArgumentNullException(nameof(templateNamespace), "Cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(typeName))
                throw new ArgumentNullException(nameof(typeName), "Cannot be null or empty.");

            // customize the default engine a little bit
            var engine = RazorEngine.Create(b =>
            {
                InheritsDirective.Register(b); // make sure the engine understand the @inherits directive in the input templates
                FunctionsDirective.Register(b); // make sure the engine understand the @function directive in the input templates
                SectionDirective.Register(b); // make sure the engine understand the @section directive in the input templates
                b.SetNamespace(templateNamespace); // define a namespace for the Template class
                b.Build();
            });

            var project = RazorProject.Create(HostingEnvironment.ContentRootPath);
            var templateEngine = new RazorTemplateEngine(engine, project);
            
            // get a razor-templated file. My "hello.txt" template file is defined like this:
            //
            // @inherits RazorTemplate.MyTemplate
            // Hello @Model.Name, welcome to Razor World!
            //

            var fileInfo = _FindView(typeName, basePath, out var filepath);

            // ... parse and generate C# code ...
            var codeDoc = RazorCSharpDocument.Create();
             var cs = templateEngine.GenerateCode(codeDoc);

            // ... use roslyn to parse the C# code ...
            // 
            var tree = CSharpSyntaxTree.ParseText(cs.GeneratedCode);

            // ... name the assembly ...
            // 
            string dllName = templateNamespace + "." + typeName;

            var compilation = CSharpCompilation.Create(dllName, new[] { tree },
                new[]
                {
                    MetadataReference.CreateFromFile(typeof(object).Assembly.Location), // include corlib
                    MetadataReference.CreateFromFile(Assembly.GetExecutingAssembly().Location), // this file (that contains the MyTemplate base class)

                    // for some reason on .NET core, I need to add this... this is not needed with .NET framework
                    MetadataReference.CreateFromFile(Path.Combine(Path.GetDirectoryName(typeof(object).Assembly.Location), "System.Runtime.dll")),

                    // as found out by @Isantipov, for some other reason on .NET Core for Mac and Linux, we need to add this... this is not needed with .NET framework
                    MetadataReference.CreateFromFile(Path.Combine(Path.GetDirect‌​oryName(typeof(object).Assembly.Location‌​), "netstandard.dll")‌​)
                },
                new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)); // we want a dll

            // compile the dll
            //string path = Path.Combine(Path.GetFullPath("."), dllName + ".dll");
            var output = new MemoryStream();
            var result = compilation.Emit(output);
            if (!result.Success)
            {
                var msg = string.Join(Environment.NewLine, result.Diagnostics);
                throw new InvalidOperationException("Failed to compile '" + typeName + "': " + Environment.NewLine + msg);
            }

            // load the built dll
            Console.WriteLine(path);
            var asm = Assembly.LoadFile(path);

            // the generated type is defined in our custom namespace, as we asked. "Template" is the type name that razor uses by default.
            var template = (MyTemplate)Activator.CreateInstance(asm.GetType("MyNamespace.Template"));

            // run the code.
            // should display "Hello Killroy, welcome to Razor World!"
            template.ExecuteAsync().Wait();
        }
    }

    public interface IViewRender
    {
        Task<IHtmlContent> RenderAsync(string name);

        Task<IHtmlContent> RenderAsync<TModel>(string name, TModel model);
    }

    class Program
    {
    }

    // the model class. this is 100% specific to your context
    public class MyModel
    {
        // this will map to @Model.Name
        public string Name => "Killroy";
    }

    // the sample base template class. It's not mandatory but I think it's much easier.
    public abstract class MyTemplate
    {
        // this will map to @Model (property name)
        public MyModel Model => new MyModel();

        public void WriteLiteral(string literal)
        {
            // replace that by a text writer for example
            Console.Write(literal);
        }

        public void Write(object obj)
        {
            // replace that by a text writer for example
            Console.Write(obj);
        }

        public async virtual Task ExecuteAsync()
        {
            await Task.Yield(); // whatever, we just need something that compiles...
        }
    }
}

// Notes:
//   https://stackoverflow.com/questions/38247080/using-razor-outside-of-mvc-in-net-core
