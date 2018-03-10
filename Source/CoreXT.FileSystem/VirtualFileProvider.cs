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
    /// <typeparam name="TCurrent"> The type of the current object instance in which the event is NOW triggering. </typeparam>
    /// <typeparam name="TState">
    ///     Type of the state that will be passed to the action, which is typically the event owner. In most cases the "current"
    ///     and "state" types are the same, where "TCurrent" is the instance where the even triggered, and "TState" is the
    ///     origin of the event.
    /// </typeparam>
    public class WeakEventHandler<TCurrent, TState>
    {
        Dictionary<Delegate, WeakReference<Action<TCurrent, TState>>> _ChangedHandlers = new Dictionary<Delegate, WeakReference<Action<TCurrent, TState>>>();

        /// <summary> Used to register listeners for this event instance. </summary>
        public event Action<TCurrent, TState> Event
        {
            add { lock (_ChangedHandlers) _ChangedHandlers[value] = new WeakReference<Action<TCurrent, TState>>(value); }
            remove { lock (_ChangedHandlers) _ChangedHandlers.Remove(value); }
        }

        TCurrent _Owner;

        public WeakEventHandler(TCurrent owner) { _Owner = owner; }


        /// <summary> Triggers this event object by calling each registered handler while removing nullified entries. </summary>
        public void Raise(TState state)
        {
            lock (_ChangedHandlers)
                foreach (var weakRefEntry in _ChangedHandlers.ToArray())
                {
                    if (weakRefEntry.Value.TryGetTarget(out var handler))
                        handler(_Owner, state);
                    else
                        _ChangedHandlers.Remove(weakRefEntry.Key);
                }
        }
    }

    public class VirtualFileInfo : FileInfoBase, IVirtualFileSystemObject, IFileInfo, IDisposable
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Triggered when the file changes. </summary>
        public readonly WeakEventHandler<VirtualFileInfo, VirtualFileInfo> Changed;

        /// <summary> Triggered if the file is disposed (or the data is disposed). Calling 'Delete()' simply disposes the data and the file.</summary>
        public readonly WeakEventHandler<VirtualFileInfo, VirtualFileInfo> Disposed;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The data for this file entry. Note: Editing this directly does not trigger 'Changed' events. </summary>
        public VirtualFileData Data => _Data ?? throw new ObjectDisposedException(nameof(VirtualFileInfo));
        VirtualFileData _Data;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> True if resource exists in the underlying storage system. </summary>
        /// <value> A true or false value. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileProviders.IFileInfo.Exists"/>
        public bool Exists => !string.IsNullOrEmpty(Name);

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
        public override string Name => _Name;
        internal string _Name;

        /// <summary> The case-insensitive name used by directories. </summary>
        /// <value> The key value. </value>
        public string Key => _Key ?? CreateKey(Name);
        internal string _Key;

        /// <summary> Creates a case-insensitive name used by directories. </summary>
        /// <param name="name"> A string containing the name of the file or directory (without the path). </param>
        /// <returns> The new key. </returns>
        public static string CreateKey(string name) => Path.GetFileName(name).ToLowerInvariant();

        /// <summary> Gets the full path to this directory entry from the root. </summary>
        /// <value> The full path to this directory entry. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileSystemGlobbing.Abstractions.FileSystemInfoBase.FullName"/>
        public override string FullName => ParentDirectory != null ? Path.Combine(ParentDirectory.FullName, Name) : Name;

        /// <summary> The parent directory for the current file or directory. </summary>
        /// <value> The pathname of the parent directory. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileSystemGlobbing.Abstractions.FileSystemInfoBase.ParentDirectory"/>
        public override DirectoryInfoBase ParentDirectory => _Directory;
        internal readonly VirtualDirectoryNode _Directory;

        /// <summary> The length of the file in bytes, or -1 for a directory or non-existing files. </summary>
        /// <value> The length. </value>
        /// <seealso cref="P:Microsoft.Extensions.FileProviders.IFileInfo.Length"/>
        public long Length => Data.Length;

        /// <summary> Return file contents as readonly stream. Caller should dispose stream when complete. </summary>
        /// <returns> The file stream. </returns>
        /// <seealso cref="M:Microsoft.Extensions.FileProviders.IFileInfo.CreateReadStream()"/>
        public Stream CreateReadStream() => new MemoryStream(Data.ToArray(), false);

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets a value indicating whether this object is disposed. </summary>
        /// <value> A true or false value. </value>
        public bool IsDisposed => _Data == null;

        /// <summary> Deletes the file. </summary>
        /// <seealso cref="M:System.IDisposable.Dispose()"/>
        void IDisposable.Dispose()
        {
            if (!IsDisposed)
            {
                Disposed.Raise(this);
                try { _Data.Dispose(); }
                finally { _Data = null; }
            }
        }

        /// <summary> Deletes the file. </summary>
        /// <seealso cref="M:System.IDisposable.Dispose()"/>
        public void Delete() => ((IDisposable)this).Dispose();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Constructor. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <exception cref="ArgumentException"> Thrown when one or more arguments have unsupported or illegal values. </exception>
        /// <param name="directory"> The parent directory. </param>
        /// <param name="filename"> Filename of the file. </param>
        internal VirtualFileInfo(VirtualDirectoryNode directory, string filename)
        {
            Changed = new WeakEventHandler<VirtualFileInfo, VirtualFileInfo>(this);
            Disposed = new WeakEventHandler<VirtualFileInfo, VirtualFileInfo>(this);

            _Directory = directory ?? throw new ArgumentNullException(nameof(directory));
            _Name = filename;

            _Data = new VirtualFileData(this);
            _Data.Changed += d => Changed.Raise(this);
            _Data.Disposed += d => Disposed.Raise(this);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Renames the specified file and returns the renamed file. </summary>
        /// <exception cref="FileNotFoundException"> Thrown when the requested file is not present. </exception>
        /// <param name="filename"> Filename of the file. </param>
        /// <param name="newName"> The new filename. </param>
        /// <returns> The VirtualFileInfo instance that was renamed. </returns>
        public VirtualFileInfo Rename(string newName) => _Directory.RenameFile(Name, newName);

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################\

    public class VirtualDirectoryNode : DirectoryInfoBase, IVirtualFileSystemObject, IDirectoryContents, IDisposable
    {
        // --------------------------------------------------------------------------------------------------------------------


        /// <summary> Triggered when a file is added to this directory. </summary>
        public WeakEventHandler<VirtualDirectoryNode, VirtualFileInfo> FileAdded;
        /// <summary> Triggered when a file is removed from this directory. </summary>
        public WeakEventHandler<VirtualDirectoryNode, VirtualFileInfo> FileDeleted;
        /// <summary> Triggered when a file in this directory changes. </summary>
        public WeakEventHandler<VirtualDirectoryNode, VirtualFileInfo> FileChanged;

        /// <summary> Triggered when a file is added to this directory. </summary>
        public WeakEventHandler<VirtualDirectoryNode, VirtualDirectoryNode> DirectoryAdded;
        /// <summary> Triggered when a file is removed from this directory. </summary>
        public WeakEventHandler<VirtualDirectoryNode, VirtualDirectoryNode> DirectoryDeleted;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The parent directory. </summary>
        public override DirectoryInfoBase ParentDirectory => _Parent;
        internal readonly VirtualDirectoryNode _Parent;

        /// <summary> Gets the name for this directory entry. </summary>
        /// <value> The directory entry name. </value>
        public override string Name => _Name;
        string _Name; // (if the name is null this object is invalid or disposed)

        /// <summary> The case-insensitive name used by directories. </summary>
        /// <value> The key value. </value>
        public string Key => _Key ?? VirtualFileInfo.CreateKey(Name);
        string _Key;

        /// <summary> Gets the full path to this directory entry from the root. </summary>
        /// <value> The full path to this directory entry. </value>
        public override string FullName => _Parent != null ? Path.Combine(_Parent.FullName, Name) : Name;

        /// <summary> Gets the root directory. </summary>
        /// <value> The root directory. </value>
        public VirtualDirectoryNode Root => _Parent?.Root ?? this;

        /// <summary> The sub directories to this directory entry. </summary>
        Dictionary<string, VirtualDirectoryNode> _SubDirectories = new Dictionary<string, VirtualDirectoryNode>();

        /// <summary> The files in this directory entry. </summary>
        Dictionary<string, VirtualFileInfo> _Files = new Dictionary<string, VirtualFileInfo>();

        /// <summary> Gets the files in this directory entry. </summary>
        /// <value> The files. </value>
        public IEnumerable<VirtualFileInfo> Files => _Files.Values;

        public int FileCount => _Files.Values.Count;

        public bool Exists => !string.IsNullOrEmpty(Name);

        ///// <summary> Gets the root watcher used to register other watchers for this file system. </summary>
        ///// <value> The root watcher. </value>
        //x public RootVirtualFileSystemWatcher RootWatcher => Root._RootWatcher;
        //x RootVirtualFileSystemWatcher _RootWatcher;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Constructs a new directory entry.  If parent is null, then this entry is considered the root entry. </summary>
        /// <exception cref="ArgumentException"> Thrown when 'name' is null, empty, or only whitespace. </exception>
        /// <param name="parent"> The parent directory. </param>
        /// <param name="name"> The name. </param>
        public VirtualDirectoryNode(VirtualDirectoryNode parent, string name)
        {
            _Parent = parent;
            _Name = name;
            FileAdded = new WeakEventHandler<VirtualDirectoryNode, VirtualFileInfo>(this);
            FileDeleted = new WeakEventHandler<VirtualDirectoryNode, VirtualFileInfo>(this);
            FileChanged = new WeakEventHandler<VirtualDirectoryNode, VirtualFileInfo>(this);
        }

        void _CheckDisposed()
        {
            if (IsDisposed)
                throw new ObjectDisposedException(nameof(VirtualDirectoryNode));
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets a directory relative to the current directory using a slash-delimited path ('/' or '\' will work). </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <param name="path"> Full path of the file directory. </param>
        /// <param name="createIfNotExists">
        ///     (Optional) True to create any missing directory entries. If false, null is returned if the directory was not found.
        /// </param>
        /// <returns> The directory if found, or null otherwise. </returns>
        public VirtualDirectoryNode GetDirectory(string path, bool createIfNotExists)
        {
            _CheckDisposed();

            if ((path[0] == '\\' || path[0] == '/') && this != Root)
                return Root.GetDirectory(path, createIfNotExists); // (request search at the root level; send upwards)

            var names = path?.Trim().Split('/', '\\') ?? new string[0];
            VirtualDirectoryNode dir = this, nextDir = null;

            for (var i = 0; i < names.Length; ++i)
            {
                var name = names[i].Trim();

                if (!string.IsNullOrWhiteSpace(name))
                {
                    var entryKey = VirtualFileInfo.CreateKey(name);
                    nextDir = dir._SubDirectories.Value(entryKey);

                    if (nextDir == null)
                    {
                        if (createIfNotExists)
                        {
                            if (_Files.ContainsKey(entryKey))
                                throw new InvalidOperationException($"Cannot create directory '{path}' - a directory already exists by the name '{name}' in '{dir.FullName}'.");

                            nextDir = new VirtualDirectoryNode(this, name) { _Key = entryKey };
                            _SubDirectories[entryKey] = nextDir;
                        }
                        else return null; // (not found)
                    }
                    dir = nextDir;
                }
            }
            return dir;
        }

        /// <summary>
        ///     Gets a file using the specific filename.  If the filename contains a path then it will be used to locate the
        ///     directory relative to the current directory.
        /// </summary>
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

            var entryKey = VirtualFileInfo.CreateKey(filename);
            var file = dir._Files.Value(entryKey);

            if (file == null && createIfNotExists)
            {
                if (_SubDirectories.ContainsKey(entryKey))
                    throw new InvalidOperationException($"Cannot create file '{filePath}' - a directory already exists by that name.");
                file = new VirtualFileInfo(dir, filename) { _Key = entryKey };
                _Files[entryKey] = file;
            }

            return file;
        }

        // --------------------------------------------------------------------------------------------------------------------

        public IEnumerator<IFileInfo> GetEnumerator() => _Files.Values.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => _Files.Values.GetEnumerator();

        // --------------------------------------------------------------------------------------------------------------------

        public override IEnumerable<FileSystemInfoBase> EnumerateFileSystemInfos() => this.Cast<FileSystemInfoBase>();

        /// <summary>
        ///     Returns an instance of <see cref="T:Microsoft.Extensions.FileSystemGlobbing.Abstractions.DirectoryInfoBase" /> that
        ///     represents a subdirectory for the specified path.
        /// </summary>
        /// <param name="path"> The directory name or relative path. </param>
        /// <returns>
        ///     Instance of <see cref="T:Microsoft.Extensions.FileSystemGlobbing.Abstractions.DirectoryInfoBase" /> even if
        ///     directory does not exist.
        /// </returns>
        /// <seealso cref="M:Microsoft.Extensions.FileSystemGlobbing.Abstractions.DirectoryInfoBase.GetDirectory(string)"/>
        public override DirectoryInfoBase GetDirectory(string path)
            => (DirectoryInfoBase)GetDirectory(path, false) ?? new VirtualDirectoryNode(this, string.Empty);

        /// <summary>
        ///     Returns an instance of <see cref="T:Microsoft.Extensions.FileSystemGlobbing.Abstractions.FileInfoBase" /> that
        ///     represents a file in the directory.
        /// </summary>
        /// <param name="filePath"> The file name. </param>
        /// <returns>
        ///     Instance of <see cref="T:Microsoft.Extensions.FileSystemGlobbing.Abstractions.FileInfoBase" /> even if file does not
        ///     exist.
        /// </returns>
        /// <seealso cref="M:Microsoft.Extensions.FileSystemGlobbing.Abstractions.DirectoryInfoBase.GetFile(string)"/>
        public override FileInfoBase GetFile(string filePath)
            => (FileInfoBase)GetFile(filePath, false) ?? new VirtualFileInfo(this, string.Empty);

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Queries if a given file or directory exists. </summary>
        /// <param name="name"> The name for this directory entry. </param>
        /// <returns> True if it exists, false otherwise. </returns>
        public bool FileOrDirectoryExists(string name, out string entryKey)
        {
            _CheckDisposed();
            entryKey = VirtualFileInfo.CreateKey(name);
            return _SubDirectories.ContainsKey(entryKey) || _Files.ContainsKey(entryKey);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates a virtual file in this directory with the given filename. </summary>
        /// <exception cref="InvalidOperationException"> Thrown if the name is invalid or already exists. </exception>
        /// <param name="name"> The name for the new file. </param>
        /// <returns> The new file. </returns>
        public VirtualFileInfo CreateFile(string name)
        {
            _CheckDisposed();

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(PathUtils.NOT_NULL_EMPTY_OR_WHITESPACE_MSG, nameof(name));

            if (PathUtils.HasInvalidFilenameChars(name))
                throw new InvalidOperationException($"Filename '{name}' is not valid.");

            if (FileOrDirectoryExists(name, out var key))
                throw new InvalidOperationException($"A file or directory already exists with the name '{name}'.");

            var file = new VirtualFileInfo(this, name);
            _Files[key] = file;
            file.Changed.Event += _OnFileChanged;
            file.Disposed.Event += _OnFileDisposed;

            FileAdded.Raise(file);

            return file;
        }

        private void _OnFileChanged(VirtualFileInfo origin, VirtualFileInfo file)
        {
            FileChanged.Raise(file);
            _Parent?._OnFileChanged(file, file);
        }

        private void _OnFileDisposed(VirtualFileInfo origin, VirtualFileInfo file)
        {
            if (file._Directory == this)
            {
                _Files.Remove(file.Key);
                file.Changed.Event -= _OnFileChanged;
                file.Disposed.Event -= _OnFileDisposed;
            }

            FileDeleted.Raise(file);
            _Parent?._OnFileDisposed(file, file);
        }

        // --------------------------------------------------------------------------------------------------------------------

        public VirtualDirectoryNode CreateDirectory(string name)
        {
            _CheckDisposed();

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(PathUtils.NOT_NULL_EMPTY_OR_WHITESPACE_MSG, nameof(name));

            if (PathUtils.HasInvalidPathChars(name))
                throw new InvalidOperationException($"Directory name '{name}' is not valid.");

            if (FileOrDirectoryExists(name, out var key))
                throw new InvalidOperationException($"A file or directory already exists with the name '{name}'.");

            var dir = new VirtualDirectoryNode(this, name);
            _SubDirectories[key] = dir;
            dir.DirectoryAdded.Event += _OnSubDirectoryAdded;
            dir.DirectoryDeleted.Event += _OnSubDirectoryDeleted;

            DirectoryAdded.Raise(dir);

            return dir;
        }

        private void _OnSubDirectoryAdded(VirtualDirectoryNode origin, VirtualDirectoryNode dir)
        {
            DirectoryAdded.Raise(dir);
            _Parent?._OnSubDirectoryAdded(this, dir);
        }

        private void _OnSubDirectoryDeleted(VirtualDirectoryNode origin, VirtualDirectoryNode dir)
        {
            DirectoryDeleted.Raise(dir);
            _Parent?._OnSubDirectoryDeleted(this, dir);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Renames the specified file and returns the file entry. </summary>
        /// <exception cref="FileNotFoundException"> Thrown when the requested file is not present. </exception>
        /// <param name="filename"> Filename of the file. </param>
        /// <param name="newName"> The new filename. </param>
        /// <returns> The VirtualFileInfo instance that was renamed. </returns>
        public VirtualFileInfo RenameFile(string filename, string newName)
        {
            _CheckDisposed();

            var file = _Files.Value(VirtualFileInfo.CreateKey(filename));
            if (file == null)
                throw new FileNotFoundException($"The file was not found in directory '{FullName}'.", filename);

            if (FileOrDirectoryExists(newName, out var newKey))
                throw new InvalidOperationException($"A file or directory already exists in '{FullName}' with the name '{newName}'.");
            else
            {
                _Files.Remove(file.Key);
                file._Name = newName;
                file._Key = newKey;
                _Files[newKey] = file;

                return file;
            }
        }

        /// <summary> Renames the specified sub-directory and returns the directory entry. </summary>
        /// <exception cref="FileNotFoundException"> Thrown when the requested directory is not present. </exception>
        /// <param name="directoryName"> Name of the directory to rename. </param>
        /// <param name="newName"> The new directory name. </param>
        /// <returns> The VirtualDirectoryNode instance that was renamed. </returns>
        public VirtualDirectoryNode RenameDirectory(string directoryName, string newName)
        {
            _CheckDisposed();

            var dir = _SubDirectories.Value(VirtualFileInfo.CreateKey(directoryName));
            if (dir == null)
                throw new DirectoryNotFoundException($"Directory '{directoryName}' does not exist in directory '{FullName}'.");

            if (FileOrDirectoryExists(newName, out var newKey))
                throw new InvalidOperationException($"A file or directory already exists in '{FullName}' with the name '{newName}'.");
            else
            {
                _SubDirectories.Remove(dir.Key);
                dir._Name = newName;
                dir._Key = newKey;
                _SubDirectories[newKey] = dir;

                return dir;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets a value indicating whether this object is disposed. </summary>
        /// <value> A true or false value. </value>
        public bool IsDisposed => _SubDirectories == null || _Files == null;

        void IDisposable.Dispose()
        {
            if (!IsDisposed)
            {
                foreach (IDisposable dir in _SubDirectories.Values.ToArray()) // ('ToArray()' required because 'Dispose()' will remove from '_SubDirectories') 
                    dir.Dispose(); // (release the sub-directory and all files and child directories [depth first])

                foreach (IDisposable file in _Files.Values.Reverse().ToArray()) // (remove from end is a bit more efficient; 'ToArray()' required because 'Dispose()' will remove from '_Files')
                    file.Dispose(); // (release the sub-directory and all files and child directories)

                // ... remove the dictionary instances to flag that this directory is already disposed so this is not done again ...

                _SubDirectories = null; // (makes this object disposed)
                _Files = null; // (makes this object disposed)

                // ... if a parent exists, remove this object from its sub-directory dictionary ...

                _Parent?.DeleteDirectory(this);
            }
        }

        /// <summary> Deletes the directory. </summary>
        /// <seealso cref="M:System.IDisposable.Dispose()"/>
        public void Delete() => ((IDisposable)this).Dispose();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Deletes a sub-directory and returns the deleted directory. </summary>
        /// <param name="dir"> The sub-directory to delete. </param>
        /// <returns> The deleted VirtualDirectoryNode, or null if not found. </returns>
        public VirtualDirectoryNode DeleteDirectory(VirtualDirectoryNode dir)
        {
            _CheckDisposed();

            if (dir?.IsDisposed == false && _SubDirectories.Remove(dir.Key))
            {
                dir.Delete();
                return dir;
            }
            else
                return null; // (not found)
        }

        /// <summary> Deletes a sub-directory by name and returns the deleted directory. </summary>
        /// <param name="name"> The name of a sub-directory to delete. </param>
        /// <returns> The deleted VirtualDirectoryNode, or null if not found. </returns>
        public VirtualDirectoryNode DeleteDirectory(string name)
        {
            _CheckDisposed();
            return DeleteDirectory(_SubDirectories.Value(VirtualFileInfo.CreateKey(name)));
        }

        /// <summary> Deletes a file by name and returns the deleted file. </summary>
        /// <param name="name"> The name of a file to delete. </param>
        /// <returns> The deleted VirtualFileInfo, or null if not found. </returns>
        public VirtualFileInfo DeleteFile(string name)
        {
            _CheckDisposed();

            var file = _Files.Value(VirtualFileInfo.CreateKey(name));
            if (file != null)
            {
                file.Delete();
                return file;
            }
            else
                return null; // (not found)
        }

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
        public readonly Matcher GlobMatcher;

        public VirtualWatcherBase(TVirtualFileSystemTarget target, string globPattern)
        {
            Target = target;
            GlobMatcher = new Matcher(StringComparison.InvariantCultureIgnoreCase);
            GlobMatcher.AddInclude(globPattern);
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

        /// <summary>
        ///     If the changed directory or file 'path' matches the glob pattern then any registered callbacks will be called.
        ///     Returns true if the change is a match for this watcher.
        /// </summary>
        /// <param name="path"> Full pathname of the file. </param>
        /// <returns> True if it succeeds, false if it fails. </returns>
        protected bool OnChanged(string path)
        {
            // ... call watchers once only ...
            if (!HasChanged)
            {
                // ... check if this is a match ...
                var result = GlobMatcher.Match(path);
                if (result.HasMatches)
                {
                    HasChanged = true;
                    foreach (var cb in _Callbacks)
                        cb.Value.Callback(cb.Value.State);
                }
                // (else not a match for this watcher, do nothing)
            }

            return HasChanged;
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

        private void _File_Changed(VirtualFileInfo origin, VirtualFileInfo changedFile)
        { if (OnChanged(changedFile.FullName)) Target.Changed.Event -= _File_Changed; }
    }

    /// <summary>
    ///     Watches for a change to a virtual directory.  If a change occurs then 'HasChanged' will be true and any registered
    ///     callbacks will be called.
    /// </summary>
    /// <seealso cref="T:CoreXT.FileSystem.VirtualWatcherBase{CoreXT.FileSystem.VirtualDirectoryNode}"/>
    /// <seealso cref="T:Microsoft.Extensions.Primitives.IChangeToken"/>
    public class VirtualDirectoryWatcher : VirtualWatcherBase<VirtualDirectoryNode>
    {
        /// <summary> Construct a new watcher for the specific directory. </summary>
        /// <param name="directory"> Pathname of the directory. </param>
        /// <param name="globPattern"> A pattern specifying the glob. </param>
        public VirtualDirectoryWatcher(VirtualDirectoryNode directory, string globPattern)
            : base(directory, globPattern)
        {
            directory.FileAdded.Event += _Directory_FileAdded;
            directory.FileDeleted.Event += _Directory_FileDeleted;
            directory.FileChanged.Event += _Directory_FileChanged;
        }

        void _CheckChanged()
        {
            /// use the glob pattern to see if 
        }

        internal virtual void _Directory_FileAdded(VirtualDirectoryNode origin, VirtualFileInfo file) { if (OnChanged(file.FullName)) Target.FileAdded.Event -= _Directory_FileAdded; }
        internal virtual void _Directory_FileDeleted(VirtualDirectoryNode origin, VirtualFileInfo file) { if (OnChanged(file.FullName)) Target.FileDeleted.Event -= _Directory_FileDeleted; }
        internal virtual void _Directory_FileChanged(VirtualDirectoryNode origin, VirtualFileInfo file) { if (OnChanged(file.FullName)) Target.FileChanged.Event -= _Directory_FileChanged; }
    }

    //x public class RootVirtualFileSystemWatcher : VirtualDirectoryWatcher
    //{
    //    public RootVirtualFileSystemWatcher(VirtualDirectoryNode directory, string globPattern = @"**\*.*")
    //        : base(directory, globPattern)
    //    {
    //    }


    //    /// <summary> A list of watchers to trigger for every change in the whole file system. </summary>
    //    public readonly WeakReferenceList<VirtualDirectoryWatcher> Watchers = new WeakReferenceList<VirtualDirectoryWatcher>();

    //    internal override void _Directory_FileAdded(VirtualDirectoryNode origin, VirtualFileInfo file)
    //    {
    //        if (OnChanged(file.FullName))
    //            for (int i = 0, n = Watchers.Count; i < n; ++i)
    //            {
    //                var watcher = Watchers[i];
    //                if (watcher != null)
    //                    watcher._Directory_FileAdded(Target, file);
    //                else
    //                    Watchers.RemoveAt(i);
    //            }
    //    }

    //    internal override void _Directory_FileDeleted(VirtualDirectoryNode origin, VirtualFileInfo file)
    //    {
    //        if (OnChanged(file.FullName))
    //            for (int i = 0, n = Watchers.Count; i < n; ++i)
    //            {
    //                var watcher = Watchers[i];
    //                if (watcher != null)
    //                    watcher._Directory_FileDeleted(Target, file);
    //                else
    //                    Watchers.RemoveAt(i);
    //            }
    //    }

    //    internal override void _Directory_FileChanged(VirtualDirectoryNode origin, VirtualFileInfo file)
    //    {
    //        if (OnChanged(file.FullName))
    //            for (int i = 0, n = Watchers.Count; i < n; ++i)
    //            {
    //                var watcher = Watchers[i];
    //                if (watcher != null)
    //                    watcher._Directory_FileChanged(Target, file);
    //                else
    //                    Watchers.RemoveAt(i);
    //            }
    //    }
    //}

    // ########################################################################################################################\

    ///<Summary>
    /// Looks up files using embedded resources in the specified assembly. This file
    /// provider is case sensitive.
    /// </Summary>
    public class VirtualFileProvider : IFileProvider
    {
        static Dictionary<string, VirtualDirectoryNode> _Volumes = new Dictionary<string, VirtualDirectoryNode>();

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
            return (IDirectoryContents)dir ?? NotFoundDirectoryContents.Singleton;
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

            var result = VolumeRoot.GetFile(filepath);
            if (result != null) return (IFileInfo)result;

            // ... if the path is absolute then fail, otherwise it is relative, so try any "wwwroot" folder ...

            if (filepath[0] == '\\' || filepath[0] == '/' || filepath.Contains(":"))
                return new NotFoundFileInfo(filepath);

            // ... try looking for a "wwwroot" folder ...

            result = VolumeRoot.GetFile(Path.Combine("wwwroot", filepath));

            return (IFileInfo)result ?? new NotFoundFileInfo(filepath);
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

            var watcher = new VirtualDirectoryWatcher(VolumeRoot, filter);

            //x VolumeRoot.RootWatcher.Watchers.Add(watcher);

            return watcher;
        }
    }
}
