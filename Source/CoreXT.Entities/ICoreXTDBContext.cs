using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CoreXT.Entities
{
    public interface ICoreXTDBContext : IDisposable
    {
        bool IsReadonly { get; }

        DatabaseFacade Database { get; }

        /// <summary>
        /// Attempts to get or set the connection string for the underlying 'Database' object instance.
        /// Note that this may not be reliable, and seems to be provider implementation dependent.
        /// </summary>
        /// <returns></returns>
        string ConnectionString { get; set; }

        /// <summary>
        /// Called when the DBContext is being configured.
        /// </summary>
        event Action<DbContextOptionsBuilder> Configuring;

        /// <summary>
        /// Enforce that field names in the entity classes are within a maximum length.
        /// </summary>
        /// <param name="modelBuilder"></param>
        /// <param name="maxLength"></param>
        /// <returns></returns>
        string ValidateMaxColumnNameLength(ModelBuilder modelBuilder, int maxLength);

        /// <summary>
        /// Updates the relational entity information with an associated table names specified using the 'Table()' attribute.
        /// </summary>
        /// <param name="modelBuilder"></param>
        /// <returns></returns>
        void UpdateTableNames(ModelBuilder modelBuilder);

        int SaveChanges();
        Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken));
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken));

        int ForceSaveChanges();
        Task<int> ForceSaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken));
        Task<int> ForceSaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken));
    }

    public interface ICoreXTReadonlyDBContext : ICoreXTDBContext
    {
    }
}
