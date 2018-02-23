#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Globalization;
using System.Linq.Expressions;
using System.Reflection;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    /// <summary>
    /// Provides utility methods for expression trees.
    /// </summary>
    public static partial class Expressions
    {
        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an entity member selector expression.
        /// </summary>
        /// <param name="entity">The entity type.</param>
        /// <param name="property">The property type on the entity.</param>
        /// <param name="propertyName">The property name on the entity.</param>
        /// <returns></returns>
        public static LambdaExpression CreateMemberSelector(Type entity, Type property, string propertyName)
        {
            var parameter = Expression.Parameter(entity, "m");
            var body = Expression.PropertyOrField(parameter, propertyName);
            return Expression.Lambda(typeof(Func<,>).MakeGenericType(entity, property), body, parameter);
        }

        /// <summary>
        /// Creates an entity member selector expression.
        /// </summary>
        /// <typeparam name="TEntity">The entity type.</typeparam>
        /// <typeparam name="TProperty">The property type on the entity.</typeparam>
        /// <param name="propertyName">The property name on the entity.</param>
        /// <returns></returns>
        public static Expression<Func<TEntity, TProperty>> CreateMemberSelector<TEntity, TProperty>(string propertyName)
        {
            var parameter = Expression.Parameter(typeof(TEntity), "m");
            var body = Expression.PropertyOrField(parameter, propertyName);
            return Expression.Lambda<Func<TEntity, TProperty>>(body, parameter);
        }

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
