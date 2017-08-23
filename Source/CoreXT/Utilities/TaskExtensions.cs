#if (NETSTANDARD1_5 || NETSTANDARD1_6 || NETCOREAPP1_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Threading;
using System.Threading.Tasks;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static class TaskExtensions
    {
        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Waits for the System.Threading.Tasks.Task to complete execution, then returns the result.
        /// </summary>
        /// <typeparam name="TReturn">The return value type.</typeparam>
        /// <param name="task"></param>
        /// <returns></returns>
        public static TReturn Wait<TReturn>(this Task<TReturn> task)
        {
            task.Wait();
            if (task.Exception != null)
                throw task.Exception;
            return task.Result;
        }

        /// <summary>
        /// Waits for the System.Threading.Tasks.Task to complete execution, then returns the result.
        /// If the task times out, then a 'TimeoutException' is thrown.
        /// </summary>
        /// <typeparam name="TReturn">The return value type.</typeparam>
        /// <param name="task"></param>
        /// <param name="timeout">The time in milliseconds for the task to timeout, or System.Threading.Timeout.Infinite (-1)
        /// to wait indefinitely.</param>
        /// <returns></returns>
        public static TReturn Wait<TReturn>(this Task<TReturn> task, int timeout)
        {
            if (!task.Wait(timeout))
                throw new TimeoutException("The task ran longer than " + timeout + "ms and timed out.");
            if (task.Exception != null)
                throw task.Exception;
            return task.Result;
        }

        /// <summary>
        /// Waits for the System.Threading.Tasks.Task to complete execution, then returns the result.
        /// If the task times out, then a 'TimeoutException' is thrown.
        /// </summary>
        /// <typeparam name="TReturn">The return value type.</typeparam>
        /// <param name="task"></param>
        /// <param name="timeout">The time in milliseconds for the task to timeout, or a System.TimeSpan
        /// that represents -1 milliseconds to wait indefinitely.</param>
        /// <returns></returns>
        public static TReturn Wait<TReturn>(this Task<TReturn> task, TimeSpan timeout)
        {
            if (!task.Wait(timeout))
                throw new TimeoutException("The task ran longer than " + timeout + "ms and timed out.");
            if (task.Exception != null)
                throw task.Exception;
            return task.Result;
        }

        /// <summary>
        /// Waits for the System.Threading.Tasks.Task to complete execution, then returns the result.
        /// The wait terminates if a cancellation token is canceled before the task completes.
        /// <para>If the token is cancelled, an 'OperationCanceledException' is thrown.</para>
        /// </summary>
        /// <typeparam name="TReturn">The return value type.</typeparam>
        /// <param name="task"></param>
        /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
        /// <returns></returns>
        public static TReturn Wait<TReturn>(this Task<TReturn> task, CancellationToken cancellationToken)
        {
            task.Wait(cancellationToken);
            cancellationToken.ThrowIfCancellationRequested();
            if (task.Exception != null)
                throw task.Exception;
            return task.Result;
        }

        /// <summary>
        /// Waits for the System.Threading.Tasks.Task to complete execution, then returns the result.
        /// The wait terminates if the timeout interval elapses, or a cancellation token is canceled before the task completes.
        /// <para>If the task times out, then a 'TimeoutException' is thrown. If the token is cancelled, an 'OperationCanceledException' is thrown.</para>
        /// </summary>
        /// <typeparam name="TReturn">The return value type.</typeparam>
        /// <param name="task"></param>
        /// <param name="timeout">The time in milliseconds for the task to timeout, or System.Threading.Timeout.Infinite (-1)
        /// to wait indefinitely.</param>
        /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
        /// <returns></returns>
        public static TReturn Wait<TReturn>(this Task<TReturn> task, int timeout, CancellationToken cancellationToken)
        {
            task.Wait(timeout, cancellationToken);
            cancellationToken.ThrowIfCancellationRequested();
            if (task.Exception != null)
                throw task.Exception;
            return task.Result;
        }

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
