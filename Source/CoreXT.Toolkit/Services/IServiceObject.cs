using CoreXT.Entities;
using CoreXT.Services.DI;
using Microsoft.EntityFrameworkCore;
using System;

namespace CoreXT.Services
{
    public interface IServiceObjectInternal
    {
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
        TService Configure<TService>(Func<Type, IDbContext> contextFactory)
            where TService : class, IServiceObject;

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <param name="dbContextType"> Type of the database context to register the factory function under. </param>
        /// <param name="contextFactory"> A function that returns an DbContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        TService Configure<TService>(Type dbContextType, Func<IDbContext> contextFactory)
            where TService : class, IServiceObject;

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <typeparam name="TDbContext"> Type of the database context. </typeparam>
        /// <param name="contextFactory"> A function that returns an DbContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        TService Configure<TService, TDbContext>(Func<TDbContext> contextFactory)
            where TService : class, IServiceObject
            where TDbContext : class, IDbContext;

        /// <summary> Configures this CDS service object with a database context. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <typeparam name="TService"> Type of the service. </typeparam>
        /// <param name="context"> An ICDSContext instance to use for this CDS service object. </param>
        /// <returns> A TService. </returns>
        TService Configure<TService>(IDbContext context)
            where TService : class, IServiceObject;
    }

    /// <summary>
    ///     This is a base class for all objects that provide one or more services or nested services. CoreXT Service objects
    ///     are designed to be independent so that they can be individually injected, or nested for grouping.
    /// </summary>
    /// <seealso cref="T:CoreXT.Services.ServiceObject"/>
    public interface IServiceObject : IServiceObjectInternal
    {
        ICoreXTServiceProvider ServiceProvider { get; }
        IDbContext GetDB(Type type);
        TDBContext GetDB<TDBContext>() where TDBContext : IDbContext;
        /// <summary>
        /// Get a service object type and associated it automatically with the DbContexts referenced by this service object.
        /// </summary>
        /// <typeparam name="TService">The interface type of the service object to pull from the underlying DI service provider.</typeparam>
        /// <returns></returns>
        TService GetService<TService>() where TService : class, IServiceObject;
    }
}
