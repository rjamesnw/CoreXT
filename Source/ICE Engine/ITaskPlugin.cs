using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICE
{
    /// <summary>
    /// Represents a plugin that has focuses on a particular task (usually on a timer, or other event based trigger).
    /// </summary>
    public interface ITaskPlugin : IPlugin
    {
        /// <summary>
        /// Starts the task.  This may not actually trigger the underlying task, but lets the plugin know to begin listening for the event it needs (timers,
        /// socket servers, file access, etc.).
        /// </summary>
        void OnStart();

        /// <summary>
        /// Notifies the task to stop (if running).  Since this is a notification only, the underlying task may not stop immediately. 
        /// </summary>
        void OnStop();

        /// <summary>
        /// Pauses the task (if running).
        /// </summary>
        void OnPause();

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
