using Microsoft.Extensions.FileProviders;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Primitives;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Collections;
using System.Linq;

namespace CoreXT.MVC
{
    // ########################################################################################################################

    public class VirtualFileInfo : MemoryStream, IFileInfo
    {
        // --------------------------------------------------------------------------------------------------------------------

        public bool Exists => true;

        public string PhysicalPath { get; internal set; }

        public string Name { get; internal set; }

        public DateTimeOffset LastModified { get; internal set; }

        public bool IsDirectory { get; internal set; }

        public Stream CreateReadStream() => this;

        // --------------------------------------------------------------------------------------------------------------------

        protected override void Dispose(bool disposing) { } // (this is a memory file system, do nothing)

        internal void _Dispose() => base.Dispose(true);

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################\

    public class DirectoryNode
    {
        /// <summary> The sub directories to this directory entry. </summary>
        public readonly Dictionary<string, DirectoryNode> SubDirectories = new Dictionary<string, DirectoryNode>();

        /// <summary> Gets a directory using a slash-delimited path ('/' or '\' will work). </summary>
        /// <param name="path"> Full path of the file directory. </param>
        /// <returns> The directory if found, or null otherwise. </returns>
        public DirectoryNode GetDirectory(string path)
        {
            var names = path?.Trim().Split('/', '\\') ?? new string[0];
            var d = this;
            foreach (var name in names)
            {
                d = d.SubDirectories.Value(name.Trim());
                if (d == null) return null; // (not found)
            }
            return d;
        }
    }

    // ########################################################################################################################\

    ///<Summary>
    /// Looks up files using embedded resources in the specified assembly. This file
    /// provider is case sensitive.
    /// </Summary>
    public class VirtualFileProvider : IFileProvider
    {
        public static Dictionary<string, DirectoryNode> _Volumes = new Dictionary<string, DirectoryNode>();

        /// <summary>
        /// The root volume entry.
        /// </summary>
        public DirectoryNode VolumeRoot { get; }

        /// <summary>
        /// The assembly associated with this file provider.
        /// </summary>
        public string VolumeName { get; }

        /// <summary>
        /// The hosting environment which is the context in which to search for content files.
        /// </summary>
        public IHostingEnvironment HostingEnvironment { get; }

        /// <summary>
        /// Initializes a new instance of the CoreXT.MVC.CoreXTEmbeddedFileProvider
        /// class using the specified assembly and empty base namespace.
        ///</summary>
        ///<param name="volumeName">The assembly that contains the embedded hostingEnvresources.</param>
        public VirtualFileProvider(string volumeName, IHostingEnvironment hostingEnvironment)
        {
            VolumeName = volumeName?.Trim() ?? throw new ArgumentNullException(nameof(volumeName));
            HostingEnvironment = hostingEnvironment;

            lock (_Volumes)
            {
                VolumeRoot = _Volumes.Value(VolumeName) ?? (_Volumes[VolumeName] = new DirectoryNode());
            }
        }

        public virtual IDirectoryContents GetDirectoryContents(string subpath)
        {
            var dir = VolumeRoot.GetDirectory(subpath);
            IEnumerable<IFileInfo> entries = dir?.GetFiles() ?? Enumerable.Empty<IFileInfo>();
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

                var cacheEntry = _AssemblyManifestNamesCache.Value(VolumeName);

                if (cacheEntry != null && cacheEntry.Length > 0)
                {
                    var fnlower = fileName.ToLower();
                    var similar = cacheEntry.Select(s => s.ToLower()).Where(s => s == fnlower || s.EndsWith("." + fnlower) || s.EndsWith("\\" + fnlower) || s.EndsWith("/" + fnlower)).ToArray();
                    if (similar.Length > 0)
                        System.Diagnostics.Debug.WriteLine(" You tried to find an embedded file '" + fileName + "' ('" + subpath + "') in '" + VolumeName.FullName + "' using CoreXTEmbeddedFileProvider with base namespace '" + BaseNamespace + "' and the file was not found; however, there IS a similar file under these paths: "
                            + Environment.NewLine + "  > " + string.Join(Environment.NewLine + "  > ", similar) + Environment.NewLine + "  * Double check that your namespace is correct. Also, path and file names are case-sensitive.", "WARNING");
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
