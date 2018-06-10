using CoreXT;
using CoreXT.Entities;
using Microsoft.EntityFrameworkCore;
using CoreXT.Services.DI;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Reflection;
using CoreXT.Demos.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace CoreXT.Demos.Models
{
    // ########################################################################################################################

    /// <summary>
    /// The CoreXT.Demos database context object.
    /// </summary>
    public partial class CoreXTDemoContext : ICoreXTDemoContext
    {
        // --------------------------------------------------------------------------------------------------------------------

        public static int MaxColumnNameLength = 50;

        // --------------------------------------------------------------------------------------------------------------------

        public override bool IsReadonly { get { return false; } }

        // --------------------------------------------------------------------------------------------------------------------

        public CoreXTDemoContext(DbContextOptions<CoreXTDemoContext> options, ICoreXTServiceProvider services)
            : base(options, services)
        {
        }

        /// <summary>
        /// Construct a new CoreXT.Demos entities context object by passing in the name of a connection string in the web.config file, or a whole connecting string itself.
        /// This allows selecting a different database server; for example, based on debug, test, or release (go live) modes.
        /// </summary>
        internal CoreXTDemoContext(string nameOrConnectionString, ICoreXTServiceProvider services = null)
            : base(new DbContextOptionsBuilder().UseMySql(nameOrConnectionString).Options, services)
        {
        }

        public CoreXTDemoContext(ICoreXTServiceProvider services) : base(services)
        {
        }

        public CoreXTDemoContext()
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // modelBuilder.Conventions.Remove<PluralizingTableNameConvention>(); 

            // ... only building the mapping tables is required, since many-to-many relationships are not yet supported for EF in .Net Core ...
            // TODO: Automate the following as well ...

            //modelBuilder.Entity<Category_Task_Map>().ToTable()
            //    .HasKey(m => new { m.categories_id, m.tasks_id });

            // ... validate the models ...

            var result = ValidateMaxColumnNameLength(modelBuilder, MaxColumnNameLength);
            if (result != null)
                throw new InvalidOperationException(result + " This is a precaution check only. To increase the allowed column name length, change the '" + nameof(CoreXTDemoContext) + "." + nameof(MaxColumnNameLength) + "' value.");

            base.OnModelCreating(modelBuilder);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================

    /// <summary>
    /// Provides a CoreXT.Demos DBContext implementation that is scoped to a request duration. This allows all methods during a single
    /// request to use a "cached" version, greatly reducing database hits.
    /// <para>Note: Saving is disabled on this context. For read/write ability, get a transient instance of 'CoreXTDemosContext'.</para>
    /// </summary>
    public class CoreXTDemoReadonlyContext : CoreXTDemoContext, ICoreXTDemoReadonlyContext
    {
        public override bool IsReadonly { get { return true; } }

        public CoreXTDemoReadonlyContext(DbContextOptions<CoreXTDemoContext> options, ICoreXTServiceProvider services) : base(options, services)
        {
        }

        /// <summary>
        /// Construct a new CDS READONLY entities context object using a connection string.
        /// This allows selecting a different database server; for example, based on debug, test, or release (go live) modes.
        /// </summary>
        internal CoreXTDemoReadonlyContext(string nameOrConnectionString, ICoreXTServiceProvider services = null)
            : base(nameOrConnectionString, services)
        {
        }

        public CoreXTDemoReadonlyContext(ICoreXTServiceProvider services) : base(services)
        {
        }
        public CoreXTDemoReadonlyContext()
        {
        }
    }

    // ========================================================================================================================

    public interface ICoreXTDemoContextProvider: IContextProvider { }

    public class CoreXTDemoContextProvider : ContextProvider<CoreXTDemoContext, CoreXTDemoReadonlyContext>, ICoreXTDemoContextProvider
    {
        public CoreXTDemoContextProvider(ICoreXTServiceProvider sp) : base(sp) { }
    }

    // ========================================================================================================================

    public static class CoreXTDemoContextExtensions
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a new database context for read/write operations as detected by the current environment.
        /// To get a context ONLY for reading, use 'GetReadOnlyContext()', which can be much more efficient, since it uses a
        /// per-request-based cache.
        /// <para>Note that this method also tests the connection by default before returning the context.</para>
        /// </summary>
        public static ICoreXTDemoContext GetCoreXTDemoContext(this ICoreXTServiceProvider sp, string connectionString = null, int? commandTimeout = null, bool testConnectingBeforeReturning = true)
        {
            if (connectionString == null)
            {
                var settings = sp.GetCoreXTDemoAppSettings();
                connectionString = settings.DefaultConnectionString;
            }
            return (ICoreXTDemoContext)sp.ConfigureCoreXTDBContext<ICoreXTDemoContextProvider>(false, options => options.UseMySql(connectionString), commandTimeout, testConnectingBeforeReturning);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a context to be used as READONLY.  This context type is normally registered for the MVC request scope, 
        /// which means a new instance on each request, but the same instance used across the request (for caching).
        /// This greatly helps to reduce database hits.
        /// </summary>
        public static ICoreXTDemoReadonlyContext GetCoreXTDemoReadOnlyContext(this ICoreXTServiceProvider sp, string connectionString = null, int? commandTimeout = null, bool testConnectingBeforeReturning = true)
        {
            if (connectionString == null)
            {
                var settings = sp.GetCoreXTDemoAppSettings();
                connectionString = settings.DefaultConnectionString;
            }
            return (ICoreXTDemoReadonlyContext)sp.ConfigureCoreXTDBContext<ICoreXTDemoContextProvider>(true, options => options.UseMySql(connectionString), commandTimeout, testConnectingBeforeReturning);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################
}
