using CoreXT;
using CoreXT.Services.DI;
using Microsoft.Extensions.Options;
using System.Collections.Generic;

namespace CoreXT.Demos.Models
{
    public interface IAppSettings
    {
        Dictionary<string, string> ConnectionStrings { get; set; }
        string DefaultConnectionString { get; }
    }

    public class CoreXTDemoAppSettings : IAppSettings // TODO: Need to make a COMMON base type, since these properties are the same on both CDS and CoreXT.Demos.
    {
        public string ApplicationName { get; set; }
        public Dictionary<string, string> ConnectionStrings { get; set; }
        public string DefaultConnectionString { get { return ConnectionStrings != null ? ConnectionStrings.Value("DefaultConnection") : null; } }
    }

    // ========================================================================================================================

    public static class ConfigExtensions
    {
        public static CoreXTDemoAppSettings GetCoreXTDemoAppSettings(this ICoreXTServiceProvider sp)
        {
            return sp.GetService<IOptions<CoreXTDemoAppSettings>>()?.Value;
        }
    }

    // ========================================================================================================================
}
