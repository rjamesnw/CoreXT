using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;

namespace ICE
{
    // ############################################################################################################

    public static class LibraryExtentionMethods
    {
        /// <summary>
        /// Returns a list of valid plugin types from the specified assembly.
        /// </summary>
        /// <param name="assembly">The assembly to search.</param> 
        /// <param name="suppressErrors">If true, then any exception errors are ignored, and 'null' is returned instead.  Any errors are still recorded in the
        /// event log however.</param>
        public static Type[] GetICEPluginTypes(this Assembly assembly, bool suppressErrors = true)
        {
            if (assembly == null) throw new ArgumentNullException("assembly");

            try
            {
                List<Type> appList = new List<Type>();

                var types = assembly.GetTypes();

                foreach (var type in types)
                    if (type.IsClass && !type.IsAbstract && typeof(IPlugin).IsAssignableFrom(type))
                        appList.Add(type);

                return appList.ToArray();
            }
            catch (Exception ex)
            {
                var _ex = ICEController.WriteICEEventError("Failed to retrieve plugin types from assembly '" + assembly.FullName + "'.", ex);
                if (!suppressErrors)
                    throw _ex;

                return new Type[0]; // (error not desired, so return an empty array)
            }
        }

        /// <summary>
        /// Returns an array of assemblies that are associated this the given assembly.
        /// </summary>
        public static List<Assembly> GetAssociatedAssemblies(this Assembly assembly)
        {
            var assemblies = Libraries._Assemblies;
            var types = assembly.GetTypes();

            foreach (var type in types)
            {
                // ... if type's assembly is not 'assembly', and not yet added to the list, then add it ...
                if (type.Assembly != assembly && !assemblies.ContainsKey(type.Assembly.FullName))
                {
                    assemblies.Add(type.Assembly.FullName, type.Assembly);

                    // ... traverse the assembly's assemblies recursively ...

                    GetAssociatedAssemblies(type.Assembly);
                }
            }

            return assemblies.Count > 0 ? assemblies.Values.ToList() : null;
        }
    }

    // ############################################################################################################

    public class Library
    {
        // --------------------------------------------------------------------------------------------------------

        string _Filename = "";
        public string Filename { get { return _Filename; } }

        public Assembly AssemblyReference { get { return _Assembly; } }
        Assembly _Assembly = null;
        bool _TypesLoaded = false;

        public Type[] PluginTypes { get; private set; }

        /// <summary>
        /// Returns true if the underlying assembly is loaded, and all plugin types have been extracted.
        /// </summary>
        public bool IsLoaded { get { return _Assembly != null && _TypesLoaded; } }

        // --------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a library entry for a plugin file.
        /// </summary>
        public Library(string filename)
            : this(null, filename)
        {
        }

        /// <summary>
        /// Creates a library entry for an already loaded plugin assembly.
        /// </summary>
        public Library(Assembly assembly)
            : this(assembly, null)
        {
        }

        /// <summary>
        /// Creates a library entry for an already loaded plugin assembly that is associated with the file location of where it was loaded from.
        /// </summary>
        public Library(Assembly assembly, string filename)
        {
            _Filename = filename;
            _Assembly = assembly;

            if (_Assembly != null)
                GetPlugins(); // (get the plugin types immediately if the assembly is available - note: this does not require the assembly to be loaded)
        }

        /// <summary>
        /// Attempts to load the assembly for this plugin library. Returns true on success, and false otherwise.
        /// </summary>
        /// <param name="throwErrors">If true, then an exception is thrown instead of returning false.</param>
        public bool Load(bool throwErrors = false)
        {
            if (_Assembly == null || _Assembly.ReflectionOnly)
            {
                if (string.IsNullOrEmpty(_Filename))
                {
                    var _ex = ICEController.WriteICEEventError("Cannot load this library: No valid filename was given.");
                    if (throwErrors) throw _ex;
                    return false;
                }

                string libFileToLoad = AppDomain.CurrentDomain.BaseDirectory + _Filename;

                ICEController.WriteICEEventInfo("Loading library '" + libFileToLoad + "'...");

                try
                {
                    _Assembly = Assembly.LoadFile(libFileToLoad);
                }
                catch (Exception ex)
                {
                    var _ex = ICEController.WriteICEEventError("An error occurred trying to load plugin '" + libFileToLoad + "'.", ex);
                    if (throwErrors) throw _ex;
                    return false;
                }
            }

            return IsLoaded;
        }

        // --------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns an array of plugins associated with this library.
        /// <para>Note: This process does not require the underlying assembly to be loaded.  The assembly is loaded for reflection only until a plugin instance
        /// is requested by calling '{PluginInfo}.CreateInstance()'.</para>
        /// </summary>
        public PluginInfo[] GetPlugins()
        {
            if (!_TypesLoaded)
            {
                PluginTypes = _Assembly.GetICEPluginTypes();

                foreach (Type type in PluginTypes)
                    PluginManager.Add(new PluginInfo(this, type));

                _TypesLoaded = true;
            }

            return (from p in PluginManager.Plugins where p.Library == this select p).ToArray();
        }

        // --------------------------------------------------------------------------------------------------------

        public override bool Equals(object obj)
        {
            return obj is Library && (((Library)obj)._Filename == _Filename || ((Library)obj)._Assembly == _Assembly);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        public override string ToString()
        {
            return !string.IsNullOrEmpty(_Filename) ? _Filename : _Assembly != null ? _Assembly.FullName : null;
        }

        // --------------------------------------------------------------------------------------------------------
    }

    public static class Libraries
    {
        // --------------------------------------------------------------------------------------------------------

        //??internal static AppDomain _PluginDomain = AppDomain.CreateDomain("plugins", null, System.AppDomain.CurrentDomain.BaseDirectory, "", false);

        internal static readonly Dictionary<string, Assembly> _Assemblies = new Dictionary<string, Assembly>();

        static List<Library> _Libraries = new List<Library>();

        // --------------------------------------------------------------------------------------------------------

        public static Library GetLibrary(string filename)
        {
            return (from l in _Libraries where l.Filename == filename select l).FirstOrDefault();
        }

        public static Library GetLibrary(Assembly assembly)
        {
            return (from l in _Libraries where l.AssemblyReference == assembly select l).FirstOrDefault();
        }

        public static Library AddLibrary(Library library)
        {
            if (_Libraries.IndexOf(library) == -1)
            {
                _Libraries.Add(library);
                return library;
            }
            return null;
        }

        // --------------------------------------------------------------------------------------------------------

        public static void Clear()
        {
            _Libraries.Clear();
        }

        // --------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Scans internal system assemblies for static (default core) plugins and adds them to the plugin library.
        /// </summary>
        internal static void _AddStaticPlugins()
        {
            var systemAssemblies = AppDomain.CurrentDomain.GetAssemblies();

            foreach (var assembly in systemAssemblies)
                AddAssembly(assembly);
        }

        /// <summary>
        /// Adds an assembly to the assembly list, returning 'false' if any errors occur, or if the assembly was already added.
        /// <para>Warning: This method recursively traverses the assembly types, and all dependent types, in real-time, and will add any other associated
        /// applications, components, and controls also.</para>
        /// </summary>
        /// <param name="assembly">The assembly to add, which represents a library of plugin types.</param>
        /// <param name="throwErrors">If true, any errors will throw an exception instead of returning false.</param>
        public static bool AddAssembly(Assembly assembly, bool throwErrors = false)
        {
            if (GetLibrary(assembly) == null)
            {
                try
                {
                    if (assembly.GetICEPluginTypes(true).Length == 0)
                        return false; // (there are no valid plugins types in this assembly)

                    var library = AddLibrary(new Library(assembly));

                    var associatedAssemblies = assembly.GetAssociatedAssemblies(); // (get a list of assemblies other than the given 'assembly')

                    if (associatedAssemblies != null)
                        foreach (var asm in associatedAssemblies)
                            AddAssembly(asm, throwErrors);
                }
                catch (Exception ex)
                {
                    var _ex = ICEController.WriteICEEventError("Failed to read types in plugin assembly '" + assembly.FullName + "' (a DLL may be missing).", ex);
                    if (throwErrors)
                        throw _ex;
                    return false;
                }

                return true;
            }

            return false;
        }

        public static bool AddAssembly(string filename, bool throwErrors = false)
        {
            if (!File.Exists(filename))
            {
                var _ex = ICEController.WriteICEEventError("The plugin library (Assembly) file '" + filename + "' does not exist.");
                if (throwErrors)
                    throw _ex;
                return false;
            }

            Assembly assembly;
            try
            {
                assembly = Assembly.ReflectionOnlyLoadFrom(filename);
            }
            catch (Exception ex)
            {
                var _ex = ICEController.WriteICEEventError("The plugin library (Assembly) file '" + filename + "' is invalid or cannot be loaded for some reason.", ex);
                if (throwErrors)
                    throw _ex;
                return false;
            }

            return AddAssembly(assembly, throwErrors);
        }
        // --------------------------------------------------------------------------------------------------------

        public static string[] GetLibraryNames()
        {
            return (from l in _Libraries where l.AssemblyReference != null select l.AssemblyReference.FullName).ToArray();
        }

        // --------------------------------------------------------------------------------------------------------
    }

    // ############################################################################################################
}