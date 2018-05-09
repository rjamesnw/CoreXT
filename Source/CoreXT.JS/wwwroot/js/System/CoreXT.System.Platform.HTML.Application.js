var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
                    CoreXT.registerNamespace("CoreXT", "System", "Platform", "HTML", "Application");
                    Application.ApplicationElement = CoreXT.ClassFactory(Application, HTML.HTMLElement, function (base) {
                        var ApplicationElement = (function (_super) {
                            __extends(ApplicationElement, _super);
                            function ApplicationElement() {
                                var _this = _super !== null && _super.apply(this, arguments) || this;
                                _this.title = Platform.GraphNode.accessor(ApplicationElement.Title);
                                _this.description = Platform.GraphNode.accessor(ApplicationElement.Description);
                                _this.version = Platform.GraphNode.accessor(ApplicationElement.Version);
                                _this.dataTemplates = {};
                                return _this;
                            }
                            ApplicationElement.prototype.getTargetElement = function () { return this.targetElement; };
                            ApplicationElement.prototype.updateLayout = function (recursive) {
                                if (recursive === void 0) { recursive = true; }
                                var log = System.Diagnostics.isDebugging() ? System.Diagnostics.log(ApplicationElement, "Application is updating its layout ...").beginCapture() : null;
                                _super.prototype.updateLayout.call(this, recursive);
                                if (this.__element != null) {
                                    var node = this.targetElement.firstChild;
                                    if (node == null || !node['replaceNode'])
                                        this.targetElement.appendChild(this.__element);
                                    else
                                        node['replaceNode'](this.__element);
                                }
                                if (log)
                                    log.write("Application layout updated.").endCapture();
                            };
                            ApplicationElement.prototype.applyTemplate = function (element) {
                            };
                            ApplicationElement.prototype.parseTemplate = function (html) {
                                if (html === void 0) { html = null; }
                                var log = System.Diagnostics.log(ApplicationElement, "Parsing application HTML template ...").beginCapture();
                                if (!html)
                                    if (CoreXT.host.isClient())
                                        html = this.loadTemplate();
                                    else
                                        throw System.Exception.from("Unable to parse the client side HTML on the server side (no HTML is loaded).  Call 'loadTemplate()' instead.");
                                document.body.innerHTML = "";
                                var result = HTML.parse(html);
                                for (var i = 0, n = result.rootElements.length; i < n; ++i)
                                    this.addChild(result.rootElements[i]);
                                for (var id in result.templates)
                                    this.dataTemplates[id] = result.templates[id];
                                log.write("Application HTML template parsing complete.").endCapture();
                            };
                            ApplicationElement.prototype.loadTemplate = function (htmlFileURI, fallbackToDOM) {
                                if (fallbackToDOM === void 0) { fallbackToDOM = true; }
                                var contents = null;
                                var log = System.Diagnostics.log("Application.loadTemplate()", "Loading template from '" + htmlFileURI + "' ...").beginCapture();
                                if (CoreXT.host.isClient()) {
                                    if (htmlFileURI) {
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
                                                    log.write("Template data was not loaded. Response: " + response, CoreXT.LogTypes.Error);
                                                if (ok)
                                                    contents = response;
                                            }
                                        };
                                        log.write("Sending request for template ...", CoreXT.LogTypes.Info);
                                        request.send();
                                    }
                                    if (!contents && fallbackToDOM) {
                                        log.write("Failed to load the template content, or content is empty.  Using the existing DOM content instead.", CoreXT.LogTypes.Warning);
                                        contents = document.getElementsByTagName("html")[0].outerHTML;
                                    }
                                }
                                else {
                                }
                                log.endCapture();
                                return contents;
                            };
                            ApplicationElement.prototype.getDataTemplate = function (id) {
                                return this.dataTemplates && this.dataTemplates[id] || null;
                            };
                            ApplicationElement.prototype.toJSON = function () {
                                return null;
                            };
                            ApplicationElement.Title = Platform.GraphNode.registerProperty(ApplicationElement, "title", true);
                            ApplicationElement.Description = Platform.GraphNode.registerProperty(ApplicationElement, "description", true);
                            ApplicationElement.Version = Platform.GraphNode.registerProperty(ApplicationElement, "version", true);
                            ApplicationElement['ApplicationElementFactory'] = (function (_super) {
                                __extends(Factory, _super);
                                function Factory() {
                                    return _super !== null && _super.apply(this, arguments) || this;
                                }
                                Factory.prototype['new'] = function (title, description, targetElement) {
                                    if (targetElement === void 0) { targetElement = null; }
                                    return null;
                                };
                                Factory.prototype.init = function (o, isnew, title, description, targetElement) {
                                    if (targetElement === void 0) { targetElement = null; }
                                    this.super.init(o, isnew, null);
                                    if (typeof title == "undefined" || "" + title == "")
                                        throw "An application title is required.";
                                    o.title(title);
                                    o.description(description);
                                    o.targetElement = targetElement || document.getElementsByTagName("body")[0] || null;
                                    return o;
                                };
                                return Factory;
                            }(CoreXT.FactoryBase(ApplicationElement, base['HTMLElementFactory'])));
                            return ApplicationElement;
                        }(base));
                        return [ApplicationElement, ApplicationElement["ApplicationElementFactory"]];
                    }, "ApplicationElement");
                })(Application = HTML.Application || (HTML.Application = {}));
            })(HTML = Platform.HTML || (Platform.HTML = {}));
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.HTML.Application.js.map