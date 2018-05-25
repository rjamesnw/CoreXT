// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        // ========================================================================================================================
        /** Web storage utilities. */
        var Storage;
        (function (Storage) {
            CoreXT.registerNamespace("CoreXT", "System", "Storage");
            // ------------------------------------------------------------------------------------------------------------------
            // Feature Detection 
            function _storageAvailable(storageType) {
                try {
                    var storage = window[storageType], x = '$__storage_test__$';
                    storage.setItem(x, x);
                    storage.removeItem(x);
                    return true;
                }
                catch (e) {
                    return false;
                }
            }
            /** Set to true if local storage is available. */
            Storage.hasLocalStorage = _storageAvailable("localStorage");
            /** Set to true if session storage is available. */
            Storage.hasSessionStorage = _storageAvailable("sessionStorage");
            // ------------------------------------------------------------------------------------------------------------------
            var StorageType;
            (function (StorageType) {
                /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
                StorageType[StorageType["Local"] = 0] = "Local";
                /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
                StorageType[StorageType["Session"] = 1] = "Session";
            })(StorageType = Storage.StorageType || (Storage.StorageType = {}));
            function getStorage(type) {
                switch (type) {
                    case StorageType.Local:
                        if (!Storage.hasLocalStorage)
                            throw "Local storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                        return localStorage;
                    case StorageType.Session:
                        if (!Storage.hasSessionStorage)
                            throw "Session storage is either not supported, or disabled. Note that local storage is sometimes disabled in mobile browsers while in 'private' mode, or in IE when loading files directly from the file system.";
                        return sessionStorage;
                }
                throw "Invalid web storage type value: '" + type + "'";
            }
            Storage.getStorage = getStorage;
            // ------------------------------------------------------------------------------------------------------------------
            /** The delimiter used to separate key name parts and data values in storage. This should be a Unicode character that is usually never used in most cases. */
            Storage.delimiter = "\uFFFC";
            Storage.storagePrefix = "fs";
            function makeKeyName(appName, dataName) {
                if (!dataName)
                    throw "An data name is required.";
                if (dataName == Storage.delimiter)
                    dataName = ""; // (this is a work-around used to get the prefix part only [fs+delimiter or fs+delimiter+appName]])
                return Storage.storagePrefix + Storage.delimiter + (appName || "") + (dataName ? Storage.delimiter + dataName : "");
            }
            Storage.makeKeyName = makeKeyName;
            /** Set a value for the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
            * If 'appVersion' and/or 'dataVersion' is given, the versions are stored with the data.  If the versions don't match
            * when retrieving the data, then 'null' is returned.
            * Warning: If the storage is full, then 'false' is returned.
            * @param {StorageType} type The type of storage to use.
            * @param {string} name The name of the item to store.
            * @param {string} value The value of the item to store. If this is undefined (void 0) then any existing value is removed instead.
            * @param {string} appName An optional application name to provision the data storage under.
            * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
            * version is different from the stored data, the data is reloaded.
            * Note: This is NOT the data version, but the version of the application itself.
            * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
            * the stored data, the data is reloaded.
            */
            function set(type, name, value, appName, appVersion, dataVersion) {
                try {
                    var store = getStorage(type);
                    name = makeKeyName(appName, name);
                    if (value !== void 0)
                        localStorage.setItem(name, ("" + (appVersion || "")) + "\uFFFC" + ("" + (dataVersion || "")) + "\uFFFC" + value);
                    else
                        localStorage.removeItem(name);
                    // (note: IE8 has a bug that doesn't allow chars under 0x20 (space): http://caniuse.com/#search=web%20storage)
                    return true;
                }
                catch (ex) {
                    return false; // (storage is full, or not available for some reason)
                }
            }
            Storage.set = set;
            /** Get a value from the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
              * If 'appVersion' and/or 'dataVersion' is given, the versions are checked against the data.  If the versions don't
              * match, then 'null' is returned.
              * @param {StorageType} type The type of storage to use.
              * @param {string} name The name of the item to store.
              * @param {string} value The value of the item to store.
              * @param {string} appName An optional application name to provision the data storage under.
              * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
              * version is different from the stored data, the data is reloaded.
              * Note: This is NOT the data version, but the version of the application itself.
              * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
              * the stored data, the data is reloaded.
              */
            function get(type, name, appName, appVersion, dataVersion) {
                var store = getStorage(type);
                var itemKey = makeKeyName(appName, name);
                var value = localStorage.getItem(itemKey);
                if (value === null)
                    return null;
                if (value === "")
                    return value;
                var i1 = value.indexOf("\uFFFC");
                var i2 = value.indexOf("\uFFFC", i1 + 1);
                if (i1 >= 0 && i2 >= 0) {
                    var _appVer = value.substring(0, i1);
                    var _datVer = value.substring(i1 + 1, i2);
                    value = value.substring(i2 + 1);
                    if ((appVersion === void 0 || appVersion === null || appVersion == _appVer) && (dataVersion === void 0 || dataVersion === null || dataVersion == _datVer))
                        return value;
                    else
                        return null; // (version mismatch)
                }
                else {
                    localStorage.removeItem(itemKey); // (remove the invalid entry)
                    return null; // (version read error [this should ALWAYS exist [even if empty], otherwise the data is not correctly stored])
                }
            }
            Storage.get = get;
            // ------------------------------------------------------------------------------------------------------------------
            /** Clear all FlowScript data from the specified storage (except save project data). */
            function clear(type) {
                var store = getStorage(type);
                var sysprefix = makeKeyName(null, Storage.delimiter); // (get just the system storage prefix part)
                for (var i = store.length - 1; i >= 0; --i) {
                    var key = store.key(i);
                    if (key.substring(0, sysprefix.length) == sysprefix) // (note: saved project data starts with "fs-<project_name>:")
                        store.removeItem(key);
                }
            }
            Storage.clear = clear;
            // ------------------------------------------------------------------------------------------------------------------
            // Cleanup web storage each time if debugging.
            if (CoreXT.isDebugging() && Storage.hasLocalStorage)
                clear(StorageType.Local);
            // ------------------------------------------------------------------------------------------------------------------
        })(Storage = System.Storage || (System.Storage = {}));
        // =======================================================================================================================
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Storage.js.map