#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Reflection;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================
    // (Some implementation ideas below were from: http://diditwith.net/2007/03/23/SolvingTheProblemWithEventsWeakEventHandlers.aspx)

    /// <summary>
    /// Provides static utility methods for working with events.
    /// </summary>
    public static class Events
    {
        // ---------------------------------------------------------------------------------------------------------------------
        // Weak references for system events.

        public delegate void UnregisterCallback<E>(EventHandler<E> eventHandler)
            where E : EventArgs;

        private interface IWeakEventHandler<E>
            where E : EventArgs
        {
            EventHandler<E> Handler { get; }
        }
        
        private class WeakEventHandler<T, E> : IWeakEventHandler<E>
            where T : class
            where E : EventArgs
        {
            private delegate void OpenEventHandler(T @this, object sender, E e);
            private WeakReference _TargetRef;
            private OpenEventHandler _OpenHandler;
            private EventHandler<E> _Handler;
            private UnregisterCallback<E> _Unregister;

            public WeakEventHandler(EventHandler<E> eventHandler, UnregisterCallback<E> unregister)
            {
                _TargetRef = new WeakReference(eventHandler.Target);
                _OpenHandler = (OpenEventHandler)eventHandler.GetMethodInfo().CreateDelegate(typeof(OpenEventHandler), null);
                _Handler = Invoke;
                _Unregister = unregister;
            }

            public void Invoke(object sender, E e)
            {
                T target = (T)_TargetRef.Target;

                if (target != null)
                    _OpenHandler.Invoke(target, sender, e);
                else if (_Unregister != null)
                {
                    _Unregister(_Handler);
                    _Unregister = null;
                }
            }

            public EventHandler<E> Handler
            {
                get { return _Handler; }
            }

            public static implicit operator EventHandler<E>(WeakEventHandler<T, E> weh)
            {
                return weh._Handler;
            }
        }

        /// <summary>
        /// Provides a means to attach event handlers (delegates) to events using weak references to the target object instance the delegate refers to.
        /// This allows the object instance targeted by a handler to be garbage collected, resulting in auto-removal from the event provider's invocation list.
        /// (Note: This is of no use, and is not even needed, if the event provider is the one to be garbage collected)
        /// <para>Proper usage is to use the "MakeWeak()" method as an extension method.</para>
        /// Example: public event EventHandler&lt;MyEventData&gt; MyEvent { add { value.MakeWeak(eh =&gt; _MyEvent -= eh); } }
        /// </summary>
        /// <typeparam name="TSender">Type of class that owns the event.</typeparam>
        /// <typeparam name="E">Type of the handler's data parameter.</typeparam>
        /// <param name="eventHandler">The handler delegate.</param>
        /// <param name="unregister">The call-back to execute when the target object of a delegate get's collected - this call is expected to un-register the handler.</param>
        public static EventHandler<E> MakeWeak<E>(this EventHandler<E> eventHandler, UnregisterCallback<E> unregister)
                  where E : EventArgs
        {
            if (eventHandler == null)
                throw new ArgumentNullException("eventHandler");

            var methodInfo = eventHandler.GetMethodInfo();

            if (methodInfo.IsStatic || eventHandler.Target == null)
                throw new ArgumentException("Only instance methods are supported.", "eventHandler");

            Type wehType = typeof(WeakEventHandler<,>).MakeGenericType(methodInfo.DeclaringType, typeof(E));
            ConstructorInfo wehConstructor = wehType.GetTypeInfo().GetConstructor(new Type[] { typeof(EventHandler<E>), typeof(UnregisterCallback<E>) });

            IWeakEventHandler<E> weh = (IWeakEventHandler<E>)wehConstructor.Invoke(
              new object[] { eventHandler, unregister });

            return weh.Handler;
        }

        // ---------------------------------------------------------------------------------------------------------------------
        // Weak references for custom events.

        public static class CustomWeakHandlers<TSender>
        {
            public delegate void EventHandler<TData>(TSender sender, TData data);

            public delegate void UnregisterCallback<TData>(EventHandler<TData> eventHandler);

            private interface IWeakEventHandler<TData>
            {
                EventHandler<TData> Handler { get; }
            }

            private class WeakEventHandler<T, TData> : IWeakEventHandler<TData>
                where T : class
            {
                private delegate void OpenEventHandler(T @this, object sender, TData e);
                private WeakReference _TargetRef;
                private OpenEventHandler _OpenHandler;
                private EventHandler<TData> _Handler;
                private UnregisterCallback<TData> _Unregister;

                public WeakEventHandler(EventHandler<TData> eventHandler, UnregisterCallback<TData> unregister)
                {
                    _TargetRef = new WeakReference(eventHandler.Target);
                    _OpenHandler = (OpenEventHandler)eventHandler.CreateDelegate(typeof(OpenEventHandler), (object)null);
                    _Handler = Invoke;
                    _Unregister = unregister;
                }

                public void Invoke(TSender sender, TData e)
                {
                    T target = (T)_TargetRef.Target;

                    if (target != null)
                        _OpenHandler.Invoke(target, sender, e);
                    else if (_Unregister != null)
                    {
                        _Unregister(_Handler);
                        _Unregister = null;
                    }
                }

                public EventHandler<TData> Handler
                {
                    get { return _Handler; }
                }

                public static implicit operator EventHandler<TData>(WeakEventHandler<T, TData> weh)
                {
                    return weh._Handler;
                }
            }

            public static EventHandler<TData> MakeWeak<TData>(EventHandler<TData> eventHandler, UnregisterCallback<TData> unregister)
            {
                if (eventHandler == null)
                    throw new ArgumentNullException("eventHandler");

                var methodInfo = eventHandler.GetMethodInfo();

                if (methodInfo.IsStatic || eventHandler.Target == null)
                    throw new ArgumentException("Only instance methods are supported.", "eventHandler");

                Type wehType = typeof(WeakEventHandler<,>).MakeGenericType(typeof(TSender), methodInfo.DeclaringType, typeof(TData));
                ConstructorInfo wehConstructor = wehType.GetTypeInfo().GetConstructor(new Type[] { typeof(EventHandler<TData>), typeof(UnregisterCallback<TData>) });

                IWeakEventHandler<TData> weh = (IWeakEventHandler<TData>)wehConstructor.Invoke(
                  new object[] { eventHandler, unregister });

                return weh.Handler;
            }

        }

        /// <summary>
        /// Provides a means to attach event handlers (delegates) to events using weak references to the target object instance the delegate refers to.
        /// This allows the object instance targeted by a handler to be garbage collected, resulting in auto-removal from the event provider's invocation list.
        /// (Note: This is of no use, and is not even needed, if the event provider is the one to be garbage collected)
        /// <para>Proper usage is to use the "MakeWeak()" method as an extension method.</para>
        /// Example: public event EventHandling.WeakHandlers&lt;TheSenderType&gt;.EventHandler&lt;MyEventData&gt; MyEvent { add { value.MakeWeak(eh =&gt; _MyEvent -= eh); } }
        /// </summary>
        /// <typeparam name="TSender">Type of class that owns the event.</typeparam>
        /// <typeparam name="E">Type of the handler's data parameter.</typeparam>
        /// <param name="eventHandler">The handler delegate.</param>
        /// <param name="unregister">The call-back to execute when the target object of a delegate get's collected - this call is expected t un-register the handler.</param>
        public static CustomWeakHandlers<TSender>.EventHandler<E> MakeWeak<TSender, E>(this CustomWeakHandlers<TSender>.EventHandler<E> eventHandler, CustomWeakHandlers<TSender>.UnregisterCallback<E> unregister)
        { return CustomWeakHandlers<TSender>.MakeWeak(eventHandler, unregister); } // (Note: Extended methods cannot be in nested classes!)

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
