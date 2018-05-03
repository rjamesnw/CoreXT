var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Storage;
        (function (Storage) {
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
            Storage.hasLocalStorage = _storageAvailable("localStorage");
            Storage.hasSessionStorage = _storageAvailable("sessionStorage");
            var StorageType;
            (function (StorageType) {
                StorageType[StorageType["Local"] = 0] = "Local";
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
            Storage.delimiter = "\uFFFC";
            Storage.storagePrefix = "fs";
            function makeKeyName(appName, dataName) {
                if (!dataName)
                    throw "An data name is required.";
                if (dataName == Storage.delimiter)
                    dataName = "";
                return Storage.storagePrefix + Storage.delimiter + (appName || "") + (dataName ? Storage.delimiter + dataName : "");
            }
            Storage.makeKeyName = makeKeyName;
            function set(type, name, value, appName, appVersion, dataVersion) {
                try {
                    var store = getStorage(type);
                    name = makeKeyName(appName, name);
                    if (value !== void 0)
                        localStorage.setItem(name, ("" + (appVersion || "")) + "\uFFFC" + ("" + (dataVersion || "")) + "\uFFFC" + value);
                    else
                        localStorage.removeItem(name);
                    return true;
                }
                catch (ex) {
                    return false;
                }
            }
            Storage.set = set;
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
                        return null;
                }
                else {
                    localStorage.removeItem(itemKey);
                    return null;
                }
            }
            Storage.get = get;
            function clear(type) {
                var store = getStorage(type);
                var sysprefix = makeKeyName(null, Storage.delimiter);
                for (var i = store.length - 1; i >= 0; --i) {
                    var key = store.key(i);
                    if (key.substring(0, sysprefix.length) == sysprefix)
                        store.removeItem(key);
                }
            }
            Storage.clear = clear;
            if (System.Diagnostics.isDebugging() && Storage.hasLocalStorage)
                clear(StorageType.Local);
        })(Storage = System.Storage || (System.Storage = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Storage.js.map