using System;
using System.Globalization;
using System.Linq;
using System.Reflection;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    /// <summary>
    /// Provides utility methods for types.
    /// This class was originally created to support the 'ThreadController" class's "Dispatch()" methods.
    /// </summary>
    public static partial class Types
    {
        // ---------------------------------------------------------------------------------------------------------------------

        public static object ChangeType(object value, Type targetType, IFormatProvider provider)
        {
            if (targetType == null)
                throw new ArgumentNullException("targetType");

            var targetTypeInfo = targetType.GetTypeInfo(); // (this is a fix to support .NET Core)

            if (targetTypeInfo.IsEnum)
            {
                return Enum.Parse(targetType, Convert.ToString(value), true);
            }
            else
            {
                Type underlyingType;

                if (provider == null)
                    provider = CultureInfo.CurrentCulture;

                if ((underlyingType = Nullable.GetUnderlyingType(targetType)) != null)
                {
                    // ... this is a nullable type target, so need to convert to underlying type first, then to a nullable type ...
                    if (value is string && string.IsNullOrEmpty((string)value))
                        return null; // (for nullable target types, convert empty strings to null)
                    else
                        value = ChangeType(value, underlyingType, provider); // (recursive call to convert to the underlying nullable type)
                    return Activator.CreateInstance(targetType, value);
                }
                else if (targetTypeInfo.IsValueType && (value == null || value is string && string.IsNullOrEmpty((string)value)))
                {
                    // (cannot set values to 'null')
                    if (targetType == typeof(bool))
                        value = false;
                    else if (targetType == typeof(DateTime))
                        value = DateTime.MinValue;
                    else
                        value = 0;
                }
                else if (value == null) return null;
                else if (value.GetType() == targetType) return value; // (same type as target!)
                else if (targetType == typeof(Boolean))
                {
                    if (value == null || value is string && ((string)value).IsNullOrWhiteSpace()) // (null or empty strings will be treated as 'false', but explicit text will try to be converted)
                        value = false;
                    else if ((value = Utilities.ToBoolean(value, null)) == null)
                        throw new InvalidCastException(string.Format("Types.ChangeType(): Cannot convert string value \"{0}\" to a boolean.", value));
                }
            }

            try
            {
                return Convert.ChangeType(value, targetType, provider);
            }
            catch (Exception ex)
            {
                throw new InvalidCastException(string.Format("Types.ChangeType(): Cannot convert value \"{0}\" (type: '{1}') to type '{2}'. If you are developing the source type yourself, implement the 'IConvertible' interface.", Utilities.ND(value, ""), value.GetType().FullName, targetTypeInfo.FullName), ex);
            }
        }
        public static object ChangeType(object value, Type targetType) { return ChangeType(value, targetType, null); }

        public static TargetType ChangeType<TargetType>(object value, IFormatProvider provider)
        { return (TargetType)ChangeType(value, typeof(TargetType), provider); }
        public static TargetType ChangeType<TargetType>(object value) { return ChangeType<TargetType>(value, null); }

        /// <summary>
        /// A structure which represents a 'typed' null value.
        /// This is required for cases where a type is just 'object', in which 'null' may be passed,
        /// but the type still needs to be known. An example usage is with methods that accept variable
        /// number of parameters, but need to know the argument type, even if null.
        /// </summary>
        public struct Null
        {
            public readonly Type Type;
            public Null(Type type) => Type = type ?? throw new ArgumentNullException("type");
        }

        /// <summary>
        /// If not null, returns either the argument, otherwise returns argument's 'null' type.
        /// This is needed in cases where an argument is null, but the argument type is needed.
        /// <para>
        /// Example: MyMethod(typeof(DateTime).Arg(value)); - If 'value' is null, then the type is passed instead as 'Types.Null'
        /// </para>
        /// </summary>
        /// <param name="type">Argument type.</param>
        /// <param name="value">Argument value.</param>
        /// <returns>Argument value, or the type if null.</returns>
        public static object Arg(this Type type, object value)
        {
            if (type == null) throw new ArgumentNullException("type");
            if (value != null)
            {
                if (!type.GetTypeInfo().IsAssignableFrom(value.GetType()))
                    throw new InvalidOperationException("Types.Arg(): Type of 'value' cannot be cast to '" + type.FullName + "'.");
                return value;
            }
            else return new Null(type);
        }

        /// <summary>
        /// Attempts to get the types of the values passed.
        /// If a value is 'null', then the call will fail, and 'null' will be returned.
        /// Note: This method recognizes Types.Null values.
        /// </summary>
        /// <param name="args">Argument values to get types for.</param>
        public static Type[] GetTypes(params object[] args)
        {
            if (args == null || args.Length == 0) return null;
            foreach (object arg in args)
                if (arg == null) return null;
            Type[] argTypes = new Type[args.Length];
            for (int i = 0; i < args.Length; i++)
                argTypes[i] = (args[i] is Null) ? ((Null)args[i]).Type : args[i].GetType();
            return argTypes;
        }

        /// <summary>
        /// Converts any Types.Null objects into simple 'null' references.
        /// This is helpful after using Types.GetTypes() on the same items - once the types are
        /// retrieved, this method helps to convert Types.Null items back to 'null'.
        /// </summary>
        public static object[] ConvertNullsToNullReferences(object[] items)
        {
            if (items != null)
                for (int i = 0; i < items.Length; i++)
                    if (items[i] is Null) items[i] = null;
            return items;
        }

        /// <summary>
        ///     Get a public instance property info object from 'type' by name. If the name is null or empty then null is
        ///     returned.
        /// </summary>
        /// <param name="type"> The type to act on. </param>
        /// <param name="name"> name of the property. </param>
        /// <returns> property info object. </returns>
        ///
        /// ### <typeparam name="T"> Generic type parameter. </typeparam>
        public static PropertyInfo GetPublicInstanceProperty(this Type type, string name)
            => type?.GetProperties(BindingFlags.Public | BindingFlags.Instance)?.Where(p => string.Compare(p.Name, name, true) == 0).FirstOrDefault();

        /// <summary>
        ///     Get a public instance property info object from 'type' by name. If the name is null or empty then null is
        ///     returned.
        /// </summary>
        /// <param name="type"> The type to act on. </param>
        /// <param name="name"> name of the property. </param>
        /// <param name="bindingAttr">
        ///     A bitmask comprised of one or more System.Reflection.BindingFlags that specify how the search is conducted; or Zero,
        ///     to return null.
        /// </param>
        /// <returns> property info object. </returns>
        public static PropertyInfo GetPublicInstanceProperty(this Type type, string name, BindingFlags bindingAttr)
            => type?.GetProperties(BindingFlags.Public | BindingFlags.Instance | bindingAttr)?.Where(p => string.Compare(p.Name, name, true) == 0).FirstOrDefault();
    }

    // =========================================================================================================================
}
