using CoreXT.Entities;
using CoreXT.Services.DI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace CoreXT.Entities
{
    // ########################################################################################################################

    /// <summary>
    /// The CoreXT database context object.
    /// </summary>
    public class CoreXTDBContext : DbContext, ICoreXTDBContext
    {
        // --------------------------------------------------------------------------------------------------------------------

        public virtual bool IsReadonly { get { return false; } }

        protected ILogger LogService => _LogService ?? (_LogService = Services.GetService<ILoggerFactory>()?.CreateLogger<CoreXTDBContext>());
        ILogger _LogService;

        /// <summary>
        /// If this database context is pulled from the services container, or created manually via certain constructors, then
        /// this will be populated with a service provider reference, otherwise this will be null.
        /// </summary>
        public ICoreXTServiceProvider Services { get; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Construct a new DBContext with options and services access.
        /// Giving access to services allows custom LINQ extension methods to have access to application services via DbSetXT.
        /// </summary>
        /// <param name="options">The DbContext options.</param>
        /// <param name="services">A reference to the application services.</param>
        public CoreXTDBContext(DbContextOptions options, ICoreXTServiceProvider services) : base(options)
        {
            Services = services ?? throw new ArgumentNullException(nameof(services));
            _Populate();
        }

        /// <summary>
        /// Construct a new DBContext with options and NO services access.
        /// The 'Services' property will not be set, and custom LINQ extensions will not have access to application services via DbSetXT.
        /// </summary>
        /// <param name="options">The DbContext options.</param>
        public CoreXTDBContext(DbContextOptions options) : base(options)
        {
            _Populate();
        }

        /// <summary>
        /// Construct a new DBContext with services access.
        /// Giving access to services allows custom LINQ extension methods to have access to application services via DbSetXT.
        /// <para>This method is usually the one called when the context is created from the DI container.</para>
        /// </summary>
        /// <param name="services">A reference to the application services.</param>
        public CoreXTDBContext(ICoreXTServiceProvider services)
        {
            Services = services ?? throw new ArgumentNullException(nameof(services));
            _Populate();
        }

        /// <summary>
        /// Construct a new DBContext with default options.
        /// The 'Services' property will not be set, and custom LINQ extensions will not have access to application services via DbSetXT.
        /// </summary>
        public CoreXTDBContext()
        {
            _Populate();
        }

        internal void _Populate()
        {
            // ... get all the runtime properties for this type ...
            var props = GetType().GetRuntimeProperties();
            // ... find the DbSetXT properties ...
            var dbSetProps = props.Where(p => p.CanWrite && p.PropertyType.IsGenericType && p.PropertyType.GetGenericTypeDefinition() == typeof(DbSetXT<>));
            var dbSetType = typeof(DbSetXT<>);
            // ... set each property with an instance of DbSetXT ...
            foreach (var prop in dbSetProps)
                prop.SetValue(this, Activator.CreateInstance(dbSetType.MakeGenericType(prop.PropertyType.GenericTypeArguments[0]), this, Services));
        }

        /// <summary>
        /// DO NOT CALL 'Dispose()' DIRECTLY. Let the DI container handle it. To force disposal, type-case to 'DbContext' first, then call '{DbContext}.Dispose()'.';
        /// </summary>
        [Obsolete("You should not be calling this directly in ASP.Net Core.")]
        void IDisposable.Dispose()
        {
            var caller = System.Reflection.Assembly.GetCallingAssembly().FullName;
            var assemblyRootName = caller.Split('.')[0].ToUpper();
            if (assemblyRootName != "SYSTEM" && assemblyRootName != "MICROSOFT")
            {
                var msg = "Disposing of a context manually can cause errors. It is recommended to let the DI container dispose of objects. To force disposing this object, type-case it to 'DbContext' first.\r\n The assembly that caused the error was '" + caller + "'. Review the exception stack trace for more details.";
                System.Diagnostics.Debug.WriteLine("*** " + msg + " ***", "ERROR");
                throw new InvalidOperationException(msg);
            }
            base.Dispose();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Attempts to get or set the connection string for the underlying 'Database' object instance.
        /// Note that this may not be reliable, and seems to be provider implementation dependent.
        /// </summary>
        /// <returns></returns>
        public string ConnectionString
        {
            get { return Database.GetDbConnection().ConnectionString; }
            set { Database.GetDbConnection().ConnectionString = value; }
        }

        /// <summary>
        /// Called when the DBContext is being configured.
        /// </summary>
        public event Action<DbContextOptionsBuilder> Configuring;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            Configuring?.Invoke(optionsBuilder);
            base.OnConfiguring(optionsBuilder);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Enforce that field names in the entity classes are within a maximum length.
        /// </summary>
        /// <param name="modelBuilder"></param>
        /// <param name="maxLength"></param>
        /// <returns></returns>
        public string ValidateMaxColumnNameLength(ModelBuilder modelBuilder, int maxLength)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
                foreach (var property in entityType.GetProperties())
                    if (property.FieldInfo != null)
                    {
                        var columnName = property.FieldInfo.Name; //? .SqlServer().ColumnName;
                        if (columnName.Length > maxLength)
                            return "Column name '" + columnName + "' is greater than " + maxLength + " characters.";
                    }
            return null;
        }

        /// <summary>
        /// Updates the relational entity information with an associated table names specified using the 'Table()' attribute.
        /// </summary>
        /// <param name="modelBuilder"></param>
        /// <returns></returns>
        public void UpdateTableNames(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // ... make sure tables names are updated properly ...

                var dbInfo = entityType.Relational();

                var attr = entityType.ClrType.GetTypeInfo().GetCustomAttribute<TableAttribute>();
                if (attr != null && !string.IsNullOrWhiteSpace(attr.Name)) dbInfo.TableName = attr.Name;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Saves all changes made in this context to the underlying database.
        /// </summary>
        /// <returns>The number of state entries written to the underlying database. This can include
        /// state entries for entities and/or relationships. Relationship state entries are
        /// created for many-to-many relationships and relationships where there is no foreign
        /// key property included in the entity class (often referred to as independent associations).</returns>
        public override int SaveChanges()
        {
            try
            {
                if (IsReadonly)
                    throw new InvalidOperationException("This context is flagged as readonly. Use 'ForceSaveChanges()' if required.");
                return base.SaveChanges();
            }
            catch (Exception ex)
            {
                LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                if (IsReadonly)
                    throw new InvalidOperationException("This context is flagged as readonly. Use 'ForceSaveChangesAsync()' if required.");
                return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
            }
            catch (Exception ex)
            {
                LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                if (IsReadonly)
                    throw new InvalidOperationException("This context is flagged as readonly. Use 'ForceSaveChangesAsync()' if required.");
                return base.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        /// <summary>
        /// Ignores "Read Only" mode and saves any changes made in this context to the underlying database.
        /// <para>The only time it is safe to do this is if there is a global entity collection (like settings) being shared.</para>
        /// </summary>
        /// <returns>The number of state entries written to the underlying database. This can include
        /// state entries for entities and/or relationships. Relationship state entries are
        /// created for many-to-many relationships and relationships where there is no foreign
        /// key property included in the entity class (often referred to as independent associations).</returns>
        public int ForceSaveChanges()
        {
            try
            {
                return base.SaveChanges();
            }
            catch (Exception ex)
            {
                LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        public Task<int> ForceSaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
            }
            catch (Exception ex)
            {
                LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        public Task<int> ForceSaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                return base.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                LogService?.LogError(new EventId(-1, "CoreXT.Entities"), ex, null);
                throw;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    /// <summary>
    /// Provides a CoreXT DBContext implementation that is scoped to a request duration. This allows all methods during a single
    /// request to use a "cached" version, greatly reducing database hits.
    /// <para>Note: Saving is disabled on this context. For read/write ability, get a transient instance of the 'CoreXTDBContext' type.</para>
    /// </summary>
    public class CoreXTReadonlyDBContext : CoreXTDBContext, ICoreXTReadonlyDBContext
    {
        public override bool IsReadonly { get { return true; } }

        public CoreXTReadonlyDBContext(DbContextOptions<CoreXTReadonlyDBContext> options, ICoreXTServiceProvider services) : base(options, services)
        {
        }
    }

    // ########################################################################################################################
}
