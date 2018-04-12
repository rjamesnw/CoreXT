/// <reference path="../../manifest.ts" />

// #######################################################################################

namespace CoreXT.Scripts.Modules {
    /**
     * Google related modules.
     */
    export namespace Google {

        // ===================================================================================

        var gmapsCallbackStr = manifest.registerGlobal("onGMapsReady", null);

        /**References the Google Maps API.
          */
        export var Maps = module([], 'google.maps', "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=" + gmapsCallbackStr)
            .then((mod: IModule) => {
                manifest.setGlobalValue("onGMapsReady", () => {
                    mod.continue(); // (dependent script now loaded and initialized, so continue calling the rest of the promise handlers ...)
                });
                return mod;
            }).ready((res) => { res.pause(); }); // (this is the FIRST 'onready' handler in the list, so it is always called first, and will pause all following handlers)

        // ===================================================================================
    }
}

// #######################################################################################
