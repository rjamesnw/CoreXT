using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CoreXT.Entities
{
    public interface ITableColumn<TEntity> : ITableColumn where TEntity : class, new()
    {
        new ITable<TEntity> Table { get; }
        TableColumn<TEntity>.TableColumnValidationHandler ValidationHandler { get; set; }
        TableColumn<TEntity>.TableColumnValueHandler ValueHandler { get; set; }
    }
}