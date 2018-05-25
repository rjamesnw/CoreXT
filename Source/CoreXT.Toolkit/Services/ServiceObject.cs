using CoreXT.Entities;
using CoreXT.Services.DI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CoreXT.Services
{
    /// <summary>
    ///     This is a base class for all objects that provide one or more services or nested services. CoreXT Service objects
    ///     are designed to be independent so that they can be individually injected, or nested for grouping.
    /// </summary>
    /// <seealso cref="T:CoreXT.Services.IServiceObject"/>
    public abstract class ServiceObject : IServiceObject
    {
        // ------------------------------------------------------------------------------------------------------------------------------------

        public ICoreXTServiceProvider ServiceProvider => _ServiceProvider;
        protected ICoreXTServiceProvider _ServiceProvider;

        // ------------------------------------------------------------------------------------------------------------------------------------

        internal Func<Type, IDbContext> _DBContextRouter;

        internal readonly Dictionary<Type, Func<IDbContext>> _DbContexts = new Dictionary<Type, Func<IDbContext>>();

        Func<IDbContext> _GetAssignableFactory(Type target)
        {
            var factory = _DbContexts.Value(target);
            if (factory != null) return factory;
            var contexts = _DbContexts.Where(i => target.IsAssignableFrom(i.Key) || i.Key.IsAssignableFrom(target)).ToArray();
            if (contexts.Length == 0) return null;
            if (contexts.Length > 1) throw new InvalidOperationException($"There are multiple DbContext types found that can be assigned to {target.FullName}. You will have to request a more specific type.");
            return contexts[0].Value;
        }

        public IDbContext GetDB(Type type)
        {
            var _Context = _DBContextRouter?.Invoke(type);
            if (_Context != null) return _Context;
            if (_DbContexts.Count == 0)
                throw new InvalidOperationException("The DbContext collection is empty, please call '{" + nameof(ServiceObject) + "}.Configure()' first to register one.");
            _Context = _GetAssignableFactory(type)?.Invoke();
            if (_Context == null)
                throw new InvalidOperationException($"A DB context of type '{type.FullName}' could not be found. Make sure to call one of the '{nameof(ServiceObject)}.Configure()' methods first to configure the service object.");
            return _Context;
        }

        public TDBContext GetDB<TDBContext>() where TDBContext : IDbContext
        {
            return (TDBContext)GetDB(typeof(TDBContext));
        }

        // ------------------------------------------------------------------------------------------------------------------------------------

        public ServiceObject(ICoreXTServiceProvider services)
        {
            _ServiceProvider = services;
        }

        // ------------------------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Configures this CDS service object with a DbContext router.  A router is used to pulled database contexts from
        ///     another service object instance to allowed working with nested service objects. This allows setting contexts in the
        ///     root service object instead of every object. This allows service objects to be individual, or as part of a root
        ///     reference object.
        /// </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <param name="contextFactory"> A function that returns an ICDSContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        public TService Configure<TService>(Func<Type, IDbContext> contextFactory)
            where TService : class, IServiceObject
        {
            _DBContextRouter = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
            if (ServiceProvider == null)
                throw new InvalidOperationException("'ServiceProvider' is null - make sure this is set by derived types by setting this field either directly or indirectly via the base constructor call.");
            return (TService)(IServiceObject)this;
        }

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <param name="dbContextType"> Type of the database context to register the factory function under. </param>
        /// <param name="contextFactory"> A function that returns an DbContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        public TService Configure<TService>(Type dbContextType, Func<IDbContext> contextFactory)
            where TService : class, IServiceObject
        {
            var dbType = dbContextType;
            _DbContexts[dbType] = (Func<IDbContext>)contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
            //_DbContexts[dbType] = contextFactory != null ? (Func<IDbContext>)(() => contextFactory()) ?? throw new ArgumentNullException(nameof(contextFactory));
            return (TService)(IServiceObject)this;
        }

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <typeparam name="TDbContext"> Type of the database context. </typeparam>
        /// <param name="contextFactory"> A function that returns an DbContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        public TService Configure<TService, TDbContext>(Func<TDbContext> contextFactory)
            where TService : class, IServiceObject
            where TDbContext : class, IDbContext
        {
            return Configure<TService>(typeof(TDbContext), contextFactory);
        }

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <param name="context"> An ICDSContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        public TService Configure<TService>(IDbContext context)
            where TService : class, IServiceObject
        {
            var dbType = context?.GetType() ?? throw new ArgumentNullException(nameof(context));
            _DbContexts[dbType] = context != null ? (Func<IDbContext>)(() => context) : throw new ArgumentNullException(nameof(context));
            return (TService)(IServiceObject)this;
        }

        /// <summary>
        /// Get a service object type and associated it automatically with the DbContexts referenced by this service object.
        /// </summary>
        /// <typeparam name="TService">The interface type of the service object to pull from the underlying DI service provider.</typeparam>
        /// <returns></returns>
        public TService GetService<TService>() where TService : class, IServiceObject
        { return ServiceProvider.GetService<TService>().Configure<TService>((type) => GetDB(type)); }

        // ------------------------------------------------------------------------------------------------------------------------------------
    }

    public static class ServiceObjectExtensions
    {
        // ------------------------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Configures this CDS service object with a DbContext router.  A router is used to pulled database contexts from
        ///     another service object instance to allowed working with nested service objects. This allows setting contexts in the
        ///     root service object instead of every object. This allows service objects to be individual, or as part of a root
        ///     reference object.
        /// </summary>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <param name="serviceObj"> The service Object to act on for this extension method. </param>
        /// <param name="contextFactory"> A function that returns an ICDSContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        public static TService Configure<TService>(this TService serviceObj, Func<Type, ICoreXTDBContext> contextFactory)
            where TService : class, IServiceObject
        {
            return serviceObj.Configure<TService>(contextFactory);
        }

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <typeparam name="TDbContext"> Type of the database context. </typeparam>
        /// <param name="serviceObj"> The service Object to act on for this extension method. </param>
        /// <param name="contextFactory"> A function that returns an DbContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        public static TService Configure<TService, TDbContext>(this TService serviceObj, Func<TDbContext> contextFactory)
            where TService : class, IServiceObject
            where TDbContext : class, ICoreXTDBContext
        {
            return serviceObj.Configure<TService, IDbContext>(contextFactory);
        }

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <param name="serviceObj"> The service Object to act on for this extension method. </param>
        /// <param name="context"> An ICDSContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        public static TService Configure<TService>(this TService serviceObj, ICoreXTDBContext context)
            where TService : class, IServiceObject
        {
            return serviceObj.Configure<TService>(context);
        }
    }
}
