using CoreXT.Entities;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    public class Table : WebViewComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A reference to the data table to be rendered.
        /// </summary>
        public IVariantTable<object> DataTable { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control.
        /// </summary>
        public Table(ICoreXTServiceProvider sp) : base(sp) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Configure a table component with a data table instance. </summary>
        /// <typeparam name="TEntity"> Type of the entity. </typeparam>
        /// <param name="id">    The identifier. </param>
        /// <param name="table"> The data table to use. </param>
        /// <returns> A Table. </returns>
        public Table Configure<TEntity>(string id, IVariantTable<TEntity> table) where TEntity : class, new()
        {
            EnableAutomaticID = true;
            ID = id;
            DataTable = table;
            return this;
        }

        /// <summary> Configure a table component with a data table instance. </summary>
        /// <typeparam name="TEntity"> Type of the entity. </typeparam>
        /// <param name="id">       The data table to use. </param>
        /// <param name="entities"> The entities. </param>
        /// <returns> A Table. </returns>
        public Table Configure<TEntity>(string id, IEnumerable<TEntity> entities) where TEntity : class, new()
        {
            EnableAutomaticID = true;
            ID = id;
            var table = new Table<TEntity>(ServiceProvider);
            table.Entities = entities;
            DataTable = table;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
