module CoreXT.System.Platform {

    /** Contains a series of core CoreXT HTML-based UI elements. Each element extends the GraphNode type. */
    export module HTML {

        // ===================================================================================================================

        /** A context is a container that manages a reference to a global script environment. Each new context creates a new 
        * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
        * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
        * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
        */
        class $BrowserContext extends Context.$Type {
            private _target: any; // (iframe or worker)
            private _iframe: HTMLIFrameElement;
            private _worker: Worker;
            private _window: IWindow;
            private _global: IStaticGlobals;

            // ----------------------------------------------------------------------------------------------------------------

            static ' '() {
                var _super_factory = super[' ']().Context_factory;
                return class {
                    static BrowserContext_factory?= class {
                        static 'new'(context: Contexts = Contexts.Secure): $BrowserContext { return null; }

                        static init($this: $BrowserContext, isnew: boolean, context: Contexts = Contexts.Secure): $BrowserContext {
                            _super_factory.init($this, isnew, context);
                            return $this;
                        }
                    }
                }
            }

            // ----------------------------------------------------------------------------------------------------------------

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

            // ----------------------------------------------------------------------------------------------------------------

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

        export var BrowserContext = AppDomain.registerClass($BrowserContext, $BrowserContext[' ']().BrowserContext_factory, [CoreXT, System, Platform, HTML]);

    // ====================================================================================================================
      /** Represents the base of a CoreXT UI object. */
        export class UIElement extends GraphNode {
            // ---------------------------------------------------------------------------------------------------------------

            /** When extending 'GraphItem' with additional observable properties, it is considered good practice to create a
            * static type with a list of possible vales that can be set by end users (to promote code completion mechanisms).
            */
            static ID: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>UIElement, "id");
            static Name: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>UIElement, "name");
            static Class: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>UIElement, "class", true);
            static Style: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>UIElement, "style", true);
            /**
            * (Note: This static property registration also updates the internal '__UIProeprties' static list with UI-specific
            * properties (that will trigger redraw events). Derived types should update this to their own values)
            */

            // ---------------------------------------------------------------------------------------------------------------

            id: (id?: string) => string = GraphNode.accessor(UIElement.ID);
            name: (name?: string) => string = GraphNode.accessor(UIElement.Name);
            Class: (Class?: string) => string = GraphNode.accessor(UIElement.Class);
            style: (style?: string) => string = GraphNode.accessor(UIElement.Style);

            // ---------------------------------------------------------------------------------------------------------------

            constructor(node: GraphNode) {
                super();
                this.node = node;
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents an HTML node graph item that renders the content in the 'innerHTML of the default '__htmlTag' element (which is set to 'GraphItem.defaultHTMLTag' [DIV] initially).
        * This object has no element restrictions, so you can create any element you need by setting the '__htmlTag' tag before the UI element gets created.
        */
        export class HTML extends UIElement {
            // ---------------------------------------------------------------------------------------------------------------

            static HTML: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>HTML, "html", true);

            // ---------------------------------------------------------------------------------------------------------------

            html: (html?: string) => string = GraphNode.accessor(HTML.HTML);

            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode, html: string = "") {
                super(parent);
                this.html(html);

                this.getProperty(HTML.HTML).registerListener((property: Property, initialValue: boolean): void => {
                    if (!initialValue || !this.__children.length) {
                        if (this.__children.length)
                            this.removeAllChildren();
                        try { this.__htmlElement.innerHTML = property.getValue(); }
                        catch (ex) { /*(setting inner HTML/text is not supported on this element [eg. <img> tags])*/ }
                    }
                });
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a basic anchor node graph item that renders a link. */
        export class Anchor extends HTML {
            // ---------------------------------------------------------------------------------------------------------------

            static HRef: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Anchor, "href");
            static HRefLang: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Anchor, "hreflang");
            static Type: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Anchor, "type");
            static Rel: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Anchor, "rel");
            //static Rev: StaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "rev"); (not supported in HTML5)
            //static CharSet: StaticProperty = GraphItem.registerProperty(<typeof GraphItem><any>Anchor, "charset"); (not supported in HTML5)
            static Target: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Anchor, "target");

            // ---------------------------------------------------------------------------------------------------------------

            href: (href?: string) => string = GraphNode.accessor(Anchor.HRef);
            hreflang: (hreflang?: string) => string = GraphNode.accessor(Anchor.HRefLang);
            type: (type?: string) => string = GraphNode.accessor(Anchor.Type);
            rel: (rel?: string) => string = GraphNode.accessor(Anchor.Rel);
            //rev: (rev?: string) => string = GraphItem.accessor(Anchor.Rev);
            //charset: (charset?: string) => string = GraphItem.accessor(Anchor.CharSet);
            target: (target?: string) => string = GraphNode.accessor(Anchor.Target);

            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode, name: string = "", href: string = "", html: string = "") {
                super(parent, html);
                this.name(name);
                this.href(href);
                this.htmlTag = "a";
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("a");
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ---------------------------------------------------------------------------------------------------------------
        }


        // ===================================================================================================================

        /** Represents a basic text node graph item that renders plain text (no HTML). 
        * This is inline with the standard which declares that all DOM elements with text should have text-ONLY nodes.
        */
        export class PlainText extends UIElement {
            // ---------------------------------------------------------------------------------------------------------------

            static Text: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>PlainText, "text", true);

            // ---------------------------------------------------------------------------------------------------------------

            text: (text?: string) => string = GraphNode.accessor(PlainText.Text);

            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode, text: string = "") {
                super(parent);
                this.text(text);
                this.htmlTag = "";

                this.getProperty(PlainText.Text).registerListener((property: Property, initialValue: boolean): void => {
                    (<Text>this.__element).data = property.getValue();
                });
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("", "Text");
                return document.createTextNode("");
            }

            // ---------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents an HTML text node graph item that renders the content in the 'innerHTML of a SPAN element. 
        */
        export class HTMLText extends HTML {
            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode, html: string = "") {
                super(parent, html);
                this.htmlTag = "span";
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertUnsupportedElementTypes("html", "head", "body", "script", "audio", "canvas", "object");
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

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
        export class Phrase extends HTMLText {
            // ---------------------------------------------------------------------------------------------------------------

            static PhraseType: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Phrase, "phraseType", true);

            // ---------------------------------------------------------------------------------------------------------------

            phraseType: (phraseType?: PhraseTypes) => PhraseTypes = GraphNode.accessor(Phrase.PhraseType);

            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode, phraseTypeFlags: PhraseTypes = 0, html: string = "") {
                super(parent, html);
                this.phraseType(phraseTypeFlags);
                var pInfo: Property = this.getProperty(HTML.HTML);
                pInfo.registerFilter(this.createPhrase);
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------

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

            // ---------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive); // (note: the innerHTML property will have been updated after this call to the 'html' property)
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents an HTML header element. 
        */
        export class Header extends HTML {
            // ---------------------------------------------------------------------------------------------------------------

            static HeaderLevel: StaticProperty = GraphNode.registerProperty(<typeof GraphNode><any>Header, "headerLevel", true);

            // ---------------------------------------------------------------------------------------------------------------

            headerLevel: (headerLevel?: number) => number = GraphNode.accessor(Header.HeaderLevel);

            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode, headerLevel: number = 1, html: string = "") {
                super(parent, html);
                if (headerLevel < 1 || headerLevel > 6)
                    throw Exception.from("HTML only supports header levels 1 through 6.");
                this.setValue(Header.HeaderLevel, headerLevel);
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                var headerLevel = this.getValue(Header.HeaderLevel);
                if (headerLevel < 1 || headerLevel > 6)
                    throw Exception.from("HTML only supports header levels 1 through 6.");
                this.htmlTag = "h" + headerLevel;
                this.assertSupportedElementTypes("h1", "h2", "h3", "h4", "h5", "h6");
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------

            onRedraw(recursive: boolean = true) {
                super.onRedraw(recursive);
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class Table extends UIElement {
            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "table";
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("table");
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class TableRow extends UIElement {
            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "tr";
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("tr");
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class TableColumn extends UIElement {
            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "td";
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("td");
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================

        /** Represents a row on a table type in Bootstrap. */
        export class TableHeader extends UIElement {
            // ---------------------------------------------------------------------------------------------------------------

            constructor(parent: GraphNode) {
                super(parent);
                this.htmlTag = "th";
            }

            // ---------------------------------------------------------------------------------------------------------------

            createUIElement(): Node {
                this.assertSupportedElementTypes("th");
                return super.createUIElement();
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        // ===================================================================================================================
    }

}
