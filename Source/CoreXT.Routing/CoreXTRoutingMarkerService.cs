using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.Routing
{
    /// <summary>
    /// A marker class used to determine if all the CoreXT routing services were added to the
    /// <see cref="IServiceCollection"/> before the CoreXT routing pipeline is configured.
    /// </summary>
    public class CoreXTRoutingMarkerService
    {
    }
}
