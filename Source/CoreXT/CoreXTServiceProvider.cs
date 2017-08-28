using System;
using System.Linq;
using System.Reflection;

namespace CoreXT.Services.DI
{
    /// <summary>
    /// Represents a simple generic service provider for the CoreXT platform to support dependency injection.
    /// This allows plugging the CoreXT system into any other DI based environment.
    /// </summary>
    public interface ICoreXTServiceProvider
    {
        /// <summary>
        /// Attempts to create an instance of an implementation type based on the given service type using the underlying service provider.
        /// If no service provider is given (null), or no valid instance could be created from the underlying service provider,
        /// the method will attempt to create a new default instance from the given service type name. If the type is a class type, a default
        /// constructor is expected. If the type is an interface type named using the typical naming convention, using 'I' as the prefix (as
        /// in 'ISomeType'), the 'I' is dropped, and an instance is created for the first matching type in the same assembly.
        /// </summary>
        /// <typeparam name="TService">The service type to create an implementation instance for.</typeparam>
        /// <returns>The requested service instance.</returns>
        TService GetService<TService>() where TService : class;
    }

    /// <summary>
    /// Represents a simple generic service provider for the CoreXT platform to support dependency injection.
    /// This implementation allows falling back to creating objects base on interface names where no DI service provider is available.
    /// </summary>
    public class CoreXTServiceProvider : ICoreXTServiceProvider
    {
        IServiceProvider _ServiceProvider;

        /// <summary>
        /// This constructor is assumed to be called within the dependency injection environment of .Net Core to obtain the service
        /// provider for the host application. 'GetService()' on 'System.IServiceProvider' is called first, then if null is returned,
        /// the method attempts to resolve the type based on the given 'TService' type name.
        /// </summary>
        public CoreXTServiceProvider(IServiceProvider sp)
        {
            _ServiceProvider = sp;
        }

        public CoreXTServiceProvider() { }

        /// <summary>
        /// Get a service object.  If no 'IServiceProvider' was supplied when the 'CoreXTServiceProvider' was constructed,
        /// this method will attempt to determine the implementation type from the service type, then return an
        /// instance of the implementation type as long as a default constructor exists (without an 'IServiceProvider' instance,
        /// only default constructors can be supported in such cases [at this time]).
        /// </summary>
        /// <typeparam name="TService">The service type (usually an interface type).</typeparam>
        public TService GetService<TService>() where TService : class
        {
            var instance = (TService)_ServiceProvider?.GetService(typeof(TService));
            if (instance != null) return instance;

            var serviceType = typeof(TService);
            var typeInfo = serviceType.GetTypeInfo();
            var classType = serviceType;

            try
            {
                if (typeInfo.IsInterface)
                {
                    // ... try to get a type name from the interface name ...
                    var name = typeInfo.Name;
                    if (name.Length == 1 || name.ToUpper()[0] != 'I')
                        throw new InvalidOperationException("Cannot create default instance from interface type '" + name + "' - unable to determine any similarly named type.");
                    name = name.Substring(1);
                    classType = typeInfo.Assembly.GetTypes().Where(a => a.Name == name).FirstOrDefault();
                    if (classType == null)
                        throw new InvalidOperationException("Cannot create default instance from interface type '" + serviceType.Name + "' - could not find any type matching implementation type name '" + name + "'.");
                    typeInfo = classType.GetTypeInfo();
                }

                if (typeInfo.IsClass)
                {
                    if (typeInfo.ContainsGenericParameters)
                        throw new InvalidOperationException("Cannot create default instance of type '" + classType.Name + "' - generic type parameters required.");
                    var ctor = classType.GetConstructor(Type.EmptyTypes);
                    if (ctor == null)
                        throw new InvalidOperationException("Cannot create default instance of type '" + classType.Name + "' - no default constructor exists.");
                    try
                    {
                        return (TService)Activator.CreateInstance(serviceType);
                    }
                    catch (Exception ex)
                    {
                        throw new TargetInvocationException("Failed to created an instance of type '" + classType.Name + "'.", ex);
                    }
                }
                else
                    throw new InvalidOperationException("Cannot create default instance of non-class type '" + typeInfo.Name + "'.");
            }
            catch (Exception ex)
            {
                if (_ServiceProvider != null)
                    throw new InvalidOperationException("The service type '" + typeInfo.Name + "' could not be resolved on the 'System.IServiceProvider' instance, nor found in the related assembly.", ex);
                else
                    throw new InvalidOperationException("A 'System.IServiceProvider' instance was not supplied, and the type '" + typeInfo.Name + "' could not be resolved in the related assembly.", ex);
            }
            // TODO: Consider injecting from types within the current assembly as a pseudo DI container.
        }
    }
}