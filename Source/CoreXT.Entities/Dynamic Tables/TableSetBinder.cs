using CoreXT;
using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Validation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;

namespace CoreXT.Entities
{
    /// <summary>
    /// Can be used with controller parameters like so: '([ModelBinder(typeof(TableSetBinder&lt;TEntityType&gt;))] TEntityType parameterName, ...)'
    /// <para>Note: A binder is not required.  If you already have a reference to an HTTPRequest object, you can apply it to a TableSet object directly.</para>
    /// </summary>
    /// <typeparam name="TEntity">The expected entity model type.</typeparam>
    public class TableSetBinder<TEntity> : IModelBinder // (New methodology for .Net core; see more: http://www.dotnetcurry.com/aspnet-mvc/1368/aspnet-core-mvc-custom-model-binding)
        where TEntity : class, new()
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            return Task.FromResult(new TableSet<TEntity>(bindingContext.HttpContext.Request));
        }
    }

    public class TableSetBinderProvider : IModelBinderProvider
    {
        /// <summary>
        /// A cache of recent model binder instances to reuse.
        /// </summary>
        private readonly Dictionary<Type, IModelBinder> _TableTypeBinders = new Dictionary<Type, IModelBinder>();

        public IModelBinder GetBinder(ModelBinderProviderContext context)
        {
            var modelType = context.Metadata.ModelType;
            if (modelType != typeof(Table<>)) return null;
            var binder = _TableTypeBinders.Value(modelType);
            if (binder != null) return binder;
            var binderType = typeof(TableSetBinder<>).MakeGenericType(modelType.GetGenericArguments()[0]);
            binder = (IModelBinder)Activator.CreateInstance(binderType);
            _TableTypeBinders[modelType] = binder; // (cache so this is faster next time)
            return binder;
        }
    }
}
