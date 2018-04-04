using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace CoreXT.Entities
{
    /// <summary>
    ///     A converter used to serialize a <see cref="Table{TEntity}"/>, <see cref="TableColumn{TEntity}"/>, or
    ///     <see cref="TableRow{TEntity}"/> instances into JSON. The converter can also deserialize <see cref="Table{TEntity}"/>
    ///     from JSON, but not columns and rows separately, since those need a table reference.
    /// </summary>
    /// <seealso cref="T:Newtonsoft.Json.JsonConverter"/>
    class TableConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return typeof(ITable).IsAssignableFrom(objectType) && typeof(IVariantTable<object>).IsAssignableFrom(objectType)
                || typeof(ITableColumn).IsAssignableFrom(objectType) && typeof(IVariantTableColumn<object>).IsAssignableFrom(objectType)
                || typeof(ITableRow).IsAssignableFrom(objectType) && typeof(IVariantTableRow<object>).IsAssignableFrom(objectType);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            if (!typeof(ITable).IsAssignableFrom(objectType) || !typeof(IVariantTable<object>).IsAssignableFrom(objectType))
                return null; // (only the whole table supported for now)
            // TODO: Consider supporting read-conversion for table columns and rows. separately.

            var entityType = objectType.GetGenericArguments().First();

            try
            {
                // ... make sure the reader is ready to read from an object brace ...
                if (reader.TokenType == JsonToken.Null) return null;
                if (reader.TokenType != JsonToken.StartObject) throw new InvalidOperationException("An object start brace is expected.");

                var table = (IVariantTable<object>)Activator.CreateInstance(typeof(Table<>).MakeGenericType(entityType));

                // ... read all JObjects and values from stream in one shot - we need to make sure we have all the table configurations first ...
                JObject jObject = JObject.Load(reader);
                // ... deserialize by reading and setting the table object level properties ...
                var tablePropDict = _DeserializePrimitivePublicReadableProperties(jObject, table);

                // ... read the columns (do this first BEFORE we create the rows) ...

                if (jObject.TryGetValue("columns", out var columnsProp))
                {
                    var columns = columnsProp as JContainer;
                    if (columns != null)
                        foreach (var col in columns)
                            if (col is JObject _col)
                            {
                                var columnName = _col.Property(CLRNameToJSName(nameof(ITableColumn.PropertyName)))?.Value<string>();
                                var title = _col.Property(CLRNameToJSName(nameof(ITableColumn.Title)))?.Value<string>();
                                var order = _col.Property(CLRNameToJSName(nameof(ITableColumn.Order)))?.Value<int>() ?? 0;
                                var tableColumn = table.AddColumn(columnName, title, order);
                                var rowPropDict = _DeserializePrimitivePublicReadableProperties(_col, tableColumn);
                            }
                }

                // ... read the rows ...

                if (jObject.TryGetValue("rows", out var rowsProp))
                {
                    var rows = rowsProp as JContainer;
                    if (rows != null)
                        foreach (var row in rows)
                            if (row is JObject _row)
                            {
                                var entityProp = _row.Property("entity").Value as JObject;
                                object entity = null;
                                if (entityProp != null)
                                {
                                    // ... create the entity that will receive the entity values ...
                                    entity = Activator.CreateInstance(entityType);
                                    var entityPropDict = _DeserializePrimitivePublicReadableProperties(entityProp, entity);
                                }
                                var tableRow = table.CreateRow(entity);
                                var rowPropDict = _DeserializePrimitivePublicReadableProperties(_row, tableRow);
                            }
                }

                return table;
            }
            catch (Exception ex) { throw new Exception("Failed to parse table JSON.", ex); }
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            //serializer.Serialize(writer, value, typeof(Product));
            if (value is IVariantTable<object> table)
            {
                // ... serialize and return a table as JSON ...

                writer.WriteStartObject();

                writer.WritePropertyName("entityType");
                writer.WriteValue(table.EntityType.FullName);

                _SerializePrimitivePublicReadableProperties(writer, table);

                // ... write the columns (first at the top so columns can be setup first when deserializing) ...

                writer.WritePropertyName("columns");
                writer.WriteStartArray();
                foreach (var col in table.TableColumns)
                    WriteJson(writer, col, serializer);
                writer.WriteEndArray();

                // ... write the rows ...

                writer.WritePropertyName("rows");
                writer.WriteStartArray();
                foreach (var row in table.TableRows)
                    WriteJson(writer, row, serializer);
                writer.WriteEndArray();

                writer.WriteEndObject();
            }
            else if (value is IVariantTableColumn<object> column)
            {
                // ... serialize and return a column as JSON ...
                writer.WriteStartObject();
                _SerializePrimitivePublicReadableProperties(writer, column);
                writer.WriteEndObject();
            }
            else if (value is IVariantTableRow<object> row)
            {
                // ... serialize and return a row as JSON ...
                writer.WriteStartObject();

                writer.WritePropertyName("entityType");
                writer.WriteValue(row.EntityType.FullName);

                _SerializePrimitivePublicReadableProperties(writer, row);

                // ... output the entity data for this row ...
                writer.WritePropertyName("entity");
                serializer.Serialize(writer, row.Entity);

                writer.WriteEndObject();
            }
        }

        public static string CLRNameToJSName(string clrName)
        {
            if (string.IsNullOrEmpty(clrName)) return clrName;
            //var isDbStyleName = Regex.IsMatch(clrName, "[a-z_]+"); // (if all lowercase then assume this is a DB field and convert the name accordingly "a_b_cd" to "aBCd" and not "a_b_cD" to )
            var newString = "";
            char c, prevC = '\0';
            bool isLowerChar, isUpperChar;
            //return Regex.Replace(clrName, "_([a-z])", m => m.Value.TrimStart('_').ToUpper());
            for (int i = 0, n = clrName.Length; i < n; ++i)
            {
                c = clrName[i];

                isLowerChar = TextReader.IsLower(c);
                isUpperChar = TextReader.IsUpper(c);

                if (prevC == '\0' && isUpperChar)
                    newString += c.ToString().ToLower();
                else if (prevC == '_' && isLowerChar)
                    newString += c.ToString().ToUpper();
                else if (c != '_') newString += c;

                prevC = c;
            }
            return newString;
        }

        private static void _SerializePrimitivePublicReadableProperties(JsonWriter writer, object obj)
        {
            var props = _GetProperties(obj, true, null, p => p.PropertyType.IsPrimitive);
            foreach (var prop in props)
            {
                writer.WritePropertyName(CLRNameToJSName(prop.Name));
                writer.WriteValue(prop.GetValue(obj));
            }
        }

        private static Dictionary<string, PropertyInfo> _DeserializePrimitivePublicReadableProperties(JObject jObject, object obj)
        {
            // ... create a quick-lookup dictionary to find properties from the JSON names for this object ...
            var propDict = _GetProperties(obj, null, true).ToDictionary(p => CLRNameToJSName(p.Name).ToUpper(), p => p);

            foreach (var jprop in jObject.Properties())
            {
                var name = jprop.Name;
                var prop = propDict.Value(name.ToUpper());
                if (prop == null) continue;
                if (jprop.Type == JTokenType.Float && Utilities.IsFloat(prop.PropertyType)
                    || jprop.Type == JTokenType.Integer && Utilities.IsInt(prop.PropertyType)
                    || jprop.Type == JTokenType.Boolean && Utilities.IsBoolean(prop.PropertyType))
                {
                    prop?.SetValue(obj, jprop.Value);
                }
            }

            return propDict;
        }

        static PropertyInfo[] _GetProperties(object obj, bool? canRead, bool? canWrite, Func<PropertyInfo, bool> filter = null)
        {
            // ... set all public primitive properties first by default ...
            return obj.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy)
                .Where(p => (canRead == null || p.CanRead == canRead) && (canWrite == null || p.CanWrite == canWrite) && (filter == null || filter.Invoke(p)))
                .ToArray();
        }
    }
}
