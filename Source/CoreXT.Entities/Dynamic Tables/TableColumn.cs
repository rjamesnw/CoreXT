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
    /// Used internally to work with the table columns.
    /// </summary>
    public interface IInternalTableColumn
    {
        IVariantTable<object> Table { get; set; }
        string PropertyName { get; }
        string DBName { get; }
        Int64 Order { get; set; }
    }

    public interface ITableColumn
    {
        TableColumn<T> AsTableColumn<T>() where T : class, new();
        IVariantTable<object> Table { get; }
        string PropertyName { get; }
        string DBName { get; }
        Int64 Order { get; set; }
        string Title { get; set; }
        string Description { get; set; }
        bool IsKey { get; }
        int? MaxLength { get; }
        bool? Nullable { get; }
        bool IsRequired { get; }
        string Prompt { get; set; }
        bool Hidden { get; set; }
        ITableColumn Unhide();
        bool IsCalculated { get; }
        string RequiredMessage { get; set; }
        //TableColumn<object>.TableColumnValueHandler ValueHandler { get; set; }
        IEnumerable<SelectListItem> Selections { get; set; }
        Type DataType { get; }
        object GetValue(IVariantTableRow<object> row);
        T GetValue<T>(IVariantTableRow<object> row);
        bool Equals(object obj);
        int GetHashCode();
        string ToString();
    }

    public interface IVariantTableColumn<out TEntity> : ITableColumn
        where TEntity : class, new()
    {
        IVariantTable<TEntity> Table { get; }
    }

    //public delegate object TableColumnValueHandler(ITableRow row, ITableColumn column);

    public class TableColumn<TEntity> : ITableColumn<TEntity>, IVariantTableColumn<TEntity>, IInternalTableColumn where TEntity : class, new()
    {
        public delegate object TableColumnValueHandler(ITableRow<TEntity> row, ITableColumn<TEntity> column);
        public delegate string TableColumnValidationHandler(ITableRow<TEntity> row, ITableColumn<TEntity> column);

        TableColumn<T> ITableColumn.AsTableColumn<T>() { return (TableColumn<T>)(ITableColumn<TEntity>)this; }

        public ITable<TEntity> Table { get; private set; }
        IVariantTable<object> ITableColumn.Table { get { return (IVariantTable<object>)Table; } }
        IVariantTable<object> IInternalTableColumn.Table { get { return (IVariantTable<object>)Table; } set { Table = (ITable<TEntity>)value; } }

        public string PropertyName { get; private set; }
        public string DBName { get; private set; }
        public Int64 Order { get; set; }
        /// <summary>
        /// The column title to display on the UI.
        /// </summary>
        public string Title { get; set; }
        /// <summary>
        /// Used for showing help details or tips for columns.
        /// </summary>
        public string Description { get; set; }
        public bool IsKey { get; private set; }
        public int? MaxLength { get; private set; }
        public bool? Nullable { get; private set; }

        public bool IsRequired { get { return !IsCalculated && !(Nullable ?? false); } }

        /// <summary>
        /// Watermark help text used for some prompts.
        /// </summary>
        public string Prompt { get; set; }

        public bool Hidden { get; set; }
        public ITableColumn Unhide() { Hidden = false; return this; }

        /// <summary>
        /// A message to display if a required value is not supplied.
        /// </summary>
        public string RequiredMessage { get; set; }

        /// <summary>
        /// Set to true if this column is a calculated column.  Changing cells on a row causes these to update automatically.
        /// Make sure to set a handler for 'TableColumnValueHandler' for calculating the values.
        /// </summary>
        public bool IsCalculated { get; set; }

        /// <summary>
        /// Allows overriding a row's column value to return a custom value (such as 'M'/'F' to 'Male'/'Female', 'Y'/'N' to 'Yes'/'No', etc).
        /// <para><!--If 'IsCalculated' is true, any row values for this column are always ignored, and a handler 
        /// is expected. In this case, if not set, null is assumed. An example might be a person's age, based
        /// on their birth date.-->When this is set, it bypasses reading the property on the entity.
        /// Return the value 'DBNull.Value' to fall back to the property value if needed.</para>
        /// </summary>
        public TableColumnValueHandler ValueHandler { get; set; }

        /// <summary>
        /// If set, is called to validate the current value when changes are applied to the underlying entities.
        /// </summary>
        public TableColumnValidationHandler ValidationHandler { get; set; }

        /// <summary>
        /// A list of selections for this column.  If present, the UI will show a dropdown.
        /// </summary>
        public IEnumerable<SelectListItem> Selections { get; set; }

        /// <summary>
        /// Returns the type of data for this column based on entity data stored in the parent table.
        /// For dynamic/calculated columns, this should be set to a proper type (default is object).
        /// </summary>
        public Type DataType
        {
            get { return _DataType ?? Table.GetEntityPropertyFromCache(typeof(TEntity), PropertyName)?.PropertyType ?? (_DataType = typeof(object)); }
            set { _DataType = value; }
        }
        Type _DataType;

        public TableColumn(ITable<TEntity> table, string propertyName, string dbName, string title = null, Int64? order = null, int? maxLength = null, bool? nullable = null, bool isKey = false, string requiredMsg = null)
        {
            Table = table;
            PropertyName = propertyName;
            DBName = dbName;
            Title = title ?? DBName;
            Order = order ?? Int64.MaxValue;
            IsKey = isKey;
            MaxLength = maxLength;
            RequiredMessage = requiredMsg;
            Nullable = nullable ?? (requiredMsg != null ? true : (bool?)null);
        }

        /// <summary>
        /// Returns a value for this column when given a row.
        /// </summary>
        public object GetValue(IVariantTableRow<object> row) //(note: this method is the master method for getting values, due to calculated columns that may not be on the entity object)
        {
            var result = ValueHandler != null ? ValueHandler((ITableRow<TEntity>)row, this) : DBNull.Value;
            //? /*Entity.Property{get} can also be used for a value handler!*/ if (IsCalculated) return result; // (always return this if this is a calculated-only column)
            if (result != DBNull.Value) return result; // (user can override entity values, such as might be required for translations)
            var property = Table.GetEntityPropertyFromCache(row.EntityType, PropertyName);
            return property?.GetValue(row.Entity, null); // (if no user handler exists [override/filter], or it's return is null, get the value from the row)
        }
        public T GetValue<T>(IVariantTableRow<object> row)
        {
            return Types.ChangeType<T>(GetValue(row));
        }

        public override string ToString() { return this.Title + " (" + this.DBName + ")"; }
        public override int GetHashCode() { return base.GetHashCode(); }
        public override bool Equals(object obj) { return obj != null && (obj is string && string.Compare(((string)obj), DBName, true) == 0 || obj is TableColumn<object> && string.Compare(((TableColumn<object>)obj).DBName, DBName, true) == 0 || string.Compare(obj.ToString(), DBName, true) == 0); }

        public static TableColumn<TEntity> FromProperty(ITable<TEntity> table, PropertyInfo colProp, Int64? order = null, bool? isKey = null, int? maxLength = null, string requiredMessage = null)
        {
            // ... extract any attribute annotation details ...

            var displayAttr = table.GetCustomMetadataPropertyAttributes<DisplayAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var columnAttr = table.GetCustomMetadataPropertyAttributes<ColumnAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var maxLenAttr = table.GetCustomMetadataPropertyAttributes<MaxLengthAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var requiredAttr = table.GetCustomMetadataPropertyAttributes<RequiredAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var keyAttr = table.GetCustomMetadataPropertyAttributes<KeyAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var readonlyAttr = table.GetCustomMetadataPropertyAttributes<ReadOnlyAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();
            var hiddenAttr = table.GetCustomMetadataPropertyAttributes<NotMappedAttribute>(colProp.Name, colProp.DeclaringType).FirstOrDefault();

            string dbName = columnAttr != null ? columnAttr.Name : null;
            string title = displayAttr != null ? displayAttr.Name : colProp.Name;
            string desc = displayAttr != null ? displayAttr.Description : null;
            string prompt = displayAttr != null ? displayAttr.Prompt : null;
            order = order ?? (displayAttr != null ? displayAttr.Order : columnAttr != null ? columnAttr.Order : order);
            int? maxLen = maxLenAttr != null ? maxLenAttr.Length : maxLength;
            isKey = isKey ?? (keyAttr != null || table.KeyNames.Contains(colProp.Name));
            string requiredMsg = requiredAttr != null ? requiredAttr.ErrorMessage : requiredMessage;
            bool? nullable = requiredMsg != null;
            bool hidden = hiddenAttr != null;

            return new TableColumn<TEntity>(table, colProp.Name, dbName, title, order, maxLen, nullable, isKey ?? false, requiredMsg)
            {
                Description = desc,
                Prompt = prompt,
                IsCalculated = !colProp.CanWrite || (colProp.SetMethod?.Attributes.HasFlag(MethodAttributes.Private) ?? false) || (readonlyAttr?.IsReadOnly ?? false),
                Hidden = hidden
            };
        }

        public static TableColumn<TEntity> FromMetadataProperty(ITable<TEntity> table, Property prop)
        {
            // ... extract any attribute annotation details from the underlying entity type, if available ...

            var displayAttr = table.GetCustomMetadataPropertyAttributes<DisplayAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var columnAttr = table.GetCustomMetadataPropertyAttributes<ColumnAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var maxLenAttr = table.GetCustomMetadataPropertyAttributes<MaxLengthAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var requiredAttr = table.GetCustomMetadataPropertyAttributes<RequiredAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var keyAttr = table.GetCustomMetadataPropertyAttributes<KeyAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var readonlyAttr = table.GetCustomMetadataPropertyAttributes<ReadOnlyAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();
            var hiddenAttr = table.GetCustomMetadataPropertyAttributes<NotMappedAttribute>(prop.Name, typeof(TEntity)).FirstOrDefault();

            string dbName = columnAttr != null ? columnAttr.Name : null;
            string title = displayAttr != null ? displayAttr.Name : prop.Name;
            string desc = displayAttr != null ? displayAttr.Description : null;
            string prompt = displayAttr != null ? displayAttr.Prompt : null;
            int? order = displayAttr != null ? displayAttr.Order : columnAttr != null ? columnAttr.Order : table.ColumnOrder.IndexOf(prop.Name);
            if (order < 0) order = null;
            int? maxLen = maxLenAttr != null ? maxLenAttr.Length : prop.GetMaxLength();
            bool isKey = keyAttr != null || prop.IsKey(); // (Note: Casting the declaring type and checking the key members is how the inaccessible internal '{EdmProperty}.IsKeyMember' property works)
            string requiredMsg = requiredAttr != null ? requiredAttr.ErrorMessage : null;
            bool nullable = prop.IsNullable;
            bool hidden = hiddenAttr != null;

            return new TableColumn<TEntity>(table, prop.Name, dbName, title, order, maxLen, nullable, isKey, requiredMsg)
            {
                Description = desc,
                Prompt = prompt,
                IsCalculated = readonlyAttr?.IsReadOnly ?? false,
                Hidden = hidden
            };
        }

        // -----------------------------------------------------------------------------------------------------------------------------------
        // Variant Support

        IVariantTable<TEntity> IVariantTableColumn<TEntity>.Table => (IVariantTable<TEntity>)Table;

        // -----------------------------------------------------------------------------------------------------------------------------------
    }
}
