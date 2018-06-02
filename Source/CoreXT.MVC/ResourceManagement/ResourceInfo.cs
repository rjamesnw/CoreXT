using CoreXT.ASPNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;

namespace CoreXT.MVC.ResourceManagement
{
    // ########################################################################################################################

    public enum RenderModes
    {
        /// <summary>
        /// The component will be rendered for display only (using display templates).
        /// </summary>
        Display,

        /// <summary>
        /// The component will be rendered for editing (using editor templates).
        /// </summary>
        Edit
    }

    /// <summary>
    /// Tells CoreXT where to render a resource.
    /// </summary>
    public enum RenderTargets
    {
        /// <summary>
        /// This resource must be loaded into the header of the page.
        /// </summary>
        Header,
        /// <summary>
        /// This resource must be loaded into the footer of the page.
        /// </summary>
        Footer,
        /// <summary>
        /// This resource is loaded on demand. It will not be available until dynamic loading completes.
        /// </summary>
        Dynamic
    }

    /// <summary>
    /// Support resource types to render.
    /// </summary>
    public enum ResourceTypes
    {
        /// <summary>
        /// The resource URI returns a script (usually JavaScript).
        /// </summary>
        Script,
        /// <summary>
        /// The resource URI returns CSS.
        /// </summary>
        CSS
    }

    // ########################################################################################################################

    /// <summary>
    /// Holds resource details for deferred rendering, such as JavaScript or CSS.
    /// </summary>
    public class ResourceInfo : IHtmlContent
    {
        // -------------------------------------------------------------------------------------------------------------------

        public static string DefaultEnvironmentName = nameof(Environments.Development);

        // -------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The environment name where this resource should be rendered.
        /// Note that if set, this explicit value takes precedence over the 'Environment' enum value.
        /// </summary>
        public string EnvironmentName;

        /// <summary>
        /// One or more environments where this resource should be rendered.
        /// Note that any explicitly non-null or non-empty name in 'EnvironmentName' will take precedence.
        /// </summary>
        public Environments Environment;

        /// <summary>
        /// Returns either the name, content file name, or path, of this resource. 
        /// </summary>
        public string ID
        {
            get
            {
                if (_ID != null)
                    return _ID;
                else
                {
                    var filename = System.IO.Path.GetFileName((Path ?? string.Empty));
                    if (!string.IsNullOrWhiteSpace(filename))
                        return filename;
                    else
                        return Path;
                }
            }
            set
            {
                _ID = (value ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(_ID))
                    _ID = null;
            }
        }
        string _ID;

        /// <summary>
        /// If provided, this will help the system determine if a resource is already loaded.
        /// If not set, or empty, by default the resource file name (if available), or the full URI, is assumed.
        /// </summary>
        public string Name
        {
            get
            {
                return _Name;
            }
            set
            {
                _Name = (value ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(_Name))
                    _Name = null;
            }
        }
        string _Name;


        /// <summary>
        /// A version number array, from major to minor. Higher versions are given priority.
        /// </summary>
        public int[] Version;

        /// <summary>
        /// The resource URI.
        /// </summary>
        public string Path;

        /// <summary>
        /// The resource URI to fall back to if the primary resource cannot be loaded.
        /// </summary>
        public string FallbackPath;

        /// <summary>
        /// If set, will be used to test for an existing class for CSS loading failures in order to load the fall-back URI.
        /// </summary>
        public string FallbackTestClass;
        /// <summary>
        /// If set, will be used with 'FallbackTestPropertyValue' to test if a CSS property was set in order to load the fall-back URI.
        /// </summary>
        public string FallbackTestProperty;
        /// <summary>
        /// If set, will be used with 'FallbackTestProperty' to test if a CSS property was set in order to load the fall-back URI.
        /// </summary>
        public string FallbackTestPropertyValue;

        /// <summary>
        /// If set, will be used to test for script loading failures in order to load a fall-back script URI.
        /// The value is simply an expression that should evaluate to true or false, such as "window.jQuery && window.jQuery.fn".
        /// </summary>
        public string FallbackTestExpression;


        /// <summary>
        /// If not null, this is output along with the resource URI to ensure the browser does not load the resource from the cache ("cache busting").
        /// <para>To always prevent caching (perhaps for debug purposes), this could be set with a new GUID or DateTime string for
        /// each request (in fact this is the default behavior).  If an empty string value is set, the version will attempt to be
        /// created from either the modified date of a matching file, or a random GUID value (if no file is found).</para>
        /// </summary>
        public string ContentVersion;

        /// <summary>
        /// The resource type, which determines the types of elements to create.
        /// </summary>
        public ResourceTypes Type;

        /// <summary>
        /// The page target for the resource.
        /// </summary>
        public RenderTargets RenderTarget;

        /// <summary>
        /// If true, outputs debug information as comments during rendering, otherwise nothing is output.
        /// </summary>
        public bool Debug;

        /// <summary>
        /// Resources are sorted by this sequence value. The sort is in descending order as the layout page is usually last to render, but first in the stack,
        /// and inner partial views are rendered first (this keeps scripts grouped in order added, and by view).
        /// </summary>
        /// <remarks>When a script is added via the 'CoreXT' view helper, the view's 'NestedLevel' property is used to group the scripts by the nested level of the view.</remarks>
        public int Sequence;

        // -------------------------------------------------------------------------------------------------------------------

        public ResourceInfo(string filePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence = 0, string environmentName = null, bool debug = false)
        {
            EnvironmentName = environmentName;
            Path = filePath;
            Type = resourceType;
            RenderTarget = renderTarget;
            Sequence = sequence;
            Debug = debug;
        }

        public ResourceInfo(string filePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment, bool debug = false)
        {
            Environment = environment;
            Path = filePath;
            Type = resourceType;
            RenderTarget = renderTarget;
            Sequence = sequence;
            Debug = debug;
        }

        // -------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if this resource is for the environment name based on the given hosting environment settings.
        /// </summary>
        /// <param name="hostingEnvironment">This is usually obtain from the service provider by getting the 'IHostingEnvironment' service object.</param>
        public bool IsForThisEnvironment(IHostingEnvironment hostingEnvironment)
        {
            if (!string.IsNullOrWhiteSpace(EnvironmentName))
                return hostingEnvironment.IsEnvironment(EnvironmentName ?? DefaultEnvironmentName, true) || hostingEnvironment.IsEnvironment(Environment);
            else
                return hostingEnvironment.IsEnvironment(Environment);
        }

        // -------------------------------------------------------------------------------------------------------------------

        public void WriteTo(TextWriter writer, HtmlEncoder encoder)
        {
            if (Debug)
                writer.Write("<!--(" + Type + ": " + Path + " » " + RenderTarget + ")-->" + System.Environment.NewLine);
        }

        // -------------------------------------------------------------------------------------------------------------------

        public void CopyFrom(ResourceInfo resourceInfo)
        {
            foreach (var prop in resourceInfo.GetType().GetTypeInfo().GetProperties(BindingFlags.Public | BindingFlags.Instance))
                if (prop.Name != "ID") // (reading from ID will not be valid)
                    prop.SetValue(this, prop.GetValue(resourceInfo));

            foreach (var field in resourceInfo.GetType().GetTypeInfo().GetFields(BindingFlags.Instance))
                field.SetValue(this, field.GetValue(resourceInfo));

            _ID = resourceInfo._ID;

            // ... make sure references are not shared ...

            if (Version != null)
                Version = Version.ToArray();
        }

        // -------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the version for this resource.  If the 'Version' property is null, then an empty string is returned.  If 'Version'
        /// is not empty or whitespace, then 'Version' is returned.  If 'Version' is not null, but empty or whitespace, then
        /// the content file modified date will be used, or a random GUID value if no physical file exists.
        /// </summary>
        /// <param name="urlHelper"></param>
        /// <param name="resourcePath"></param>
        /// <returns></returns>
        public string GetVersion(IUrlHelper urlHelper, string resourcePath)
        {
            if (ContentVersion == null) return string.Empty;
            if (!string.IsNullOrWhiteSpace(ContentVersion))
                return ContentVersion;

            // ... we need to determine a version from the file modified date/time ...

            var filepath = urlHelper.MapPath(resourcePath);

            if (!string.IsNullOrWhiteSpace(filepath))
                try
                {
                    var fi = new FileInfo(filepath.ToString());
                    if (fi.Exists)
                        return fi.LastWriteTimeUtc.Ticks.ToString();
                }
                catch { }

            return Guid.NewGuid().ToString("N");
        }

        public string _AddURIVersion(IUrlHelper urlHelper, string uri)
        {
            if (ContentVersion == null || string.IsNullOrWhiteSpace(uri)) return uri;
            uri = uri.TrimEnd('?', '&');
            var delimiter = uri.Contains("?") ? "&" : "?";
            return Strings.Append(uri, "_v_=" + GetVersion(urlHelper, uri), delimiter);
        }

        /// <summary>
        /// Gets the absolute URI for this resource.
        /// This method takes into account the 'Version' value.
        /// </summary>
        public string GetURI(IUrlHelper urlHelper)
        {
            return urlHelper.Content(_AddURIVersion(urlHelper, Path));
        }

        /// <summary>
        /// Gets the fall-back URI string for this resource.
        /// This method takes into account the 'Version' value.
        /// </summary>
        public string GetFallbackURI(IUrlHelper urlHelper)
        {
            return urlHelper.Content(_AddURIVersion(urlHelper, FallbackPath));
        }

        // -------------------------------------------------------------------------------------------------------------------

        public ResourceInfo SetTarget(RenderTargets target)
        {
            RenderTarget = target;
            return this;
        }

        /// <summary>
        /// Sets the environment where this resource should be rendered.
        /// </summary>
        public ResourceInfo SetEnvironment(string environmentName)
        {
            EnvironmentName = environmentName;
            return this;
        }

        /// <summary>
        /// Sets the environment where this resource should be rendered.
        /// </summary>
        public ResourceInfo SetEnvironment(Environments environment)
        {
            //if ((environment & (environment - 1)) != 0)
            //    throw new InvalidDataException("Because the hosting environment uses string names, you cannot set multiple names using multiple flags.");
            Environment = environment;
            return this;
        }

        /// <summary>
        /// Allows setting a fall-back URI if the underlying CSS URI for this resource fails to load (for example, if a CDN is down).
        /// </summary>
        /// <param name="resourceFallbackPath"></param>
        /// <param name="testClass"></param>
        /// <param name="testProperty"></param>
        /// <param name="testPropertyValue"></param>
        /// <returns></returns>
        public ResourceInfo SetCSSFallback(string resourceFallbackPath, string testClass, string testProperty = null, string testPropertyValue = null)
        {
            if (Type != ResourceTypes.CSS)
                throw new InvalidOperationException("You can only set a CSS fall-back URI on CSS resource."
                    + System.Environment.NewLine + "  Current Path: " + Path + " (" + Type.GetName() + ")"
                    + System.Environment.NewLine + "  Fall-back Path: " + resourceFallbackPath);

            if (string.IsNullOrWhiteSpace(testClass) || string.IsNullOrWhiteSpace(testProperty) || string.IsNullOrWhiteSpace(testPropertyValue))
                throw new InvalidOperationException("A test CSS class name, property name, and expected property value is required in order to complete a valid test.");

            FallbackPath = string.IsNullOrWhiteSpace(resourceFallbackPath) ? null : resourceFallbackPath; // (must not be null or empty when setting this, otherwise null cancels it)

            FallbackTestClass = testClass;
            FallbackTestProperty = testProperty;
            FallbackTestPropertyValue = testPropertyValue;

            return this;
        }

        /// <summary>
        /// Allows setting a fall-back URI if the underlying resource URI fails to load (for example, if a CDN is down).
        /// </summary>
        /// <param name="resourceFallbackPath">A new resource URI.</param>
        /// <param name="testExpression">A JS expression to use for testing that this resource has loaded.</param>
        /// <returns></returns>
        public ResourceInfo SetFallback(string resourceFallbackPath, string testExpression)
        {
            FallbackPath = resourceFallbackPath;
            FallbackTestExpression = testExpression;
            return this;
        }

        /// <summary>
        /// Sets version for the resource URI to prevent browser caching (aka "cache busting").
        /// If a version is present, it is output along with the resource URI to ensure the browser does not load the resource from the cache.
        /// When this method is called without passing a parameter (i.e. if 'version' is null), a value representing the current file modified
        /// date/time is assumed by default.
        /// <para>To always prevent caching (perhaps for debug purposes), this could be set with a new GUID or DateTime string for each request.</para>
        /// </summary>
        public ResourceInfo AppendVersion(string contentVersion = null)
        {
            ContentVersion = contentVersion ?? string.Empty;
            return this;
        }

        // -------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A version number array, from major to minor. Higher versions are given priority. Example: Version(1,0,3)
        /// </summary>
        public ResourceInfo SetVersion(params int[] versionDigits)
        {
            Version = versionDigits.Length > 0 ? versionDigits : null;
            return this;
        }

        /// <summary>
        /// A version number array, from major to minor. Higher versions are given priority. Example: Version("1.0.3")
        /// </summary>
        public ResourceInfo SetVersion(string version)
        {
            return SetVersion(ParseVersion(version));
        }


        public static int[] ParseVersion(string version)
        {
            return (version ?? "")
                .Split('.')
                .Select(c => Utilities.IsInt(c) ? Convert.ToInt32(c) : 0)
                .ToArray();
        }

        // -------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Compares this resource's version with another resource and returns -1 if this resource is less, 0 if equal,
        /// or 1 if greater than the given resource. If the version arrays are not the same length, 0 is assume for any missing digits.
        /// </summary>
        public int CompareVersions(ResourceInfo otherResourceInfo)
        {
            if ((Version == null || Version.Length == 0) && otherResourceInfo.Version != null) return -1;
            if (Version != null && (otherResourceInfo.Version == null || otherResourceInfo.Version.Length == 0)) return 1;
            var v1 = Version;
            var v2 = otherResourceInfo.Version;
            if (v1.Length < v2.Length)
            {
                // ... swap to get the larger one first ...
                v1 = otherResourceInfo.Version;
                v2 = Version;
            }
            for (var i = 0; i < v1.Length; ++i)
            {
                var value1 = v1[i]; // (always largest array, so no need to check)
                var value2 = i < v2.Length ? v2[i] : 0;
                if (value1 > value2) return 1;
                if (value1 < value2) return -1;
            }
            return 0; // (equal)
        }

        string _StripMin(string s) { return s != null ? Regex.Replace(s, @"\.min\.", ".", RegexOptions.IgnoreCase) : null; }

        /// <summary>
        /// Returns true if there is a match between this resource and the given name or resource path.
        /// If the name or resource path contains the typical ".min." name part, it will be ignored to make comparisons more consistent.
        /// </summary>
        /// <param name="actionContext">If supplied, then 'MapPath() will be used to map the resource path to a
        /// file path in order to have a more accurate match.</param>
        public bool Equals(string name, string resourcePath, ActionContext actionContext = null)
        {
            var thisName = _StripMin(string.IsNullOrWhiteSpace(_Name) ? null : _Name.Trim());
            name = _StripMin(string.IsNullOrWhiteSpace(name) ? null : name.Trim());

            if (thisName != null && name != null && string.Compare(thisName, name, true) == 0) return true; // (explicit name match)

            // ... both do not have names, or do not match, so fall back to trying the paths ...
            // ... find the file location so we can validate based on the actual location of the file, and not a virtual path ...
            // (use MapPath() is available [should be more consistent this way])

            string thisPath;

            if (actionContext != null)
            {
                var mappedPath = actionContext.MapPath(Path);
                if (string.IsNullOrWhiteSpace(mappedPath))
                    thisPath = Path;
                else
                    thisPath = mappedPath;

                mappedPath = actionContext.MapPath(resourcePath);
                if (!string.IsNullOrWhiteSpace(mappedPath))
                    resourcePath = mappedPath;
            }
            else thisPath = Path;

            thisPath = _StripMin(thisPath);
            resourcePath = _StripMin(resourcePath);

            if (thisName == null && name == null && string.IsNullOrWhiteSpace(thisPath) && string.IsNullOrWhiteSpace(resourcePath))
                return true; // (empty resources will compare as equal)

            // ... if either doesn't have a name, try full paths and content names ...

            if (string.Compare(thisPath, resourcePath, true) == 0) return true; // (paths match)

            // ... paths don't match, but it is possible the same file is loaded from two different locations (it is rare to have the same content name loaded more than once!) ...

            var contentName1 = _StripMin(System.IO.Path.GetFileName(thisPath));
            var contentName2 = _StripMin(System.IO.Path.GetFileName(resourcePath));

            if (string.Compare(contentName1, contentName2, true) == 0) return true; // (content file names are the same)
            if (thisName != null && string.Compare(contentName2, thisName, true) == 0) return true; // ('robj' content file name equals this given name)
            if (name != null && string.Compare(contentName1, name, true) == 0) return true; // (this content file name equals the 'robj' given name)

            return false; // (nothing matches)
        }

        /// <summary>
        /// Returns true if the given resource object is a ResouseInfo object, and has the same name, content file name, or path,
        /// as this resource object.
        /// </summary>
        public override bool Equals(object obj)
        {
            return Equals(obj as ResourceInfo);
        }

        /// <summary>
        /// Returns true if the given resource object has the same name, content file name, or path,
        /// as this resource object.
        /// </summary>
        public bool Equals(ResourceInfo obj, ActionContext actionContext = null)
        {
            if ((object)obj == null) return false;
            return Equals(obj._Name, obj.Path, actionContext);
        }

        public static bool operator ==(ResourceInfo a, ResourceInfo b)
        {
            return (object)a == null && (object)b == null || (a?.Equals(b) ?? false);
        }

        public static bool operator !=(ResourceInfo a, ResourceInfo b)
        {
            return !(a == b);
        }

        public override string ToString()
        {
            return (EnvironmentName ?? Environment.ToString()) + "; " + RenderTarget + "; " + ID;
        }

        public override int GetHashCode()
        {
            var id = ID;
            return id != null ? id.GetHashCode() : base.GetHashCode();
        }

        // -------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################
}

// (WebComponent is base on the ViewComponent concepts: https://www.youtube.com/watch?v=zxQBIfwqVoA)

// Special thanks to the original source that helped jump start the controls section:
// https://www.codeproject.com/Articles/32356/Custom-controls-in-ASP-NET-MVC
// The final code, however, is an almost complete rewrite specific to CoreXT purposes (rather than retyping the same typical code). The rewrite
// also focuses on using editor and display templates, rather than hard coding the control designs. This gives more better development flexibility.
