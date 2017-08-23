using Microsoft.Extensions.FileProviders;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Primitives;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Collections;

namespace CoreXT.MVC
{

    ///<Summary>
    /// Looks up files using embedded resources in the specified assembly. This file
    /// provider is case sensitive.
    /// </Summary>
    public class CoreXTEmbeddedFileProvider : IFileProvider
    {
        EmbeddedFileProvider _EmbeddedFileProvider;
        IHostingEnvironment _HostingEnvironment;

        /// <summary>
        ///     Initializes a new instance of the Microsoft.Extensions.FileProviders.EmbeddedFileProvider
        ///     class using the specified assembly and empty base namespace.
        ///</summary>
        ///<param name="assembly">The assembly that contains the embedded hostingEnvresources.</param>
        public CoreXTEmbeddedFileProvider(Assembly assembly, IHostingEnvironment hostingEnvironment)
        {
            _EmbeddedFileProvider = new EmbeddedFileProvider(assembly);
            _HostingEnvironment = hostingEnvironment;
        }

        //
        /// <summary>
        ///     Initializes a new instance of the Microsoft.Extensions.FileProviders.EmbeddedFileProvider
        ///     class using the specified assembly and empty base namespace.
        ///</summary>
        ///<param name="assembly">The assembly that contains the embedded resources.</param>
        ///<param name="baseNamespace">The base namespace that contains the embedded resources.</param>
        public CoreXTEmbeddedFileProvider(Assembly assembly, string baseNamespace)
        {
            _EmbeddedFileProvider = new EmbeddedFileProvider(assembly, baseNamespace);
        }

        public virtual IDirectoryContents GetDirectoryContents(string subpath)
        {
            var entries = _EmbeddedFileProvider.GetDirectoryContents(subpath);

            return new EnumerableDirectoryContents(entries);
        }

        public virtual IFileInfo GetFileInfo(string subpath)
        {
            if (_HostingEnvironment != null) //? && Path.GetFileName(subpath) != "_ViewImports.cshtml")
            {
                // ... if the file is found locally anywhere then abort to allow the user to load the local one instead as an override ...

                var filepath = Path.Combine(_HostingEnvironment.ContentRootPath, subpath.TrimStart('/'));
                if (File.Exists(filepath))
                    return new NotFoundFileInfo(filepath);

                filepath = Path.Combine(_HostingEnvironment.WebRootPath, subpath.TrimStart('/'));
                if (File.Exists(filepath))
                    return new NotFoundFileInfo(filepath);
            }

            // ... in the embedded context, it's ok to check both roots (in case this is a content request) ...
            // (note: hyphens "-" in directory names are changed to underscores "_" by default, so fix this here; optionally this can be done also: https://goo.gl/zRJtDC)

            var dirPart = Path.GetDirectoryName(subpath).Replace("-", "_").Replace('\\', '.').Replace('/', '.').Trim('.');
            var fileName = Path.GetFileName(subpath);

            var result = _EmbeddedFileProvider.GetFileInfo(string.IsNullOrEmpty(dirPart) ? fileName : dirPart + "." + fileName);
            if (result.Exists) return result;

            return _EmbeddedFileProvider.GetFileInfo("wwwroot." + dirPart + "." + fileName);
        }

        public virtual IChangeToken Watch(string filter)
        {
            return _EmbeddedFileProvider.Watch(filter);
        }
    }

    public class EnumerableDirectoryContents : IDirectoryContents
    {
        private readonly IEnumerable<IFileInfo> _entries;

        public EnumerableDirectoryContents(IEnumerable<IFileInfo> entries)
        {
            if (entries == null)
            {
                throw new ArgumentNullException(nameof(entries));
            }

            _entries = entries;
        }

        public bool Exists
        {
            get { return true; }
        }

        public IEnumerator<IFileInfo> GetEnumerator()
        {
            return _entries.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return _entries.GetEnumerator();
        }
    }
}
