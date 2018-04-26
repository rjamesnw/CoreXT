module CoreXT.System.Platform {

    /** Contains a series of core CoreXT HTML-based UI elements. Each element extends the GraphNode type. */
    export namespace HTML {
        registerNamespace(CoreXT, "System", "Platform", "HTML")
        // ===================================================================================================================

        /** A context is a container that manages a reference to a global script environment. Each new context creates a new 
        * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
        * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
        * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
        */
        class $BrowserContext extends Context.$__type {
            private _target: any; // (iframe or worker)
            private _iframe: HTMLIFrameElement;
            private _worker: Worker;
            private _window: IWindow;
            private _global: IStaticGlobals;

            // -----------------------------------------------------------------------------------------------------------------

            protected static '$BrowserContext Factory' = class Factory extends FactoryBase($BrowserContext, $BrowserContext['$Context Factory']) implements IFactory {
                'new'(context: Contexts = Contexts.Secure): $BrowserContext { return null; }

                init($this: $BrowserContext, isnew: boolean, context: Contexts = Contexts.Secure): $BrowserContext {
                    this.$__baseFactory.init($this, isnew, context);
                    return $this;
                }
            }.register();

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
        }

        export interface IBrowserContext extends $BrowserContext { }
        export var BrowserContext = $BrowserContext['$BrowserContext Factory'].$__type;

        // ====================================================================================================================
        class $UIElement extends GraphNode.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            /** When extending 'GraphItem' with additional observable properties, it is considered good practice to create a
            * static type with a list of possible vales that can be set by end users (to promote code completion mechanisms).
            */
            static ID: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$UIElement, "id");
            static Name: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$UIElement, "name");
            /**
            * (Note: This static property registration also updates the internal '__UIProeprties' static list with UI-specific
            * properties (that will trigger redraw events). Derived types should update this to their own values)
            */

            // ----------------------------------------------------------------------------------------------------------------

            id: (id?: string) => string = GraphNode.accessor($UIElement.ID);
            name: (name?: string) => string = GraphNode.accessor($UIElement.Name);

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$UIElement Factory' = class Factory extends FactoryBase($UIElement, $UIElement['$GraphNode Factory']) implements IFactory {
                'new'(node: IGraphNode): InstanceType<typeof Factory.$__type> { return null; }

                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, node: IGraphNode): InstanceType<typeof Factory.$__type> {
                    this.$__baseFactory.init($this, isnew);
                    $this.node = node;
                    return $this;
                }
            }.register();

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IUIElement extends $UIElement { }
        /** Represents the base of a CoreXT UI object of various UI types. The default implementation extends this to implement HTML elements. */
        export var UIElement = $UIElement['$UIElement Factory'].$__type;

        // ===================================================================================================================

        /** Represents an HTML node graph item that renders the content in the 'innerHTML of the default '__htmlTag' element (which is set to 'GraphItem.defaultHTMLTag' [DIV] initially).
        * This object has no element restrictions, so you can create any element you need by setting the '__htmlTag' tag before the UI element gets created.
        */
        class $HTMLElement<TElement extends InstanceType<typeof global.HTMLElement> = InstanceType<typeof global.HTMLElement>> extends UIElement.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            static Class: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$HTMLElement, "class", true);
            static Style: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$HTMLElement, "style", true);
            static HTML: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$HTMLElement, "html", true);

            /** Each new graph item instance will initially set its '__htmlTag' property to this value. */
            static defaultHTMLTag: string = "div";

            // ----------------------------------------------------------------------------------------------------------------

            class: string; // (auto generated getter/setter based on static property) //x = GraphNode.accessor($UIElement.Class);
            style: string; // (auto generated getter/setter based on static property) //x = GraphNode.accessor($UIElement.Style);
            html: string; // (auto generated getter/setter based on static property) //x = GraphNode.accessor($HTMLElement.HTML);

            /** Sets a value on this HTML element object and returns the element (to allow chaining calls). If a DOM element is also associated it's attributes are updated with the specified value. */
            set<N extends keyof TElement, V extends TElement[N]>(name: N, value: V): this {
                return this.setValue(name, value); // (triggers '_onPropertyValueSet()' in this class, which will update the attributes)
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
                    var attr = this.__htmlElement.attributes.getNamedItem(name);
                    if (attr) return attr.value;
                }
                return this.getValue(name);
            }

            // ----------------------------------------------------------------------------------------------------------------

            /** Represents the HTML element tag to use for this graph item.  The default value is set when a derived graph item is constructed.
            * Not all objects support this property, and changing it is only valid BEFORE the layout is updated for the first time.
            */
            tagName: string = $GraphNode.defaultHTMLTag; // (warning: this may already be set from parsing an HTML template)
            protected __element: Node = null;
            protected __htmlElement: TElement = null;

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$HTMLElement Factory' = class Factory extends FactoryBase($HTMLElement, $HTMLElement['$UIElement Factory']) implements IFactory {
                'new'<TName extends keyof HTMLElementTagNameMap, TElement extends HTMLElementTagNameMap[TName]>(parent: GraphNode, tagName: TName = "div", html?: string): $HTMLElement<TElement> { return null; }

                init<TName extends keyof HTMLElementTagNameMap, TElement extends HTMLElementTagNameMap[TName]>($this: $HTMLElement<TElement>, isnew: boolean, parent: IGraphNode, tagName: TName = "div", html?: string): $HTMLElement<TElement> {
                    this.$__baseFactory.init($this, isnew, parent);
                    this.htmlTag = tagName;
                    $this.set(<keyof HTMLDivElement>"innerHTML", html);
                    $this.getProperty($HTMLElement.HTML).registerListener((property: Property, initialValue: boolean): void => {
                        if (!initialValue || !$this.__children.length) {
                            if ($this.__children.length)
                                $this.removeAllChildren();
                            try { $this.__htmlElement.innerHTML = property.getValue(); }
                            catch (ex) { /*(setting inner HTML/text is not supported on this element [eg. <img> tags])*/ }
                        }
                    });
                    return $this;
                }
            }.register();

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ----------------------------------------------------------------------------------------------------------------

            /** Attaches an event handler to the specified event name. */
            on(eventName: string, handler: (ev: Event) => any) {
                var event = super.on(eventName, handler);
                if (this.__htmlElement && !event.isAssociated(this.__htmlElement)) {
                    if (this.__htmlElement.addEventListener)
                        this.__htmlElement.addEventListener(eventName, (ev: any): any => { return event.dispatch(ev); }, false);
                    else if (this.__htmlElement['attachEvent']) {
                        this.__htmlElement['attachEvent']("on" + eventName, (ev: any): any => { return event.dispatch(ev); });
                    } else {
                        // (in a server or other environment, do nothing)
                    }
                    event.associate(this.__htmlElement);
                }
            }

            // ----------------------------------------------------------------------------------------------------------------

            /** Updates the associated HTML element attribute when a property value changes on this HTML element graph node. */
            protected onPropertyValueSet?(name: string, value: any) {
                if (super.onPropertyValueSet) super.onPropertyValueSet(name, value);
                // ... setting a local observable property will also set any corresponding element property ...
                if (this.__htmlElement && this.__htmlElement.setAttribute)
                    this.__htmlElement.setAttribute(name, value);
            }

            // --------------------------------------------------------------------------------------------------------------------

            /** 
             * The function is called by the graph node base during layout updates in order to generate/update the initial properties and HTML elements for display.
             */
            protected onUpdateLayout() {

                if (host.isClient()) { // (the server has no UI!)
                    // ... create this item's element before the child items get updated ...

                    var parentElement: Node = this.__parent ? this.__parent.__element : null;
                    var i: number, n: number;
                    var doRedraw = false;

                    if (this.__element == null || this.__element.nodeName != this.tagName) {
                        if (this.__element != null && parentElement != null)
                            parentElement.removeChild(this.__element);

                        this.__element = this.createUIElement();
                        this.tagName = this.__element.nodeName; // (keep this the same, just in case it changes internally)

                        if (typeof this.__element['innerHTML'] !== 'undefined') { // (more info at http://www.w3schools.com/dom/dom_nodetype.asp)
                            this.__htmlElement = <HTMLElement>this.__element;

                            // ... apply properties as attributes ...

                            for (var pname in this.__properties) {
                                var prop = this.__properties[pname];
                                if (prop.hasValue())
                                    this.__htmlElement.setAttribute(pname, prop.getValue());
                            }
                        } else
                            this.__htmlElement = null;

                        if (this.__element != null && parentElement != null)
                            parentElement.appendChild(this.__element);
                    }
                    else if (parentElement != null && this.__element.parentNode != parentElement) {
                        // ... the parent element is different for the existing element, so *move* it to the new parent ...
                        if (this.__element.parentNode != null)
                            this.__element.parentNode.removeChild(this.__element);
                        try {
                            parentElement.appendChild(this.__element);
                        } catch (e) {
                        }
                    }
                }
            }

            // --------------------------------------------------------------------------------------------------------------------
        }

        export interface IHTMLElement<TElement extends InstanceType<typeof global.HTMLElement>> extends $HTMLElement<TElement> { }
        export var HTMLElement = $HTMLElement['$HTMLElement Factory'].$__type;

        // ===================================================================================================================

        /** Represents a basic anchor node graph item that renders a link. */
        class $Anchor extends HTML.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            static HRef: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "href");
            static HRefLang: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "hreflang");
            static Type: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "type");
            static Rel: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "rel");
            //static Rev: IStaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "rev"); (not supported in HTML5)
            //static CharSet: IStaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "charset"); (not supported in HTML5)
            static Target: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Anchor, "target");

            // ----------------------------------------------------------------------------------------------------------------

            href: (href?: string) => string = GraphNode.accessor($Anchor.HRef);
            hreflang: (hreflang?: string) => string = GraphNode.accessor($Anchor.HRefLang);
            type: (type?: string) => string = GraphNode.accessor($Anchor.Type);
            rel: (rel?: string) => string = GraphNode.accessor($Anchor.Rel);
            //rev: (rev?: string) => string = GraphItem.accessor(Anchor.Rev);
            //charset: (charset?: string) => string = GraphItem.accessor(Anchor.CharSet);
            target: (target?: string) => string = GraphNode.accessor($Anchor.Target);

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$Anchor Factory' = class Factory extends FactoryBase($Anchor, $Anchor['$HTMLElement Factory']) implements IFactory {
                'new'(parent: GraphNode, name: string = "", href: string = "", html: string = ""): InstanceType<typeof Factory.$__type> { return null; }

                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: IGraphNode, name: string = "", href: string = "", html: string = ""): InstanceType<typeof Factory.$__type> {
                    this.$__baseFactory.init($this, isnew, parent, html);
                    this.name(name);
                    this.href(href);
                    this.htmlTag = "a";
                    return $this;
                }
            }.register();

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$Anchor Factory' = class Factory extends FactoryBase($Anchor, $Anchor['']) implements IFactory {
                /** Get a new app domain instance.
                    * @param application An optional application to add to the new domain.
                    */
                'new'(node: IGraphNode): InstanceType<typeof Factory.$__type> { return null; }

                /** Constructs an application domain for the specific application instance. */
                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, node: IGraphNode): InstanceType<typeof Factory.$__type> {
                    $this.node = node;
                    return $this;
                }
            }.register();

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("a");
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IAnchor extends $Anchor { }
        export var Anchor = $Anchor['$Anchor Factory'].$__type;

        // ===================================================================================================================

        /** Represents a basic text node graph item that renders plain text (no HTML). 
        * This is inline with the standard which declares that all DOM elements with text should have text-ONLY nodes.
        */
        class $PlainText extends UIElement.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            static Text: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$PlainText, "text", true);

            // ----------------------------------------------------------------------------------------------------------------

            text: (text?: string) => string = GraphNode.accessor($PlainText.Text);

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$PlainText Factory' = class Factory extends FactoryBase($PlainText, $PlainText['$UIElement Factory']) implements IFactory {
                'new'(parent: IGraphNode, text: string = ""): InstanceType<typeof Factory.$__type> { return null; }

                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: IGraphNode, text: string = ""): InstanceType<typeof Factory.$__type> {
                    this.$__baseFactory.init($this, isnew, parent);
                    this.text(text);
                    this.htmlTag = "";
                    this.getProperty($PlainText.Text).registerListener((property: Property, initialValue: boolean): void => {
                        (<Text>this.__element).data = property.getValue();
                    });
                    return $this;
                }
            }.register();

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("", "Text");
                return document.createTextNode("");
            }

            // ----------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IPlainText extends $PlainText { }
        export var PlainText = $PlainText['$PlainText Factory'].$__type;

        // ===================================================================================================================

        /** Represents an HTML text node graph item that renders the content in the 'innerHTML of a SPAN element. 
          */
        class $HTMLText extends HTML.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            constructor() {
                super(parent, html);
            }

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$HTMLText Factory' = class Factory extends FactoryBase($HTMLText, $HTMLText['$HTMLElement Factory']) implements IFactory {
                'new'(parent: IGraphNode, html: string = ""): InstanceType<typeof Factory.$__type> { return null; }

                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: IGraphNode, html: string = ""): InstanceType<typeof Factory.$__type> {
                    this.$__baseFactory.init($this, isnew, parent, html);
                    this.htmlTag = "span";
                    return $this;
                }
            }.register();

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
        }

        export interface IHTMLText extends $HTMLText { }
        export var HTMLText = $HTMLText['$HTMLText Factory'].$__type;

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
        class $Phrase extends $HTMLText.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            static PhraseType: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Phrase, "phraseType", true);

            // ----------------------------------------------------------------------------------------------------------------

            phraseType: (phraseType?: PhraseTypes) => PhraseTypes = GraphNode.accessor($Phrase.PhraseType);

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$Phrase Factory' = class Factory extends FactoryBase($Phrase, $Phrase['$HTMLElement Factory']) implements IFactory {
                'new'(parent: IGraphNode, phraseTypeFlags: PhraseTypes = 0, html: string = ""): InstanceType<typeof Factory.$__type> { return null; }

                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: IGraphNode, phraseTypeFlags: PhraseTypes = 0, html: string = ""): InstanceType<typeof Factory.$__type> {
                    this.$__baseFactory.init($this, isnew, parent, html);
                    $this.phraseType(phraseTypeFlags);
                    var pInfo: Property = $this.getProperty($HTMLElement.HTML);
                    pInfo.registerFilter($this.createPhrase);
                    return $this;
                }
            }.register();

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------

            createPhrase(property: Property, value: any): any {
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
        }

        export interface IPhrase extends $Phrase { }
        export var Phrase = $Phrase['$Phrase Factory'].$__type;

        // ===================================================================================================================

        /** Represents an HTML header element. 
        */
        class $Header extends HTMLElement.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            static HeaderLevel: IStaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>$Header, "headerLevel", true);

            // ----------------------------------------------------------------------------------------------------------------

            headerLevel: (headerLevel?: number) => number = GraphNode.accessor($Header.HeaderLevel);

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$Header Factory' = class Factory extends FactoryBase($Header, $Header['$HTMLElement Factory']) implements IFactory {
                'new'(parent: GraphNode, headerLevel: number = 1, html: string = ""): InstanceType<typeof Factory.$__type> { return null; }

                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: GraphNode, headerLevel: number = 1, html: string = ""): InstanceType<typeof Factory.$__type> {
                    this.$__baseFactory.init($this, isnew, parent, html);
                    if (headerLevel < 1 || headerLevel > 6)
                        throw Exception.from("HTML only supports header levels 1 through 6.");
                    $this.setValue($Header.HeaderLevel, headerLevel);
                    return $this;
                }
            }.register();

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                var headerLevel = this.getValue($Header.HeaderLevel);
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
        }

        export interface IHeader extends $Header { }
        export var Header = $Header['$Header Factory'].$__type;

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class Table extends UIElement.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "table";
            }

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("table");
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class TableRow extends UIElement.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "tr";
            }

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("tr");
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class TableColumn extends UIElement.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "td";
            }

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("td");
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class TableHeader extends UIElement.$__type {
            // ----------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "th";
            }

            // ----------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("th");
                return super.createUIElement();
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        // ========================================================================================================================

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
        export function parse(html: string = null, strictMode?: boolean): { rootElements: $GraphNode[]; templates: { [id: string]: IDataTemplate; } } {
            var log = Diagnostics.log(Markup, "Parsing HTML template ...").beginCapture();
            log.write("Template: " + html);

            if (!html) return null;

            // ... parsing is done by passing each new graph item the current scan position in a recursive pattern, until the end of the HTML text is found ...
            var htmlReader = Markup.HTMLReader.new(html);
            if (strictMode !== void 0)
                htmlReader.strictMode = !!strictMode;

            var approotID: string;
            var mode: number = 0; // (1 = ready on next tag, 2 = creating objects)
            var classMatch = /^[$.][A-Za-z0-9_$]*(\.[A-Za-z0-9_$]*)*(\s+|$)/;
            var attribName: string;

            var storeRunningText = (parent: $GraphNode) => {
                if (htmlReader.runningText) { // (if there is running text, then create a text node for it for the CURRENT graph item [not the parent])
                    if (!UI)
                        new $GraphNode(parent).setValue((htmlReader.runningText.indexOf('&') < 0 ? "text" : "html"), htmlReader.runningText);
                    else if (htmlReader.runningText.indexOf('&') < 0)
                        new UI.PlainText(parent, htmlReader.runningText);
                    else
                        new UI.HTMLText(parent, htmlReader.runningText);
                }
            };

            var rootElements: $GraphNode[] = [];
            var dataTemplates: { [id: string]: IDataTemplate; } = {};

            type TGraphNodeFactoryType = typeof GraphNode['$GraphNode Factory']['$__factory'];

            var processTags = (parent: $GraphNode): IDataTemplate[] => { // (returns the data templates found for the immediate children only)
                var graphItemType: string, graphItemTypePrefix: string;
                var graphType: TGraphNodeFactoryType;
                var graphItem: $GraphNode;
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
                                    // (this end tag should be the "closure" to the recently created graph item sibling, which clears 'graphiItem', but if
                                    // it's already null, the end tag should be handled by the parent level; also, if the closing tag name is different
                                    // (usually due to ill-formatted HTML [allowed only on parser override], or auto-closing tags, like '<img>'), assume
                                    // closure of the previous tag and let the parent handle it)
                                    if (graphItem) {
                                        storeRunningText(graphItem);

                                        if (isDataTemplate) {
                                            dataTemplateHTML = htmlReader.getHTML().substring(tagStartIndex, htmlReader.textEndIndex) + ">";
                                            templateInfo = { id: dataTemplateID, originalHTML: dataTemplateHTML, templateHTML: undefined, templateItem: graphItem };
                                            // (note: if there are immediate child templates, remove them from the current template text)
                                            if (immediateChildTemplates)
                                                for (var i = 0, n = immediateChildTemplates.length; i < n; i++)
                                                    dataTemplateHTML = dataTemplateHTML.replace(immediateChildTemplates[i].originalHTML, "<!--{{" + immediateChildTemplates[i].id + "Items}}-->");
                                            templateInfo.templateHTML = dataTemplateHTML;
                                            dataTemplates[dataTemplateID] = templateInfo; // (all templates are recorded in application scope, so IDs must be unique, otherwise they will override previous ones)
                                            if (!templates) templates = [];
                                            templates.push(templateInfo);
                                            isDataTemplate = false;
                                        }

                                        if (htmlReader.tagName != graphItem.htmlTag)
                                            return templates; // (note: in ill-formatted html [optional feature of the parser], make sure the closing tag name is correct, else perform an "auto close and return")

                                        graphType = null;
                                        graphItem = null;
                                        immediateChildTemplates = null;
                                    }
                                    else return templates; // (return if this closing tag doesn't match the last opening tag read, so let the parent level handle it)
                                }
                                else if (mode == 2 && htmlReader.readMode == Markup.HTMLReaderModes.EndOfTag) { // (end of attributes, so create the tag graph item)

                                    // ... this is either the end of the tag with inner html/text, or a self ending tag (XML style) ...

                                    graphItemType = properties['class']; // (this may hold an explicit object type to create [note expected format: module.full.name.classname])
                                    graphItem = null;
                                    graphType = null;

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

                                        var graphFactory = GraphNode['$GraphNode Factory'];
                                        graphType = <TGraphNodeFactoryType>Utilities.dereferencePropertyPath((<ITypeInfo>CoreXT).$__parent, Scripts.translateModuleTypeName(graphItemType));

                                        if (graphType === void 0)
                                            throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " was not found.");

                                        if (typeof graphType !== 'function' || typeof graphType.defaultHTMLTag === void 0)
                                            throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " does not resolve to a GraphItem class type.");
                                    }

                                    if (graphType == null) {
                                        // ... auto detect the CoreXT UI GraphNode type based on the tag name (all valid HTML4/5 tags: http://www.w3schools.com/tags/) ...
                                        switch (currentTagName) {
                                            case 'a': graphType = UI.Anchor; break;

                                            // (phrases)
                                            case 'abbr': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Abbreviation; break;
                                            case 'acronym': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Acronym; break;
                                            case 'em': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Emphasis; break;
                                            case 'strong': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Strong; break;
                                            case 'cite': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Cite; break;
                                            case 'dfn': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Defining; break;
                                            case 'code': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Code; break;
                                            case 'samp': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Sample; break;
                                            case 'kbd': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Keyboard; break;
                                            case 'var': graphType = Phrase; properties['phraseTypes'] = UI.PhraseTypes.Variable; break;

                                            // (headers)
                                            case 'h1': graphType = Header; properties['headerLevel'] = 1; break;
                                            case 'h2': graphType = Header; properties['headerLevel'] = 2; break;
                                            case 'h3': graphType = Header; properties['headerLevel'] = 3; break;
                                            case 'h4': graphType = Header; properties['headerLevel'] = 4; break;
                                            case 'h5': graphType = Header; properties['headerLevel'] = 5; break;
                                            case 'h6': graphType = Header; properties['headerLevel'] = 6; break;

                                            default: graphType = HTMLElement; // (just create a basic object to use with htmlReader.tagName)
                                        }
                                    }

                                    if (!graphItem) { // (only create if not explicitly created)
                                        graphItem = graphType.new(isDataTemplate ? null : parent);
                                    }

                                    for (var pname in properties)
                                        graphItem.setValue(pname, properties[pname], true);

                                    graphItem.htmlTag = currentTagName;

                                    // ... some tags are not allowed to have children (and don't have to have closing tags, so null the graph item and type now)...
                                    switch (currentTagName) {
                                        case "area": case "base": case "br": case "col": case "command": case "embed": case "hr": case "img": case "input":
                                        case "keygen": case "link": case "meta": case "param": case "source": case "track": case "wbr":
                                            graphItem = null;
                                            graphType = null;
                                    }

                                    if (parent === null)
                                        rootElements.push(graphItem);
                                }
                                else if (htmlReader.readMode == Markup.HTMLReaderModes.Tag) {
                                    if (mode == 1) mode = 2; // (begin creating on this tag [i.e. after the root tag, since root is the "application" object itself])

                                    if (!graphItem) {
                                        // ... start of a new sibling tag ...
                                        properties = {};
                                        tagStartIndex = htmlReader.textEndIndex; // (the text end index is the start of the tag)
                                        if (mode == 2)
                                            storeRunningText(parent);
                                    } else if (mode == 2) {
                                        // (note: each function call deals with a single nested level, and if a tag is not closed upon reading another, 'processTag' is called again)
                                        immediateChildTemplates = processTags(graphItem); // ('graphItem' was just created for the last tag read, but the end tag is still yet to be read)
                                        if (htmlReader.tagName != graphItem.htmlTag)
                                            throw Exception.from("The closing tag '</" + htmlReader.tagName + ">' was unexpected for current tag '<" + graphItem.htmlTag + ">' on line " + htmlReader.getCurrentLineNumber() + ".");
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

            return { rootElements: rootElements, templates: dataTemplates };
        }

        // ===================================================================================================================
    }

}
