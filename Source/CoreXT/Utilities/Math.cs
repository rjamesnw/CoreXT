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
    }

    // =========================================================================================================================
}
