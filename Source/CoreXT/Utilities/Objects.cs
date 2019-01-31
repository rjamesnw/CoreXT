using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static partial class Objects
    {
        /// <summary>
        /// Get the property or field of the specified object.
        /// As the name suggests, a property is returned if found, otherwise a field is returned, but not both.
        /// </summary>
        public static void GetPropertyOrField(object obj, string fieldOrPropertyName, out PropertyInfo pi, out FieldInfo fi)
        {
            if (obj == null) { fi = null; pi = null; return; }
            pi = obj.GetType().GetTypeInfo().GetProperty(fieldOrPropertyName);
            if (pi == null) pi = obj.GetType().GetTypeInfo().GetProperty(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static properties)
            fi = (pi != null) ? null : obj.GetType().GetTypeInfo().GetField(fieldOrPropertyName);
            if (pi == null && fi == null) fi = obj.GetType().GetTypeInfo().GetField(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static fields)
        }
        /// <summary>
        /// For use with static properties or fields.
        /// </summary>
        public static void GetPropertyOrField(Type objType, string fieldOrPropertyName, out PropertyInfo pi, out FieldInfo fi)
        {
            if (objType == null) { fi = null; pi = null; return; }
            pi = objType.GetTypeInfo().GetProperty(fieldOrPropertyName);
            if (pi == null) pi = objType.GetTypeInfo().GetProperty(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static properties)
            fi = (pi != null) ? null : objType.GetTypeInfo().GetField(fieldOrPropertyName);
            if (pi == null && fi == null) fi = objType.GetTypeInfo().GetField(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static fields)
        }

        public static bool HasPropertyOrField(object obj, string fieldOrPropertyName)
        {
            PropertyInfo pInfo = null;
            FieldInfo fInfo = null;
            GetPropertyOrField(obj, fieldOrPropertyName, out pInfo, out fInfo);
            return pInfo != null || fInfo != null;
        }

        public static void GetFieldOrProperty(object obj, string fieldOrPropertyName, out FieldInfo fi, out PropertyInfo pi)
        {
            if (obj == null) { fi = null; pi = null; return; }
            fi = obj.GetType().GetTypeInfo().GetField(fieldOrPropertyName);
            if (fi == null) fi = obj.GetType().GetTypeInfo().GetField(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static fields)
            pi = (fi != null) ? null : obj.GetType().GetTypeInfo().GetProperty(fieldOrPropertyName);
            if (fi == null && pi == null) pi = obj.GetType().GetTypeInfo().GetProperty(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static properties)
        }
        public static void GetFieldOrProperty(Type objType, string fieldOrPropertyName, out FieldInfo fi, out PropertyInfo pi)
        {
            if (objType == null) { fi = null; pi = null; return; }
            fi = objType.GetTypeInfo().GetField(fieldOrPropertyName);
            if (fi == null) fi = objType.GetTypeInfo().GetField(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static fields)
            pi = (fi != null) ? null : objType.GetTypeInfo().GetProperty(fieldOrPropertyName);
            if (fi == null && pi == null) pi = objType.GetTypeInfo().GetProperty(fieldOrPropertyName, BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy); // (check static properties)
        }

        public static bool HasFieldOrProperty(object obj, string fieldOrPropertyName)
        {
            FieldInfo fInfo = null;
            PropertyInfo pInfo = null;
            GetFieldOrProperty(obj, fieldOrPropertyName, out fInfo, out pInfo);
            return fInfo != null || pInfo != null;
        }

        public static bool GetPropertyOrFieldValue<T>(object subject, PropertyInfo pi, object[] piIndex, FieldInfo fi, out T value)
        {
            if (pi != null)
            { value = (T)pi.GetValue(subject, piIndex); return true; }
            else if (fi != null)
            { value = (T)fi.GetValue(subject); return true; }
            value = default(T);
            return false;
        }
        public static T GetPropertyOrFieldValue<T>(object subject, PropertyInfo pi, object[] piIndex, FieldInfo fi, T defaultValue)
        {
            T value;
            if (!GetPropertyOrFieldValue(subject, pi, piIndex, fi, out value))
                value = defaultValue;
            return value;
        }

        public static bool GetFieldOrPropertyValue<T>(object subject, FieldInfo fi, PropertyInfo pi, object[] piIndex, out T value)
        {
            if (fi != null)
            { value = (T)fi.GetValue(subject); return true; }
            else if (pi != null)
            { value = (T)pi.GetValue(subject, piIndex); return true; }
            value = default(T);
            return false;
        }
        public static T GetFieldOrPropertyValue<T>(object subject, FieldInfo fi, PropertyInfo pi, object[] piIndex, T defaultValue)
        {
            T value;
            if (!GetFieldOrPropertyValue(subject, fi, pi, piIndex, out value))
                value = defaultValue;
            return value;
        }

        public static bool GetPropertyOrFieldValue<T>(object subject, string name, out T value)
        {
            PropertyInfo pInfo = null;
            FieldInfo fInfo = null;
            GetPropertyOrField(subject, name, out pInfo, out fInfo);
            return GetPropertyOrFieldValue(subject, pInfo, null, fInfo, out value);
        }
        public static T GetPropertyOrFieldValue<T>(object subject, string name, T defaultValue)
        {
            T value;
            if (!GetPropertyOrFieldValue(subject, name, out value))
                value = defaultValue;
            return value;
        }

        public static bool GetFieldOrPropertyValue<T>(object subject, string name, out T value)
        {
            PropertyInfo pInfo = null;
            FieldInfo fInfo = null;
            GetFieldOrProperty(subject, name, out fInfo, out pInfo);
            return GetFieldOrPropertyValue(subject, fInfo, pInfo, null, out value);
        }
        public static T GetFieldOrPropertyValue<T>(object subject, string name, T defaultValue)
        {
            T value;
            if (!GetFieldOrPropertyValue(subject, name, out value))
                value = defaultValue;
            return value;
        }

        public static bool SetPropertyOrFieldValue<T>(object subject, PropertyInfo pi, object[] piIndex, FieldInfo fi, T value)
        {
            if (pi != null)
                pi.SetValue(subject, ((T)value is IConvertible ? Types.ChangeType((T)value, pi.PropertyType) : (T)value), piIndex);
            else if (fi != null)
                fi.SetValue(subject, ((T)value is IConvertible ? Types.ChangeType((T)value, fi.FieldType) : (T)value));
            else
                return false;
            return true;
        }

        public static bool SetFieldOrPropertyValue<T>(object subject, FieldInfo fi, PropertyInfo pi, object[] piIndex, T value)
        {
            if (fi != null)
                fi.SetValue(subject, ((T)value is IConvertible ? Types.ChangeType((T)value, fi.FieldType) : (T)value));
            else if (pi != null)
                pi.SetValue(subject, ((T)value is IConvertible ? Types.ChangeType((T)value, pi.PropertyType) : (T)value), piIndex);
            else
                return false;
            return true;
        }

        public static bool SetPropertyOrFieldValue<T>(object subject, string name, T value)
        {
            PropertyInfo pInfo = null;
            FieldInfo fInfo = null;
            Objects.GetPropertyOrField(subject, name, out pInfo, out fInfo);
            return SetPropertyOrFieldValue(subject, pInfo, null, fInfo, (T)value);
        }

        public static bool SetFieldOrPropertyValue<T>(object subject, string name, T value)
        {
            FieldInfo fInfo = null;
            PropertyInfo pInfo = null;
            Objects.GetFieldOrProperty(subject, name, out fInfo, out pInfo);
            return SetFieldOrPropertyValue(subject, fInfo, pInfo, null, (T)value);
        }

        public static T GetPropertyOrFieldValue<T>(object subject, string name)
        {
            object value;
            if (!GetPropertyOrFieldValue(subject, name, out value))
                value = default(T);
            if (value is T) return (T)value;
            return (T)Types.ChangeType(value, typeof(T), CultureInfo.CurrentCulture);
        }

        private static void _MergeData(object target, object source, string[] pathsToSkip, ref string path, ref bool modified, IList<object> referenceLevels)
        {
            if (target == null || source == null) return; // nothing to do

            // ... keep track of references to protect against cyclical cases ...

            if (referenceLevels.Contains(source))
                return;
            referenceLevels.Add(source);

            // ... if merge objects are of type IList or IEnumerable, then attempt to sync the lists,
            // otherwise abort ...

            try
            {
                if (source is IEnumerable && target is IList)
                {
                    Collections.SyncCollections((IList)target, (IEnumerable)source);
                    // ... continue on to check if there are any other fields/properties to consider ...
                }
            }
            catch
            {
                // ... error processing collection (error in user collection?), just ignore it ...
            }

            string _path = "";

            // ... merge changed properties first, in case they also modify public fields ...

            PropertyInfo[] properties = source.GetType().GetTypeInfo().GetProperties();
            PropertyInfo targetPropInfo = null;
            foreach (PropertyInfo srcInfo in properties)
            {
                targetPropInfo = target.GetType().GetTypeInfo().GetProperty(srcInfo.Name);
                if (targetPropInfo == null) continue; // (skip if target doesn't have this member)

                _path = (path.Length == 0 ? srcInfo.Name : path + "." + srcInfo.Name);
                if (pathsToSkip.Contains(_path))
                    continue; // (skip if the member name is one of the paths to skip)

                if (srcInfo.CanRead && targetPropInfo.CanRead && srcInfo.GetIndexParameters().Length == 0)
                {
                    object targetValue = targetPropInfo.GetValue(target, null);
                    object sourceValue = srcInfo.GetValue(source, null);

                    if (srcInfo.PropertyType.GetTypeInfo().IsClass && srcInfo.PropertyType != typeof(string)) // (although string is a class, it is a primitive type)
                    {
                        // ... attempt to create object on target if missing ...
                        if (sourceValue != null && targetValue == null)
                        {
                            try
                            {
                                targetValue = sourceValue.GetType().GetTypeInfo().Assembly.CreateInstance(sourceValue.GetType().FullName);
                                targetPropInfo.SetValue(target, targetValue, null);
                            }
                            catch { /* ... unable to instantiate the type, just skip it ... */ }
                        }

                        _MergeData(targetValue, sourceValue, pathsToSkip, ref _path, ref modified, referenceLevels);
                    }
                    else
                    {
                        try
                        {
                            if (targetPropInfo.CanWrite && (targetValue == null && sourceValue != null || targetValue != null && !targetValue.Equals(sourceValue)))
                            {
                                targetPropInfo.SetValue(target, sourceValue, null);
                                modified = true;
                            }
                        }
                        catch
                        {
                            // ... error processing property (possible custom-code errors), just skip it ...
                        }
                    }
                }
            }

            // ... merge fields that are different ...

            FieldInfo[] fields = source.GetType().GetTypeInfo().GetFields();
            FieldInfo targetFieldInfo = null;
            foreach (FieldInfo info in fields)
            {
                targetFieldInfo = target.GetType().GetTypeInfo().GetField(info.Name);
                if (targetFieldInfo == null) continue;

                _path = (path.Length == 0 ? info.Name : path + "." + info.Name);
                if (pathsToSkip.Contains(_path))
                    continue;

                if (info.FieldType.GetTypeInfo().IsClass && targetFieldInfo.FieldType.GetTypeInfo().IsClass)
                    _MergeData(targetFieldInfo.GetValue(target), info.GetValue(source), pathsToSkip, ref _path, ref modified, referenceLevels);
                else
                    if (!targetFieldInfo.IsInitOnly && !targetFieldInfo.IsLiteral &&
                        targetFieldInfo.GetValue(target) != info.GetValue(source))
                {
                    targetFieldInfo.SetValue(target, info.GetValue(source));
                    modified = true;
                }
            }

            // ... remove the reference added in this call (should be the last one) ...

            referenceLevels.RemoveAt(referenceLevels.Count - 1);
        }

        /// <summary>
        /// Merges the source values (all public fields and properties) into the target.
        /// Encapsulated class objects are also traversed.
        /// Any source fields and properties not found in the target are skipped.
        /// Returns true if any values were copied.
        /// </summary>
        /// <param name="target">Object to update.</param>
        /// <param name="source">Source of changed values.</param>
        /// <param name="pathsToSkip">Reference paths to skip (e.g. "Parent", "Child.SubChild.Prop", etc.). "Parent" is assumed if null is passed.</param>
        public static bool MergeData(object target, object source, string[] pathsToSkip)
        {
            if (target == null)
                throw new Exception("MergeData(): 'target' cannot be null.");
            if (source == null)
                throw new Exception("MergeData(): 'source' cannot be null.");
            if (pathsToSkip == null)
                pathsToSkip = new string[] { "Parent", "parent", "_parent" };

            string path = "";
            bool modified = false;

            IList<object> _referenceLevels = new List<object>(100); // (should be no more than 100 levels, but this list can grow just in case)

            _MergeData(target, source, pathsToSkip, ref path, ref modified, _referenceLevels);

            return modified;
        }
        public static bool MergeData(object target, object source)
        { return MergeData(target, source, null); }
    }

    // =========================================================================================================================
}
