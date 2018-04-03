using System;
using System.Collections.Generic;
using CoreXT.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreXT.Entities
{
    public interface ITableRow<TEntity>: ITableRow where TEntity : class, new()
    {
        TEntity Entity { get; }
        new ITable<TEntity> Table { get; set; }
        TEntity FindInContext(DbContext context);
    }
}