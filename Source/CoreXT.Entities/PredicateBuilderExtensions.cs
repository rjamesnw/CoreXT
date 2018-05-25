using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace System.Linq.Expressions
{
    /// <summary>
    /// Enables the efficient, dynamic composition of query predicates.
    /// </summary>
    public static class PredicateBuilderExtensions // (special thanks to: https://petemontgomery.wordpress.com/2011/02/10/a-universal-predicatebuilder/)
    {
        /// <summary>
        /// Starts a predicate building sequence.
        /// </summary>
        /// <typeparam name="T">The entity type associated with the predicate input parameter.</typeparam>
        /// <param name="query">The query to start building a predicate for.</param>
        /// <param name="initialState">The initial state of the predicate if used by itself.</param>
        /// <returns>An expression that can be used with predicate builder extension methods.</returns>
        public static Expression<Func<T, bool>> BuildPredicate<T>(this IQueryable<T> query, bool initialState = false) { return param => initialState; }

        /// <summary>
        /// Starts a predicate building sequence from an initial boolean state.
        /// </summary>
        /// <typeparam name="T">The entity type associated with the predicate input parameter.</typeparam>
        /// <param name="initialState">The initial state of the predicate if used by itself.</param>
        /// <returns>An expression that can be used with predicate builder extension methods.</returns>
        public static Expression<Func<T, bool>> ToPredicate<T>(this bool initialState) { return param => initialState; }

        /// <summary>
        /// Creates a predicate expression from the specified lambda expression.
        /// </summary>
        public static Expression<Func<T, bool>> Create<T>(Expression<Func<T, bool>> predicate) { return predicate; }

        /// <summary>
        /// Combines the first predicate with the second using the logical "and".
        /// </summary>
        public static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> first, Expression<Func<T, bool>> second)
        {
            if (first == null && second == null) return false.ToPredicate<T>();
            if (first == null) return second ?? false.ToPredicate<T>();
            if (second == null) return first ?? false.ToPredicate<T>();
            return first.Compose(second, Expression.AndAlso);
        }

        /// <summary>
        /// Combines the first predicate with the second using the logical "or".
        /// </summary>
        public static Expression<Func<T, bool>> Or<T>(this Expression<Func<T, bool>> first, Expression<Func<T, bool>> second)
        {
            if (first == null && second == null) return false.ToPredicate<T>();
            if (first == null) return second ?? false.ToPredicate<T>();
            if (second == null) return first ?? false.ToPredicate<T>();
            return first.Compose(second, Expression.OrElse);
        }

        /// <summary>
        /// Negates the predicate.
        /// </summary>
        public static Expression<Func<T, bool>> Not<T>(this Expression<Func<T, bool>> expression)
        {
            var negated = Expression.Not(expression.Body);
            return Expression.Lambda<Func<T, bool>>(negated, expression.Parameters);
        }

        /// <summary>
        /// Combines the first expression with the second using the specified merge function.
        /// </summary>
        static Expression<T> Compose<T>(this Expression<T> first, Expression<T> second, Func<Expression, Expression, Expression> merge)
        {
            // zip parameters (map from parameters of second to parameters of first)
            var map = first.Parameters
                .Select((f, i) => new { f, s = second.Parameters[i] })
                .ToDictionary(p => p.s, p => p.f);

            // replace parameters in the second lambda expression with the parameters in the first
            var secondBody = ParameterRebinder.ReplaceParameters(map, second.Body);

            // create a merged lambda expression with parameters from the first expression
            return Expression.Lambda<T>(merge(first.Body, secondBody), first.Parameters);
        }

        class ParameterRebinder : ExpressionVisitor
        {
            readonly Dictionary<ParameterExpression, ParameterExpression> map;

            ParameterRebinder(Dictionary<ParameterExpression, ParameterExpression> map)
            {
                this.map = map ?? new Dictionary<ParameterExpression, ParameterExpression>();
            }

            public static Expression ReplaceParameters(Dictionary<ParameterExpression, ParameterExpression> map, Expression exp)
            {
                return new ParameterRebinder(map).Visit(exp);
            }

            protected override Expression VisitParameter(ParameterExpression p)
            {
                ParameterExpression replacement;

                if (map.TryGetValue(p, out replacement))
                {
                    p = replacement;
                }

                return base.VisitParameter(p);
            }
        }
    }
}
