using CoreXT.Entities;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    public class Table : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A reference to the data table to be rendered.
        /// </summary>
        public ITable<object> DataTable { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control.
        /// </summary>
        public Table(ICoreXTServiceProvider sp) : base(sp) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Configure a table component with a data table instance.
        /// </summary>
        /// <param name="table">The data table to use.</param>
        public Table Configure<TEntity>(ITable<TEntity> table) where TEntity: class, new()
        {
            DataTable = table;
            return this;
        }

        /// <summary>
        /// Configure a table component with a data table instance.
        /// </summary>
        /// <param name="table">The data table to use.</param>
        public Table Configure<TEntity>(IEnumerable<TEntity> entities) where TEntity : class, new()
        {
            var table = new Table<TEntity>(ServiceProvider);
            table.Entities = entities;
            DataTable = table;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
