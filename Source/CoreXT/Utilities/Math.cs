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
            static volatile ushort _UIDCounter = 0;

            /// <summary>
            ///     Creates a unique 64-bit identifier based on a 14-bit shard (single server instance) ID, a 100ms interval, and an
            ///     internal static counter that wraps at 14 bits (every 16383 [handles ~163830 requests per second without
            ///     collisions]). Since most server operations are delayed slightly due to various operations (such as database reads
            ///     and/or writes), this counter is usually more than enough.
            ///     <para>Why use this method?  This method allows the inserting of records without needing auto-number IDs on the
            ///     database side. The server is free to populate </para>
            ///     <para>The key returned will be encoded with the shared ID which can allow coordinated queries between server
            ///     instances. These keys are valid up to 217 years from <see cref="Epoch"/>. </para>
            ///     <para>Warning: The key returned is not a GUID (globally unique ID) by default.  How "global" depends on the value
            ///     used for the shared ID. By using server instance IDs (or similar) the values are at least unique within the server
            ///     cluster scope. If you use an organization ID it could be unique on a per-site/customer basis.</para>
            /// </summary>
            /// <param name="shardID">
            ///     A 14-bit identifier (0-16383) that represents a shard (server) instance. It is important to configure each server
            ///     with a dedicated ID for the database it also services.
            /// </param>
            /// <returns> A new 64-bit unique ID. </returns>
            public static ulong UID(ushort shardID)
            {
                // ... 14 bits for session ID ...

                var _sessionID = ((ulong)shardID & 0x3FFF) << (64 - (3 * 4 + 2));

                // ... 36 bits for time (1/10 ms) ....

                var spanInSeconds = (((ulong)(DateTime.UtcNow - Epoch).TotalMilliseconds / 10) & 0xFFFFFFFFF) << (3 * 4 + 2);

                // ... 14 bits for a counter value ...

                var counter = (ulong)(_UIDCounter++ & 0x3FFF);

                // ... return session | time | counter ... 

                return _sessionID | spanInSeconds | counter;
            }

            ///// <summary>
            /////     Creates a unique 64-bit identifier from the given A 64-bit shard ID that was originally creating using
            /////     <see cref="UID(uint)"/> or <see cref="UID(ulong)"/>. This is done by extracting most of the seconds value and the lowest
            /////     byte of the counter value to create a 20-bit session hash.
            ///// </summary>
            ///// <param name="shardID">    A 64-bit session key ID value. </param>
            ///// <returns>   A new 64-bit unique ID. </returns>
            //? public static ulong UID(ulong shardID) => UID(((shardID & 0xFFF000) >> 4) | (shardID & 0xFF));
        }
    }

    // =========================================================================================================================
}
