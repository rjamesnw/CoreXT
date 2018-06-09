using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Diagnostics.Tracing;

namespace Microsoft.Extensions.Diagnostics.Timing
{
    public static class EventSpan
    {
        public static EventSpan<T> Create<T>(T state, Action<T> action) => new EventSpan<T>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1> Create<T, T1>(T state, Action<T, T1> action) => new EventSpan<T, T1>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1, T2> Create<T, T1, T2>(T state, Action<T, T1, T2> action) => new EventSpan<T, T1, T2>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1, T2, T3> Create<T, T1, T2, T3>(T state, Action<T, T1, T2, T3> action) => new EventSpan<T, T1, T2, T3>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1, T2, T3, T4> Create<T, T1, T2, T3, T4>(T state, Action<T, T1, T2, T3, T4> action) => new EventSpan<T, T1, T2, T3, T4>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1, T2, T3, T4, T5> Create<T, T1, T2, T3, T4, T5>(T state, Action<T, T1, T2, T3, T4, T5> action) => new EventSpan<T, T1, T2, T3, T4, T5>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1, T2, T3, T4, T5, T6> Create<T, T1, T2, T3, T4, T5, T6>(T state, Action<T, T1, T2, T3, T4, T5, T6> action) => new EventSpan<T, T1, T2, T3, T4, T5, T6>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1, T2, T3, T4, T5, T6, T7> Create<T, T1, T2, T3, T4, T5, T6, T7>(T state, Action<T, T1, T2, T3, T4, T5, T6, T7> action) => new EventSpan<T, T1, T2, T3, T4, T5, T6, T7>(ValueStopwatch.StartNew(), action, state);
        public static EventSpan<T, T1, T2, T3, T4, T5, T6, T7, T8> Create<T, T1, T2, T3, T4, T5, T6, T7, T8>(T state, Action<T, T1, T2, T3, T4, T5, T6, T7, T8> action) => new EventSpan<T, T1, T2, T3, T4, T5, T6, T7, T8>(ValueStopwatch.StartNew(), action, state);
    }

    public struct EventSpan<T>
    {
        private readonly Action<T> _action;
        private readonly T _state;

        public ValueStopwatch Stopwatch { get; }

        internal EventSpan(ValueStopwatch stopwatch, Action<T> action, T state)
        {
            Stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End()
        {
            _action(_state);
        }
    }

    public struct EventSpan<T, T1>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0)
        {
            _action(_state, arg0);
        }
    }

    public struct EventSpan<T, T1, T2>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1, T2> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1, T2> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0, T2 arg1)
        {
            _action(_state, arg0, arg1);
        }
    }

    public struct EventSpan<T, T1, T2, T3>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1, T2, T3> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1, T2, T3> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0, T2 arg1, T3 arg2)
        {
            _action(_state, arg0, arg1, arg2);
        }
    }

    public struct EventSpan<T, T1, T2, T3, T4>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1, T2, T3, T4> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1, T2, T3, T4> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0, T2 arg1, T3 arg2, T4 arg3)
        {
            _action(_state, arg0, arg1, arg2, arg3);
        }
    }

    public struct EventSpan<T, T1, T2, T3, T4, T5>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1, T2, T3, T4, T5> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1, T2, T3, T4, T5> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0, T2 arg1, T3 arg2, T4 arg3, T5 arg4)
        {
            _action(_state, arg0, arg1, arg2, arg3, arg4);
        }
    }

    public struct EventSpan<T, T1, T2, T3, T4, T5, T6>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1, T2, T3, T4, T5, T6> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1, T2, T3, T4, T5, T6> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0, T2 arg1, T3 arg2, T4 arg3, T5 arg4, T6 arg5)
        {
            _action(_state, arg0, arg1, arg2, arg3, arg4, arg5);
        }
    }

    public struct EventSpan<T, T1, T2, T3, T4, T5, T6, T7>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1, T2, T3, T4, T5, T6, T7> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1, T2, T3, T4, T5, T6, T7> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0, T2 arg1, T3 arg2, T4 arg3, T5 arg4, T6 arg5, T7 arg6)
        {
            _action(_state, arg0, arg1, arg2, arg3, arg4, arg5, arg6);
        }
    }

    public struct EventSpan<T, T1, T2, T3, T4, T5, T6, T7, T8>
    {
        private readonly ValueStopwatch _stopwatch;
        private readonly Action<T, T1, T2, T3, T4, T5, T6, T7, T8> _action;
        private readonly T _state;

        internal EventSpan(ValueStopwatch stopwatch, Action<T, T1, T2, T3, T4, T5, T6, T7, T8> action, T state)
        {
            _stopwatch = stopwatch;
            _action = action;
            _state = state;
        }

        public void End(T1 arg0, T2 arg1, T3 arg2, T4 arg3, T5 arg4, T6 arg5, T7 arg6, T8 arg7)
        {
            _action(_state, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        }
    }
}
