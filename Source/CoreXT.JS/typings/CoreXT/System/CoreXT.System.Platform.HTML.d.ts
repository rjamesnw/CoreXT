declare module CoreXT.System.Platform {
    /** Contains a series of core CoreXT HTML-based UI elements. Each element extends the GraphNode type. */
    namespace HTML {
        const BrowserContext_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof Context;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /** A context is a container that manages a reference to a global script environment. Each new context creates a new
          * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
          * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
          * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
          */
        class BrowserContext extends BrowserContext_base {
            static 'new'(context?: Contexts): IBrowserContext;
            static init(o: IBrowserContext, isnew: boolean, context?: Contexts): void;
        }
        namespace BrowserContext {
            const $__type_base: typeof Context.$__type;
            class $__type extends $__type_base {
                private _target;
                private _iframe;
                private _worker;
                private _window;
                private _global;
                _setupIFrame(): void;
                _setupWorker(): void;
                _setupWindow(): void;
                /** Load a resource (usually a script or page) into this context. */
                load(url: string): void;
            }
        }
        interface IBrowserContext extends BrowserContext.$__type {
        }
        const HTMLNode_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof GraphNode;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /** Represents the base of a CoreXT UI object of various UI types. The default implementation extends this to implement HTML elements. */
        class HTMLNode extends HTMLNode_base {
            static 'new'(parent: IGraphNode, id?: string, name?: string): IHTMLNode;
            static init(o: IHTMLNode, isnew: boolean, parent: IGraphNode, id?: string, name?: string): void;
        }
        namespace HTMLNode {
            const $__type_base_1: typeof GraphNode.$__type;
            class $__type extends $__type_base_1 {
                id: string;
                name: string;
                /** Represents the HTML element tag to use for this graph item.  The default value is set when a derived graph item is constructed.
                  * Not all objects support this property, and changing it is only valid BEFORE the layout is updated for the first time.
                  */
                tagName: string;
                /** The generated element for this HTMLelement graph node. */
                protected __element: Node;
                /** Detaches this GraphItem from the logical graph tree, but does not remove it from the parent's child list.
                 * Only call this function if you plan to manually remove the child from the parent.
                 */
                detach(): this;
                onRedraw(recursive?: boolean): void;
                /** Changes the type of element to create (if supported by the derived type), and returns the underlying graph instance.
                   * Changing this after a layout pass has already created elements will cause the existing element for this graph item to be deleted and replaced.
                   * WARNING: This is not supported by all derived types, and calling this AFTER a layout pass has created elements for those unsupported types may have no effect.
                   * For example, the UI 'PlaneText' graph item overrides 'createUIElement()' to return a node created from 'document.createTextNode()',
                   * and calling 'setHTMLTag("span")' will have no effect before OR after the first layout pass (this element will always be a text node).
                   * Some derived types that override 'createUIElement()' my provide special logic to accept only supported types.
                   */
                setHTMLTag(htmlTag: string): this;
                /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate supported element types. */
                assertSupportedElementTypes(...args: string[]): boolean;
                /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate unsupported element types. */
                assertUnsupportedElementTypes(...args: string[]): void;
            }
        }
        interface IHTMLNode extends HTMLNode.$__type {
        }
        const HTMLElement_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof HTMLNode;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /** Represents an HTML node graph item that renders the content in the 'innerHTML of the default '__htmlTag' element (which is set to 'GraphItem.defaultHTMLTag' [DIV] initially).
          * This object has no element restrictions, so you can create any element you need by setting the '__htmlTag' tag before the UI element gets created.
          */
        class HTMLElement extends HTMLElement_base {
            static 'new'<TName extends keyof HTMLElementTagNameMap = 'div', TElement extends HTMLElementTagNameMap[TName] = HTMLDivElement>(parent: IGraphNode, id?: string, name?: string, tagName?: TName, html?: string): IHTMLElement<TElement>;
            /** Each new graph item instance will initially set its '__htmlTag' property to this value. */
            static defaultHTMLTagName: string;
            static init<TName extends keyof HTMLElementTagNameMap = 'div', TElement extends HTMLElementTagNameMap[TName] = HTMLDivElement>(o: IHTMLElement<TElement>, isnew: boolean, parent: IGraphNode, id?: string, name?: string, tagName?: TName, html?: string): void;
            static ID: IStaticProperty;
            static Name: IStaticProperty;
            static Class: IStaticProperty;
            static Style: IStaticProperty;
            static InnerHTML: IStaticProperty;
        }
        namespace HTMLElement {
            const $__type_base_2: typeof HTMLNode.$__type;
            class $__type<TElement extends NativeTypes.IHTMLElement = NativeTypes.IHTMLElement> extends $__type_base_2 {
                class: string;
                style: string;
                innerHTML: string;
                protected readonly __htmlElement: TElement;
                /** Sets a value on this HTML element object and returns the element (to allow chaining calls). If a DOM element is also
                  * associated it's attributes are updated with the specified value.
                  */
                set<N extends keyof TElement, V extends TElement[N]>(name: N, value: V): this;
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
                get<N extends keyof TElement, V extends TElement[N]>(name: N, tryElement?: boolean): V;
            }
        }
        interface IHTMLElement<TElement extends InstanceType<typeof global.HTMLElement> = InstanceType<typeof global.HTMLElement>> extends HTMLElement.$__type<TElement> {
        }
        const PlainText_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof HTMLNode;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /**
          * Represents a basic text node graph item that renders plain text (no HTML). For HTML use 'HTMLText'.
          * This is inline with the standard which declares that all DOM elements with text should have text-ONLY nodes.
          */
        class PlainText extends PlainText_base {
            static 'new'(parent: IGraphNode, text?: string): IPlainText;
            static init(o: IPlainText, isnew: boolean, parent: IGraphNode, text?: string): void;
            static Text: IStaticProperty;
        }
        namespace PlainText {
            const $__type_base_3: typeof HTMLNode.$__type;
            class $__type extends $__type_base_3 {
                text: (text?: string) => string;
                createUIElement(): Node;
                onRedraw(recursive?: boolean): void;
            }
        }
        interface IPlainText extends PlainText.$__type {
        }
        const HTMLText_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof HTMLElement;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /** Represents an HTML text node graph item that renders the content in the 'innerHTML of a SPAN element. For plain text nodes use 'PlainText'.
          */
        class HTMLText extends HTMLText_base {
            static 'new'(parent: IGraphNode, html?: string): IHTMLText;
            static init(o: IHTMLText, isnew: boolean, parent: IGraphNode, html?: string): void;
        }
        namespace HTMLText {
            const $__type_base_4: typeof HTMLElement.$__type;
            class $__type extends $__type_base_4<HTMLSpanElement> {
                createUIElement(): Node;
                onRedraw(recursive?: boolean): void;
            }
        }
        interface IHTMLText extends HTMLText.$__type {
        }
        /** A list of text mark-up flags for use with phrase based elements. */
        enum PhraseTypes {
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
        const Phrase_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof HTMLElement;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /** Represents a basic phrase node graph item that renders phrase elements (a term used by w3.org to describe adding
          * "structural information to text fragments").  This is basically just text formatting in most cases.
          * It's important to note the word "structural" here, as it is a suggestion on how to process text, but, unlike CSS,
          * it does not dictate exactly HOW the text will actually look like. For instance, "<STRONG>" tags usually render as
          * bold text, but someone can decide to color and increase font size instead using CSS for all such elements. This is
          * actually a good thing, as it allows flexible web design in a way that can allow applying themes at a later time. */
        class Phrase extends Phrase_base {
            static 'new'(parent: IGraphNode, phraseTypeFlags?: PhraseTypes, html?: string): IPhrase;
            static init(o: IPhrase, isnew: boolean, parent: IGraphNode, phraseTypeFlags?: PhraseTypes, html?: string): void;
            static PhraseType: IStaticProperty;
        }
        namespace Phrase {
            const $__type_base_5: typeof HTMLElement.$__type;
            class $__type extends $__type_base_5 {
                phraseType: (phraseType?: PhraseTypes) => PhraseTypes;
                createUIElement(): Node;
                createPhrase(property: IProperty, value: any): any;
                onRedraw(recursive?: boolean): void;
            }
        }
        interface IPhrase extends Phrase.$__type {
        }
        const Header_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof HTMLElement;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /** Represents an HTML header element.
          */
        class Header extends Header_base {
            static 'new'(parent: IGraphNode, headerLevel?: number, html?: string): IHeader;
            static init(o: IHeader, isnew: boolean, parent: IGraphNode, headerLevel?: number, html?: string): void;
            static HeaderLevel: IStaticProperty;
        }
        namespace Header {
            const $__type_base_6: typeof HTMLElement.$__type;
            class $__type extends $__type_base_6 {
                headerLevel: (headerLevel?: number) => number;
                createUIElement(): Node;
                onRedraw(recursive?: boolean): void;
            }
        }
        interface IHeader extends Header.$__type {
        }
        /** Data template information as extracted from HTML template text. */
        interface IDataTemplate {
            id: string;
            originalHTML: string;
            templateHTML: string;
            templateItem: IGraphNode;
            childTemplates: IDataTemplate[];
        }
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
        function parse(html?: string, strictMode?: boolean): {
            rootElements: IGraphNode[];
            templates: {
                [id: string]: IDataTemplate;
            };
        };
    }
}
