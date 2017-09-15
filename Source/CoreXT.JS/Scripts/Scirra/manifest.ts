/// <reference path="../manifest.ts" />

// #######################################################################################

namespace CoreXT.Scripts.Modules {
    /**
    * Modules for Scirra's Construct 2 HTML5/JS game development platform (http://scirra.com).
    */
    export module Scirra {

        // ===================================================================================

        /**
        * CoreXT support for creating games using Scirra's "Construct 2" HTML5 game engine development platform (see scirra.com for the IDE).
        * Note: You'll need the CoreXT plugin for Construct 2 for this to work (it's included with CoreXT files, and named 'CoreXT_Construct2_Plugin.js').
        * Note: As with most CoreXT graph objects, the objects are "logical" elements, and thus, a visual layout environment (eg. browser) is not required.
        */
        export var Construct2 = module([System.UI_HTML], 'Scirra.Construct2{min:.min}');

        // ===================================================================================
    }
}

// #######################################################################################
