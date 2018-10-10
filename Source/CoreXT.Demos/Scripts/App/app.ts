namespace CoreXT {
    onBeforeBootstrapHandlers = onBeforeBootstrapHandlers || [];

    export namespace Demos {
        function main() {
            alert("The DOM is now loaded!");
        }

        if (CoreXT.System.Browser.DOM.isDOMReady)
            alert("CoreXT system is loaded and ready!");
        else
            alert("CoreXT system is loaded and ready! Just waiting on the browser ...");

        CoreXT.System.Browser.DOM.onDOMLoaded.attach(main); // (all events fire immediately when the DOM is already loaded)
    }
};

// ===================================================================================================================
