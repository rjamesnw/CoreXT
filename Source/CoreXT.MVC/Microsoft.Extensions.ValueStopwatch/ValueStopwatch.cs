using System;
using System.Diagnostics;

namespace Microsoft.Extensions.Diagnostics.Tracing
{
    public struct ValueStopwatch
    {
        private static readonly double TimestampToTicks = TimeSpan.TicksPerSecond / (double)Stopwatch.Frequency;

        private bool _enabled;
        private long _endTimestamp;
        private long _startTimestamp;

        public TimeSpan Elapsed => GetElapsedTime();
        public bool Enabled => _enabled;

        private ValueStopwatch(long startTimestamp)
        {
            _enabled = true;
            _endTimestamp = 0;
            _startTimestamp = startTimestamp;
        }

        public void Stop()
        {
            if(_startTimestamp == 0)
            {
                throw new InvalidOperationException("An uninitialized, or 'default', ValueStopwatch cannot be used");
            }

            _endTimestamp = Stopwatch.GetTimestamp();
            _enabled = false;
        }

        public static ValueStopwatch StartNew() => new ValueStopwatch(Stopwatch.GetTimestamp());

        public TimeSpan GetElapsedTime()
        {
            if(_startTimestamp == 0)
            {
                throw new InvalidOperationException("An uninitialized, or 'default', ValueStopwatch cannot be used");
            }

            var end = _endTimestamp == 0 ? Stopwatch.GetTimestamp() : _endTimestamp;
            var timestampDelta = end - _startTimestamp;
            var ticks = (long)(TimestampToTicks * timestampDelta);
            return new TimeSpan(ticks);
        }

        private enum State
        {
            // This will be the default value, as in default(ValueStopwatch)
            Uninitialized = 0,
            Initialized = 1,
            Stopped = 2
        }
    }
}
