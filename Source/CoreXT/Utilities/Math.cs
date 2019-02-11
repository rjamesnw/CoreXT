using System;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static class Math
    {
        // ---------------------------------------------------------------------------------------------------------------------

        public static double ToRad(double valueInDegrees) { return valueInDegrees * System.Math.PI / 180; }

        public static double ToDegrees(double valueInRads) { return valueInRads * 180 / System.Math.PI; }

        // ---------------------------------------------------------------------------------------------------------------------

        public static double GetMapDistance(double longitude1, double latitude1, double longitude2, double latitude2)
        {
            // (see http://www.movable-type.co.uk/scripts/latlong.html and http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points)

            double R = 6371d; // earth radius in km

            double dLat = ToRad(latitude2 - latitude1);
            double dLon = ToRad(longitude2 - longitude1);

            latitude1 = ToRad(latitude1);
            latitude2 = ToRad(latitude2);

            double a = System.Math.Sin(dLat / 2) * System.Math.Sin(dLat / 2) +
                    System.Math.Sin(dLon / 2) * System.Math.Sin(dLon / 2) * System.Math.Cos(latitude1) * System.Math.Cos(latitude2);

            double c = 2 * System.Math.Atan2(System.Math.Sqrt(a), System.Math.Sqrt(1 - a));

            double d = R * c;

            return d;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static double GetDistance(double x1, double y1, double x2, double y2)
        {
            return System.Math.Sqrt(System.Math.Pow(x2 - x1, 2) + System.Math.Pow(y2 - y1, 2));
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static class UID64
        {
            public static DateTime Epoch = new DateTime(2019, 1, 1);
            static ushort _UIDCounter = 0;

            /// <summary> Creates a unique 64-bit identifier from the given 20-bit session ID. </summary>
            /// <param name="session20ID"> A 20-bit identifier/hash for the session. </param>
            /// <returns> A new 64-bit unique ID. </returns>
            public static ulong UID(uint session20ID)
            {
                // ... 5 words for session ID ...

                var _sessionID = ((ulong)session20ID & 0xFFFFF) << (64 - 5 * 4);

                // ... 8 words for date+time ....

                var spanInSeconds = (((ulong)(DateTime.UtcNow - Epoch).TotalSeconds) & 0xFFFFFFFF) << (3 * 4);

                // ... 3 words for a counter value ...

                var counter = (ulong)(_UIDCounter++ & 0xFFF);

                // ... return 5 word session + 8 word date and time + 3 word counter ...

                return _sessionID | spanInSeconds | counter;
            }

            /// <summary>
            ///     Creates a unique 64-bit identifier from the given A 64-bit session ID that was originally creating using
            ///     <see cref="UID(uint)"/> or <see cref="UID(ulong)"/>. This is done by extracting most of the seconds value and the lowest
            ///     byte of the counter value to create a 20-bit session hash.
            /// </summary>
            /// <param name="sessionID">    A 64-bit session key ID value. </param>
            /// <returns>   A new 64-bit unique ID. </returns>
            public static ulong UID(ulong sessionID) => UID(((sessionID & 0xFFF000) >> 4) | (sessionID & 0xFF));
        }
    }

    // =========================================================================================================================
}
