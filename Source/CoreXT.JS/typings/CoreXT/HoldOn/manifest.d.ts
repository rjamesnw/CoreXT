/// <reference path="../manifest.d.ts" />
declare namespace CoreXT.Scripts.Modules.IO {
    interface IHoldOn {
        open: (options: {
            message: string;
            theme?: string;
            content?: string;
            backgroundColor?: string;
            textColor?: string;
        }) => void;
        close: () => void;
    }
    /**
     * HoldOn.js is a useful plugin that allows you to block user interactions using an overlay over the page.
     * Source: https://sdkcarlos.github.io/sites/holdon.html
     */
    var HoldOn: IUsingModule;
}
