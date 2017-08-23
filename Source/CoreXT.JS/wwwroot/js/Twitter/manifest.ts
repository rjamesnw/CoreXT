/// <reference path="../manifest.ts" />
/// <reference path="corext.system.platform.ui.bootstrap.ts" />
/// <reference path="../jquery/manifest.ts" />

// #######################################################################################

namespace CoreXT.Scripts.Modules {
    /** Twitter related plugins. */
    export module Twitter {

        // ===================================================================================

        /** The Twitter Bootstrap JS module (the Bootstrap script file only, nothing more). 
        */
        export var Bootstrap = module([JQuery], 'bootstrap{min:.min}', '~js/').then((modInfo) => {
            return true;
        });

        // ===================================================================================

        /** CoreXT support for Twitter's Bootstrap based UI design.  This module extends the CoreXT GraphItem to implement the Bootstrap module.
        * Note: As with most CoreXT graph objects, the objects are "logical" elements, and thus, a visual layout environment (eg. browser) is not required.
        */
        export var Bootstrap_UI = module([System.UI_HTML], 'CoreXT.System.Platform.UI.Bootstrap{min:.min}').ready((modInfo) => {
            Browser.onReady.attach(() => {
                using.Twitter.Bootstrap(null);
            });
            return true;
        }); // (some functionality of the bootstrap UI uses jquery)
        // (note: this is only dependent on the CSS, and has no actual script related dependencies; also note: bootstrap.js must always be loaded LAST [after the app] for event hook-up.)

        // ===================================================================================
    }
}

// #######################################################################################
