using Common;
using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;

namespace ICE
{
    // ===========================================================================================================

    public class ICEController : ConfigurationBase
    {
        // -------------------------------------------------------------------------------------------------------

        public readonly Channels Channels;
        private static readonly EventLog EventLogger = null;

        public readonly RegistryKey ICERegKey = null;

        // -------------------------------------------------------------------------------------------------------

        public static ICEController Instance
        {
            get
            {
                if (_Instance != null) return _Instance;
                else throw new InvalidOperationException("You must first call 'Initialize()' to initialize the controller.");
            }
        }
        static ICEController _Instance;

        /// <summary>
        /// Initializes the controller singleton instance, and hooks into 'AppDomain.CurrentDomain.UnhandledException' event for error reporting.
        /// The 'Instance' property is not valid until this is called.
        /// </summary>
        public static ICEController Initialize()
        {
            if (_Instance == null)
            {
                WriteICEEventInfo("Initializing ICE controller ...");
                _Instance = new ICEController();
                AppDomain.CurrentDomain.UnhandledException += (_s, _e) =>
                {
                    WriteICEEventError("A non-functional exception error has occurred" + (_e.IsTerminating ? " while terminating." : ".")
                        + "  This is usually due to developer or configuration related errors.  Please see inner exception information for more details.", _e.ExceptionObject);
                };
                WriteICEEventInfo("ICE controller initialized.");
            }
            return _Instance;
        }

        static ICEController()
        {
            // ... create the event logger ...

            if (EventLogger == null)
            {
                if (!EventLog.SourceExists("ICE"))
                    EventLog.CreateEventSource("ICE", "ICE");

                EventLogger = new EventLog("ICE", System.Environment.MachineName, "ICE");

                WriteICEEventInfo("Event logger ready.");
            }
        }

        internal ICEController()
        {
            ConfigurationLoadeError += _ICEController_ConfigurationLoadeError;
            CreateNewConfiguration += _ICEController_CreateNewConfiguration;

            // ... make sure the registry entry exists ...

            ICERegKey = Registry.LocalMachine.OpenSubKey("Software\\ICE", true);
            if (ICERegKey == null)
                ICERegKey = Registry.LocalMachine.CreateSubKey("Software\\ICE");

            Channels = new Channels(this);

            _SetupConfiguration(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "ICE - " + Assembly.GetEntryAssembly().FullName.Split(',')[0].Trim());

            // ... start the ICE database connection ...
            // TODO: Possibly write event log to a database table...?
        }

        // -------------------------------------------------------------------------------------------------------

        public override bool CanSave { get { return true; } }

        void _ICEController_ConfigurationLoadeError(ConfigurationBase sender, Exception ex)
        {
            if (ex != null)
            {
                WriteICEEventError("Failed to loaded data file '", _ConfigurationFile, "'.", ex);
                // (Note: A new properties table will be created, but the '_Error' field will be set, preventing future saves [for precaution])
            }
        }

        void _ICEController_CreateNewConfiguration(ConfigurationBase sender, DataTable table)
        {
            //??table.Rows.Add("PluginID", GUID);
            //??table.Rows.Add("Name", Name);
        }

        // -------------------------------------------------------------------------------------------------------

        public static string WriteEvent(string source, params object[] args)
        {
            string message = source + ":\r\n" + Strings.Join("\r\n", args);
            if (EventLogger != null)
                lock (EventLogger) { EventLogger.WriteEntry(message); }
            return message;
        }

        public static string WriteEvent(string source, string message, EventLogEntryType entryType)
        {
            message = source + ":\r\n" + message;
            if (entryType == EventLogEntryType.Error || entryType == EventLogEntryType.FailureAudit)
                try { message += "\r\n\r\n" + Environment.StackTrace; }
                catch { }
            if (EventLogger != null)
                lock (EventLogger) { EventLogger.WriteEntry(message, entryType); }
            return message;
        }

        public static string WriteEvent(string source, EventLogEntryType entryType, params object[] args)
        {
            string message = source + ":\r\n" + Strings.Join("\r\n", args);
            if (entryType == EventLogEntryType.Error || entryType == EventLogEntryType.FailureAudit)
                try { message += "\r\n\r\n" + Environment.StackTrace; }
                catch { }
            if (EventLogger != null)
                lock (EventLogger) { EventLogger.WriteEntry(message, entryType); }
            return message;
        }

        public static string WriteEvent(string source, string message, Exception ex)
        {
            if (!string.IsNullOrEmpty(message)) message += "\r\n\r\n"; else message = "";
            message += Exceptions.GetFullErrorMessage(ex);
            try { message += "\r\n\r\nError event source stack:\r\n" + Environment.StackTrace; }
            catch { }
            return WriteEvent(source, EventLogEntryType.Error, message);
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// If one of the 'WriteICEEventError()' methods are called, this property is updated to the error for that thread (each thread has its own value).
        /// </summary>
        public static Exception LastError
        {
            get { lock (_LastErrors) { return GetLastErrorForThread(Thread.CurrentThread.ManagedThreadId); } }
            internal set { lock (_LastErrors) { _LastErrors[Thread.CurrentThread.ManagedThreadId] = value; } }
        }
        static Dictionary<int, Exception> _LastErrors = new Dictionary<int, Exception>();

        /// <summary>
        /// Returns the last error that occurred for a specific thread (each channel runs on its own thread).
        /// </summary>
        public static Exception GetLastErrorForThread(int threadID) { Exception ex; _LastErrors.TryGetValue(threadID, out ex); return ex; }

        public static void WriteICEEventInfo(params object[] args)
        { WriteEvent("ICE", EventLogEntryType.Information, args); }

        public static void WriteICEEventWarning(params object[] args)
        { WriteEvent("ICE", EventLogEntryType.Warning, args); }

        public static TException WriteICEEventError<TException>(params object[] args) where TException : Exception, new()
        {
            return (TException)(LastError = (Exception)Activator.CreateInstance(typeof(TException), WriteEvent("ICE", EventLogEntryType.Error, args)));
        }
        public static Exception WriteICEEventError(params object[] args) { return WriteICEEventError<Exception>(); }

        public static TException WriteICEEventError<TException>(string message, Exception ex) where TException : Exception, new()
        {
            WriteEvent("ICE", message, ex);
            return (TException)(LastError = (Exception)Activator.CreateInstance(typeof(TException), message, ex));
        }
        public static Exception WriteICEEventError(string message, Exception ex) { return WriteICEEventError<Exception>(message, ex); }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Sets a registry value based on the calling object (example: an ITask).
        /// </summary>
        /// <param name="source"></param>
        /// <param name="name"></param>
        /// <param name="value"></param>
        public void SetRegistryValue(IPluginController source, string name, object value)
        {
            string sourceTypeName = source.GUID;

            RegistryKey libRegKey = Registry.LocalMachine.OpenSubKey("Software\\ICE\\" + sourceTypeName);
            if (libRegKey == null)
            {
                libRegKey = Registry.LocalMachine.CreateSubKey("Software\\ICE\\" + sourceTypeName);
                libRegKey.SetValue("Name", source.Name, RegistryValueKind.String);
            }

            RegistryValueKind type = RegistryValueKind.String;
            if (Utilities.IsInt(value.GetType())) type = RegistryValueKind.DWord;

            libRegKey.SetValue(name, value, type);
        }

        public object GetRegistryValue(IPluginController source, string name, object defaultValue)
        {
            string sourceTypeName = source.GUID;

            RegistryKey libRegKey = Registry.LocalMachine.OpenSubKey("Software\\ICE\\" + sourceTypeName);
            if (libRegKey == null)
                return null;

            return libRegKey.GetValue(name, defaultValue);
        }

        // --------------------------------------------------------------------------------------------------------

        static bool _StaticLibrariesAdded; // (just to keep track; this only makes sense to do ONE time)

        /// <summary>
        /// Loads all core internal plugins, including external libraries (plugin assemblies) in the following locations:
        /// <para>    1. The AppDomain based directory path.</para>
        /// <para>    2. The calling assembly location.</para>
        /// <para>    3. The executing assembly location.</para>
        /// <para>    4. The current working directory.</para>
        /// <para>    5. A "Plugins" folder that may exist in any of the above, including immediate sub-folders only.</para>
        /// If a specific library location is required, call the overloaded method with a specific path.
        /// </summary>
        public static void LoadLibraries()
        {
            // ... scan the already loaded libraries for valid types (to add any core ICE plugins by default) ...

            if (!_StaticLibrariesAdded)
            {
                Libraries._AddStaticPlugins();
                _StaticLibrariesAdded = true;
            }

            // ... scan supported assembly (library) locations ...

            Action<string> loadFrom = null; loadFrom = (path) =>
             {
                 LoadLibraries(path, false, true);
                 var pluginsPath = Path.Combine(path, "Plugins");
                 if (Directory.Exists(pluginsPath))
                 {
                     LoadLibraries(pluginsPath, false, true);
                     var pluginSubFolders = Directory.GetDirectories(pluginsPath);
                     foreach (var subFolder in pluginSubFolders)
                         loadFrom(subFolder);
                 }
             };

            loadFrom(AppDomain.CurrentDomain.BaseDirectory);
            loadFrom(Assembly.GetCallingAssembly().Location);
            loadFrom(Assembly.GetCallingAssembly().Location);
            loadFrom(Directory.GetCurrentDirectory());
        }

        /// <summary>
        /// Loads all plugin libraries (assemblies) from the given path (only).
        /// </summary>
        public static void LoadLibraries(string libraryPath, bool includeSubFolders = false, bool ignoreErrors = false)
        {
            if (!Directory.Exists(libraryPath))
            {
                if (!ignoreErrors)
                    WriteICEEventError("The plugin library (Assembly) path '" + libraryPath + "' does not exist, or is not accessible.");
                return;
            }

            try
            {
                var files = Directory.GetFiles(libraryPath, "*.dll", includeSubFolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly);

                foreach (var file in files)
                    try
                    {
                        Libraries.AddAssembly(file, true);
                    }
                    catch (Exception ex)
                    {
                        if (!ignoreErrors) throw ex;
                    }
            }
            catch (Exception ex)
            {
                var _ex = WriteICEEventError("The plugin library (Assembly) path '" + libraryPath + "' does not exist, or is not accessible.", ex);
                if (!ignoreErrors)
                    throw _ex;
            }
        }

        // -------------------------------------------------------------------------------------------------------

        public static Channel CreateChannel(string name)
        {
            return Instance.Channels.CreateChannel(name, null);
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The default timeout for individual channel threads to terminate is 5 seconds.
        /// </summary>
        public const int DEFAULT_TERMINATE_TIMEOUT = 5000;

        public static void Shutdown(int timeout = DEFAULT_TERMINATE_TIMEOUT)
        {
            Instance.Channels.Terminate(timeout);
        }

        // -------------------------------------------------------------------------------------------------------
    }

    // ===========================================================================================================
}
