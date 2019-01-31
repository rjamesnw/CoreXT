using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
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
            where TEntity : class
        {
            var parameter = Expression.Parameter(typeof(TEntity), "m");
            var body = Expression.PropertyOrField(parameter, propertyName);
            return Expression.Lambda<Func<TEntity, TProperty>>(body, parameter);
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Dynamically creates a lambda expression in the form "m=>m.MemberName==constantValue" that can be used with LINQ
        ///     'Where()' filter calls. If the member type and constant value type are different, a conversion expression is
        ///     inserted as well.
        /// </summary>
        /// <typeparam name="TEntity"> Type of the entity. </typeparam>
        /// <typeparam name="TValue"> Type of the value. </typeparam>
        /// <param name="entityMemberName">
        ///     Name of the entity member to test equality for, which is the left side of the equality expression.
        /// </param>
        /// <param name="entityMemberType"> Type of the entity member. </param>
        /// <param name="constantValue"> The constant value on the right side of the equality test. </param>
        /// <returns> The new lambda equality expression. </returns>
        public static Expression<Func<TEntity, bool>> CreateWhereEqualLambda<TEntity, TValue>(string entityMemberName, TValue constantValue)
            where TEntity : class
        {
            var entityType = typeof(TEntity);
            var entityMemberInfo = entityType.GetProperty(entityMemberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.FlattenHierarchy)
                ?? throw new InvalidOperationException($"No public instance property with name '{entityMemberName}' could be found on the entity '{entityType.Name}'.");

            ParameterExpression pe = Expression.Parameter(typeof(TEntity), "m");
            var left = Expression.Property(pe, entityMemberInfo);
            var valueType = typeof(TValue);

            Expression right = Expression.Constant(constantValue, valueType);
            if (valueType != entityMemberInfo.PropertyType)
                right = Expression.Convert(right, entityMemberInfo.PropertyType);
            Expression eq = Expression.Equal(left, right);

            var lam = Expression.Lambda<Func<TEntity, bool>>(eq, pe);
            return lam;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Dynamically creates a lambda expression in the form "m=>m.MemberName==constantValue" that can be used with LINQ
        ///     'Where()' filter calls. If the member type and constant value type are different, a conversion expression is
        ///     inserted as well.
        /// </summary>
        /// <typeparam name="TEntity"> Type of the entity. </typeparam>
        /// <typeparam name="TSource"> Type of the values to filter on. </typeparam>
        /// <param name="entityMemberName">
        ///     Name of the entity member to find in the given array of values.
        /// </param>
        /// <param name="entityMemberType"> Type of the entity member. </param>
        /// <param name="values"> The constant value on the right side of the equality test. </param>
        /// <returns> The new lambda equality expression. </returns>
        public static Expression<Func<TEntity, bool>> CreateWhereContainsLambda<TEntity, TSource>(string entityMemberName, TSource[] values)
            where TEntity : class
        {
            var entityType = typeof(TEntity);
            var entityMemberInfo = entityType.GetProperty(entityMemberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.FlattenHierarchy)
                ?? throw new InvalidOperationException($"No public instance property with name '{entityMemberName}' could be found on the entity '{entityType.Name}'.");

            var pe = Expression.Parameter(typeof(TEntity), "m");
            Expression peMember = Expression.Property(pe, entityMemberInfo);
            var valueType = typeof(TSource);
            if (valueType != entityMemberInfo.PropertyType)
                peMember = Expression.Convert(peMember, entityMemberInfo.PropertyType);

            Func<IEnumerable<TSource>, TSource, bool> contains = Enumerable.Contains; // (to get the method info)
            Expression body = Expression.Call(Expression.Constant(values), contains.Method, peMember);

            var lam = Expression.Lambda<Func<TEntity, bool>>(body, pe);
            return lam;
        }

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
