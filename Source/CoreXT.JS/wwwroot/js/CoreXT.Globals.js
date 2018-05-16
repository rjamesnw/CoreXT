var CoreXT;
(function (CoreXT) {
    var Globals;
    (function (Globals) {
        CoreXT.registerNamespace("CoreXT", "Globals");
        var _globals = CoreXT.Globals;
        var _namespaces = {};
        var _nsCount = 1;
        function register(namespace, name, initialValue, asHostGlobal) {
            if (asHostGlobal === void 0) { asHostGlobal = false; }
            var nsID, nsglobals, alreadyRegistered = false;
            if (typeof namespace == 'object' && namespace.url)
                namespace = namespace.url;
            if (!(namespace in _namespaces))
                _namespaces[namespace] = nsID = '_' + _nsCount++;
            else {
                nsID = _namespaces[namespace];
                alreadyRegistered = true;
            }
            nsglobals = _globals[nsID];
            if (!nsglobals)
                _globals[nsID] = nsglobals = {};
            if (asHostGlobal) {
                var hostGlobalName = "_" + CoreXT.ROOT_NAMESPACE + nsID + "_" + name;
                if (!alreadyRegistered) {
                    nsglobals[name] = { "global": CoreXT.global, "hostGlobalName": hostGlobalName };
                    CoreXT.global[hostGlobalName] = initialValue;
                }
                return hostGlobalName;
            }
            else {
                if (!alreadyRegistered)
                    nsglobals[name] = initialValue;
                if (/^[A-Z_\$]+[A-Z0-9_\$]*$/gim.test(name))
                    return CoreXT.ROOT_NAMESPACE + ".Globals." + nsID + "." + name;
                else
                    return CoreXT.ROOT_NAMESPACE + ".Globals." + nsID + "['" + name.replace(/'/g, "\\'") + "']";
            }
        }
        Globals.register = register;
        ;
        function exists(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            return name in nsglobals;
        }
        Globals.exists = exists;
        ;
        function erase(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return false;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == CoreXT.global) {
                var hgname = existingValue["hostGlobalName"];
                delete CoreXT.global[hgname];
            }
            return nsglobals[name] === void 0;
        }
        Globals.erase = erase;
        ;
        function clear(namespace) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                return false;
            nsglobals = _globals[nsID];
            for (var name in nsglobals) {
                var existingValue = nsglobals[name];
                if (existingValue && existingValue["global"] == CoreXT.global)
                    delete CoreXT.global[existingValue["hostGlobalName"]];
            }
            _globals[nsID] = {};
            return true;
        }
        Globals.clear = clear;
        ;
        function setValue(namespace, name, value) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID) {
                register(namespace, name, value);
                nsID = _namespaces[namespace];
            }
            nsglobals = _globals[nsID];
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == CoreXT.global) {
                return CoreXT.global[existingValue["hostGlobalName"]] = value;
            }
            else
                return nsglobals[name] = value;
        }
        Globals.setValue = setValue;
        ;
        function getValue(namespace, name) {
            var namespace = namespace.url || ('' + namespace), nsID, nsglobals;
            nsID = _namespaces[namespace];
            if (!nsID)
                throw CoreXT.System.Exception.from("The namespace '" + namespace + "' does not exist - did you remember to call 'CoreXT.Globals.register()' first?", namespace);
            nsglobals = _globals[nsID];
            if (!(name in nsglobals))
                return void 0;
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == CoreXT.global) {
                return CoreXT.global[existingValue["hostGlobalName"]];
            }
            else
                return nsglobals[name];
        }
        Globals.getValue = getValue;
        ;
    })(Globals = CoreXT.Globals || (CoreXT.Globals = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.Globals.js.map