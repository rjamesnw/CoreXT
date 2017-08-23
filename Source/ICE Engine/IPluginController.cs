using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;

namespace ICE
{
    /// <summary>
    /// Represents a wrapper for an external plugin.
    /// Normally developers derive from the 'Plugin' class, or implement IPlugin.
    /// This interface is not expected to be used externally, but provides the possibility to create a custom plugin controller instance if needed.
    /// </summary>
    public interface IPluginController
    {
        /// <summary>
        /// A reference to the channel this plugin instance is loaded in.
        /// </summary>
        Channel Channel { get; }

        /// <summary>
        /// A reference to the library this plugin instance belongs to.
        /// </summary>
        Library Library { get; }

        /// <summary>
        /// A convenience method that simply references the global ICEController instance.
        /// </summary>
        ICEController Controller { get; }

        string Name { get; }
        string GUID { get; }

        /// <summary>
        /// Returns a title which represents what type of plugin this is.
        /// </summary>
        string TypeTitle { get; }

        PluginState PluginState { get; }
        bool IsInitialized { get; }
        DataSet Configuration { get; }

        /// <summary>
        /// Returns true once the data for the plugin instance is loaded for the first time.
        /// This remains true even if the data is cleared in order to prevent implicitly reloading
        /// the data again.
        /// </summary>
        bool IsConfigurationLoaded { get; }

        /// <summary>
        /// Prevents saving data until 'EndDataInit()' is called.
        /// This is useful when updating the dataset during a plugin initialization.
        /// </summary>
        void BeginDataInit();

        /// <summary>
        /// Undoes the 'BeginDataInit()' state (see <seealso cref="BeginDataInit()"/>).
        /// </summary>
        void EndDataInit();

        /// <summary>
        /// Loads the data file for this plugin instance.  Any existing unsaved changes will be lost.
        /// </summary>
        /// <param name="reload">If false, the data is not loaded if already loaded; however if the properties
        /// table is missing, it will be recreated.</param>
        DataSet LoadData(bool reload);

        /// <summary>
        /// Loads/reloads the data file for this plugin instance.  Any existing unsaved changes will be lost.
        /// </summary>
        DataSet LoadData();

        /// <summary>
        /// Saves the current data for this plugin to an XML file with a name based on the GUID.
        /// The file is expected to be in the same location as the plugin assembly location.
        /// </summary>
        void SaveData();

        /// <summary>
        /// Creates and returns a new table, or returns any existing table with the same name.
        /// </summary>
        DataTable CreateTable(string tableName);

        void SetValue(string name, string value);
        string GetValue(string name, string defaultValue);

        /// <summary>
        /// Attempts to get a property value, using the default value if not found.
        /// If the property name is not found, the default value becomes set as the active value before returning.
        /// </summary>
        string GetSetValue(string name, string defaultValue);

        /// <summary>
        /// Attempts to get a property value, using the default value if not found.
        /// If the property name is not found, the default value becomes set as the active value before returning.
        /// </summary>
        int GetSetValue(string name, int defaultValue);

        /// <summary>
        /// Attempts to get a property value, using the default value if not found.
        /// If the property name is not found, the default value becomes set as the active value before returning.
        /// </summary>
        double GetSetValue(string name, double defaultValue);

        /// <summary>
        /// Attempts to get a property value, using the default value if not found.
        /// If the property name is not found, the default value becomes set as the active value before returning.
        /// </summary>
        DateTime GetSetValue(string name, DateTime defaultValue);

        /// <summary>
        /// Attempts to get a property value, using the default value if not found.
        /// If the property name is not found, the default value becomes set as the active value before returning.
        /// </summary>
        TimeSpan GetSetValue(string name, TimeSpan defaultValue);

        /// <summary>
        /// Clears ALL data in the data set for the current plugin.
        /// The properties table will be rebuilt again before returning.
        /// </summary>
        void ClearData();

        /// <summary>
        /// Removes the "Properties" table for the current plugin and rebuilds it again.
        /// </summary>
        void ClearProperties();

        /// <summary>
        /// Enables and sets the interval of a timer for the underlying plugin.
        /// <para>Plugins have the ability to turn on and set the interval of plugin-specific timers as needed. Since most services operate on timers,
        /// this provides a convenient method to set one up by simply calling 'SetInterval()' on a plugin instance.</para>
        /// </summary>
        void SetInterval(long ms);

        /// <summary>
        /// When a plugin calls "RunNext()" it usually was triggered due to an event and has completed a task and is ready for the next plugin to take over.
        /// This allows plugins to run in series, processing input data in a chain-like fashion.
        /// <para>This method is usually called by the first plugin instance, which is waiting on an event (timer, file, network, or otherwise), which
        /// acts as a filter, executing 'RunNext()' when all required conditions are met.</para>
        /// </summary>
        void RunNext();
    }
}
