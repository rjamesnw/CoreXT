// ############################################################################################################################
// Types for event management.
// ############################################################################################################################

namespace CoreXT.System.Platform.HTML.Application {
    namespace(() => CoreXT.System.Platform.HTML.Application);

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
    export class ApplicationElement extends FactoryBase(HTMLElement) {
        static 'new'(title: string, description: string, targetElement: NativeTypes.IHTMLElement = null): IApplicationElement { return null; }

        static init(o: IApplicationElement, isnew: boolean, title: string, description: string, targetElement: NativeTypes.IHTMLElement = null) { }

        static Title: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>ApplicationElement, "title", true);
        static Description: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>ApplicationElement, "description", true);
        static Version: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>ApplicationElement, "version", true);
    }
    export namespace ApplicationElement {
        export class $__type extends FactoryType(HTMLElement) {
            // --------------------------------------------------------------------------------------------------------------------

            /** A title for the application (required). */
            title: (title?: string) => string = GraphNode.accessor(ApplicationElement.Title);

            /** A short application description (optional). */
            description: (description?: string) => string = GraphNode.accessor(ApplicationElement.Description);

            /** The application version number (i.e. '#.#.#...') in string form. */
            version: (version?: string) => string = GraphNode.accessor(ApplicationElement.Version);


            /** This is the target element that the application will render to when updateLayout() is called. */
            private _targetElement: NativeTypes.IHTMLElement;
            getTargetElement(): NativeTypes.IHTMLElement { return this._targetElement; }

            /** Holds a list of data templates found in the parsed HTML page template.
            * Templates are based on elements within the page which are marked by the 'data--template="someID"' attribute. These
            * elements are stripped out and are not part of the resulting page.
            */
            dataTemplates: { [id: string]: IDataTemplate; } = {};

            // --------------------------------------------------------------------------------------------------------------------

            /** This generates/updates the HTML elements required to display the application. */
            updateLayout(recursive: boolean = true) {
                var log = isDebugging() ? Diagnostics.log(ApplicationElement, "Application is updating its layout ...").beginCapture() : null;

                super.updateLayout(recursive);

                if (this.__element != null) {
                    var node = <NativeTypes.IHTMLElement>this._targetElement.firstChild;
                    if (node == null || !node['replaceNode'])
                        this._targetElement.appendChild(this.__element);
                    else
                        node['replaceNode'](this.__element);
                }

                if (log)
                    log.write("Application layout updated.").endCapture();
            }

            // --------------------------------------------------------------------------------------------------------------------

            /** Imports an HTML template starting at the given DOM element (a basic DOM system is required for traversing the elements).  Any existing graph items
            * will be merged or replaced.
            * If 'CoreXT.isServer()' returns true, then you should call 'parseTemplate()'
            * @param {HTMLElement} element HTML root element to traverse.
            */
            applyTemplate(element: HTMLElement) {
                // ... 'element' is the application root ...
            }

            /** Parses HTML text to build the visual graph tree.
            * This concept is similar to using XAML to load objects in Silverlight or WPF. You have the option to use an HTML file, or dynamically build your application
            * directly in code (just like with Silverlight/WPF using XAML/C#/VB/etc.).
            * 
            * Warning about inline scripts: Script tags will be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
            * HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side. "Business" logic should always be in your script
            * files and NOT inline within the HTML.
            */
            parseTemplate(html: string = null) {
                var log = Diagnostics.log(ApplicationElement, "Parsing application HTML template ...").beginCapture();

                if (!html)
                    if (CoreXT.host.isClient())
                        html = this.loadTemplate(); // (returns "<html>...</html>" from the DOM)
                    else
                        throw Exception.from("Unable to parse the client side HTML on the server side (no HTML is loaded).  Call 'loadTemplate()' instead.");

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
            }

            /** Loads the 'htmlFile' file and calls 'parseTemplate()' with the contents.
            * The call is synchronous, and only returns when completed.
            * @param {string} htmlFileURI The URI to the HTML template file. If empty or undefined, then the HTML is pulled from the loaded DOM (see 'parseTemplate()').
            * @param {boolean} fallbackToDOM If true (the default), then the HTML template will be extracted from the currently loaded DOM as a fallback (i.e. if the
            * URI is invalid, or access fails due to a sudden connection failure).
            */
            loadTemplate(htmlFileURI?: string, fallbackToDOM: boolean = true): string {
                var contents = null;
                var log = Diagnostics.log("Application.loadTemplate()", "Loading template from '" + htmlFileURI + "' ...").beginCapture();
                // ... load the file ...
                if (CoreXT.host.isClient()) {
                    if (htmlFileURI) {
                        // ... use AJAX ...
                        var request = new XMLHttpRequest();
                        request.open("get", htmlFileURI + "!", false);
                        request.onerror = (ev: ProgressEvent) => {
                            Diagnostics.log("Application.loadTemplate()", getErrorMessage(ev), LogTypes.Error);
                        };
                        request.onreadystatechange = () => {
                            if (request.readyState == (XMLHttpRequest.DONE || 4)) {
                                var ok = false, response = request.response || request.responseText || request.responseXML || request['responseBody'];
                                if (request.status == 200) {
                                    log.write("Template data was loaded from the server.", LogTypes.Success);
                                    ok = true;
                                } else if (request.status == 304) {
                                    log.write("Template data was loaded from the browser cache.", LogTypes.Success);
                                    ok = true;
                                } else
                                    log.write("Template data was not loaded. Response: " + response, LogTypes.Error); // (usually at 404)
                                if (ok)
                                    contents = response;
                            }
                        };
                        log.write("Sending request for template ...", LogTypes.Info);
                        request.send();
                    }
                    if (!contents && fallbackToDOM) {
                        log.write("Failed to load the template content, or content is empty.  Using the existing DOM content instead.", LogTypes.Warning);
                        // ... get HTML from the DOM as a fall back [there should be no reason not to have something!] ...
                        contents = document.getElementsByTagName("html")[0].outerHTML;
                    }
                } else {
                    // ... use the host bridge ...
                    // contents = loadedContent;
                }
                log.endCapture();
                return contents;
            }

            // --------------------------------------------------------------------------------------------------------------------

            /** Returns a template with the specified ID.  Returns null if nothing was found. */
            getDataTemplate(id: string): IDataTemplate {
                return this.dataTemplates && this.dataTemplates[id] || null;
            }

            // --------------------------------------------------------------------------------------------------------------------

            /** Return the application, and all child graph items, as a single JSON string.  The values are all graph objects and related REGISTERED properties
            * only - direct instance properties are not all persisted, if any.
            * JavaScript 1.7 implements the 'JSON.stringify()' function to convert values into the JSON format.  The implementation looks for a 'toJSON()'
            * function on an object and calls it if found.
            */
            toJSON(): string { // (see http://stackoverflow.com/questions/14991374/how-does-moment-js-know-when-its-object-is-being-serialised/14991571#14991571)
                return null;
            }

            // --------------------------------------------------------------------------------------------------------------------

            private static [constructor](factory: typeof ApplicationElement) {
                factory.init = (o: $__type, isnew, title, description, targetElement = null) => {
                    factory.super.init<any, any>(o, isnew, null);
                    if (typeof title == "undefined" || "" + title == "")
                        throw "An application title is required.";
                    o.title(title);
                    o.description(description);
                    o._targetElement = targetElement || document.getElementsByTagName("body")[0] || null;
                };
            }
        }
        ApplicationElement.$__register(Application);
    }

    export interface IApplicationElement extends ApplicationElement.$__type { }

    // ========================================================================================================================
}

// ############################################################################################################################
