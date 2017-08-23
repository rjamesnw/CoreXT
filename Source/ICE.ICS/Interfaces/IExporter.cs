using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS.Enumerators;

namespace ICS
{
    public interface IExporter
    {
        EnumeratorBase Source { get; set; }

        bool IsInitialized { get; }

        void Initialize(EnumeratorBase sourceEnum);
        /* Reference to the source enumerator that this class is registered with. This method should call Reset() as a “best practice”. This method should not be called from the constructor. The SourceEnumerator object given should have a translator specified; otherwise the export will most likely fail. */

        void Reset();
        /* Resets internal variables to defaults, and gets ready to process another message. This method will be called by the export manager just before calling Export(). */

        void Export();
        /* Exports the message associated with “exportManager”. */

        void OnIdle();
        /* Is called after all messages are processed */
    }
}
