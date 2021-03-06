﻿using Microsoft.Extensions.FileProviders;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Primitives;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Collections;
using System.Linq;

namespace CoreXT.FileSystem
{
    /// <summary>
    ///     Looks up files using embedded resources in the specified assembly.
    ///     <para>
    ///       The normal search order goes from 'Assembly 1'-&gt;'Assembly 2'-&gt;'App Static files'.  If the file is found to
    ///       exist locally within the web app file system a "file not found" result will be returned to allow the static file
    ///       to be served.
    ///       </para>
    ///     </Summary>
    /// </summary>
    /// <seealso cref="T:Microsoft.Extensions.FileProviders.IFileProvider"/>
    public class OverridableEmbeddedFileProvider : IFileProvider
    {
        /// <summary>
        /// The assembly associated with this file provider.
        /// </summary>
        public Assembly Assembly { get; }

        /// <summary>
        /// The base namespace that was specified for this file provider.
        /// </summary>
        public string BaseNamespace => _BaseNamespace ?? Assembly.GetName().Name;
        string _BaseNamespace;

        /// <summary>
        /// The hosting environment which is the context in which to search for content files.
        /// </summary>
        public IHostingEnvironment HostingEnvironment { get; }

        EmbeddedFileProvider _EmbeddedFileProvider;

        public static Dictionary<Assembly, string[]> _AssemblyManifestNamesCache = new Dictionary<Assembly, string[]>(); // (mainly for debug purposes)

        /// <summary>
        /// Initializes a new instance of the CoreXT.MVC.CoreXTEmbeddedFileProvider
        /// class using the specified assembly and empty base namespace.
        ///</summary>
        ///<param name="assembly">The assembly that contains the embedded hostingEnvresources.</param>
        public OverridableEmbeddedFileProvider(Assembly assembly, IHostingEnvironment hostingEnvironment)
        {
            Assembly = assembly ?? throw new ArgumentNullException(nameof(assembly));
            _EmbeddedFileProvider = new EmbeddedFileProvider(Assembly);
            HostingEnvironment = hostingEnvironment;
            lock (_AssemblyManifestNamesCache)
            {
                var cacheEntry = _AssemblyManifestNamesCache.Value(assembly);
                if (cacheEntry == null)
                    _AssemblyManifestNamesCache[Assembly] = Assembly.GetManifestResourceNames();
            }
        }

        //
        /// <summary>
        /// Initializes a new instance of the CoreXT.MVC.CoreXTEmbeddedFileProvider
        /// class using the specified assembly and empty base namespace.
        ///</summary>
        ///<param name="assembly">The assembly that contains the embedded resources.</param>
        ///<param name="baseNamespace">The base namespace that contains the embedded resources.</param>
        public OverridableEmbeddedFileProvider(Assembly assembly, string baseNamespace)
        {
            Assembly = assembly ?? throw new ArgumentNullException(nameof(assembly));
            _BaseNamespace = baseNamespace ?? assembly.GetName().Name;
            _EmbeddedFileProvider = new EmbeddedFileProvider(Assembly, BaseNamespace);
            lock (_AssemblyManifestNamesCache)
            {
                var cacheEntry = _AssemblyManifestNamesCache.Value(assembly);
                if (cacheEntry == null)
                    _AssemblyManifestNamesCache[Assembly] = Assembly.GetManifestResourceNames();
            }
        }

        public virtual IDirectoryContents GetDirectoryContents(string subpath)
        {
            var entries = _EmbeddedFileProvider.GetDirectoryContents(subpath);

            return new EnumerableDirectoryContents(entries);
        }

        public virtual IFileInfo GetFileInfo(string subpath)
        {
            if (HostingEnvironment != null) //? && Path.GetFileName(subpath) != "_ViewImports.cshtml")
            {
                // ... if the file is found locally anywhere then abort to allow the user to load the local one instead as an override ...

                var filepath = Path.Combine(HostingEnvironment.ContentRootPath, subpath.TrimStart('/'));
                if (File.Exists(filepath))
                    return new NotFoundFileInfo(filepath);

                filepath = Path.Combine(HostingEnvironment.WebRootPath, subpath.TrimStart('/'));
                if (File.Exists(filepath))
                    return new NotFoundFileInfo(filepath);
            }

            // ... in the embedded context, it's ok to check both roots (in case this is a content request) ...
            // (note: hyphens "-" in directory names are changed to underscores "_" by default, so fix this here; optionally this can be done also: https://goo.gl/zRJtDC)

            var dirPart = Path.GetDirectoryName(subpath).Replace("-", "_").Replace('\\', '.').Replace('/', '.').Trim('.');
            var fileName = Path.GetFileName(subpath);

            var result = _EmbeddedFileProvider.GetFileInfo(string.IsNullOrEmpty(dirPart) ? fileName : dirPart + "." + fileName);
            if (result.Exists) return result;

            // ... try the "wwwroot" folder 1...

            result = _EmbeddedFileProvider.GetFileInfo("wwwroot." + dirPart + "." + fileName);

            if (!result.Exists)
            {
#if DEBUG
                // ... file does not exist, but warn if the file does exist at the end of any existing entry ...

                var cacheEntry = _AssemblyManifestNamesCache.Value(Assembly);

                if (cacheEntry != null && cacheEntry.Length > 0)
                {
                    var fnlower = fileName.ToLower();
                    var similar = cacheEntry.Select(s => new { path = s, lcpath = s.ToLower() }).Where(s => s.lcpath == fnlower || s.lcpath.EndsWith("." + fnlower) || s.lcpath.EndsWith("\\" + fnlower) || s.lcpath.EndsWith("/" + fnlower))
                        .Select(m => m.path).ToArray();
                    if (similar.Length > 0)
                        System.Diagnostics.Debug.WriteLine(" You tried to find an embedded file '" + fileName + "' ('" + subpath + "') in '" + Assembly.FullName + "' using CoreXTEmbeddedFileProvider with base namespace '" + BaseNamespace + "' and the file was not found; however, there IS a similar file under these paths: "
                            + Environment.NewLine + "  > " + string.Join(Environment.NewLine + "  > ", similar) + Environment.NewLine + "  * Double check that your namespace is correct. Also, remember that .Net Core file providers are case SENSITIVE.", "WARNING");
                }
#endif
            }

            return result;
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
            _entries = entries ?? throw new ArgumentNullException(nameof(entries));
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
