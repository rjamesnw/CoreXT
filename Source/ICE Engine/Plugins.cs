using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICE
{
    // ###########################################################################################################

    /// <summary>
    /// This non-generic Plugin class contains details of the plugin type only.
    /// When creating plugins, simply implement the IPlugin interface, or inherit from the generic Plugin&lt;T> type.
    /// </summary>
    public sealed class PluginInfo
    {
        // -------------------------------------------------------------------------------------------------------

        public Library Library { get; private set; }
        public Type PluginType { get; private set; }

        // -------------------------------------------------------------------------------------------------------

        public PluginInfo(Library library, Type pluginType)
        {
            Library = library;
            PluginType = pluginType;
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates and returns a plugin instance to run on a given channel.
        /// </summary>
        /// <param name="channel">The channel instance to create the plugin in (required).</param>
        /// <param name="name">The case-sensitive type name, or full type name (i.e. [Namespace].[Type]), of the plugin to create.  Full type names are
        /// searched first before type-only names.</param>
        /// <param name="guid">A globally unique ID for this plugin instance (system wide, across all channels). If null or empty, a new GUID will be created automatically.</param>
        public Plugin<IPlugin> CreateInstance(Channel channel, string instanceName, string guid = null)
        {
            if (channel == null)
                throw new ArgumentNullException("A channel reference is required for plugin instances.");

            if (string.IsNullOrEmpty(guid))
                guid = Guid.NewGuid().ToString("N");

            if (channel.GetPluginInstance(instanceName) != null)
                throw new InvalidOperationException("There is already an existing plugin instance with the name '" + instanceName + "'.");

            Plugin<IPlugin> pluginController = null;

            try
            {
                ICEController.WriteICEEventInfo("Creating instance for plugin '" + PluginType.FullName + "' on channel '" + channel.Name + "'...");

                var pluginInstance = PluginType.Assembly.CreateInstance(PluginType.FullName) as IPlugin;

                pluginController = pluginInstance as Plugin<IPlugin>;

                if (pluginInstance != null && pluginController == null)
                {
                    // ... this plugin instance does not derive from the plugin<T> controller class, so we need to wrap it in one ...
                    pluginController = new Plugin<IPlugin>();
                    pluginController._Plugin = pluginInstance;
                }

                if (pluginController != null)
                    pluginController._Configure(channel, Library, instanceName, pluginController.ActualPlugin, guid);
            }
            catch (Exception ex)
            {
                throw ICEController.WriteICEEventError("Error creating plugin type '" + PluginType.FullName + "'.", ex);
            }

            return pluginController;
        }

        // -------------------------------------------------------------------------------------------------------

        public override bool Equals(object obj)
        {
            return obj is PluginInfo && ((PluginInfo)obj).PluginType == PluginType;
        }

        public override int GetHashCode()
        {
            return PluginType.GetHashCode();
        }

        // -------------------------------------------------------------------------------------------------------
    }

    // ###########################################################################################################

    public static class PluginManager
    {
        // -------------------------------------------------------------------------------------------------------

        public static IEnumerable<PluginInfo> Plugins { get { return _Plugins.Values; } }
        static Dictionary<string, PluginInfo> _Plugins = new Dictionary<string, PluginInfo>();

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Registers a plugin descriptor object in the internal plugin dictionary based on the full type name of the plugin type.
        /// </summary>
        public static void Add(PluginInfo plugin)
        {
            if (!_Plugins.ContainsKey(plugin.PluginType.FullName))
                _Plugins[plugin.PluginType.FullName] = plugin;
        }

        // -------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates and returns a plugin instance to run on a given channel.
        /// </summary>
        /// <param name="channel">The channel instance to create the plugin in (required).</param>
        /// <param name="typeName">The case-sensitive type name, or full type name (i.e. [Namespace].[Type]), of the plugin to create.  Full type names are
        /// searched first before type-only names.</param>
        /// <param name="guid">The channel instance to create the plugin in (required).</param>
        public static Plugin<IPlugin> CreateInstance(Channel channel, string typeName, string instanceName, string guid = null)
        {
            if (string.IsNullOrEmpty(typeName))
                throw new ArgumentNullException("name");

            // ... check full names first, then check type-only names ...

            PluginInfo pluginInfo = null;

            if (!_Plugins.TryGetValue(typeName, out pluginInfo))
                pluginInfo = (from pi in _Plugins.Values where pi.PluginType.Name == typeName && (pi.Library.IsLoaded || pi.Library.Load()) select pi).FirstOrDefault();

            if (pluginInfo != null)
                return pluginInfo.CreateInstance(channel, instanceName, guid);

            return null; // (not found, or an error occurred trying to load the underlying assembly for the library)
        }

        // -------------------------------------------------------------------------------------------------------
    }

    // ###########################################################################################################
}
