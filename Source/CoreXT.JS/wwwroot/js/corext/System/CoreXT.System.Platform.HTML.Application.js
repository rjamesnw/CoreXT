// ############################################################################################################################
// Types for event management.
// ############################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            var HTML;
            (function (HTML) {
                var Application;
                (function (Application) {
                    CoreXT.namespace(function () { return CoreXT.System.Platform.HTML.Application; });
                    // ========================================================================================================================
                    //export var HTMLApplication = ClassFactory(Application, UIApplication,
                    //    (base) => {
                    //        class HTMLApplication extends base {
                    //        }
                    //        return [HTMLApplication, HTMLApplication["ScriptResourceFactory"]];
                    //    },
                    //    "HTMLApplication"
                    //);
                    //export interface IHTMLApplication extends InstanceType<typeof HTMLApplication.$__type> { }
                    // ========================================================================================================================
                    /** An ApplicationElement object is the root object of the graph tree that relates one UIApplication instance. */
                    var ApplicationElement = /** @class */ (function (_super) {
                        __extends(ApplicationElement, _super);
                        function ApplicationElement() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        ApplicationElement['new'] = function (title, description, targetElement) {
                            if (targetElement === void 0) { targetElement = null; }
                            return null;
                        };
                        ApplicationElement.init = function (o, isnew, title, description, targetElement) {
                            if (targetElement === void 0) { targetElement = null; }
                        };
                        ApplicationElement.Title = Platform.GraphNode.registerProperty(ApplicationElement, "title", true);
                        ApplicationElement.Description = Platform.GraphNode.registerProperty(ApplicationElement, "description", true);
                        ApplicationElement.Version = Platform.GraphNode.registerProperty(ApplicationElement, "version", true);
                        return ApplicationElement;
                    }(CoreXT.FactoryBase(HTML.HTMLElement)));
                    Application.ApplicationElement = ApplicationElement;
                    (function (ApplicationElement) {
                        var $__type = /** @class */ (function (_super) {
                            __extends($__type, _super);
                            function $__type() {
                                // --------------------------------------------------------------------------------------------------------------------
                                var _this = _super !== null && _super.apply(this, arguments) || this;
                                /** A title for the application (required). */
                                _this.title = Platform.GraphNode.accessor(ApplicationElement.Title);
                                /** A short application description (optional). */
                                _this.description = Platform.GraphNode.accessor(ApplicationElement.Description);
                                /** The application version number (i.e. '#.#.#...') in string form. */
                                _this.version = Platform.GraphNode.accessor(ApplicationElement.Version);
                                /** Holds a list of data templates found in the parsed HTML page template.
                                * Templates are based on elements within the page which are marked by the 'data--template="someID"' attribute. These
                                * elements are stripped out and are not part of the resulting page.
                                */
                                _this.dataTemplates = {};
                                return _this;
                            }
                            $__type.prototype.getTargetElement = function () { return this._targetElement; };
                            // --------------------------------------------------------------------------------------------------------------------
                            /** This generates/updates the HTML elements required to display the application. */
                            $__type.prototype.updateLayout = function (recursive) {
                                if (recursive === void 0) { recursive = true; }
                                var log = CoreXT.isDebugging() ? System.Diagnostics.log(ApplicationElement, "Application is updating its layout ...").beginCapture() : null;
                                _super.prototype.updateLayout.call(this, recursive);
                                if (this.__element != null) {
                                    var node = this._targetElement.firstChild;
                                    if (node == null || !node['replaceNode'])
                                        this._targetElement.appendChild(this.__element);
                                    else
                                        node['replaceNode'](this.__element);
                                }
                                if (log)
                                    log.write("Application layout updated.").endCapture();
                            };
                            // --------------------------------------------------------------------------------------------------------------------
                            /** Imports an HTML template starting at the given DOM element (a basic DOM system is required for traversing the elements).  Any existing graph items
                            * will be merged or replaced.
                            * If 'CoreXT.isServer()' returns true, then you should call 'parseTemplate()'
                            * @param {HTMLElement} element HTML root element to traverse.
                            */
                            $__type.prototype.applyTemplate = function (element) {
                                // ... 'element' is the application root ...
                            };
                            /** Parses HTML text to build the visual graph tree.
                            * This concept is similar to using XAML to load objects in Silverlight or WPF. You have the option to use an HTML file, or dynamically build your application
                            * directly in code (just like with Silverlight/WPF using XAML/C#/VB/etc.).
                            *
                            * Warning about inline scripts: Script tags will be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
                            * HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side. "Business" logic should always be in your script
                            * files and NOT inline within the HTML.
                            */
                            $__type.prototype.parseTemplate = function (html) {
                                if (html === void 0) { html = null; }
                                var log = System.Diagnostics.log(ApplicationElement, "Parsing application HTML template ...").beginCapture();
                                if (!html)
                                    if (CoreXT.host.isClient())
                                        html = this.loadTemplate(); // (returns "<html>...</html>" from the DOM)
                                    else
                                        throw System.Exception.from("Unable to parse the client side HTML on the server side (no HTML is loaded).  Call 'loadTemplate()' instead.");
                                // ... parse the HTML "body" section for the graph tree ("body" is the application root) ...
                                // (quickly scan the template text to create the required objects [using <body> as the application root])
                                document.body.innerHTML = ""; // (clear this if not already done so [will be dynamically rebuilt using the graph tree before the user sees any changes])
                                // (allowing the innterHTML to exist first provides a quick visual view of the page, which will then give time to quickly replace it)
                                var result = HTML.parse(html);
                                for (var i = 0, n = result.rootElements.length; i < n; ++i)
                                    this.addChild(result.rootElements[i]);
                                for (var id in result.templates)
                                    this.dataTemplates[id] = result.templates[id];
                                log.write("Application HTML template parsing complete.").endCapture();
                            };
                            /** Loads the 'htmlFile' file and calls 'parseTemplate()' with the contents.
                            * The call is synchronous, and only returns when completed.
                            * @param {string} htmlFileURI The URI to the HTML template file. If empty or undefined, then the HTML is pulled from the loaded DOM (see 'parseTemplate()').
                            * @param {boolean} fallbackToDOM If true (the default), then the HTML template will be extracted from the currently loaded DOM as a fallback (i.e. if the
                            * URI is invalid, or access fails due to a sudden connection failure).
                            */
                            $__type.prototype.loadTemplate = function (htmlFileURI, fallbackToDOM) {
                                if (fallbackToDOM === void 0) { fallbackToDOM = true; }
                                var contents = null;
                                var log = System.Diagnostics.log("Application.loadTemplate()", "Loading template from '" + htmlFileURI + "' ...").beginCapture();
                                // ... load the file ...
                                if (CoreXT.host.isClient()) {
                                    if (htmlFileURI) {
                                        // ... use AJAX ...
                                        var request = new XMLHttpRequest();
                                        request.open("get", htmlFileURI + "!", false);
                                        request.onerror = function (ev) {
                                            System.Diagnostics.log("Application.loadTemplate()", ev.message, CoreXT.LogTypes.Error);
                                        };
                                        request.onreadystatechange = function () {
                                            if (request.readyState == (XMLHttpRequest.DONE || 4)) {
                                                var ok = false, response = request.response || request.responseText || request.responseXML || request['responseBody'];
                                                if (request.status == 200) {
                                                    log.write("Template data was loaded from the server.", CoreXT.LogTypes.Success);
                                                    ok = true;
                                                }
                                                else if (request.status == 304) {
                                                    log.write("Template data was loaded from the browser cache.", CoreXT.LogTypes.Success);
                                                    ok = true;
                                                }
                                                else
                                                    log.write("Template data was not loaded. Response: " + response, CoreXT.LogTypes.Error); // (usually at 404)
                                                if (ok)
                                                    contents = response;
                                            }
                                        };
                                        log.write("Sending request for template ...", CoreXT.LogTypes.Info);
                                        request.send();
                                    }
                                    if (!contents && fallbackToDOM) {
                                        log.write("Failed to load the template content, or content is empty.  Using the existing DOM content instead.", CoreXT.LogTypes.Warning);
                                        // ... get HTML from the DOM as a fall back [there should be no reason not to have something!] ...
                                        contents = document.getElementsByTagName("html")[0].outerHTML;
                                    }
                                }
                                else {
                                    // ... use the host bridge ...
                                    // contents = loadedContent;
                                }
                                log.endCapture();
                                return contents;
                            };
                            // --------------------------------------------------------------------------------------------------------------------
                            /** Returns a template with the specified ID.  Returns null if nothing was found. */
                            $__type.prototype.getDataTemplate = function (id) {
                                return this.dataTemplates && this.dataTemplates[id] || null;
                            };
                            // --------------------------------------------------------------------------------------------------------------------
                            /** Return the application, and all child graph items, as a single JSON string.  The values are all graph objects and related REGISTERED properties
                            * only - direct instance properties are not all persisted, if any.
                            * JavaScript 1.7 implements the 'JSON.stringify()' function to convert values into the JSON format.  The implementation looks for a 'toJSON()'
                            * function on an object and calls it if found.
                            */
                            $__type.prototype.toJSON = function () {
                                return null;
                            };
                            // --------------------------------------------------------------------------------------------------------------------
                            $__type[CoreXT.constructor] = function (factory) {
                                factory.init = function (o, isnew, title, description, targetElement) {
                                    if (targetElement === void 0) { targetElement = null; }
                                    factory.super.init(o, isnew, null);
                                    if (typeof title == "undefined" || "" + title == "")
                                        throw "An application title is required.";
                                    o.title(title);
                                    o.description(description);
                                    o._targetElement = targetElement || document.getElementsByTagName("body")[0] || null;
                                };
                            };
                            return $__type;
                        }(CoreXT.FactoryType(HTML.HTMLElement)));
                        ApplicationElement.$__type = $__type;
                        ApplicationElement.$__register(Application);
                    })(ApplicationElement = Application.ApplicationElement || (Application.ApplicationElement = {}));
                    // ========================================================================================================================
                })(Application = HTML.Application || (HTML.Application = {}));
            })(HTML = Platform.HTML || (Platform.HTML = {}));
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
// ############################################################################################################################
//# sourceMappingURL=CoreXT.System.Platform.HTML.Application.js.map