using System;
using System.Collections.Generic;
using System.Reflection;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static class EnumExtensions
    {
        // ---------------------------------------------------------------------------------------------------------------------

        public static string GetName(this Enum source)
        {
            return Enum.GetName(source.GetType(), source);
        }
        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
