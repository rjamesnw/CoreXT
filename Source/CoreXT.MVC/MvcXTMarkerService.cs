using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.MVC
{
    /// <summary>
    /// A marker class used to determine if all the CoreXT MVC services were added to the
    /// <see cref="IServiceCollection"/> before the CoreXT MVC routing pipeline is configured.
    /// </summary>
    public class MvcXTMarkerService
    {
    }
}
