using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.IO;
using System.Linq;
using Common;

namespace ICE
{

    public class TaskPlugin<T> : Plugin<T>
        where T : class, ITaskPlugin
    {
        // -------------------------------------------------------------------------------------------------------

        public TaskPlugin(Channel channel, string name, T instance, string guid) : base(channel, name, instance, guid) { }
        public TaskPlugin(Channel parent, string name, T instance) : this(parent, name, instance, null) { }

        // -------------------------------------------------------------------------------------------------------
        // Wrapped interface related methods

        public virtual void Start()
        {
            _CheckInitialized();

            if (_PluginState == PluginState.Ready || _PluginState == PluginState.Paused || _PluginState == PluginState.Stopped)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Starting '" + _Name + "' ...");

                    _Plugin.OnStart();
                    _PluginState = PluginState.Started;

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + _Name + "' started.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error starting ", typeTitle.ToLower(), " '", _Name, "' on channel '", _Channel.Name, "'.");
                }
            }
        }

        public virtual void Stop()
        {
            _CheckInitialized();

            if (_PluginState == PluginState.Started || _PluginState == PluginState.Paused)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Stopping '" + _Name + "' ...");

                    _Plugin.OnStop();
                    _PluginState = PluginState.Stopped;

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + _Name + "' stopped.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error stopping ", typeTitle.ToLower(), " '", _Name, "' on channel '", _Channel.Name, "'.");
                }
            }
        }

        public virtual void Pause()
        {
            _CheckInitialized();

            if (_PluginState == PluginState.Started)
            {
                var typeTitle = TypeTitle;

                try
                {
                    ICEController.WriteICEEventInfo("(" + typeTitle + ") Pausing '" + _Name + "' ...");

                    _Plugin.OnPause();
                    _PluginState = PluginState.Paused;

                    ICEController.WriteICEEventInfo("(" + typeTitle + ") '" + _Name + "' paused.");
                }
                catch (Exception ex)
                {
                    SetErrorMessage(ex, "Error pausing ", typeTitle.ToLower(), " '", _Name, "' on channel '", _Channel.Name, "'.");
                }
            }
        }

        // -------------------------------------------------------------------------------------------------------
    }

    // ===========================================================================================================
}
