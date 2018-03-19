using CoreXT.Services.DI;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Query.Internal;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace CoreXT.Entities
{
    public interface IDbSetXT
    {
        ICoreXTServiceProvider Services { get; }
        DbContext DbContext { get; }
        IQueryProvider QueryProvider { get; }
    }

    /// <summary>
    /// This is a proxy to the original DbSet. This hook allows the 'IQueryable.Provider' reference on chaining queryable methods to reference the
    /// original 'DbSetXT' type, which also allows access to the DbContext, database, other DbSets, and the service provider for injection.  This
    /// gives extension methods more access to services, and allows for a richer development experience.
    /// <para>To use, simply duplicate all <see cref="DbSet{T}"/> properties, rename the original ones and make 'protected' (to hide them), and change the types
    /// on the duplicates to <see cref="DbSetXT{TEntity}"/> instead.</para>
    /// <para>Warning: You cannot simply change all existing context properties from DbSet to DbSetXT.  The reason is that the entity framework requires
    /// the DbSet types in order to build the internal relationship model required for queries.</para>
    /// </summary>
    /// <typeparam name="TEntity">The entity type represented by this entity set.</typeparam>
    public class DbSetXT<TEntity> : DbSet<TEntity>, IDbSetXT, IQueryable<TEntity>, IEnumerable<TEntity>, IEnumerable, IQueryable,
        IInfrastructure<IServiceProvider>, IListSource, IAsyncQueryProvider
        where TEntity : class
    {
        // --------------------------------------------------------------------------------------------------------------------------------------------

        public DbSet<TEntity> EntitySet => _DbSet;
        InternalDbSet<TEntity> _DbSet;

        /// <summary>
        /// The CoreXT service provider that the underlying DbContext is associated with.
        /// If the DbContext was not injected from the services container then this may be null.
        /// </summary>
        public ICoreXTServiceProvider Services { get; }

        public DbContext DbContext { get; }

        // --------------------------------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Construct a new DbSetXT object.
        /// </summary>
        /// <param name="context">The DbContext this DbSet is associated with.</param>
        /// <param name="services">The CoreXT service provider that the underlying DbContext is associated with.</param>
        public DbSetXT(DbContext context, ICoreXTServiceProvider services)
        {
            DbContext = context ?? throw new ArgumentNullException(nameof(context));
            _DbSet = new InternalDbSet<TEntity>(DbContext);
            Services = services;
        }

        // --------------------------------------------------------------------------------------------------------------------------------------------

        Type IQueryable.ElementType => ((IQueryable)_DbSet).ElementType;

        Expression IQueryable.Expression => ((IQueryable)_DbSet).Expression;

        IQueryProvider IQueryable.Provider => this;

        IServiceProvider IInfrastructure<IServiceProvider>.Instance => ((IInfrastructure<IServiceProvider>)_DbSet).Instance;

        bool IListSource.ContainsListCollection => ((IListSource)_DbSet).ContainsListCollection;

        IEnumerator<TEntity> IEnumerable<TEntity>.GetEnumerator() => ((IEnumerable<TEntity>)_DbSet).GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => ((IEnumerable)_DbSet).GetEnumerator();

        IList IListSource.GetList() => ((IListSource)_DbSet).GetList();

        // --------------------------------------------------------------------------------------------------------------------------------------------

        public override LocalView<TEntity> Local => _DbSet.Local;

        public override EntityEntry<TEntity> Add(TEntity entity) => _DbSet.Add(entity);

        public override Task<EntityEntry<TEntity>> AddAsync(TEntity entity, CancellationToken cancellationToken = default(CancellationToken)) => _DbSet.AddAsync(entity, cancellationToken);

        public override void AddRange(IEnumerable<TEntity> entities) => _DbSet.AddRange(entities);

        public override void AddRange(params TEntity[] entities) => _DbSet.AddRange(entities);

        public override Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default(CancellationToken)) => _DbSet.AddRangeAsync(entities, cancellationToken);

        public override Task AddRangeAsync(params TEntity[] entities) => _DbSet.AddRangeAsync(entities);

        public override EntityEntry<TEntity> Attach(TEntity entity) => _DbSet.Attach(entity);

        public override void AttachRange(params TEntity[] entities) => _DbSet.AttachRange(entities);

        public override void AttachRange(IEnumerable<TEntity> entities) => _DbSet.AttachRange(entities);

        public override TEntity Find(params object[] keyValues) => _DbSet.Find(keyValues);

        public override Task<TEntity> FindAsync(object[] keyValues, CancellationToken cancellationToken) => _DbSet.FindAsync(keyValues, cancellationToken);

        public override Task<TEntity> FindAsync(params object[] keyValues) => _DbSet.FindAsync(keyValues);

        public override EntityEntry<TEntity> Remove(TEntity entity) => _DbSet.Remove(entity);

        public override void RemoveRange(params TEntity[] entities) => _DbSet.RemoveRange(entities);

        public override void RemoveRange(IEnumerable<TEntity> entities) => _DbSet.RemoveRange(entities);

        public override EntityEntry<TEntity> Update(TEntity entity) => _DbSet.Update(entity);

        public override void UpdateRange(params TEntity[] entities) => _DbSet.UpdateRange(entities);

        public override void UpdateRange(IEnumerable<TEntity> entities) => _DbSet.UpdateRange(entities);

        // --------------------------------------------------------------------------------------------------------------------------------------------
        // This is a hook to the original provider. This hook allows the 'IQueryable.Provider' reference on chaining queryable methods to reference the
        // original DbSetXT type, which also allows access to the DbContext, database, other DbSets, and the service provider for injection. 

        IQueryable IQueryProvider.CreateQuery(Expression expression) => new CoreXTQueryBridge<TEntity, TEntity>(this, ((IQueryable)_DbSet).Provider.CreateQuery(expression));

        IQueryable<TElement> IQueryProvider.CreateQuery<TElement>(Expression expression) => new CoreXTQueryBridge<TEntity, TElement>(this, ((IQueryable)_DbSet).Provider.CreateQuery<TElement>(expression));

        object IQueryProvider.Execute(Expression expression) => ((IQueryable)_DbSet).Provider.Execute(expression);

        TResult IQueryProvider.Execute<TResult>(Expression expression) => ((IQueryable)_DbSet).Provider.Execute<TResult>(expression);

        IAsyncEnumerable<TResult> IAsyncQueryProvider.ExecuteAsync<TResult>(Expression expression)
            => ((IAsyncQueryProvider)((IQueryable)_DbSet).Provider).ExecuteAsync<TResult>(expression);

        Task<TResult> IAsyncQueryProvider.ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken)
             => ((IAsyncQueryProvider)((IQueryable)_DbSet).Provider).ExecuteAsync<TResult>(expression, cancellationToken);

        /// <summary>
        /// The original provider used to execute the queries.
        /// </summary>
        public IQueryProvider QueryProvider => ((IQueryable)_DbSet).Provider;

        // --------------------------------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################################

    public interface ICoreXTQueryBridge
    {
        IDbSetXT DbSet { get; }
    }

    /// <summary>
    /// A bridge type used to allow the inclusion of DbContext and DbSet related information.
    /// </summary>
    /// <typeparam name="TDbSetEntity">The entity type of the original DbSet.</typeparam>
    /// <typeparam name="TEntity">The entity type as selected by the current query extension method.</typeparam>
    public class CoreXTQueryBridge<TDbSetEntity, TEntity> : EntityQueryProvider, ICoreXTQueryBridge, IIncludableQueryable<TEntity, object>, IAsyncEnumerable<TEntity>,
        IDetachableContext, IListSource, IOrderedQueryable<TEntity>, IQueryable<TEntity>
        where TDbSetEntity : class
    {
        //------------------------------------------------------------------------------------------------------------------------------------

        public DbSetXT<TDbSetEntity> DbSet { get; }

        IDbSetXT ICoreXTQueryBridge.DbSet => DbSet;

        IQueryable _Query;

        //------------------------------------------------------------------------------------------------------------------------------------

        internal CoreXTQueryBridge(DbSetXT<TDbSetEntity> dbSet, IQueryable query) : base(((IInfrastructure<IServiceProvider>)dbSet).GetService<IQueryCompiler>())
        {
            DbSet = dbSet ?? throw new ArgumentNullException(nameof(dbSet));
            _Query = query ?? throw new ArgumentNullException(nameof(query));
        }

        //------------------------------------------------------------------------------------------------------------------------------------

        public Type ElementType => _Query.ElementType;
        public Expression Expression => _Query.Expression;
        public IQueryProvider Provider => this;

        //------------------------------------------------------------------------------------------------------------------------------------

        bool IListSource.ContainsListCollection => ((IListSource)_Query).ContainsListCollection;

        //------------------------------------------------------------------------------------------------------------------------------------

        public IEnumerator<TEntity> GetEnumerator() => ((IQueryable<TEntity>)_Query).GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => _Query.GetEnumerator();

        IAsyncEnumerator<TEntity> IAsyncEnumerable<TEntity>.GetEnumerator() => ((IAsyncEnumerable<TEntity>)_Query).GetEnumerator();

        //------------------------------------------------------------------------------------------------------------------------------------

        IDetachableContext IDetachableContext.DetachContext() => ((IDetachableContext)_Query).DetachContext();

        //------------------------------------------------------------------------------------------------------------------------------------

        IList IListSource.GetList() => ((IListSource)_Query).GetList();

        //------------------------------------------------------------------------------------------------------------------------------------

        public override IQueryable CreateQuery(Expression expression) => ((IQueryProvider)DbSet).CreateQuery(expression);

        public override IQueryable<TElement> CreateQuery<TElement>(Expression expression) => ((IQueryProvider)DbSet).CreateQuery<TElement>(expression);

        public override object Execute(Expression expression) => ((IQueryProvider)DbSet).Execute(expression);

        public override TResult Execute<TResult>(Expression expression) => ((IQueryProvider)DbSet).Execute<TResult>(expression);

        public override IAsyncEnumerable<TResult> ExecuteAsync<TResult>(Expression expression) => ((IAsyncQueryProvider)DbSet).ExecuteAsync<TResult>(expression);

        public override Task<TResult> ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken) => ((IAsyncQueryProvider)DbSet).ExecuteAsync<TResult>(expression, cancellationToken);

        //------------------------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################################

    public static class DbSetXTExtensions
    {
        /// <summary>
        /// Get the services reference for a query bridge. The DbSet type that started the query must be of type DbSetXT, and the
        /// containing DbContext class for the DbSet must be created from the DI container.
        /// </summary>
        /// <param name="bridge"></param>
        /// <returns></returns>
        public static ICoreXTServiceProvider GetServices(this ICoreXTQueryBridge bridge) => bridge.DbSet.Services;

        /// <summary>
        /// Get the services reference from a query. The DbSet type that started the query must be of type DbSetXT, and the
        /// containing DbContext class for the DbSet must be created from the DI container.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queryable"></param>
        /// <returns></returns>
        public static T GetService<T>(this IQueryable queryable) where T : class 
            => (queryable.Provider as ICoreXTQueryBridge ?? throw new InvalidOperationException("Provider is not a 'ICoreXTQueryBridge' type. Make sure the \"entity set\" property in your DbContext is of type 'DbSetXT<T>'."))
            .GetServices().GetService<T>();
    }
}
