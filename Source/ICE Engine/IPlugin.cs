using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICE
{
    /// <summary>
    /// This allows 3rd-parties to implement the 'IPlugin' interface without having to derive from the 'Plugin' class.  Plugin developers can simply
    /// implement 'IPlugin' into their existing classes and use 'Plugin&lt;MyType>' instead.
    /// </summary>
    public interface IPlugin
    {
        /// <summary>
        /// Initializes the plugin.  This is where a plugin's constructor logic should go.
        /// </summary>
        /// <param name="controller">A reference to an ICE controller instance.</param>
        /// <param name="pluginWrapper">A reference to the plugin controller (or the plugin itself for derived types), which contains other methods specific to plugins (such as setting up default name=value properties).</param>
        /// <returns>True if initialization was successful.</returns>
        void Initialize(ICEController controller, IPluginController pluginController);

        /// <summary>
        /// Called when an error occurs.  An error can be triggered within the plugin itself (and caught by the ICE system), or caused within the ICE system
        /// itself (for instance, if there's suddenly a write access error to the configuration file).  In any case, this method will be called.
        /// Derived types should override this method to implement custom behavior.
        /// </summary>
        void OnError(Exception ex);

        /// <summary>
        /// Starts the task.  This may not actually trigger the underlying task, but lets the plugin know to begin listening for the event it needs (timers,
        /// socket servers, file access, etc.).
        /// </summary>
        void OnStart();

        /// <summary>
        /// Occurs when it's a plugin's time to execute in the chain of plugins.
        /// The implementation should return true to continue to the next task, and false to abort the process.
        /// This can be used to filter channel events.
        /// </summary>
        bool OnRun();

        /// <summary>
        /// Notifies the task to stop (if running).  Since this is a notification only, the underlying task may not stop immediately. 
        /// </summary>
        void OnStop();

        /// <summary>
        /// Called when the plugin is being unloaded (usually when the application is shutting down).
        /// </summary>
        void OnClosing();

        /// <summary>
        /// Pauses the task (if running).
        /// </summary>
        void OnPause();

        /// <summary>
        /// Occurs at an interval set by the plugin during initialization (off by default).
        /// <para>Plugins have the ability to turn on and set the interval of plugin-specific timers as needed. Since most services operate on timers,
        /// this provides a convenient method to set one up by simply calling 'SetInterval()' on a plugin instance.</para>
        /// </summary>
        void OnTick();

        /// <summary>
        /// After 'Stop()' is called, this property should return true when the task has stopped and is no longer listening for events.
        /// </summary>
        bool IsStopped { get; }

        /// <summary>
        /// After 'Pause()' is called, this property should return true when the task has paused (if applicable; this may mean different things based on the
        /// implementer, and may behave as if 'Stop()' was called in some cases).
        /// </summary>
        bool IsPaused { get; }
    }
}
