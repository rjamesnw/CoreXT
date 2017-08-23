using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Xml.Linq;
using System.Threading;
using System.Diagnostics;
using System.Threading.Tasks;

namespace ICE
{
    public class Channel
    {
        // -------------------------------------------------------------------------------------------------------

        public readonly Channels Parent;
        public ICEController Controller { get { return Parent.Controller; } }

        internal Thread _Thread; // (the thread this channel is on)

        public string Name;

        public string GUID { get { return _GUID; } }
        protected string _GUID = "";

        /// <summary>
        /// Holds the message data for this channel.  Each task in turn has the ability to modify this data for processing by following tasks.
        /// Internally, this is 'null', until the property is accessed, at which point a new XML-based message document is created.
        /// Check 'HasMessage' to see if there is a valid message before accessing this property.
        /// </summary>
        public XDocument Message { get { return _Message ?? (_Message = new XDocument()); } }
        XDocument _Message;

        /// <summary>
        /// If the channel processes non-textual data (i.e. uses special objects or binary data), it can be placed here instead.
        /// <para>Note: This is usually only for special cases, and as such, there may be no compatible plugins to convert or otherwise process the data in
        /// this case.</para>
        /// </summary>
        public object Data { get; set; }

        /// <summary>
        /// Returns true when a message is available for processing.
        /// This becomes true once a valid message instance (an XML document) is created internally (see the 'Message' property), and a valid root node exists.
        /// </summary>
        public bool HasMessage { get { return _Message != null && _Message.FirstNode != null; } }

        /// <summary>
        /// Allows iterating over all the plugin instances for this channel.
        /// </summary>
        public IEnumerable<Plugin<IPlugin>> PluginInstances { get { return _PluginInstances.AsEnumerable(); } }
        internal readonly List<Plugin<IPlugin>> _PluginInstances = new List<Plugin<IPlugin>>();

        int _ActivePluginInstanceIndex = -1;

        /// <summary>
        /// The plugin that is currently active (running), if any, or null otherwise.
        /// </summary>
        public IPluginController ActivePluginInstance { get { return _ActivePluginInstanceIndex >= 0 ? _PluginInstances[_ActivePluginInstanceIndex] : null; } }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the channel itself has encountered an error.
        /// This can be set if an uncaught exception occurs in a queued action for this channel.
        /// When an exception occurs, the error is added to the event log, and the action is discarded.
        /// Be sure to catch errors and recover with the action routines to prevent this.
        /// </summary>
        public Exception LastError { get { return _LastError; } }
        internal Exception _LastError;

        /// <summary>
        /// Clears the last channel specific error, if any.
        /// </summary>
        public void ClearError() { _LastError = null; }

        /// <summary>
        /// Returns true if the channel itself (not any plugin instances) has encountered an error.
        /// </summary>
        public bool HasError { get { return _LastError != null; } }

        // -------------------------------------------------------------------------------------------------------

        public Channel(Channels parent, string name, string guid)
        {
            if (parent == null) throw new ArgumentNullException("parent");
            Parent = parent;
            Name = name;
            _GUID = string.IsNullOrEmpty(guid) ? System.Guid.NewGuid().ToString("N") : guid;
            _Thread = new Thread(_ThreadLoop);
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the channel has been requested to terminate - usually due to calling 'ICEController.Shutdown()'.
        /// </summary>
        public bool IsClosing { get { return _Closing; } }
        bool _Closing; // (true to flag a request to stop the thread loop)

        Queue<Action> _Actions = new Queue<Action>(10);

        /// <summary>
        /// Queues an action to run on the channel's thread.
        /// If the caller is already on the same thread, the action is run immediately and not queued.
        /// To force queuing by callers on the channel's own thread, simple set 'forceQueue' to true.
        /// </summary>
        public void QueueAction(Action a, bool forceQueue = false)
        {
            if (Thread.CurrentThread.ManagedThreadId == _Thread.ManagedThreadId)
                a();
            else
                lock (_Actions) { _Actions.Enqueue(a); }
        }

        /// <summary>
        /// Each channel is run in a different thread to prevent interference with other channels.
        /// </summary>
        void _ThreadLoop()
        {
            Action action;

            while (!AppDomain.CurrentDomain.IsFinalizingForUnload() && !_Closing)
            {
                while (_Actions.Count > 0)
                {
                    lock (_Actions)
                    {
                        action = _Actions.Dequeue();
                    }
                    try
                    {
                        action();
                    }
                    catch (Exception ex)
                    {
                        _LastError = ICEController.WriteICEEventError("A queued action '" + action.Method.Name + "' for channel '" + Name + " (" + _GUID + ")' has caused an exception error.", ex);
                    }
                }

                Thread.Sleep(0);
            }
        }

        // -------------------------------------------------------------------------------------------------------

        public void Clear()
        {
            Stop();
            _PluginInstances.Clear();
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates and returns a plugin instance to run on the channel.
        /// </summary>
        /// <param name="name">The case-sensitive type name, or full type name (i.e. [Namespace].[Type]), of the plugin to create.  Full type names are
        /// searched first before type-only names.</param>
        public Plugin<IPlugin> CreateInstance(string name, string guid)
        {
            ICEController.WriteICEEventInfo("Creating instance for plugin '" + name + "' on channel '" + Name + "'...");

            Plugin<IPlugin> plugin = PluginManager.CreateInstance(this, name, guid);

            if (plugin != null)
                _PluginInstances.Add(plugin);

            return plugin;
        }
        public Plugin<IPlugin> CreateInstance(string name) { return CreateInstance(name, null); }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a plugin instance with the given instance (display) name, or 'null' if not found.
        /// <para>Note: No two plugin instances can have the same name.</para>
        /// </summary>
        public Plugin<IPlugin> GetPluginInstance(string instanceName)
        {
            return (from pi in _PluginInstances where pi.Name == instanceName select pi).FirstOrDefault();
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Initializes any plugins that have not been initialized yet.
        /// This is called after all plugin instances have been instantiated and configured, and has no effect on already initialized plugin instances.
        /// </summary>
        public Task Initialize(int timeout = -1)
        {
            var task = new TaskCompletionSource<bool>();
            QueueAction(() =>
            {
                foreach (Plugin<IPlugin> plugin in _PluginInstances)
                    plugin.Initialize();
            });
            if (timeout > 0)
                return TaskEx.WhenAny(task.Task, TaskEx.Delay(timeout));
            else
                return task.Task;
        }

        public Task Start(int timeout = -1)
        {
            var task = new TaskCompletionSource<bool>();
            QueueAction(() =>
            {
                foreach (Plugin<IPlugin> plugin in _PluginInstances)
                    plugin._OnStart();
            });
            if (timeout > 0)
                return TaskEx.WhenAny(task.Task, TaskEx.Delay(timeout));
            else
                return task.Task;
        }

        /// <summary>
        /// Queues a request to stop all plugin instances, optionally waiting until the request has completed.
        /// </summary>
        /// <param name="timeout">How long to wait (in ms) for all plugin instances to stop.  By default this is -1, which means "wait indefinitely".</param>
        public Task Stop(int timeout = -1)
        {
            var task = new TaskCompletionSource<bool>();
            QueueAction(() =>
            {
                foreach (Plugin<IPlugin> plugin in _PluginInstances)
                    plugin._OnStop();
                task.TrySetResult(true);
            });
            if (timeout > 0)
                return TaskEx.WhenAny(task.Task, TaskEx.Delay(timeout));
            else
                return task.Task;
        }

        public Task Pause(int timeout = -1)
        {
            var task = new TaskCompletionSource<bool>();
            QueueAction(() =>
            {
                foreach (Plugin<IPlugin> plugin in _PluginInstances)
                    plugin._OnPause();
                task.TrySetResult(true);
            });
            if (timeout > 0)
                return TaskEx.WhenAny(task.Task, TaskEx.Delay(timeout));
            else
                return task.Task;
        }

        public Task Closing(int timeout = -1)
        {
            var task = new TaskCompletionSource<bool>();
            QueueAction(() =>
            {
                foreach (Plugin<IPlugin> plugin in _PluginInstances)
                    plugin._OnClosing();
            });
            if (timeout > 0)
                return TaskEx.WhenAny(task.Task, TaskEx.Delay(timeout));
            else
                return task.Task;
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// When a plugin calls "RunNext()" it usually was triggered due to an event and has completed a task and is ready for the next plugin to take over.
        /// This allows plugins to run in series, processing input data in a chain-like fashion.
        /// </summary>
        internal void _RunNext()
        {
            if (_ActivePluginInstanceIndex < 0)
            {
                if (_PluginInstances.Count > 0)
                    _ActivePluginInstanceIndex = 0;
            }
            else
            {
                _ActivePluginInstanceIndex++;
                if (_ActivePluginInstanceIndex >= _PluginInstances.Count)
                    _ActivePluginInstanceIndex = -1;
            }
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Determines if all plugin instances in this channel are of the same state.
        /// This is usually used to determine if all plugin instances have been initialized, started, stopped, etc.
        /// </summary>
        /// <param name="pluginState">The state to match against all plugin instances for all channels.</param>
        public bool IsAll(PluginState pluginState)
        {
            foreach (var plugin in PluginInstances)
                if (plugin.PluginState != pluginState) return false;
            return true;
        }

        /// <summary>
        /// Determines if ANY plugin instance in this channel matches the given state.
        /// This is usually used to determine if an error has occurred.
        /// </summary>
        /// <param name="pluginState">The state to match against all plugin instances for all channels.</param>
        public bool IsAny(PluginState pluginState)
        {
            foreach (var plugin in PluginInstances)
                if (plugin.PluginState == pluginState) return true;
            return false;
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Aborts all channel threads if still running after a specified time.  This should only be used as a last resort.
        /// If exiting an application process, call 'ICEController.Shutdown()' instead, which is more graceful.
        /// </summary>
        public Task Terminate(int timeout = ICEController.DEFAULT_TERMINATE_TIMEOUT)
        {
            var task = new TaskCompletionSource<bool>();

            if (_Thread != null && _Thread.ThreadState != System.Threading.ThreadState.Unstarted)
            {
                QueueAction(async () =>
                {
                    _Closing = true;
                    await Stop(); // (give time for ALL channels to stop)
                    await Closing(); // (give time for ALL channels to execute closing code)
                    task.TrySetResult(true);
                });
            }
            else task.TrySetResult(true);

            if (timeout > 0)
                return TaskEx.WhenAny(task.Task, TaskEx.Delay(timeout).ContinueWith(t => { _Thread.Abort(); })); // (forcibly terminate [abort] thread on timeout)
            else
                return task.Task;
        }

        // -------------------------------------------------------------------------------------------------------
    }

    public class Channels
    {
        // -------------------------------------------------------------------------------------------------------

        public ICEController Controller { get; private set; }

        List<Channel> _Channels = new List<Channel>();

        // -------------------------------------------------------------------------------------------------------

        public Channel CreateChannel(string name, string guid = null)
        {
            ICEController.WriteICEEventInfo("Creating channel '" + name + "'...");
            Channel channel = new Channel(this, name, guid);
            _Channels.Add(channel);
            return channel;
        }

        // -------------------------------------------------------------------------------------------------------

        public Channels(ICEController controller)
        {
            if (controller == null) throw new ArgumentNullException("controller");
            Controller = controller;
        }

        // -------------------------------------------------------------------------------------------------------

        public void Clear()
        {
            foreach (Channel channel in _Channels)
            {
                try
                {
                    channel.Clear();
                }
                catch
                {
                }
            }
            try
            {
                _Channels.Clear();
            }
            catch
            {
            }
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Initializes all channels that are not yet initialized.
        /// <para>Each channel runs on its own thread, and this method calls a method of the same name on each specific channel instance all at once, which in
        /// turn queues the request to run on the thread specific to that channel. You can use the "await" operator to block the calling thread until the
        /// request completes for all channels.</para>
        /// </summary>
        /// <param name="timeout">An optional timeout value (in milliseconds).</param>
        public Task Initialize()
        {
            var tasks = new List<Task>(_Channels.Count);
            foreach (Channel channel in _Channels)
                tasks.Add(channel.Initialize());
            return TaskEx.WhenAll(tasks);
        }

        /// <summary>
        /// Starts all channels.
        /// <para>Each channel runs on its own thread, and this method calls a method of the same name on each specific channel instance all at once, which in
        /// turn queues the request to run on the thread specific to that channel. You can use the "await" operator to block the calling thread until the
        /// request completes for all channels.</para>
        /// </summary>
        /// <param name="timeout">An optional timeout value (in milliseconds).</param>
        public Task Start(int timeout = -1)
        {
            var tasks = new List<Task>(_Channels.Count);
            foreach (Channel channel in _Channels)
                tasks.Add(channel.Start());
            return TaskEx.WhenAll(tasks);
        }

        /// <summary>
        /// Stops all channels.
        /// Each channel runs on its own thread, and this method calls a method of the same name on each specific channel instance all at once.
        /// <para>Each channel runs on its own thread, and this method calls a method of the same name on each specific channel instance all at once, which in
        /// turn queues the request to run on the thread specific to that channel. You can use the "await" operator to block the calling thread until the
        /// request completes for all channels.</para>
        /// </summary>
        /// <param name="timeout">An optional timeout value (in milliseconds).</param>
        public Task Stop(int timeout = -1)
        {
            var tasks = new List<Task>(_Channels.Count);
            foreach (Channel channel in _Channels)
                tasks.Add(channel.Stop());
            return TaskEx.WhenAll(tasks);
        }

        /// <summary>
        /// Pauses all channels.
        /// <para>Each channel runs on its own thread, and this method calls a method of the same name on each specific channel instance all at once, which in
        /// turn queues the request to run on the thread specific to that channel. You can use the "await" operator to block the calling thread until the
        /// request completes for all channels.</para>
        /// </summary>
        /// <param name="timeout">An optional timeout value (in milliseconds).</param>
        public Task Pause(int timeout = -1)
        {
            var tasks = new List<Task>(_Channels.Count);
            foreach (Channel channel in _Channels)
                tasks.Add(channel.Pause());
            return TaskEx.WhenAll(tasks);
        }

        /// <summary>
        /// Notifies all channels that the channel is being removed (usually due to the application shutting down).
        /// <para>Each channel runs on its own thread, and this method calls a method of the same name on each specific channel instance all at once, which in
        /// turn queues the request to run on the thread specific to that channel. You can use the "await" operator to block the calling thread until the
        /// request completes for all channels.</para>
        /// </summary>
        /// <param name="timeout">An optional timeout value (in milliseconds).</param>
        public Task Closing(int timeout = -1)
        {
            var tasks = new List<Task>(_Channels.Count);
            foreach (Channel channel in _Channels)
                tasks.Add(channel.Closing(timeout));
            return TaskEx.WhenAll(tasks);
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Determines if all plugin instances in all channels are of the same state.
        /// This is usually used to determine if all plugin instances have been initialized, started, stopped, etc.
        /// </summary>
        /// <param name="pluginState">The state to match against all plugin instances for all channels.</param>
        public bool IsAll(PluginState pluginState)
        {
            foreach (Channel channel in _Channels)
                return channel.IsAll(pluginState);
            return true;
        }

        /// <summary>
        /// Determines if ANY plugin instance in ANY channel matches the given state.
        /// This is usually used to determine if an error has occurred.
        /// </summary>
        /// <param name="pluginState">The state to match against all plugin instances for all channels.</param>
        public bool IsAny(PluginState pluginState)
        {
            foreach (Channel channel in _Channels)
                return channel.IsAny(pluginState);
            return false;
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Immediately stops and closes all channel threads. A terminate request is send to all channels at once, with a default 5 second timeout before the
        /// channel threads are forcibly aborted.
        /// <para>Note: If exiting an application process, best practice is to call 'ICEController.Shutdown()'.</para>
        /// <para>Each channel runs on its own thread, and this method calls a method of the same name on each specific channel instance all at once, which in
        /// turn queues the request to run on the thread specific to that channel.  This method doesn't return until all channels are closed.</para>
        /// </summary>
        /// <param name="timeout">The amount of time for each individual channel thread to finish up before it is forced to terminate. Specify -1 to wait indefinitely.</param>
        public async void Terminate(int timeout = ICEController.DEFAULT_TERMINATE_TIMEOUT)
        {
            List<Task> tasks = new List<Task>(_Channels.Count);

            foreach (Channel channel in _Channels)
                tasks.Add(channel.Terminate(timeout));

            await TaskEx.WhenAll(tasks);
        }

        // -------------------------------------------------------------------------------------------------------
    }
}
