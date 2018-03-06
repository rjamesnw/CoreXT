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
using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using CoreXT.CollectionsAndLists;

namespace CoreXT.FileSystem
{
    // ########################################################################################################################

    public interface IVirtualFileSystemObject
    {
        bool Exists { get; }
    }

    // ########################################################################################################################

    /// <summary>
    ///     A weak event handler that allows the garbage collector to reclaim unused delegates. This ensures that objects with
    ///     delegate references don't get "leaked" in memory just because a delegate has not been removed from callback lists.
    /// </summary>
    /// <typeparam name="TState">
    ///     Type of the state that will be passed to the action, which is typically the type of the event owner.
    /// </typeparam>
    public class WeakEventHandler<TState>
    {
        Dictionary<Delegate, WeakReference<Action<TState>>> _ChangedHandlers = new Dictionary<Delegate, WeakReference<Action<TState>>>();\

        /// <summary> Used to register listeners for this event instance. </summary>
        public event Action<TState> Event
        {
            add { lock (_ChangedHandlers) _ChangedHandlers[value] = new WeakReference<Action<TState>>(value); }
            remove { lock (_ChangedHandlers) _ChangedHandlers.Remove(value); }
        }

        TState _Owner;

        public WeakEventHandler(TState owner) { _Owner = owner; }


        /// <summary> Triggers this event object by calling each registered handler while removing nullified entries. </summary>
        public void Raise()
        {
            lock (_ChangedHandlers)
                foreach (var weakRefEntry in _ChangedHandlers.ToArray())
                {
                    if (weakRefEntry.Value.TryGetTarget(out var handler))
                        handler(_Owner);
                    else
                        _ChangedHandlers.Remove(weakRefEntry.Key);
                }
        }
    }

    public class VirtualFileInfo : FileInfoBase, IVirtualFileSystemObject, IFileInfo
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The changed. </summary>
        public readonly WeakEventHandler<VirtualFileInfo> Changed;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The data for this file entry. </summary>
        public readonly MemoryStream Data = new MemoryStream();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> True if resource exists in the underlying storage system. </summary>
        /// <value> A true or false value. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileProviders.IFileInfo.Exists"/>
        public bool Exists => true;

        /// <summary> The path to the file, including the file name. Return null if the file is not directly accessible. </summary>
        /// <value> The full pathname of the physical file. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileProviders.IFileInfo.PhysicalPath"/>
        string IFileInfo.PhysicalPath => FullName;

        /// <summary> When the file was last modified. </summary>
        /// <value> The last modified. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileProviders.IFileInfo.LastModified"/>
        public DateTimeOffset LastModified { get; internal set; }

        /// <summary> True for the case TryGetDirectoryContents has enumerated a sub-directory. </summary>
        /// <value> A true or false value. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileProviders.IFileInfo.IsDirectory"/>
        public bool IsDirectory { get; internal set; }

        /// <summary> A string containing the name of the file or directory. </summary>
        /// <value> The name. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileSystemGlobbing.Abstractions.FileSystemInfoBase.Name"/>
        public override string Name { get; }
        /// <summary> The name. </summary>

        /// <summary> Gets the full path to this directory entry from the root. </summary>
        /// <value> The full path to this directory entry. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileSystemGlobbing.Abstractions.FileSystemInfoBase.FullName"/>
        public override string FullName => ParentDirectory != null ? Path.Combine(ParentDirectory.FullName, Name) : Name;

        /// <summary> The parent directory for the current file or directory. </summary>
        /// <value> The pathname of the parent directory. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileSystemGlobbing.Abstractions.FileSystemInfoBase.ParentDirectory"/>
        public override DirectoryInfoBase ParentDirectory { get; }

        /// <summary> The length of the file in bytes, or -1 for a directory or non-existing files. </summary>
        /// <value> The length. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileProviders.IFileInfo.Length"/>
        public long Length => Data.Length;

        /// <summary> Return file contents as readonly stream. Caller should dispose stream when complete. </summary>
        /// <returns> The file stream. </returns>
        /// <seealso cref="M:Microsoft.Extensions.FileProviders.IFileInfo.CreateReadStream()"/>
        public Stream CreateReadStream() => new MemoryStream(Data.ToArray(), false);

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Constructor. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <exception cref="ArgumentException"> Thrown when one or more arguments have unsupported or illegal values. </exception>
        /// <param name="directory"> The parent directory. </param>
        /// <param name="filename"> Filename of the file. </param>
        internal VirtualFileInfo(VirtualDirectoryNode directory, string filename)
        {
            Changed = new WeakEventHandler<VirtualFileInfo>(this);
            ParentDirectory = directory ?? throw new ArgumentNullException(nameof(directory));
            if (string.IsNullOrWhiteSpace(filename))
                throw new ArgumentException(PathUtils.NOT_NULL_EMPTY_OR_WHITESPACE_MSG, nameof(filename));
            Name = filename;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################\

    public class VirtualDirectoryNode : DirectoryInfoBase, IVirtualFileSystemObject, IDirectoryContents
    {
        // --------------------------------------------------------------------------------------------------------------------

        public WeakEventHandler<DirectoryInfo> FileAdded;
        public WeakEventHandler<DirectoryInfo> FileDeleted;
        public WeakEventHandler<VirtualFileInfo> FileChanged;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The parent directory. </summary>
        public readonly VirtualDirectoryNode Parent;
        public override DirectoryInfoBase ParentDirectory => throw new NotImplementedException();

        /// <summary> Gets the name for this directory entry. </summary>
        /// <value> The directory entry name. </value>
        public override string Name { get; }

        /// <summary> Gets the full path to this directory entry from the root. </summary>
        /// <value> The full path to this directory entry. </value>
        public override string FullName => Parent != null ? System.IO.Path.Combine(Parent.FullName, Name) : Name;

        /// <summary> Gets the root directory. </summary>
        /// <value> The root directory. </value>
        public VirtualDirectoryNode Root => Parent?.Root ?? this;

        /// <summary> The sub directories to this directory entry. </summary>
        readonly Dictionary<string, VirtualDirectoryNode> _SubDirectories = new Dictionary<string, VirtualDirectoryNode>();

        /// <summary> The files in this directory entry. </summary>
        readonly Dictionary<string, VirtualFileInfo> _Files = new Dictionary<string, VirtualFileInfo>();

        /// <summary> Gets the files in this directory entry. </summary>
        /// <value> The files. </value>
        public IEnumerable<VirtualFileInfo> Files => _Files.Values;

        public int FileCount => _Files.Values.Count;

        public bool Exists => true;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Constructs a new directory entry.  If parent is null, then this entry is considered the root entry. </summary>
        /// <exception cref="ArgumentException"> Thrown when 'name' is null, empty, or only whitespace. </exception>
        /// <param name="parent"> The parent directory. </param>
        /// <param name="name"> The name. </param>
        public VirtualDirectoryNode(VirtualDirectoryNode parent, string name)
        {
            Parent = parent;
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(PathUtils.NOT_NULL_EMPTY_OR_WHITESPACE_MSG, nameof(name));
            Name = name;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets a directory using a slash-delimited path ('/' or '\' will work). </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <param name="path"> Full path of the file directory. </param>
        /// <param name="createIfNotExists">
        ///     (Optional) True to create any missing directory entries. If false, null is returned if the directory was not found.
        /// </param>
        /// <returns> The directory if found, or null otherwise. </returns>
        public VirtualDirectoryNode GetDirectory(string path, bool createIfNotExists)
        {
            if ((path[0] == '\\' || path[0] == '/') && this != Root)
                return Root.GetDirectory(path, createIfNotExists); // (request search at the root level; send upwards)

            var names = path?.Trim().Split('/', '\\') ?? new string[0];
            VirtualDirectoryNode dir = this, nextDir = null;

            for (var i = 0; i < names.Length; ++i)
            {
                var name = names[i].Trim();

                if (!string.IsNullOrWhiteSpace(name))
                {
                    var entryKey = name.ToLowerInvariant();
                    nextDir = dir._SubDirectories.Value(entryKey);

                    if (nextDir == null)
                    {
                        if (createIfNotExists)
                        {
                            if (_Files.ContainsKey(entryKey))
                                throw new InvalidOperationException($"Cannot create directory '{path}' - a directory already exists by the name '{name}' in '{dir.FullName}'.");

                            nextDir = new VirtualDirectoryNode(this, name);
                            _SubDirectories[entryKey] = nextDir;
                        }
                        else return null; // (not found)
                    }
                    dir = nextDir;
                }
            }
            return dir;
        }

        /// <summary> Gets a directory using a slash-delimited path ('/' or '\' will work). </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <param name="filePath"> Full path of the file directory. </param>
        /// <param name="createIfNotExists">
        ///     (Optional) True to create new directory and file entries if missing. If false, null is returned if the directory or
        ///     file was not found.
        /// </param>
        /// <returns> The directory if found, or null otherwise. </returns>
        public VirtualFileInfo GetFile(string filePath, bool createIfNotExists)
        {
            if (string.IsNullOrWhiteSpace(filePath)) return null; // (nothing given)

            filePath = filePath.Trim();
            var filename = Path.GetFileName(filePath);

            if (string.IsNullOrWhiteSpace(filename)) return null; // (no filename given)

            var dirPath = Path.GetDirectoryName(filePath);
            var dir = GetDirectory(dirPath, createIfNotExists);

            if (dir == null) return null;

            var entryKey = filename.ToLowerInvariant();
            var file = dir._Files.Value(entryKey);

            if (file == null && createIfNotExists)
            {
                if (_SubDirectories.ContainsKey(entryKey))
                    throw new InvalidOperationException($"Cannot create file '{filePath}' - a directory already exists by that name.");
                file = new VirtualFileInfo(dir, filename);
                _Files[entryKey] = file;
            }

            return file;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public IEnumerator<IFileInfo> GetEnumerator() => _Files.Values.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => _Files.Values.GetEnumerator();

        // --------------------------------------------------------------------------------------------------------------------

        public override IEnumerable<FileSystemInfoBase> EnumerateFileSystemInfos() => this.Cast<FileSystemInfoBase>();

        public override DirectoryInfoBase GetDirectory(string path) => GetDirectory(path, false);

        public override FileInfoBase GetFile(string filePath) => GetFile(filePath, false);

        // --------------------------------------------------------------------------------------------------------------------
    }

    /// <summary>
    ///     Abstract class for virtual file system watchers that wait for a change notifications.  If a change occurs then
    ///     'HasChanged' will be true and any registered callbacks will be called.
    /// </summary>
    /// <typeparam name="TVirtualFileSystemTarget"> Type of the virtual file system target. </typeparam>
    /// <seealso cref="T:Microsoft.Extensions.Primitives.IChangeToken"/>
    public abstract class VirtualWatcherBase<TVirtualFileSystemTarget> : IChangeToken
        where TVirtualFileSystemTarget : class, IVirtualFileSystemObject
    {
        protected readonly Dictionary<Delegate, _CallbackInfo> _Callbacks = new Dictionary<Delegate, _CallbackInfo>();

        public readonly TVirtualFileSystemTarget Target;
        public readonly Matcher GlobPattern;

        public VirtualWatcherBase(TVirtualFileSystemTarget target, string globPattern)
        {
            Target = target;
            GlobPattern = new Matcher(StringComparison.InvariantCultureIgnoreCase);
            GlobPattern.AddInclude(globPattern);
        }

        public bool HasChanged { get; protected set; }

        public bool ActiveChangeCallbacks => _Callbacks.Count > 0;

        protected class _CallbackInfo : IDisposable
        {
            public VirtualWatcherBase<TVirtualFileSystemTarget> Watcher;
            public Action<object> Callback;
            public object State;

            public void Dispose()
            {
                Watcher?._Callbacks.Remove(Callback);
                Watcher = null;
            }
        }

        public IDisposable RegisterChangeCallback(Action<object> callback, object state)
        {
            var cbEntry = new _CallbackInfo { Watcher = this, Callback = callback, State = state };
            _Callbacks[callback] = cbEntry;
            return cbEntry;
        }


        /// <summary> Call registered callbacks due to changes detected. </summary>
        protected void OnChanged()
        {
            // ... call watchers once only ...
            if (!HasChanged)
            {
                HasChanged = true;
                foreach (var cb in _Callbacks)
                    cb.Value.Callback(cb.Value.State);
            }
        }
    }

    /// <summary>
    ///     Watches for a change to a virtual file.  If a change occurs then 'HasChanged' will be true and any registered
    ///     callbacks will be called.
    /// </summary>
    /// <seealso cref="T:CoreXT.FileSystem.VirtualWatcherBase{CoreXT.FileSystem.VirtualFileInfo}"/>
    /// <seealso cref="T:Microsoft.Extensions.Primitives.IChangeToken"/>
    public class VirtualFileWatcher : VirtualWatcherBase<VirtualFileInfo>
    {
        public VirtualFileWatcher(VirtualFileInfo file, string globPattern) : base(file, globPattern)
        {
            file.Changed.Event += _File_Changed;
        }

        private void _File_Changed(VirtualFileInfo obj) { Target.Changed.Event -= _File_Changed; OnChanged(); }
    }

    /// <summary>
    ///     Watches for a change to a virtual directory.  If a change occurs then 'HasChanged' will be true and any registered
    ///     callbacks will be called.
    /// </summary>
    /// <seealso cref="T:CoreXT.FileSystem.VirtualWatcherBase{CoreXT.FileSystem.VirtualDirectoryNode}"/>
    /// <seealso cref="T:Microsoft.Extensions.Primitives.IChangeToken"/>
    public class VirtualDirectoryWatcher : VirtualWatcherBase<VirtualDirectoryNode>
    {
        public VirtualDirectoryWatcher(VirtualDirectoryNode directory, string globPattern) : base(directory, globPattern)
        {
            directory.FileAdded.Event += _Directory_FileAdded;
            directory.FileDeleted.Event += _Directory_FileDeleted;
            directory.FileChanged.Event += _Directory_FileChanged;
        }

        void _CheckChanged()
        {
            /// use the glob pattern to see if 
        }

        private void _Directory_FileAdded(DirectoryInfo obj) { Target.FileAdded.Event -= _Directory_FileAdded; OnChanged(); }
        private void _Directory_FileDeleted(DirectoryInfo obj) { Target.FileDeleted.Event -= _Directory_FileDeleted; OnChanged(); }
        private void _Directory_FileChanged(VirtualFileInfo obj) { Target.FileChanged.Event -= _Directory_FileChanged; OnChanged(); }
    }

    // ########################################################################################################################\

    ///<Summary>
    /// Looks up files using embedded resources in the specified assembly. This file
    /// provider is case sensitive.
    /// </Summary>
    public class VirtualFileProvider : IFileProvider
    {
        public static Dictionary<string, VirtualDirectoryNode> _Volumes = new Dictionary<string, VirtualDirectoryNode>();

        /// <summary>
        /// The root volume entry.
        /// </summary>
        public VirtualDirectoryNode VolumeRoot { get; }

        /// <summary>
        /// The assembly associated with this file provider.
        /// </summary>
        public string VolumeName { get; }

        /// <summary>
        /// The hosting environment which is the context in which to search for content files.
        /// </summary>
        public IHostingEnvironment HostingEnvironment { get; }

        /// <summary>
        ///     Initializes a new instance of the CoreXT.MVC.VirtualFileProvider class using the specified volume name, hosting
        ///     environment information, and optional base directory path.
        /// </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <param name="volumeName">
        ///     The virtual file system volume that contains the file. Volumes are stored statically in memory by this name.  If the
        ///     volume doesn't exist a new one will be created.
        /// </param>
        /// <param name="hostingEnvironment">
        ///     The hosting environment which is the context in which to search for content files. If provided, and a physical files exists, it will be used 
        /// </param>
        /// <param name="basePath"> (Optional) Full pathname of the base file. </param>
        public VirtualFileProvider(string volumeName, IHostingEnvironment hostingEnvironment, string basePath = null)
        {
            VolumeName = volumeName?.Trim() ?? throw new ArgumentNullException(nameof(volumeName));
            HostingEnvironment = hostingEnvironment;

            lock (_Volumes)
            {
                VolumeRoot = _Volumes.Value(VolumeName) ?? (_Volumes[VolumeName] = new VirtualDirectoryNode(null, "\\"));
            }
        }

        public virtual IDirectoryContents GetDirectoryContents(string subpath)
        {
            var dir = VolumeRoot.GetDirectory(subpath);
            IEnumerable<IFileInfo> entries = dir?.Files ?? Enumerable.Empty<IFileInfo>();
            return dir;
        }

        public virtual IFileInfo GetFileInfo(string filepath)
        {
            if (string.IsNullOrWhiteSpace(filepath))
                return new NotFoundFileInfo(filepath);

            if (HostingEnvironment != null) //? && Path.GetFileName(subpath) != "_ViewImports.cshtml")
            {
                // ... if the file is found locally anywhere then abort to allow the user to load the local one instead as an override ...

                var physicalFilepath = Path.Combine(HostingEnvironment.ContentRootPath, filepath.TrimStart('/'));
                if (File.Exists(physicalFilepath))
                    return new NotFoundFileInfo(physicalFilepath);

                physicalFilepath = Path.Combine(HostingEnvironment.WebRootPath, filepath.TrimStart('/'));
                if (File.Exists(physicalFilepath))
                    return new NotFoundFileInfo(physicalFilepath);
            }

            IFileInfo result = VolumeRoot.GetFile(filepath);
            if (result != null) return result;

            // ... if the path is absolute then fail, otherwise it is relative, so try any "wwwroot" folder ...

            if (filepath[0] == '\\' || filepath[0] == '/' || filepath.Contains(":"))
                return new NotFoundFileInfo(filepath);

            // ... try looking for a "wwwroot" folder ...

            result = VolumeRoot.GetFile(Path.Combine("wwwroot", filepath));

            return result ?? new NotFoundFileInfo(filepath);
        }

        /// <summary>
        ///     <para>Creates a <see cref="IChangeToken" /> for the specified <paramref name="filter" />.</para>
        ///     <para>Globbing patterns are interpreted by <seealso cref="Microsoft.Extensions.FileSystemGlobbing.Matcher" />.</para>
        /// </summary>
        /// <param name="filter">
        /// Filter string used to determine what files or folders to monitor. Example: **/*.cs, *.*,
        /// subFolder/**/*.cshtml.
        /// </param>
        /// <returns>
        /// An <see cref="IChangeToken" /> that is notified when a file matching <paramref name="filter" /> is added,
        /// modified or deleted. Returns a <see cref="NullChangeToken" /> if <paramref name="filter" /> has invalid filter
        /// characters or if <paramref name="filter" /> is an absolute path or outside the root directory specified in the
        /// constructor <seealso cref="PhysicalFileProvider(string)" />.
        /// </returns>
        public IChangeToken Watch(string filter)
        {
            if (filter == null || PathUtils.HasInvalidFilterChars(filter))
            {
                return NullChangeToken.Singleton;
            }

            // Relative paths starting with leading slashes are okay
            filter = filter.TrimStart(PathUtils.PathSeparators);

            return _filesWatcher.CreateFileChangeToken(filter);
        }
    }
}
