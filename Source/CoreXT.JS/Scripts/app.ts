﻿// / <reference path="_references.ts" />
// declare var application: CoreXT.System.Platform.UIApplication;

alert("Almost ready...");

CoreXT.DOM.onDOMLoaded.attach(() => {
    alert("DOM loaded!");
});