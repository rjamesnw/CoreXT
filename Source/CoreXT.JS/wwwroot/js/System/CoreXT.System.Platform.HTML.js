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
                CoreXT.registerNamespace("CoreXT", "System", "Platform", "HTML");
                HTML.BrowserContext = CoreXT.ClassFactory(HTML, Platform.Context, function (base) {
                    var BrowserContext = (function (_super) {
                        __extends(BrowserContext, _super);
                        function BrowserContext() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        BrowserContext.prototype._setupIFrame = function () {
                            this._target = this._iframe = document.createElement("iframe");
                            this._iframe.style.display = "none";
                            this._iframe.src = this._url;
                            CoreXT.global.document.body.appendChild(this._iframe);
                            this._global = this._iframe.contentWindow;
                        };
                        BrowserContext.prototype._setupWorker = function () {
                            this._target = this._worker = new Worker(this._url);
                        };
                        BrowserContext.prototype._setupWindow = function () {
                            this._target = this._window = Platform.Window.new(null, this._url);
                        };
                        BrowserContext.prototype.load = function (url) {
                            var contextType = this._contextType;
                            switch (CoreXT.Environment) {
                                case CoreXT.Environments.Browser:
                                    switch (contextType) {
                                        case Platform.Contexts.Secure:
                                        case Platform.Contexts.Unsecure:
                                            this._setupIFrame();
                                            if (CoreXT.Environment == CoreXT.Environments.Browser) {
                                            }
                                            else if (CoreXT.Environment == CoreXT.Environments.Browser) {
                                            }
                                            else {
                                                this._target = this._worker = new Worker("CoreXT.js");
                                            }
                                            break;
                                        case Platform.Contexts.SecureWindow:
                                        case Platform.Contexts.UnsecureWindow:
                                            if (CoreXT.Environment == CoreXT.Environments.Browser) {
                                                this._target = this._iframe = document.createElement("iframe");
                                                this._iframe.style.display = "none";
                                                this._iframe.src = "index.html";
                                                CoreXT.global.document.body.appendChild(this._iframe);
                                                this._global = this._iframe.contentWindow;
                                            }
                                            else if (CoreXT.Environment == CoreXT.Environments.Browser) {
                                            }
                                            else {
                                                this._target = this._worker = new Worker("CoreXT.js");
                                            }
                                            break;
                                        case Platform.Contexts.Local:
                                            this._target = this._global = CoreXT.global;
                                            break;
                                    }
                                    break;
                            }
                            if (this._contextType == Platform.Contexts.Unsecure)
                                url = "/";
                            else
                                this._iframe.src = location.protocol + "//ctx" + (Math.random() * 0x7FFFFF | 0) + "." + location.hostname;
                        };
                        BrowserContext['BrowserContextFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype['new'] = function (context) {
                                if (context === void 0) { context = Platform.Contexts.Secure; }
                                return null;
                            };
                            Factory.prototype.init = function (o, isnew, context) {
                                if (context === void 0) { context = Platform.Contexts.Secure; }
                                this.super.init(o, isnew, context);
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(BrowserContext, BrowserContext['ContextFactory'])));
                        return BrowserContext;
                    }(base));
                    return [BrowserContext, BrowserContext["BrowserContextFactory"]];
                }, "BrowserContext");
                HTML.HTMLNode = CoreXT.ClassFactory(HTML, Platform.GraphNode, function (base) {
                    var HTMLNode = (function (_super) {
                        __extends(HTMLNode, _super);
                        function HTMLNode() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        HTMLNode.prototype.onRedraw = function (recursive) {
                            if (recursive === void 0) { recursive = true; }
                            _super.prototype.onRedraw.call(this, recursive);
                        };
                        HTMLNode['HTMLNodeFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype['new'] = function (parent, id, name) { return null; };
                            Factory.prototype.init = function (o, isnew, parent, id, name) {
                                this.super.init(o, isnew, parent);
                                if (id !== void 0 && id !== null)
                                    o.id = id;
                                if (name !== void 0 && name !== null)
                                    o.name = name;
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(HTMLNode, base['GraphNodeFactory'])));
                        return HTMLNode;
                    }(base));
                    return [HTMLNode, HTMLNode["HTMLNodeFactory"]];
                });
                HTML.HTMLElement = CoreXT.ClassFactory(HTML, HTML.HTMLNode, function (base) {
                    var HTMLElement = (function (_super) {
                        __extends(HTMLElement, _super);
                        function HTMLElement() {
                            var _this = _super !== null && _super.apply(this, arguments) || this;
                            _this.tagName = HTMLElement.defaultHTMLTag;
                            _this.__element = null;
                            _this.__htmlElement = null;
                            return _this;
                        }
                        HTMLElement.prototype.set = function (name, value) {
                            return this.setValue(name, value);
                        };
                        HTMLElement.prototype.get = function (name, tryElement) {
                            if (tryElement === void 0) { tryElement = false; }
                            if (tryElement && this.__htmlElement) {
                                var attr = this.__htmlElement.attributes.getNamedItem(name);
                                if (attr)
                                    return attr.value;
                            }
                            return this.getValue(name);
                        };
                        HTMLElement.prototype.onRedraw = function (recursive) {
                            if (recursive === void 0) { recursive = true; }
                            _super.prototype.onRedraw.call(this, recursive);
                        };
                        HTMLElement.prototype.on = function (eventName, handler) {
                            var event = _super.prototype.on.call(this, eventName, handler);
                            if (this.__htmlElement && !event.isAssociated(this.__htmlElement)) {
                                if (this.__htmlElement.addEventListener)
                                    this.__htmlElement.addEventListener(eventName, function (ev) { return event.dispatch(ev); }, false);
                                else if (this.__htmlElement['attachEvent']) {
                                    this.__htmlElement['attachEvent']("on" + eventName, function (ev) { return event.dispatch(ev); });
                                }
                                else {
                                }
                                event.associate(this.__htmlElement);
                            }
                            return event;
                        };
                        HTMLElement.prototype.onPropertyValueSet = function (name, value) {
                            if (_super.prototype.onPropertyValueSet)
                                _super.prototype.onPropertyValueSet.call(this, name, value);
                            if (this.__htmlElement && this.__htmlElement.setAttribute)
                                this.__htmlElement.setAttribute(name, value);
                        };
                        HTMLElement.prototype.createUIElement = function () {
                            return document.createElement(this.htmlTag || HTMLElement.defaultHTMLTag || "div");
                        };
                        HTMLElement.prototype.onUpdateLayout = function () {
                            if (CoreXT.host.isClient()) {
                                var parentElement = this.__parent ? this.__parent.__element : null;
                                var i, n;
                                var doRedraw = false;
                                if (this.__element == null || this.__element.nodeName != this.tagName) {
                                    if (this.__element != null && parentElement != null)
                                        parentElement.removeChild(this.__element);
                                    this.__element = this.createUIElement();
                                    this.tagName = this.__element.nodeName;
                                    if (typeof this.__element['innerHTML'] !== 'undefined') {
                                        this.__htmlElement = this.__element;
                                        for (var pname in this.__properties) {
                                            var prop = this.__properties[pname];
                                            if (prop.hasValue())
                                                this.__htmlElement.setAttribute(pname, prop.getValue());
                                        }
                                    }
                                    else
                                        this.__htmlElement = null;
                                    if (this.__element != null && parentElement != null)
                                        parentElement.appendChild(this.__element);
                                }
                                else if (parentElement != null && this.__element.parentNode != parentElement) {
                                    if (this.__element.parentNode != null)
                                        this.__element.parentNode.removeChild(this.__element);
                                    try {
                                        parentElement.appendChild(this.__element);
                                    }
                                    catch (e) {
                                    }
                                }
                            }
                        };
                        HTMLElement.ID = Platform.GraphNode.registerProperty(HTMLElement, "id");
                        HTMLElement.Name = Platform.GraphNode.registerProperty(HTMLElement, "name");
                        HTMLElement.Class = Platform.GraphNode.registerProperty(HTMLElement, "class", true);
                        HTMLElement.Style = Platform.GraphNode.registerProperty(HTMLElement, "style", true);
                        HTMLElement.InnerHTML = Platform.GraphNode.registerProperty(HTMLElement, "innerHTML", true);
                        HTMLElement.defaultHTMLTag = "div";
                        HTMLElement['HTMLElementFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype['new'] = function (parent, id, name, tagName, html) {
                                if (tagName === void 0) { tagName = "div"; }
                                return null;
                            };
                            Factory.prototype.init = function (o, isnew, parent, id, name, tagName, html) {
                                if (tagName === void 0) { tagName = "div"; }
                                this.super.init(o, isnew, parent, id, name);
                                o.tagName = tagName;
                                o.set("innerHTML", html);
                                o.getProperty(HTMLElement.InnerHTML).registerListener(function (property, initialValue) {
                                    if (!initialValue || !o.__children.length) {
                                        if (o.__children.length)
                                            o.removeAllChildren();
                                        try {
                                            o.__htmlElement.innerHTML = property.getValue();
                                        }
                                        catch (ex) { }
                                    }
                                });
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(HTMLElement, base['HTMLNodeFactory'])));
                        return HTMLElement;
                    }(base));
                    return [HTMLElement, HTMLElement["HTMLNodeFactory"]];
                });
                HTML.PlainText = CoreXT.ClassFactory(HTML, HTML.HTMLNode, function (base) {
                    var PlainText = (function (_super) {
                        __extends(PlainText, _super);
                        function PlainText() {
                            var _this = _super !== null && _super.apply(this, arguments) || this;
                            _this.text = Platform.GraphNode.accessor(PlainText.Text);
                            return _this;
                        }
                        PlainText.prototype.createUIElement = function () {
                            this.assertSupportedElementTypes("", "Text");
                            return document.createTextNode("");
                        };
                        PlainText.prototype.onRedraw = function (recursive) {
                            if (recursive === void 0) { recursive = true; }
                            _super.prototype.onRedraw.call(this, recursive);
                        };
                        PlainText.Text = Platform.GraphNode.registerProperty(PlainText, "text", true);
                        PlainText['PlainTextFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype['new'] = function (parent, text) {
                                if (text === void 0) { text = ""; }
                                return null;
                            };
                            Factory.prototype.init = function (o, isnew, parent, text) {
                                if (text === void 0) { text = ""; }
                                this.super.init(o, isnew, parent);
                                o.text(text);
                                o.htmlTag = "";
                                o.getProperty(PlainText.Text).registerListener(function (property, initialValue) {
                                    o.__element.data = property.getValue();
                                });
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(PlainText, base['HTMLNodeFactory'])));
                        return PlainText;
                    }(base));
                    return [PlainText, PlainText["PlainTextFactory"]];
                });
                HTML.HTMLText = CoreXT.ClassFactory(HTML, HTML.HTMLElement, function (base) {
                    var HTMLText = (function (_super) {
                        __extends(HTMLText, _super);
                        function HTMLText() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        HTMLText.prototype.createUIElement = function () {
                            this.assertUnsupportedElementTypes("html", "head", "body", "script", "audio", "canvas", "object");
                            return _super.prototype.createUIElement.call(this);
                        };
                        HTMLText.prototype.onRedraw = function (recursive) {
                            if (recursive === void 0) { recursive = true; }
                            _super.prototype.onRedraw.call(this, recursive);
                        };
                        HTMLText['HTMLTextFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype['new'] = function (parent, html) {
                                if (html === void 0) { html = ""; }
                                return null;
                            };
                            Factory.prototype.init = function (o, isnew, parent, html) {
                                if (html === void 0) { html = ""; }
                                this.super.init(o, isnew, parent, html);
                                o.htmlTag = "span";
                                CoreXT.global;
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(HTMLText, base['HTMLElementFactory'])));
                        return HTMLText;
                    }(base));
                    return [HTMLText, HTMLText["HTMLTextFactory"]];
                });
                var PhraseTypes;
                (function (PhraseTypes) {
                    PhraseTypes[PhraseTypes["Emphasis"] = 1] = "Emphasis";
                    PhraseTypes[PhraseTypes["Strong"] = 2] = "Strong";
                    PhraseTypes[PhraseTypes["Cite"] = 4] = "Cite";
                    PhraseTypes[PhraseTypes["Defining"] = 8] = "Defining";
                    PhraseTypes[PhraseTypes["Code"] = 16] = "Code";
                    PhraseTypes[PhraseTypes["Sample"] = 32] = "Sample";
                    PhraseTypes[PhraseTypes["Keyboard"] = 64] = "Keyboard";
                    PhraseTypes[PhraseTypes["Variable"] = 128] = "Variable";
                    PhraseTypes[PhraseTypes["Abbreviation"] = 256] = "Abbreviation";
                    PhraseTypes[PhraseTypes["Acronym"] = 512] = "Acronym";
                })(PhraseTypes = HTML.PhraseTypes || (HTML.PhraseTypes = {}));
                HTML.Phrase = CoreXT.ClassFactory(HTML, HTML.HTMLElement, function (base) {
                    var Phrase = (function (_super) {
                        __extends(Phrase, _super);
                        function Phrase() {
                            var _this = _super !== null && _super.apply(this, arguments) || this;
                            _this.phraseType = Platform.GraphNode.accessor(Phrase.PhraseType);
                            return _this;
                        }
                        Phrase.prototype.createUIElement = function () {
                            return _super.prototype.createUIElement.call(this);
                        };
                        Phrase.prototype.createPhrase = function (property, value) {
                            var leftTags = "", rightTags = "", phraseType = this.phraseType();
                            if ((phraseType & PhraseTypes.Emphasis) > 0) {
                                leftTags = "<em>" + leftTags;
                                rightTags += "</em>";
                            }
                            if ((phraseType & PhraseTypes.Strong) > 0) {
                                leftTags = "<strong>" + leftTags;
                                rightTags += "</strong>";
                            }
                            if ((phraseType & PhraseTypes.Cite) > 0) {
                                leftTags = "<cite>" + leftTags;
                                rightTags += "</cite>";
                            }
                            if ((phraseType & PhraseTypes.Defining) > 0) {
                                leftTags = "<dfn>" + leftTags;
                                rightTags += "</dfn>";
                            }
                            if ((phraseType & PhraseTypes.Code) > 0) {
                                leftTags = "<code>" + leftTags;
                                rightTags += "</code>";
                            }
                            if ((phraseType & PhraseTypes.Sample) > 0) {
                                leftTags = "<samp>" + leftTags;
                                rightTags += "</samp>";
                            }
                            if ((phraseType & PhraseTypes.Keyboard) > 0) {
                                leftTags = "<kbd>" + leftTags;
                                rightTags += "</kbd>";
                            }
                            if ((phraseType & PhraseTypes.Variable) > 0) {
                                leftTags = "<var>" + leftTags;
                                rightTags += "</var>";
                            }
                            if ((phraseType & PhraseTypes.Abbreviation) > 0) {
                                leftTags = "<abbr>" + leftTags;
                                rightTags += "</abbr>";
                            }
                            if ((phraseType & PhraseTypes.Acronym) > 0) {
                                leftTags = "<acronym>" + leftTags;
                                rightTags += "</acronym>";
                            }
                            return leftTags + value + rightTags;
                        };
                        Phrase.prototype.onRedraw = function (recursive) {
                            if (recursive === void 0) { recursive = true; }
                            _super.prototype.onRedraw.call(this, recursive);
                        };
                        Phrase.PhraseType = Platform.GraphNode.registerProperty(Phrase, "phraseType", true);
                        Phrase['PhraseFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype['new'] = function (parent, phraseTypeFlags, html) {
                                if (phraseTypeFlags === void 0) { phraseTypeFlags = 0; }
                                if (html === void 0) { html = ""; }
                                return null;
                            };
                            Factory.prototype.init = function (o, isnew, parent, phraseTypeFlags, html) {
                                if (phraseTypeFlags === void 0) { phraseTypeFlags = 0; }
                                if (html === void 0) { html = ""; }
                                this.super.init(o, isnew, parent, html);
                                o.phraseType(phraseTypeFlags);
                                var pInfo = o.getProperty(HTML.HTMLElement.InnerHTML);
                                pInfo.registerFilter(o.createPhrase);
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(Phrase, base['HTMLElementFactory'])));
                        return Phrase;
                    }(base));
                    return [Phrase, Phrase["PhraseFactory"]];
                });
                HTML.Header = CoreXT.ClassFactory(HTML, HTML.HTMLElement, function (base) {
                    var Header = (function (_super) {
                        __extends(Header, _super);
                        function Header() {
                            var _this = _super !== null && _super.apply(this, arguments) || this;
                            _this.headerLevel = Platform.GraphNode.accessor(Header.HeaderLevel);
                            return _this;
                        }
                        Header.prototype.createUIElement = function () {
                            var headerLevel = this.getValue(Header.HeaderLevel);
                            if (headerLevel < 1 || headerLevel > 6)
                                throw System.Exception.from("HTML only supports header levels 1 through 6.");
                            this.tagName = "h" + headerLevel;
                            this.assertSupportedElementTypes("h1", "h2", "h3", "h4", "h5", "h6");
                            return _super.prototype.createUIElement.call(this);
                        };
                        Header.prototype.onRedraw = function (recursive) {
                            if (recursive === void 0) { recursive = true; }
                            _super.prototype.onRedraw.call(this, recursive);
                        };
                        Header.HeaderLevel = Platform.GraphNode.registerProperty(Header, "headerLevel", true);
                        Header['HeaderFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype['new'] = function (parent, headerLevel, html) {
                                if (headerLevel === void 0) { headerLevel = 1; }
                                if (html === void 0) { html = ""; }
                                return null;
                            };
                            Factory.prototype.init = function (o, isnew, parent, headerLevel, html) {
                                if (headerLevel === void 0) { headerLevel = 1; }
                                if (html === void 0) { html = ""; }
                                this.super.init(o, isnew, parent, html);
                                if (headerLevel < 1 || headerLevel > 6)
                                    throw System.Exception.from("HTML only supports header levels 1 through 6.");
                                o.setValue(Header.HeaderLevel, headerLevel);
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(Header, base['HTMLElementFactory'])));
                        return Header;
                    }(base));
                    return [Header, Header["HeaderFactory"]];
                });
                function parse(html, strictMode) {
                    if (html === void 0) { html = null; }
                    var log = System.Diagnostics.log(HTML, "Parsing HTML template ...").beginCapture();
                    log.write("Template: " + html);
                    if (!html)
                        return null;
                    var htmlReader = System.Markup.HTMLReader.new(html);
                    if (strictMode !== void 0)
                        htmlReader.strictMode = !!strictMode;
                    var approotID;
                    var mode = 0;
                    var classMatch = /^[$.][A-Za-z0-9_$]*(\.[A-Za-z0-9_$]*)*(\s+|$)/;
                    var attribName;
                    var storeRunningText = function (parent) {
                        if (htmlReader.runningText) {
                            if (htmlReader.runningText.indexOf('&') < 0)
                                HTML.PlainText.new(parent, htmlReader.runningText);
                            else
                                HTML.HTMLText.new(parent, htmlReader.runningText);
                        }
                    };
                    var rootElements = [];
                    var globalTemplatesReference = {};
                    var processTags = function (parent) {
                        var graphItemType, graphItemTypePrefix;
                        var graphType;
                        var graphItem;
                        var properties;
                        var currentTagName;
                        var isDataTemplate = false, dataTemplateID, dataTemplateHTML;
                        var tagStartIndex, lastTemplateIndex;
                        var templateInfo;
                        var templates = null;
                        var immediateChildTemplates = null;
                        while (htmlReader.readMode != System.Markup.HTMLReaderModes.End) {
                            currentTagName = htmlReader.tagName;
                            if (!htmlReader.isMarkupDeclaration() && !htmlReader.isCommentBlock() && !htmlReader.isScriptBlock() && !htmlReader.isStyleBlock()) {
                                if (currentTagName == "html") {
                                    if (approotID === void 0)
                                        approotID = null;
                                    if (htmlReader.attributeName == "data-approot" || htmlReader.attributeName == "data--approot") {
                                        approotID = htmlReader.attributeValue;
                                    }
                                }
                                else {
                                    if (htmlReader.readMode == System.Markup.HTMLReaderModes.Attribute) {
                                        if (!isDataTemplate && htmlReader.attributeName == "data--template") {
                                            isDataTemplate = true;
                                            dataTemplateID = htmlReader.attributeValue;
                                        }
                                        attribName = (htmlReader.attributeName.substring(0, 6) != "data--") ? htmlReader.attributeName : htmlReader.attributeName.substring(6);
                                        properties[attribName] = htmlReader.attributeValue;
                                        if (htmlReader.attributeName == "id" && htmlReader.attributeValue == approotID && mode == 0)
                                            mode = 1;
                                    }
                                    else {
                                        if (mode == 2 && htmlReader.readMode == System.Markup.HTMLReaderModes.Tag && htmlReader.isClosingTag()) {
                                            if (graphItem) {
                                                storeRunningText(graphItem);
                                                if (isDataTemplate) {
                                                    dataTemplateHTML = htmlReader.getHTML().substring(tagStartIndex, htmlReader.textEndIndex) + ">";
                                                    templateInfo = { id: dataTemplateID, originalHTML: dataTemplateHTML, templateHTML: undefined, templateItem: graphItem, childTemplates: immediateChildTemplates };
                                                    if (immediateChildTemplates)
                                                        for (var i = 0, n = immediateChildTemplates.length; i < n; i++)
                                                            dataTemplateHTML = dataTemplateHTML.replace(immediateChildTemplates[i].originalHTML, "<!--{{" + immediateChildTemplates[i].id + "Items}}-->");
                                                    templateInfo.templateHTML = dataTemplateHTML;
                                                    globalTemplatesReference[dataTemplateID] = templateInfo;
                                                    if (!templates)
                                                        templates = [];
                                                    templates.push(templateInfo);
                                                    isDataTemplate = false;
                                                }
                                                if (htmlReader.tagName != graphItem.htmlTag)
                                                    return templates;
                                                graphType = null;
                                                graphItem = null;
                                                immediateChildTemplates = null;
                                            }
                                            else
                                                return templates;
                                        }
                                        else if (mode == 2 && htmlReader.readMode == System.Markup.HTMLReaderModes.EndOfTag) {
                                            graphItemType = properties['class'];
                                            graphItem = null;
                                            graphType = null;
                                            if (graphItemType && classMatch.test(graphItemType)) {
                                                graphItemTypePrefix = RegExp.lastMatch.substring(0, 1);
                                                if (graphItemTypePrefix == '$') {
                                                    graphItemType = RegExp.lastMatch.substring(1);
                                                    if (graphItemType.charAt(0) == '.')
                                                        graphItemTypePrefix = '.';
                                                }
                                                else
                                                    graphItemType = RegExp.lastMatch;
                                                if (graphItemTypePrefix == '.')
                                                    graphItemType = "DreamSpace.System.UI" + graphItemType;
                                                var graphFactory = Platform.GraphNode['GraphNodeFactory'];
                                                graphType = CoreXT.Utilities.dereferencePropertyPath(CoreXT.Scripts.translateModuleTypeName(graphItemType), CoreXT.$__parent);
                                                if (graphType === void 0)
                                                    throw System.Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " was not found.");
                                                if (typeof graphType !== 'function' || typeof HTML.HTMLElement.defaultHTMLTag === void 0)
                                                    throw System.Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " does not resolve to a GraphItem class type.");
                                            }
                                            if (graphType == null) {
                                                switch (currentTagName) {
                                                    case 'abbr':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Abbreviation;
                                                        break;
                                                    case 'acronym':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Acronym;
                                                        break;
                                                    case 'em':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Emphasis;
                                                        break;
                                                    case 'strong':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Strong;
                                                        break;
                                                    case 'cite':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Cite;
                                                        break;
                                                    case 'dfn':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Defining;
                                                        break;
                                                    case 'code':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Code;
                                                        break;
                                                    case 'samp':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Sample;
                                                        break;
                                                    case 'kbd':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Keyboard;
                                                        break;
                                                    case 'var':
                                                        graphType = HTML.Phrase;
                                                        properties[HTML.Phrase.PhraseType.name] = PhraseTypes.Variable;
                                                        break;
                                                    case 'h1':
                                                        graphType = HTML.Header;
                                                        properties[HTML.Header.HeaderLevel.name] = 1;
                                                        break;
                                                    case 'h2':
                                                        graphType = HTML.Header;
                                                        properties[HTML.Header.HeaderLevel.name] = 2;
                                                        break;
                                                    case 'h3':
                                                        graphType = HTML.Header;
                                                        properties[HTML.Header.HeaderLevel.name] = 3;
                                                        break;
                                                    case 'h4':
                                                        graphType = HTML.Header;
                                                        properties[HTML.Header.HeaderLevel.name] = 4;
                                                        break;
                                                    case 'h5':
                                                        graphType = HTML.Header;
                                                        properties[HTML.Header.HeaderLevel.name] = 5;
                                                        break;
                                                    case 'h6':
                                                        graphType = HTML.Header;
                                                        properties[HTML.Header.HeaderLevel.name] = 6;
                                                        break;
                                                    default: graphType = HTML.HTMLElement;
                                                }
                                            }
                                            if (!graphItem) {
                                                graphItem = graphType.new(isDataTemplate ? null : parent);
                                            }
                                            for (var pname in properties)
                                                graphItem.setValue(pname, properties[pname], true);
                                            graphItem.htmlTag = currentTagName;
                                            switch (currentTagName) {
                                                case "area":
                                                case "base":
                                                case "br":
                                                case "col":
                                                case "command":
                                                case "embed":
                                                case "hr":
                                                case "img":
                                                case "input":
                                                case "keygen":
                                                case "link":
                                                case "meta":
                                                case "param":
                                                case "source":
                                                case "track":
                                                case "wbr":
                                                    graphItem = null;
                                                    graphType = null;
                                            }
                                            if (parent === null)
                                                rootElements.push(graphItem);
                                        }
                                        else if (htmlReader.readMode == System.Markup.HTMLReaderModes.Tag) {
                                            if (mode == 1)
                                                mode = 2;
                                            if (!graphItem) {
                                                properties = {};
                                                tagStartIndex = htmlReader.textEndIndex;
                                                if (mode == 2)
                                                    storeRunningText(parent);
                                            }
                                            else if (mode == 2) {
                                                immediateChildTemplates = processTags(graphItem);
                                                if (htmlReader.tagName != graphItem.htmlTag)
                                                    throw System.Exception.from("The closing tag '</" + htmlReader.tagName + ">' was unexpected for current tag '<" + graphItem.htmlTag + ">' on line " + htmlReader.getCurrentLineNumber() + ".");
                                                continue;
                                            }
                                            if (currentTagName == "body" && !approotID)
                                                mode = 1;
                                        }
                                    }
                                }
                            }
                            htmlReader.readNext();
                        }
                        return templates;
                    };
                    htmlReader.readNext();
                    processTags(null);
                    log.write("HTML template parsing complete.").endCapture();
                    return { rootElements: rootElements, templates: globalTemplatesReference };
                }
                HTML.parse = parse;
            })(HTML = Platform.HTML || (Platform.HTML = {}));
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.HTML.js.map