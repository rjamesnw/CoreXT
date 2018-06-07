module CoreXT.System.Platform {

    /** Contains a series of core CoreXT HTML-based UI elements. Each element extends the GraphNode type. */
    export namespace HTML {
        namespace(() => CoreXT.System.Platform.HTML);
        // ===================================================================================================================

        /** A context is a container that manages a reference to a global script environment. Each new context creates a new 
          * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
          * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
          * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
          */
        export class BrowserContext extends FactoryBase(Context) {
            static 'new'(context: Contexts = Contexts.Secure): IBrowserContext { return null; }

            static init(o: IBrowserContext, isnew: boolean, context: Contexts = Contexts.Secure) {
                this.super.init(o, isnew, context);
            }
        }
        export namespace BrowserContext {
            export class $__type extends FactoryType(Context) {
                private _target: any; // (iframe or worker)
                private _iframe: HTMLIFrameElement;
                private _worker: Worker;
                private _window: IWindow;
                private _global: IStaticGlobals;

                // -----------------------------------------------------------------------------------------------------------------

                _setupIFrame() {
                    this._target = this._iframe = document.createElement("iframe");
                    this._iframe.style.display = "none";
                    this._iframe.src = this._url;
                    global.document.body.appendChild(this._iframe);
                    this._global = <IStaticGlobals>this._iframe.contentWindow;
                }

                _setupWorker() {
                    this._target = this._worker = new Worker(this._url);
                }

                _setupWindow() {
                    this._target = this._window = Window.new(null, this._url);
                }

                // -----------------------------------------------------------------------------------------------------------------

                /** Load a resource (usually a script or page) into this context. */
                load(url: string) {
                    var contextType = this._contextType;

                    switch (Environment) {
                        case Environments.Browser:
                            switch (contextType) {
                                case Contexts.Secure:
                                case Contexts.Unsecure:
                                    this._setupIFrame();
                                    if (Environment == Environments.Browser) {
                                    } else if (Environment == Environments.Browser) {
                                    } else {
                                        this._target = this._worker = new Worker("CoreXT.js");
                                    }
                                    break;
                                case Contexts.SecureWindow:
                                case Contexts.UnsecureWindow:
                                    if (Environment == Environments.Browser) {
                                        this._target = this._iframe = document.createElement("iframe");
                                        this._iframe.style.display = "none";
                                        this._iframe.src = "index.html";
                                        global.document.body.appendChild(this._iframe);
                                        this._global = <IStaticGlobals>this._iframe.contentWindow;
                                    } else if (Environment == Environments.Browser) {
                                    } else {
                                        this._target = this._worker = new Worker("CoreXT.js");
                                    }
                                    break;
                                case Contexts.Local:
                                    this._target = this._global = global;
                                    break;
                            }
                            break;
                    }

                    if (this._contextType == Contexts.Unsecure)
                        url = "/";
                    else
                        this._iframe.src = location.protocol + "//ctx" + (Math.random() * 0x7FFFFF | 0) + "." + location.hostname; // (all sub-domains go to the same location)
                }

                private static [constructor](factory: typeof BrowserContext) {
                    factory.init = (o, isnew) => {
                    };
                }
            }
            BrowserContext.$__register(HTML);
        }

        export interface IBrowserContext extends BrowserContext.$__type { }

        // ====================================================================================================================

        /** Represents the base of a CoreXT UI object of various UI types. The default implementation extends this to implement HTML elements. */
        export class HTMLNode extends FactoryBase(GraphNode) {
            static 'new'(parent: IGraphNode, id?: string, name?: string): IHTMLNode { return null; }

            static init(o: IHTMLNode, isnew: boolean, parent: IGraphNode, id?: string, name?: string) {
                this.super.init(o, isnew, parent);
                if (id !== void 0 && id !== null) o.id = id;
                if (name !== void 0 && name !== null) o.name = name;
            }
        }
        export namespace HTMLNode {
            export class $__type extends FactoryType(GraphNode) {
                // --------------------------------------------------------------------------------------------------------------------------

                id: string;
                name: string;

                /** Represents the HTML element tag to use for this graph item.  The default value is set when a derived graph item is constructed.
                  * Not all objects support this property, and changing it is only valid BEFORE the layout is updated for the first time.
                  */
                tagName = "NODE";

                // --------------------------------------------------------------------------------------------------------------------------

                /** The generated element for this HTMLelement graph node. */
                protected __element: Node = null;

                // --------------------------------------------------------------------------------------------------------------------------

                /** Detaches this GraphItem from the logical graph tree, but does not remove it from the parent's child list.
                 * Only call this function if you plan to manually remove the child from the parent.
                 */
                detach(): this {
                    if (this.__parent && (<IHTMLNode>this.__parent).__element && this.__element)
                        (<IHTMLNode>this.__parent).__element.removeChild(this.__element);
                    return super.detach();
                }

                onRedraw(recursive: boolean = true) {
                    super.onRedraw(recursive);
                }

                /** Changes the type of element to create (if supported by the derived type), and returns the underlying graph instance.
                   * Changing this after a layout pass has already created elements will cause the existing element for this graph item to be deleted and replaced.
                   * WARNING: This is not supported by all derived types, and calling this AFTER a layout pass has created elements for those unsupported types may have no effect.
                   * For example, the UI 'PlaneText' graph item overrides 'createUIElement()' to return a node created from 'document.createTextNode()', 
                   * and calling 'setHTMLTag("span")' will have no effect before OR after the first layout pass (this element will always be a text node).
                   * Some derived types that override 'createUIElement()' my provide special logic to accept only supported types.
                   */
                setHTMLTag(htmlTag: string): this {
                    this.tagName = htmlTag;
                    // .. if an element already exists, replace it if the tag is different ...
                    if (this.__element != null && this.__element.nodeName != this.tagName) {
                        this.updateLayout();
                    }
                    return this;
                }

                /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate supported element types. */
                assertSupportedElementTypes(...args: string[]) {
                    this.tagName = (this.tagName || "").toLowerCase();
                    //??args = <string[]><any>arguments;
                    if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length) args = <string[]><any>args[0];
                    for (var i = 0; i < args.length; i++)
                        if (this.tagName == args[i]) return true;
                    throw Exception.from("The element type '" + this.tagName + "' is not supported for this GraphItem type.");
                }

                /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate unsupported element types. */
                assertUnsupportedElementTypes(...args: string[]) {
                    this.tagName = (this.tagName || "").toLowerCase();
                    //??args = <string[]><any>arguments;
                    if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length) args = <string[]><any>args[0];
                    for (var i = 0; i < args.length; i++)
                        if (this.tagName == args[i])
                            throw Exception.from("The element type '" + this.tagName + "' is not supported for this GraphItem type.");
                }

                // ----------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof HTMLNode) {
                    //factory.init = (o, isnew) => {
                    //};
                }
            }
            HTMLNode.$__register(HTML);
        }

        export interface IHTMLNode extends HTMLNode.$__type { }

        // ===================================================================================================================

        /** Represents an HTML node graph item that renders the content in the 'innerHTML of the default '__htmlTag' element (which is set to 'GraphItem.defaultHTMLTag' [DIV] initially).
          * This object has no element restrictions, so you can create any element you need by setting the '__htmlTag' tag before the UI element gets created.
          */
        export class HTMLElement extends FactoryBase(HTMLNode) {
            static 'new'<TName extends keyof HTMLElementTagNameMap = 'div', TElement extends HTMLElementTagNameMap[TName]= HTMLDivElement>(parent: IGraphNode, id?: string, name?: string, tagName: TName = <any>"div", html?: string): IHTMLElement<TElement> { return null; }

            /** Each new graph item instance will initially set its '__htmlTag' property to this value. */
            static defaultHTMLTagName: string = "div";

            static init<TName extends keyof HTMLElementTagNameMap = 'div', TElement extends HTMLElementTagNameMap[TName]= HTMLDivElement>
                (o: IHTMLElement<TElement>, isnew: boolean, parent: IGraphNode, id?: string, name?: string, tagName: TName = <any>HTMLElement.defaultHTMLTagName, html?: string) {
                this.super.init(o, isnew, parent, id, name);
                o.tagName = tagName;
                o.set("innerHTML", html);
                o.getProperty(HTMLElement.InnerHTML).registerListener((property: IProperty, initialValue: boolean): void => {
                    if (!initialValue || !o.__children.length) {
                        if (o.__children.length)
                            o.removeAllChildren();
                        try { o['__htmlElement'].innerHTML = property.getValue(); }
                        catch (ex) { /*(setting inner HTML/text is not supported on this element [eg. <img> tags])*/ }
                    }
                });
            }

            // ----------------------------------------------------------------------------------------------------------------

            /* When extending 'GraphItem' with additional observable properties, it is considered good practice to create a
                     * static type with a list of possible vales that can be set by end users (to promote code completion mechanisms).
             */

            static ID: IStaticProperty = GraphNode.registerProperty(HTMLElement, "id");
            static Name: IStaticProperty = GraphNode.registerProperty(HTMLElement, "name");
            static Class: IStaticProperty = GraphNode.registerProperty(HTMLElement, "class", true);
            static Style: IStaticProperty = GraphNode.registerProperty(HTMLElement, "style", true);
            static InnerHTML: IStaticProperty = GraphNode.registerProperty(HTMLElement, "innerHTML", true);

            /*
              * (Note: This static property registration also updates the internal '__UIProeprties' static list with UI-specific
              * properties (that will trigger redraw events). Derived types should update this to their own values)
              */
        }
        export namespace HTMLElement {
            export class $__type<TElement extends NativeTypes.IHTMLElement = NativeTypes.IHTMLElement> extends FactoryType(HTMLNode) {
                // ----------------------------------------------------------------------------------------------------------------

                class: string; // (auto generated getter/setter based on static property) //x = GraphNode.accessor($UIElement.Class);
                style: string;
                innerHTML: string;

                protected get __htmlElement(): TElement { return <TElement>this.__element; }

                /** Sets a value on this HTML element object and returns the element (to allow chaining calls). If a DOM element is also
                  * associated it's attributes are updated with the specified value.
                  */
                set<N extends keyof TElement, V extends TElement[N]>(name: N, value: V): this {
                    return this.setValue(<string>name, value); // (triggers '_onPropertyValueSet()' in this class, which will update the attributes)
                }

                /** 
                  * Gets a value on this HTML element object. Any associated DOM element is ignored if 'tryElement' is false (the default,
                  * which means only local values are returned). Set 'tryElement' to true to always read from the DOM element first, then
                  * fallback to reading locally.
                  * 
                  * Local value reading is always the default because of possible DOM-to-JS bridge performance issues.
                  * For more information you can:
                  *   * See this book: https://goo.gl/DWKhJc (page 36 [Chapter 3])
                  *   * Read this article: https://calendar.perfplanet.com/2009/dom-access-optimization/
                  */
                get<N extends keyof TElement, V extends TElement[N]>(name: N, tryElement = false): V {
                    if (tryElement && this.__htmlElement) {
                        var attr = this.__htmlElement.attributes.getNamedItem(<string>name);
                        if (attr) return <any>attr.value;
                    }
                    return this.getValue(<string>name);
                }

                // ----------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof HTMLElement) {
                    //factory.init = (o, isnew) => {
                    //};
                }
            }
            HTMLElement.$__register(HTML);
        }

        export interface IHTMLElement<TElement extends InstanceType<typeof global.HTMLElement> = InstanceType<typeof global.HTMLElement>>
            extends HTMLElement.$__type<TElement> { }

        // ===================================================================================================================

        ///** Represents a basic anchor node graph item that renders a link. */
        //class $Anchor extends HTMLElement.$__type<HTMLAnchorElement> {
        //    // ----------------------------------------------------------------------------------------------------------------

        //    static HRef: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "href");
        //    static HRefLang: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "hreflang");
        //    static Type: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "type");
        //    static Rel: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "rel");
        //    //static Rev: IStaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "rev"); (not supported in HTML5)
        //    //static CharSet: IStaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "charset"); (not supported in HTML5)
        //    static Target: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "target");

        //    // ----------------------------------------------------------------------------------------------------------------

        //    href: string;
        //    hreflang: string;
        //    type: string;
        //    rel: string;
        //    //rev: (rev?: string) => string = GraphItem.accessor(Anchor.Rev);
        //    //charset: (charset?: string) => string = GraphItem.accessor(Anchor.CharSet);
        //    target: string;

        //    // ----------------------------------------------------------------------------------------------------------------

        //    protected static readonly '$Anchor Factory' = class Factory extends FactoryBase($Anchor, base['$HTMLElement Factory']) implements IFactory {
        //        'new'(parent: IGraphNode, name: string = "", href: string = "", html: string = ""): InstanceType<typeof Factory.$__type> { return null; }

        //        init(o: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: IGraphNode, name: string = "", href: string = "", html: string = "") {
        //            this.super.init($this, isnew, parent, "a", html);
        //            o.name = name;
        //            o.href = href;
        //            return o;
        //        }
        //    };

        //    // ----------------------------------------------------------------------------------------------------------------

        //    createUIElement(): Node {
        //        this.assertSupportedElementTypes("a");
        //        return super.createUIElement();
        //    }

        //    // ----------------------------------------------------------------------------------------------------------------

        //    onRedraw(recursive: boolean = true) {
        //        super.onRedraw(recursive);
        //    }

        //    // ----------------------------------------------------------------------------------------------------------------
        //}

        //export interface IAnchor extends $Anchor { }
        //export var Anchor = $Anchor['$Anchor Factory'].$__type;

        // ===================================================================================================================

        /** 
          * Represents a basic text node graph item that renders plain text (no HTML). For HTML use 'HTMLText'.
          * This is inline with the standard which declares that all DOM elements with text should have text-ONLY nodes.
          */
        export class PlainText extends FactoryBase(HTMLNode) {
            static 'new'(parent: IGraphNode, text: string = ""): IPlainText { return null; }

            static init(o: IPlainText, isnew: boolean, parent: IGraphNode, text: string = "") { }

            // -------------------------------------------------------------------------------------------------------------------------------

            static Text: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>PlainText, "text", true);

            // -------------------------------------------------------------------------------------------------------------------------------
        }
        export namespace PlainText {
            export class $__type extends FactoryType(HTMLNode) { // (https://developer.mozilla.org/en-US/docs/Web/API/Text)
                // --------------------------------------------------------------------------------------------------------------------------

                text: (text?: string) => string = GraphNode.accessor(PlainText.Text);

                // --------------------------------------------------------------------------------------------------------------------------

                createUIElement(): Node {
                    this.assertSupportedElementTypes("", "Text");
                    return document.createTextNode("");
                }

                // --------------------------------------------------------------------------------------------------------------------------

                onRedraw(recursive: boolean = true) {
                    super.onRedraw(recursive);
                }

                // --------------------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof PlainText) {
                    factory.init = (o: $__type, isnew, parent, text) => {
                        factory.super.init(o, isnew, parent);
                        o.text(text);
                        o.tagName = "";
                        o.getProperty(PlainText.Text).registerListener((property: IProperty, initialValue: boolean): void => {
                            (<Text>o.__element).data = property.getValue();
                        });
                    };
                }
            }
            PlainText.$__register(HTML);
        }

        export interface IPlainText extends PlainText.$__type { }

        // ====================================================================================================================================

        /** Represents an HTML text node graph item that renders the content in the 'innerHTML of a SPAN element. For plain text nodes use 'PlainText'.
          */
        export class HTMLText extends FactoryBase(HTMLElement) {
            static 'new'(parent: IGraphNode, html: string = ""): IHTMLText { return null; }

            static init(o: IHTMLText, isnew: boolean, parent: IGraphNode, html: string = "") {
                this.super.init(o, isnew, parent, html, void 0, 'span');
            }
        }
        export namespace HTMLText {
            export class $__type extends FactoryType(HTMLElement)<HTMLSpanElement> {
                // ----------------------------------------------------------------------------------------------------------------

                createUIElement(): Node {
                    this.assertUnsupportedElementTypes("html", "head", "body", "script", "audio", "canvas", "object");
                    return super.createUIElement();
                }

                // ----------------------------------------------------------------------------------------------------------------

                onRedraw(recursive: boolean = true) {
                    super.onRedraw(recursive);
                }

                // ----------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof HTMLText) {
                    //factory.init = (o, isnew) => {
                    //};
                }
            }
            HTMLText.$__register(HTML);
        }

        export interface IHTMLText extends HTMLText.$__type { }

        // ===================================================================================================================

        /** A list of text mark-up flags for use with phrase based elements. */
        export enum PhraseTypes {
            /** Indicates emphasis. */
            Emphasis = 1,
            /** Indicates stronger emphasis. */
            Strong = 2,
            /** Contains a citation or a reference to other sources. */
            Cite = 4,
            /** Indicates that this is the defining instance of the enclosed term. */
            Defining = 8,
            /** Designates a fragment of computer code. */
            Code = 16,
            /** Designates sample output from programs, scripts, etc. */
            Sample = 32,
            /** Indicates text to be entered by the user. */
            Keyboard = 64,
            /** Indicates an instance of a variable or program argument. */
            Variable = 128,
            /** Indicates an abbreviated form (Example: WWW, HTTP, URI, AI, e.g., ex., etc., ...). */
            Abbreviation = 256,
            /** Indicates an acronym (Example: WAC, radar, NASA, laser, sonar, ...). */
            Acronym = 512
        }

        /** Represents a basic phrase node graph item that renders phrase elements (a term used by w3.org to describe adding
          * "structural information to text fragments").  This is basically just text formatting in most cases. 
          * It's important to note the word "structural" here, as it is a suggestion on how to process text, but, unlike CSS,
          * it does not dictate exactly HOW the text will actually look like. For instance, "<STRONG>" tags usually render as
          * bold text, but someone can decide to color and increase font size instead using CSS for all such elements. This is
          * actually a good thing, as it allows flexible web design in a way that can allow applying themes at a later time. */
        export class Phrase extends FactoryBase(HTMLElement) {
            static 'new'(parent: IGraphNode, phraseTypeFlags: PhraseTypes = 0, html: string = ""): IPhrase { return null; }

            static init(o: IPhrase, isnew: boolean, parent: IGraphNode, phraseTypeFlags: PhraseTypes = 0, html: string = "") {
                this.super.init<any, any>(o, isnew, parent, html);
                o.phraseType(phraseTypeFlags);
                var pInfo: IProperty = o.getProperty(HTMLElement.InnerHTML);
                pInfo.registerFilter(o.createPhrase);
            }

            static PhraseType: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Phrase, "phraseType", true);
        }
        export namespace Phrase {
            export class $__type extends FactoryType(HTMLElement) {
                // ----------------------------------------------------------------------------------------------------------------

                phraseType: (phraseType?: PhraseTypes) => PhraseTypes = GraphNode.accessor(Phrase.PhraseType);

                // ----------------------------------------------------------------------------------------------------------------

                createUIElement(): Node {
                    return super.createUIElement();
                }

                // ----------------------------------------------------------------------------------------------------------------

                createPhrase(property: IProperty, value: any): any {
                    var leftTags = "", rightTags = "", phraseType = this.phraseType();
                    if ((phraseType & PhraseTypes.Emphasis) > 0) { leftTags = "<em>" + leftTags; rightTags += "</em>"; }
                    if ((phraseType & PhraseTypes.Strong) > 0) { leftTags = "<strong>" + leftTags; rightTags += "</strong>"; }
                    if ((phraseType & PhraseTypes.Cite) > 0) { leftTags = "<cite>" + leftTags; rightTags += "</cite>"; }
                    if ((phraseType & PhraseTypes.Defining) > 0) { leftTags = "<dfn>" + leftTags; rightTags += "</dfn>"; }
                    if ((phraseType & PhraseTypes.Code) > 0) { leftTags = "<code>" + leftTags; rightTags += "</code>"; }
                    if ((phraseType & PhraseTypes.Sample) > 0) { leftTags = "<samp>" + leftTags; rightTags += "</samp>"; }
                    if ((phraseType & PhraseTypes.Keyboard) > 0) { leftTags = "<kbd>" + leftTags; rightTags += "</kbd>"; }
                    if ((phraseType & PhraseTypes.Variable) > 0) { leftTags = "<var>" + leftTags; rightTags += "</var>"; }
                    if ((phraseType & PhraseTypes.Abbreviation) > 0) { leftTags = "<abbr>" + leftTags; rightTags += "</abbr>"; }
                    if ((phraseType & PhraseTypes.Acronym) > 0) { leftTags = "<acronym>" + leftTags; rightTags += "</acronym>"; }
                    return leftTags + value + rightTags;
                }

                // ----------------------------------------------------------------------------------------------------------------

                onRedraw(recursive: boolean = true) {
                    super.onRedraw(recursive); // (note: the innerHTML property will have been updated after this call to the 'html' property)
                }

                // ----------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof Phrase) {
                    //factory.init = (o, isnew) => {
                    //};
                }
            }
            Phrase.$__register(HTML);
        }

        export interface IPhrase extends Phrase.$__type { }

        // ===================================================================================================================

        /** Represents an HTML header element. 
          */
        export class Header extends FactoryBase(HTMLElement) {
            static 'new'(parent: IGraphNode, headerLevel: number = 1, html: string = ""): IHeader { return null; }

            static init(o: IHeader, isnew: boolean, parent: IGraphNode, headerLevel: number = 1, html: string = "") {
                this.super.init<any, any>(o, isnew, parent, html);
                if (headerLevel < 1 || headerLevel > 6)
                    throw Exception.from("HTML only supports header levels 1 through 6.");
                o.setValue(Header.HeaderLevel, headerLevel);
            }

            static HeaderLevel: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Header, "headerLevel", true);
        }
        export namespace Header {
            export class $__type extends FactoryType(HTMLElement) {
                // ----------------------------------------------------------------------------------------------------------------

                headerLevel: (headerLevel?: number) => number = GraphNode.accessor(Header.HeaderLevel);

                // ----------------------------------------------------------------------------------------------------------------

                createUIElement(): Node {
                    var headerLevel = this.getValue(Header.HeaderLevel);
                    if (headerLevel < 1 || headerLevel > 6)
                        throw Exception.from("HTML only supports header levels 1 through 6.");
                    this.tagName = "h" + headerLevel;
                    this.assertSupportedElementTypes("h1", "h2", "h3", "h4", "h5", "h6");
                    return super.createUIElement();
                }

                // ----------------------------------------------------------------------------------------------------------------

                onRedraw(recursive: boolean = true) {
                    super.onRedraw(recursive);
                }

                // ----------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof Header) {
                    factory.init = (o, isnew) => {
                    };
                }
            }
            Header.$__register(HTML);
        }
        export interface IHeader extends Header.$__type { }

        // ===================================================================================================================

        //x /** Represents a row on a table type in Bootstrap. */
        //x export class Table extends Factory(HTMLNode) {
        //    // ----------------------------------------------------------------------------------------------------------------

        //    constructor(parent: IGraphNode) {
        //        super(parent);
        //        this.htmlTag = "table";
        //    }

        //    // ----------------------------------------------------------------------------------------------------------------

        //    createUIElement(): Node {
        //        this.assertSupportedElementTypes("table");
        //        return super.createUIElement();
        //    }

        //    // ----------------------------------------------------------------------------------------------------------------
        //}

        //// =====================================================================================================================================

        ///** Represents a row on a table type in Bootstrap. */
        // export class TableRow extends Factory(HTMLNode) {
        //    // -------------------------------------------------------------------------------------------------------------------------------

        //    constructor(parent: IGraphNode) {
        //        super(parent);
        //        this.htmlTag = "tr";
        //    }

        //    // -------------------------------------------------------------------------------------------------------------------------------

        //    createUIElement(): Node {
        //        this.assertSupportedElementTypes("tr");
        //        return super.createUIElement();
        //    }

        //    // -------------------------------------------------------------------------------------------------------------------------------
        //}

        //// =====================================================================================================================================

        ///** Represents a row on a table type in Bootstrap. */
        //export class TableColumn extends Factory(HTMLNode) {
        //    // -------------------------------------------------------------------------------------------------------------------------------

        //    constructor(parent: IGraphNode) {
        //        super(parent);
        //        this.htmlTag = "td";
        //    }

        //    // -------------------------------------------------------------------------------------------------------------------------------

        //    createUIElement(): Node {
        //        this.assertSupportedElementTypes("td");
        //        return super.createUIElement();
        //    }

        //    // -------------------------------------------------------------------------------------------------------------------------------
        //}

        //// =====================================================================================================================================

        ///** Represents a row on a table type in Bootstrap. */
        //export class TableHeader extends Factory(HTMLNode) {
        //    // -------------------------------------------------------------------------------------------------------------------------------

        //    constructor(parent: IGraphNode) {
        //        super(parent);
        //        this.htmlTag = "th";
        //    }

        //    // -------------------------------------------------------------------------------------------------------------------------------

        //    createUIElement(): Node {
        //        this.assertSupportedElementTypes("th");
        //        return super.createUIElement();
        //    }

        //    // -------------------------------------------------------------------------------------------------------------------------------
        //}

        // =====================================================================================================================================

        /** Data template information as extracted from HTML template text. */
        export interface IDataTemplate {
            id: string;
            originalHTML: string;
            templateHTML: string;
            templateItem: IGraphNode;
            childTemplates: IDataTemplate[];
        }

        // =====================================================================================================================================

        /** Parses HTML to create a graph object tree, and also returns any templates found.
        * This concept is similar to using XAML to load objects in WPF. As such, you have the option to use an HTML template, or dynamically build your
        * graph items directly in code.
        * 
        * Warning about inline scripts: Script tags may be executed client side (naturally by the DOM), but you cannot rely on them server side.  Try to use
        * HTML for UI DESIGN ONLY.  Expect that any code you place in the HTML will not execute server side (or client side for that matter) unless you
        * handle/execute the script code yourself.
        * @param {string} html The HTML to parse.
        * @param {boolean} strictMode If true, then the parser will produce errors on ill-formed HTML (eg. 'attribute=' with no value).
        * This can greatly help keep your html clean, AND identify possible areas of page errors.  If strict formatting is not important, pass in false.
        */
        export function parse(html: string = null, strictMode?: boolean): { rootElements: IGraphNode[]; templates: { [id: string]: IDataTemplate; } } {
            var log = Diagnostics.log(HTML, "Parsing HTML template ...").beginCapture();
            log.write("Template: " + html);

            if (!html) return null;

            // ... parsing is done by passing each new graph item the current scan position in a recursive pattern, until the end of the HTML text is found ...
            var htmlReader = Markup.HTMLReader.new(html);
            if (strictMode !== void 0)
                htmlReader.strictMode = !!strictMode;

            var approotID: string;
            var mode: number = 0; // (0 = app scope not found yet, 1 = app root found, begin parsing application scope elements, 2 = creating objects)
            var classMatch = /^[$.][A-Za-z0-9_$]*(\.[A-Za-z0-9_$]*)*(\s+|$)/;
            var attribName: string;

            var storeRunningText = (parent: IGraphNode) => {
                if (htmlReader.runningText) { // (if there is running text, then create a text node for it under the given parent node)
                    //?if (!host.isClient())
                    //?    HTMLElement.new(parent).setValue((htmlReader.runningText.indexOf('&') < 0 ? "text" : "html"), htmlReader.runningText); // (not for the UI, so doesn't matter)
                    //?else
                    if (htmlReader.runningText.indexOf('&') < 0)
                        PlainText.new(parent, htmlReader.runningText);
                    else
                        HTMLText.new(parent, htmlReader.runningText);
                }
            };

            var rootElements: IGraphNode[] = [];
            var globalTemplatesReference: { [id: string]: IDataTemplate; } = {};

            type TNodeFactoryType = { new: (parent: IGraphNode, ...args: any[]) => IHTMLNode };

            var processTags = (parent: IGraphNode): IDataTemplate[] => { // (returns the data templates found for the immediate children only)
                var graphItemType: string, graphItemTypePrefix: string;
                var nodeType: TNodeFactoryType;
                var nodeItem: IHTMLNode;
                var properties: {};
                var currentTagName: string;
                var isDataTemplate: boolean = false, dataTemplateID: string, dataTemplateHTML: string;
                var tagStartIndex: number, lastTemplateIndex: number;
                var templateInfo: IDataTemplate;
                var templates: IDataTemplate[] = null;
                var immediateChildTemplates: IDataTemplate[] = null;

                while (htmlReader.readMode != Markup.HTMLReaderModes.End) {

                    currentTagName = htmlReader.tagName;

                    if (!htmlReader.isMarkupDeclaration() && !htmlReader.isCommentBlock() && !htmlReader.isScriptBlock() && !htmlReader.isStyleBlock()) {

                        if (currentTagName == "html") {

                            // (The application root is a specification for the root of the WHOLE application, which is typically the body.  The developer should
                            // specify the element ID for the root element in the 'data--approot' attribute of the <html> tag. [eg: <html data--approot='main'> ... <body id='main'>...]\
                            // By default the app root will assume the body tag if not specified.)

                            if (approotID === void 0)
                                approotID = null; // (null flags that an HTML tag was found)

                            if (htmlReader.attributeName == "data-approot" || htmlReader.attributeName == "data--approot") {
                                approotID = htmlReader.attributeValue;
                            }
                        }
                        else {
                            // (note: app root starts at the body by default, unless a root element ID is given in the HTML tag before hand)

                            if (htmlReader.readMode == Markup.HTMLReaderModes.Attribute) {

                                // ... templates are stripped out for usage later ...

                                if (!isDataTemplate && htmlReader.attributeName == "data--template") {
                                    isDataTemplate = true; // (will add to the template list instead of the final result)
                                    dataTemplateID = htmlReader.attributeValue;
                                }

                                attribName = (htmlReader.attributeName.substring(0, 6) != "data--") ? htmlReader.attributeName : htmlReader.attributeName.substring(6);
                                properties[attribName] = htmlReader.attributeValue;

                                if (htmlReader.attributeName == "id" && htmlReader.attributeValue == approotID && mode == 0)
                                    mode = 1;
                            }
                            else {
                                if (mode == 2 && htmlReader.readMode == Markup.HTMLReaderModes.Tag && htmlReader.isClosingTag()) { // (this an ending tag (i.e. "</...>"))
                                    // (this end tag should be the "closure" to the recently created graph item sibling, which then sets 'graphiItem' to null, but if
                                    // it's already null, the end tag should be handled by the parent level (so if the parent tag finds it's own end tag, then we know
                                    // there's a problem); also, if the closing tag name is different (usually due to ill-formatted HTML [allowed only on parser override],
                                    // or auto-closing tags, like '<img>'), assume closure of the previous tag and let the parent handle it)
                                    if (nodeItem) {
                                        storeRunningText(nodeItem);

                                        if (isDataTemplate) {
                                            dataTemplateHTML = htmlReader.getHTML().substring(tagStartIndex, htmlReader.textEndIndex) + ">";
                                            templateInfo = { id: dataTemplateID, originalHTML: dataTemplateHTML, templateHTML: undefined, templateItem: nodeItem, childTemplates: immediateChildTemplates };
                                            // (note: if there are immediate child templates, remove them from the current template text)
                                            if (immediateChildTemplates)
                                                for (var i = 0, n = immediateChildTemplates.length; i < n; i++)  // TODO: The following can be optimized better (use start/end indexes).
                                                    dataTemplateHTML = dataTemplateHTML.replace(immediateChildTemplates[i].originalHTML, "<!--{{" + immediateChildTemplates[i].id + "Items}}-->");
                                            templateInfo.templateHTML = dataTemplateHTML;
                                            globalTemplatesReference[dataTemplateID] = templateInfo; // (all templates are recorded in application scope, so IDs must be unique, otherwise they will override previous ones)
                                            if (!templates) templates = [];
                                            templates.push(templateInfo);
                                            isDataTemplate = false;
                                        }

                                        if (htmlReader.tagName != nodeItem.tagName)
                                            return templates; // (note: in ill-formatted html [optional feature of the parser], make sure the closing tag name is correct, else perform an "auto close and return")

                                        nodeType = null;
                                        nodeItem = null;
                                        immediateChildTemplates = null;
                                    }
                                    else return templates; // (return if this closing tag doesn't match the last opening tag read, so let the parent level handle it)
                                }
                                else if (mode == 2 && htmlReader.readMode == Markup.HTMLReaderModes.EndOfTag) { // (end of attributes, so create the tag graph item)

                                    // ... this is either the end of the tag with inner html/text, or a self ending tag (XML style) ...

                                    graphItemType = properties['class']; // (this may hold an explicit object type to create [note expected format: module.full.name.classname])
                                    nodeItem = null;
                                    nodeType = null;

                                    if (graphItemType && classMatch.test(graphItemType)) {
                                        graphItemTypePrefix = RegExp.lastMatch.substring(0, 1); // ('$' [DS full type name prefix], or '.' [default UI type name])

                                        if (graphItemTypePrefix == '$') {
                                            graphItemType = RegExp.lastMatch.substring(1);
                                            if (graphItemType.charAt(0) == '.') // (just in case there's a '.' after '$', allow this as well)
                                                graphItemTypePrefix = '.';
                                        } else
                                            graphItemType = RegExp.lastMatch; // (type is either a full type, or starts with '.' [relative])

                                        if (graphItemTypePrefix == '.')
                                            graphItemType = "DreamSpace.System.UI" + graphItemType;

                                        var graphFactory = GraphNode['GraphNodeFactory'];
                                        nodeType = <TNodeFactoryType>Utilities.dereferencePropertyPath(Scripts.translateModuleTypeName(graphItemType), (<ITypeInfo>CoreXT).$__parent);

                                        if (nodeType === void 0)
                                            throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " was not found.");

                                        if (typeof nodeType !== 'function' || typeof HTMLElement.defaultHTMLTagName === void 0)
                                            throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " does not resolve to a GraphItem class type.");
                                    }

                                    if (nodeType == null) {
                                        // ... auto detect the CoreXT UI GraphNode type based on the tag name (all valid HTML4/5 tags: http://www.w3schools.com/tags/) ...
                                        switch (currentTagName) {
                                            // (phrases)
                                            case 'abbr': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Abbreviation; break;
                                            case 'acronym': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Acronym; break;
                                            case 'em': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Emphasis; break;
                                            case 'strong': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Strong; break;
                                            case 'cite': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Cite; break;
                                            case 'dfn': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Defining; break;
                                            case 'code': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Code; break;
                                            case 'samp': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Sample; break;
                                            case 'kbd': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Keyboard; break;
                                            case 'var': nodeType = Phrase; properties[Phrase.PhraseType.name] = PhraseTypes.Variable; break;

                                            // (headers)
                                            case 'h1': nodeType = Header; properties[Header.HeaderLevel.name] = 1; break;
                                            case 'h2': nodeType = Header; properties[Header.HeaderLevel.name] = 2; break;
                                            case 'h3': nodeType = Header; properties[Header.HeaderLevel.name] = 3; break;
                                            case 'h4': nodeType = Header; properties[Header.HeaderLevel.name] = 4; break;
                                            case 'h5': nodeType = Header; properties[Header.HeaderLevel.name] = 5; break;
                                            case 'h6': nodeType = Header; properties[Header.HeaderLevel.name] = 6; break;

                                            default: nodeType = HTMLElement; // (just create a basic object to use with htmlReader.tagName)
                                        }
                                    }

                                    if (!nodeItem) { // (only create if not explicitly created)
                                        nodeItem = nodeType.new(isDataTemplate ? null : parent);
                                    }

                                    for (var pname in properties)
                                        nodeItem.setValue(pname, properties[pname], true);

                                    nodeItem.tagName = currentTagName;

                                    // ... some tags are not allowed to have children (and don't have to have closing tags, so null the graph item and type now)...
                                    switch (currentTagName) {
                                        case "area": case "base": case "br": case "col": case "command": case "embed": case "hr": case "img": case "input":
                                        case "keygen": case "link": case "meta": case "param": case "source": case "track": case "wbr":
                                            nodeItem = null;
                                            nodeType = null;
                                    }

                                    if (parent === null)
                                        rootElements.push(nodeItem);
                                }
                                else if (htmlReader.readMode == Markup.HTMLReaderModes.Tag) {
                                    if (mode == 1) mode = 2; // (begin creating on this tag that is AFTER the root app tag [i.e. since root is the "application" object itself])

                                    if (!nodeItem) {
                                        // ... no current 'graphItem' being worked on, so assume start of a new sibling tag (to be placed under the current parent) ...
                                        properties = {};
                                        tagStartIndex = htmlReader.textEndIndex; // (the text end index is the start of the next tag [html text sits between tags])
                                        if (mode == 2)
                                            storeRunningText(parent);
                                    } else if (mode == 2) {
                                        // (note: each function call deals with a single nested level, and if a tag is not closed upon reading another, 'processTag' is called again because there may be many other nested tags before it can be closed)
                                        immediateChildTemplates = processTags(nodeItem); // ('graphItem' was just created for the last tag read, but the end tag is still yet to be read)
                                        // (the previous call will continue until an end tag is found, in which case it returns that tag to be handled by this parent level)
                                        if (htmlReader.tagName != nodeItem.tagName) // (the previous level should be parsed now, and the current tag should be an end tag that doesn't match anything in the immediate nested level, which should be the end tag for this parent tag)
                                            throw Exception.from("The closing tag '</" + htmlReader.tagName + ">' was unexpected for current tag '<" + nodeItem.tagName + ">' on line " + htmlReader.getCurrentLineNumber() + ".");
                                        continue; // (need to continue on the last item read before returning)
                                    }

                                    if (currentTagName == "body" && !approotID)
                                        mode = 1; // (body was found, and the 'approotid' attribute was not specified, so assume body as the application's root element)
                                }
                            }
                        }
                    }

                    htmlReader.readNext();
                }

                return templates;
            };

            htmlReader.readNext(); // (move to the first item)
            processTags(null);

            log.write("HTML template parsing complete.").endCapture();

            return { rootElements: rootElements, templates: globalTemplatesReference };
        }

        // ===================================================================================================================
    }

}
