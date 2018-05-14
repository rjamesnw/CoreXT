namespace CoreXT.Scripts.Modules {

    // ... define the components made available by this manifest ...

    export var App = module([System.UI_HTML], 'app{min:.min}');
    // (if your app depends on other JavaScript modules, be sure to register them above [in the correct order as needed])
    // Note: All dependencies here get loaded - even those you may never use.  Only specify dependencies that are common.  Others can be
    // loaded and applied as needed via the 'CoreXT.using.{Namespace}.{Module}(onready)...' semantic.
}

// =======================================================================================================================
// You must call the "using()" function when you want to use a module.  There are two modes to calling it:
// 1. With a callback to execute when the module is ready to be used.
// 2. Without a callback: If the module is already loaded, then the request is ignored; but if not, then an exception will be thrown.  Because no callback
//    was supplied, the system will assume the code following the "using()" call requires the specified modules.
//    One Exception:  Calling "using()" in a manifest file (like this one) assumes no code is immediately following, and thus, it is deemed acceptable
//                    to do so without causing the aforementioned error.
// (note: The "include()" function works similarly, except it is designed for loading unregistered script files 'on the fly'.)

CoreXT.System.Diagnostics.debug = CoreXT.System.Diagnostics.DebugModes.Debug_Run; // ('Debug_???' values cause the non-minified versions of scripts [where available] to be loaded)

// TIP: CoreXT supports "on demand" script loading via the "using()" function.  While the user performs some action, you simply pass the required module
//      reference to "using(...)", and a callback function to execute once the module is loaded. This is much more efficient than loading many scripts
//      on a page that many never get used (hence "on demand").
// =======================================================================================================================
