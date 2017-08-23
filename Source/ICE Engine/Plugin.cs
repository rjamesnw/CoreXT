using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.IO;
using System.Linq;
using Common;
using System.Xml.Linq;
using System.Threading;

namespace ICE
{
    // ===========================================================================================================

    public enum PluginState
    {
        Uninitialized = 0,
        Ready,
        Started,
        Stopped,
        Paused,
        Error
    }

    // ===========================================================================================================

    public class Plugin<T> : ConfigurationBase, IPluginController, IPlugin
        where T : class, IPlugin
    {
        // -------------------------------------------------------------------------------------------------------

        public Channel Channel { get; private set; }
        public Library Library { get; private set; }

        public ICEController Controller { get { return Channel.Controller; } }

        public T ActualPlugin { get { return _Plugin; } }
        internal T _Plugin = null;

        public string Name { get; private set; }

        public string GUID { get; private set; }

        public PluginState PluginState { get; protected set; }

        public bool IsInitialized { get { return PluginState != PluginState.Uninitialized; } }

        Timer _Timer;

        // -------------------------------------------------------------------------------------------------------
        // Error handling.

        /// <summary>
        /// Returns an exception object if an error occurred.
        /// Plugin creators can set this to an exception error object so errors can be handled gracefully.
        /// Setting this property will stop the plugin.
        /// </summary>
        public Exception Error
        {
            get { return _Error; }
            set
            {
                _Error = value;
                if (_Error != null)
                {
                    // ... an error has occurred on a task based plugin, then call 'stop' if in a started or paused state ...
                    if (PluginState == PluginState.Started || PluginState == PluginState.Paused)
                        OnError(_Error);
                    PluginState = PluginState.Error;
                    ICEController.WriteICEEventError(TypeTitle + " Error (" + Name + "):", _Error);
                }
                else if (PluginState == PluginState.Error)
                {
                    // ... error resolved, make sure properties are saved if there's any pending changes ...
                    PluginState = PluginState.Ready;
                    if (!IsConfigurationLoaded)
                        LoadData(false);
                }
            }
        }
        protected Exception _Error;

        /// <summary>
        /// Returns true if this plugin instance is in an error state.
        /// </summary>
        public bool HasErrored { get { return _Error != null; } }

        public override bool CanSave { get { return !HasErrored; } }

        /// <summary>
        /// Clears the error state, if any, allowing the plugin to be started again.
        /// </summary>
        public void ResetError()
        {
            Error = null;
        }

        /// <summary>
        /// Joins all given parameters into one error message.
        /// </summary>
        /// <param name="exception">An optional exception object, or 'null' if none.</param>
        /// <param name="strings">The strings to use as a single error message.</param>
        public void SetErrorMessage(Exception innerException, params string[] strings)
        {
            _Error = ICEController.WriteICEEventError(strings.Length > 0 ? String.Join("", strings) : "An ICE plugin error has occurred.", innerException);
        }
        /// <summary>
        /// Joins all given parameters into one error message.
        /// </summary>
        /// <param name="strings">The strings to use as a single error message.</param>
        public void SetErrorMessage(params string[] strings)
        {
            _Error = ICEController.WriteICEEventError(strings.Length > 0 ? String.Join("", strings) : "An unspecified ICE plugin error has occurred.");
        }

        // -------------------------------------------------------------------------------------------------------

        public Plugin()
        {
            // ... detect if this is a derived type, then 'inject' self as the plugin ...
            // (note: the implementer must override the required methods)
            if (this.GetType() != typeof(Plugin<T>)) _Plugin = (T)(IPlugin)this;

            ConfigurationLoadeError += _Plugin_ConfigurationLoadeError;
            CreateNewConfiguration += _Plugin_CreateNewConfiguration;
        }

        internal void _Configure(Channel channel, Library library, string name, T instance = null, string guid = null)
        {
            if (string.IsNullOrEmpty(name)) throw new ArgumentNullException("name is null or empty");

            _Plugin = instance ?? _Plugin;

            if (_Plugin == null) throw new ArgumentNullException("instance");

            Channel = channel;
            Library = library;
            Name = name;
            GUID = string.IsNullOrEmpty(guid) ? System.Guid.NewGuid().ToString() : guid;

            _SetupConfiguration(Path.GetDirectoryName(_Plugin.GetType().Assembly.Location), GUID);
        }

        // -------------------------------------------------------------------------------------------------------

        void _Plugin_ConfigurationLoadeError(ConfigurationBase sender, Exception ex)
        {
            if (ex != null)
            {
                SetErrorMessage(ex, "Failed to loaded data file '", _ConfigurationFile, "'.");
                // (Note: A new properties table will be created, but the '_Error' field will be set, preventing future saves [for precaution])
            }
        }

        void _Plugin_CreateNewConfiguration(ConfigurationBase sender, DataTable table)
        {
            table.Rows.Add("PluginID", GUID);
            table.Rows.Add("Name", Name);
        }

        // -------------------------------------------------------------------------------------------------------
        // Wrapped interface related methods

        public string TypeTitle
        {
            get
            {
                return (this != _Plugin) ? _Plugin.GetType().Name : typeof(T).Name;
            }
        }

        public virtual bool IsStopped { get; set; }
        public virtual bool IsPaused { get; set; }

        // -------------------------------------------------------------------------------------------------------

        public void Initialize()
        {
            if (!IsInitialized)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' startup properties:", GetNameValues(), "Initializing ...");

                    LoadData();

                    _Plugin.Initialize(Channel.Controller, this);
                    PluginState = PluginState.Ready;

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' initialized.", "Properties after initialization:", GetNameValues());
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error initializing ", typeTitle.ToLower(), " '", Name, "' on channel '", Channel.Name, "'.");
                }
            }
        }

        /// <summary>
        /// Initializes the plugin.  This is where a plugin's constructor logic should go.
        /// </summary>
        /// <param name="controller">A reference to an ICE controller instance.</param>
        /// <param name="pluginWrapper">A reference to the plugin controller (or the plugin itself for derived types), which contains other methods specific to plugins (such as setting up default name=value properties).</param>
        /// <returns>True if initialization was successful.</returns>
        public virtual void Initialize(ICEController controller, IPluginController pluginWrapper)
        {
            if (_Plugin != null && _Plugin != this)
                _Plugin.Initialize(controller, pluginWrapper);
            throw new NotImplementedException("You must implement an 'IPlugin.Initialize()' method in your own type, or override the existing one for derived types.");
        }

        protected bool _CheckInitialized(bool throwException = true)
        {
            if (!IsInitialized)
                if (throwException)
                    throw new InvalidOperationException("The plugin is not yet initialized.");
                else
                    return false;
            return true;
        }

        public virtual void OnError(Exception ex)
        {
            if (_Plugin != null && _Plugin != this)
                _Plugin.OnError(ex);
        }

        public void _OnStart()
        {
            if (!_CheckInitialized(false))
                _Timer.Dispose();

            if (PluginState == PluginState.Ready || PluginState == PluginState.Paused || PluginState == PluginState.Stopped)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Starting '" + Name + "' ...");

                    _Plugin.OnStart();
                    PluginState = PluginState.Started;

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' started.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error starting ", typeTitle.ToLower(), " '", Name, "' on channel '", Channel.Name, "'.");
                }
            }
        }
        public virtual void OnStart()
        {
            if (_Plugin != null && _Plugin != this)
                _Plugin.OnStart();
        }


        public void _OnStop()
        {
            _CheckInitialized();

            if (PluginState == PluginState.Started || PluginState == PluginState.Paused)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Stopping '" + Name + "' ...");

                    _Plugin.OnStop();
                    PluginState = PluginState.Stopped;

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' stopped.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error stopping ", typeTitle.ToLower(), " '", Name, "' on channel '", Channel.Name, "'.");
                }
            }
        }
        public virtual void OnStop()
        {
            if (_Plugin != null && _Plugin != this)
                _Plugin.OnStart();
        }

        public void _OnClosing()
        {
            _CheckInitialized();

            var typeTitle = TypeTitle;

            try
            {
                ICEController.WriteICEEventInfo("(" + typeTitle + ") Closing '" + Name + "' ...");

                _Plugin.OnClosing();
                PluginState = PluginState.Uninitialized;

                ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' ready for termination.");
            }
            catch (Exception ex)
            {
                SetErrorMessage(ex, "Error closing ", typeTitle.ToLower(), " '", Name, "' on channel '", Channel.Name, "'.");
            }
        }
        public virtual void OnClosing()
        {
            if (_Plugin != null && _Plugin != this)
                _Plugin.OnClosing();
        }

        public void _OnPause()
        {
            _CheckInitialized();

            if (PluginState == PluginState.Started)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Pausing '" + Name + "' ...");

                    _Plugin.OnPause();
                    PluginState = PluginState.Paused;

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' paused.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error pausing ", typeTitle.ToLower(), " '", Name, "' on channel '", Channel.Name, "'.");
                }
            }
        }
        public virtual void OnPause()
        {
            if (_Plugin != null && _Plugin != this)
                _Plugin.OnStart();
        }

        public bool _OnRun()
        {
            _CheckInitialized();

            var runNext = true;

            if (PluginState == PluginState.Started || PluginState == PluginState.Paused)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Running '" + Name + "' ...");

                    runNext = _Plugin.OnRun();

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' completed.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error running ", typeTitle.ToLower(), " '", Name, "' on channel '", Channel.Name, "'.");
                    runNext = false;
                }
            }

            return runNext;
        }
        public virtual bool OnRun()
        {
            if (_Plugin != null && _Plugin != this)
                return _Plugin.OnRun();
            else
                return true;
        }

        public void RunNext()
        {
            Channel._RunNext();
        }

        public void _OnTick()
        {
            _CheckInitialized();

            if (PluginState == PluginState.Started)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Timer elapsed for '" + Name + "' ...");

                    _Plugin.OnTick();

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + Name + "' completed.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error in timer method for ", typeTitle.ToLower(), " '", Name, "' on channel '", Channel.Name, "'.");
                }
            }
        }
        public virtual void OnTick()
        {
            if (_Plugin != null && _Plugin != this)
                _Plugin.OnTick();
        }

        // -------------------------------------------------------------------------------------------------------

        public void SetInterval(long ms)
        {
            if (_Timer != null)
                _Timer.Change(1, ms);
            else
                _Timer = new Timer((state) => { Channel.QueueAction(_OnTick); }, this, 1, ms); // (the timer executes on its own thread, so queue the action to run on the channel's thread)
        }

        // -------------------------------------------------------------------------------------------------------
    }

    // ===========================================================================================================
}
