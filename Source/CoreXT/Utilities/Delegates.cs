#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using LinqExpr = System.Linq.Expressions;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    namespace Delegates
    {
        public delegate object LateBoundMethod(object target, object[] arguments);

        public static class DelegateFactory
        {
            static Dictionary<string, Dictionary<string, LateBoundMethod>> _Delegates = new Dictionary<string, Dictionary<string, LateBoundMethod>>();

            // Notice: Thanks to Nate Kohari at kohari.org for the 'LateBoundMethod' coding examples.

            /// <summary>
            /// Generates a delegate method call wrapper using expressions.
            /// The resulting delegate is extremely fast, and is not limited by number of parameters.
            /// There is one caveat however, as it takes 3-4 ms to compile the required delegate before
            /// first use, after which the delegate is then cached for future requests.
            /// <para>
            /// Purpose: There is no simple way to create a delegate for unknown method signature types at run-time.
            /// This method is one way to overcome this limitation.
            /// </para>
            /// </summary>
            public static LateBoundMethod ToFastDelegateProxy(this MethodInfo method)
            {
                // ... try to pull from cache ...
                string hostType = method.DeclaringType.FullName;
                string methodSig = method.Name + Arrays.Join(method.GetParameters().Select(p => p.Name));
                if (_Delegates.ContainsKey(hostType))
                {
                    var hd = _Delegates[hostType];
                    if (hd.ContainsKey(methodSig))
                        return hd[methodSig];
                }
                else _Delegates[hostType] = new Dictionary<string, LateBoundMethod>();

                // ... create new delegate ...

                ParameterExpression instanceParameter = LinqExpr.Expression.Parameter(typeof(object), "target");
                ParameterExpression argumentsParameter = LinqExpr.Expression.Parameter(typeof(object[]), "arguments");

                MethodCallExpression call = LinqExpr.Expression.Call(
                    System.Linq.Expressions.Expression.Convert(instanceParameter, method.DeclaringType),
                    method,
                    _CreateParameterExpressions(method, argumentsParameter)
                    );

                Expression<LateBoundMethod> lambda = LinqExpr.Expression.Lambda<LateBoundMethod>(
                    LinqExpr.Expression.Convert(call, typeof(object)),
                    instanceParameter,
                    argumentsParameter
                    );

                // ... cache and return delegate ...

                return (_Delegates[hostType][methodSig] = lambda.Compile());
            }

            /// <summary>
            /// Using the supplied MethodInfo, creates the required expressions to copy values from the supplied array (argument) expression.
            /// </summary>
            private static LinqExpr.Expression[] _CreateParameterExpressions(MethodInfo method, ParameterExpression argumentsParameter)
            {
                return method.GetParameters().Select((parameter, index) =>
                  LinqExpr.Expression.Convert(
                    LinqExpr.Expression.ArrayIndex(argumentsParameter, LinqExpr.Expression.Constant(index)), parameter.ParameterType)).ToArray();
            }

            /// <summary>
            /// Builds a Delegate instance from the MethodInfo object and a target instance to invoke against.
            /// The Action/Func types are used to accomplish this, so the maximum arguments allowed are only 5.
            /// <para>
            /// Purpose: There is no simple way to create a delegate for unknown method signature types at run-time.
            /// This method is one way to overcome this limitation.
            /// </para>
            /// </summary>
            public static Delegate ToSimpleDelegate(this MethodInfo mi, object instance)
            {
                if (mi == null) throw new ArgumentNullException("mi");
                if (!mi.IsStatic && instance == null) throw new ArgumentNullException("instance (required for non-static types)");

                Type delegateType;

                var typeArgs = mi.GetParameters()
                    .Select(p => p.ParameterType)
                    .ToList();

                // builds a delegate type (note: max 5 parameters allowed in total)
                if (mi.ReturnType == typeof(void))
                    delegateType = System.Linq.Expressions.Expression.GetActionType(typeArgs.ToArray());
                else
                {
                    typeArgs.Add(mi.ReturnType);
                    delegateType = System.Linq.Expressions.Expression.GetFuncType(typeArgs.ToArray());
                }

                // creates a binded delegate if target is supplied
                var result = (instance == null)
                    ? mi.CreateDelegate(delegateType)
                    : mi.CreateDelegate(delegateType, instance);

                return result;
            }
        }
    }

    // =========================================================================================================================
}
