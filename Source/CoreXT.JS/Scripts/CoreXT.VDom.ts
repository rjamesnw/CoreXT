/*
 * CoreXT (CoreXT.com), (c) Twigate.com
 * License: http://creativecommons.org/licenses/by-nc/4.0/
 * (see CoreXT.ts for more details)
 *
 * Description: VDOM (Virtual DOM) is, as the name suggests, a virtual DOM used in the web workers and remote servers, which don't usually have UIs.
 *
 * Purpose: To provide a secure way to protected users from malicious applications.  Applications running in a web worker are untrusted by
 *          default (sandboxed). A user may, at their own risk, elevate an application to "trusted", and allow it to run in the core
 *          context.  This is required for most system related modules.
 *          The VDOM also acts as a virtual object graph, like that which is use with some game libraries/frameworks.  It allows remotely tracking
 *          and updating objects.  Any lag between a worker and the UI can be seen as "network lag" (typically in ms).  Developing an application
 *          with VDOM allows one to develop server side logic at the same time - using the same code base!  This basically makes websites act like
 *          "games", where the server side controls the main logic, and the client side simply updates the view and transmits UI events as needed.
 */

namespace CoreXT {
    export interface IEventTarget extends EventTarget { }
    export interface INode extends Node { }
    export interface IElement extends Element { }
    export interface IDocument extends Document { }
    export interface IWindow extends Window { }
    export interface INodeList extends NodeList { }
    export interface IHTMLCanvasElement extends HTMLCanvasElement { }

    export namespace VDOM {
        export function defineProperty(obj: {}, name: string, initialValue?: any, canRead: boolean = true, canWrite: boolean = true): {} {
            var desc: PropertyDescriptor = {
                configurable: false,
                enumerable: true
            };
            if (initialValue !== void 0)
                desc.value = initialValue;
            if (canRead)
                desc.get = function () {
                };
            if (canWrite)
                desc.set = function () {
                };
            return Object.defineProperty(obj, name, desc);
        }

        export function defineConst(obj: {}, name: string, value: any): {} {
            var desc: PropertyDescriptor = {
                configurable: false,
                enumerable: true,
                value: value,
                writable: false
            };
            return Object.defineProperty(obj, name, desc);
        }

        enum __Operations { Get, Set, Call }

        class __Operation {
            op: __Operations;
            objID: number;
        }

        var __operationQueue: __Operation[] = [];

        function __queueOperation(args: any[]) {
        }

        export class EventTarget implements IEventTarget {
            addEventListener(type: string, listener: EventListener, useCapture?: boolean) {

            }
            removeEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
            dispatchEvent(evt: Event): boolean;
        }

        interface __IPrivateNodeList extends Array<INode> {
            [index: number]: Node;
            $__owner: Node;
            $__length: number;
            __extendDefNumIndexProps(newVirtualLength: number): void;
        }

        // Note: Until object proxies are widely supported, a select number of numbered indexes will be defined to make the
        //       object "live" as per the spec (but only when returned by '{Node}.childNodes').
        export class NodeList implements INodeList {
            private $__owner: Node; // (defined only if returned from '{Node}.childNodes')

            [index: number]: INode;

            private $__length: number;

            get length(): number {
                return -1 - this.$__length; // (-1 == 0, -2 == 1, etc.)
            }
            set length(value: number) { // (length can only be set when >=0, otherwise it is 'locked')
                if (this.$__length >= 0)
                    this.$__length = value;
            }

            item(index: number): INode {
                return this[index];
            }
            constructor(owner?: Node) {
                if (owner)
                    this.$__owner = owner;
            }
            private static $__virtualLength: number = 0;
            private __extendDefNumIndexProps(newVirtualLength: number): void {
                for (var i = NodeList.$__virtualLength; i < newVirtualLength; ++i)
                    (function (i: number) {
                        Object.defineProperty(NodeList.prototype, i.toString(), {
                            enumerable: true,
                            configurable: false,
                            get: () => {
                                return this[i];
                            }
                        });
                    })(i);
            }
        }

        // ... copy the array prototype functions over to the NodeList proto (just to make things easier [used with '__IPrivateNodeList']) ...

        for (var p in Array.prototype)
            if ((<Object>Array.prototype).hasOwnProperty(p))
                NodeList.prototype[p] = Array.prototype[p];

        export class Node extends EventTarget implements INode {
            private $__id: number; // (a unique ID for every object, which allows tracking across worker/network boundaries)
            private $__index: number = -1; // (the index of this node among sibling nodes; -1 = no parent [not added to any list])
            private $__childNodes: __IPrivateNodeList;
            private $__siblings: __IPrivateNodeList; // (a reference to the parent '$__childNodes' array for quick reference)
            private $__parent: Node;

            get previousSibling(): INode {
                if (this.$__childNodes === void 0 || this.$__index < 1)
                    return null;
                return this.$__siblings[this.$__index - 1];
            }

            get nextSibling(): INode {
                if (this.$__childNodes === void 0 || this.$__index >= this.$__childNodes.length - 1)
                    return null;
                return this.$__siblings[this.$__index + 1];
            }

            get parentNode(): INode {
                return this.$__parent || null;
            }

            appendChild(newChild: INode): INode {
                // ... remove from existing parent if any ...
                if ((<Node>newChild).$__parent)
                    (<Node>newChild).$__parent.removeChild(newChild);
                (<Node>newChild).$__parent = this;
                (<Node>newChild).$__index = this.$__childNodes.$__length;
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (unlock)
                this.$__childNodes.push(newChild);
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (lock)
                return newChild;
            }


            removeChild(oldChild: INode): INode {
                if (typeof oldChild !== 'object')
                    throw new Error("Node value given is null or undefined.");
                if ((<Node>oldChild).$__parent !== this || (<Node>oldChild).$__index === void 0 || (<Node>oldChild).$__index < 0)
                    throw new Error("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
                // (readjust the indexes)
                for (var i = (<Node>oldChild).$__index, n = this.$__childNodes.length - i; i < n; ++i)
                    this.$__childNodes[i].$__index = i;
                (<Node>oldChild).$__index = -1;
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (unlock)
                this.$__childNodes.splice((<Node>oldChild).$__index);
                this.$__childNodes.$__length = -1 - this.$__childNodes.$__length; // (lock)
                return oldChild;
            }

            replaceChild(newChild: INode, oldChild: INode): INode;

            insertBefore(newChild: INode, refChild?: INode): INode;

            firstChild: INode;
            lastChild: INode;

            get childNodes(): INodeList { return <INodeList><any>this.$__childNodes; }

            isSameNode(other: INode): boolean;
            cloneNode(deep?: boolean): INode;
            hasChildNodes(): boolean;

            nodeType: number;

            localName: string;
            namespaceURI: string;
            textContent: string;

            nodeValue: string;
            nodeName: string;
            ownerDocument: IDocument;
            attributes: NamedNodeMap;
            prefix: string;
            isSupported(feature: string, version: string): boolean;
            isEqualNode(arg: INode): boolean;
            lookupPrefix(namespaceURI: string): string;
            isDefaultNamespace(namespaceURI: string): boolean;
            compareDocumentPosition(other: INode): number;
            normalize(): void {
            }

            hasAttributes(): boolean;
            lookupNamespaceURI(prefix: string): string;

            ENTITY_REFERENCE_NODE: number;
            ATTRIBUTE_NODE: number;
            DOCUMENT_FRAGMENT_NODE: number;
            TEXT_NODE: number;
            ELEMENT_NODE: number;
            COMMENT_NODE: number;
            DOCUMENT_POSITION_DISCONNECTED: number;
            DOCUMENT_POSITION_CONTAINED_BY: number;
            DOCUMENT_POSITION_CONTAINS: number;
            DOCUMENT_TYPE_NODE: number;
            DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
            DOCUMENT_NODE: number;
            ENTITY_NODE: number;
            PROCESSING_INSTRUCTION_NODE: number;
            CDATA_SECTION_NODE: number;
            NOTATION_NODE: number;
            DOCUMENT_POSITION_FOLLOWING: number;
            DOCUMENT_POSITION_PRECEDING: number;

            querySelectorAll(selectors: string): NodeList;
            querySelector(selectors: string): Element;

            // - - - Start MS Specific Properties - - -
            attachEvent(event: string, listener: EventListener): boolean;
            detachEvent(event: string, listener: EventListener): void;

            protocol: string;
            fileSize: string;
            fileUpdatedDate: string;
            nameProp: string;
            fileCreatedDate: string;
            fileModifiedDate: string;
            mimeType: string;

            swapNode(otherNode: INode): INode;
            removeNode(deep?: boolean): INode;
            replaceNode(replacement: INode): INode;
            // - - - End MS Specific Properties - - -
        }

        defineProperty(Node.prototype, "nodeType");
        defineProperty(Node.prototype, "localName");
        defineProperty(Node.prototype, "namespaceURI");
        defineProperty(Node.prototype, "textContent");

        // Node Type ENums
        defineConst(Node.prototype, "ELEMENT_NODE", 1);
        defineConst(Node.prototype, "ATTRIBUTE_NODE", 2);
        defineConst(Node.prototype, "TEXT_NODE", 3);
        defineConst(Node.prototype, "CDATA_SECTION_NODE", 4);
        defineConst(Node.prototype, "ENTITY_REFERENCE_NODE", 5);
        defineConst(Node.prototype, "ENTITY_NODE", 6);
        defineConst(Node.prototype, "PROCESSING_INSTRUCTION_NODE", 7);
        defineConst(Node.prototype, "COMMENT_NODE", 8);
        defineConst(Node.prototype, "DOCUMENT_NODE", 9);
        defineConst(Node.prototype, "DOCUMENT_TYPE_NODE", 10);
        defineConst(Node.prototype, "DOCUMENT_FRAGMENT_NODE", 11);
        defineConst(Node.prototype, "NOTATION_NODE", 12);

        // Flags
        defineConst(Node.prototype, "DOCUMENT_POSITION_DISCONNECTED", 0x01);
        defineConst(Node.prototype, "DOCUMENT_POSITION_PRECEDING", 0x02);
        defineConst(Node.prototype, "DOCUMENT_POSITION_FOLLOWING", 0x04);
        defineConst(Node.prototype, "DOCUMENT_POSITION_CONTAINS", 0x08);
        defineConst(Node.prototype, "DOCUMENT_POSITION_CONTAINED_BY", 0x010);
        defineConst(Node.prototype, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", 0x20);

        export class Element extends Node implements IElement {
            scrollTop: number;
            clientLeft: number;
            scrollLeft: number;
            tagName: string;
            clientWidth: number;
            scrollWidth: number;
            clientHeight: number;
            clientTop: number;
            scrollHeight: number;
            getAttribute(name?: string): string;
            getElementsByTagNameNS(namespaceURI: string, localName: string): NodeList;
            hasAttributeNS(namespaceURI: string, localName: string): boolean;
            getBoundingClientRect(): ClientRect;
            getAttributeNS(namespaceURI: string, localName: string): string;
            getAttributeNodeNS(namespaceURI: string, localName: string): Attr;
            setAttributeNodeNS(newAttr: Attr): Attr;
            hasAttribute(name: string): boolean;
            removeAttribute(name?: string): void;
            setAttributeNS(namespaceURI: string, qualifiedName: string, value: string): void;
            getAttributeNode(name: string): Attr;
            fireEvent(eventName: string, eventObj?: any): boolean;
            getElementsByTagName(name: string): NodeList;
            getClientRects(): ClientRectList;
            setAttributeNode(newAttr: Attr): Attr;
            removeAttributeNode(oldAttr: Attr): Attr;
            setAttribute(name?: string, value?: string): void;
            removeAttributeNS(namespaceURI: string, localName: string): void;

            childElementCount: number;
            previousElementSibling: Element;
            lastElementChild: Element;
            nextElementSibling: Element;
            firstElementChild: Element;

            addEventListener(type: string, listener: EventListener, useCapture?: boolean): void;

            onpointerenter: (ev: PointerEvent) => any;
            onpointerout: (ev: PointerEvent) => any;
            onpointerdown: (ev: PointerEvent) => any;
            onpointerup: (ev: PointerEvent) => any;
            onpointercancel: (ev: PointerEvent) => any;
            onpointerover: (ev: PointerEvent) => any;
            onpointermove: (ev: PointerEvent) => any;
            onpointerleave: (ev: PointerEvent) => any;

            // - - - Start MS Specific Properties - - -
            onmspointerdown: (ev: any) => any;
            onmsgotpointercapture: (ev: any) => any;
            onmsgesturedoubletap: (ev: any) => any;
            onmspointerhover: (ev: any) => any;
            onmsgesturehold: (ev: any) => any;
            onmspointermove: (ev: any) => any;
            onmsgesturechange: (ev: any) => any;
            onmsgesturestart: (ev: any) => any;
            onmspointercancel: (ev: any) => any;
            onmsgestureend: (ev: any) => any;
            onmsgesturetap: (ev: any) => any;
            onmspointerout: (ev: any) => any;
            onmsinertiastart: (ev: any) => any;
            onmslostpointercapture: (ev: any) => any;
            onmspointerover: (ev: any) => any;
            onmspointerup: (ev: any) => any;
            onmspointerenter: (ev: any) => any;
            onmspointerleave: (ev: any) => any;
            onlostpointercapture: (ev: PointerEvent) => any;
            ongotpointercapture: (ev: PointerEvent) => any;

            msMatchesSelector(selectors: string): boolean;

            msRegionOverflow: string;

            msContentZoomFactor: number;
            msGetRegionContent(): MSRangeCollection;
            msReleasePointerCapture(pointerId: number): void;
            msSetPointerCapture(pointerId: number): void;

            msZoomTo(args: MsZoomToOptions): void;
            msGetUntransformedBounds(): ClientRect;
            // - - - End MS Specific Properties - - -

            setPointerCapture(pointerId: number): void;
            releasePointerCapture(pointerId: number): void;
            msRequestFullscreen(): void;

        }

        export class Document extends Node implements IDocument {
            compatible: MSCompatibleInfoCollection;
            implementation: DOMImplementation;
            scripts: HTMLCollection;
            charset: string;
            vlinkColor: string;
            security: string;
            title: string;
            namespaces: MSNamespaceInfoCollection;
            defaultCharset: string;
            embeds: HTMLCollection;
            styleSheets: StyleSheetList;
            frames: IWindow;
            all: HTMLCollection;
            forms: HTMLCollection;
            dir: string;
            designMode: string;
            Script: MSScriptHost;
            URLUnencoded: string;
            defaultView: IWindow;
            inputEncoding: string;
            activeElement: Element;
            links: HTMLCollection;
            uniqueID: string;
            URL: string;
            head: HTMLHeadElement;
            cookie: string;
            xmlEncoding: string;
            documentMode: number;
            characterSet: string;
            anchors: HTMLCollection;
            plugins: HTMLCollection;
            rootElement: SVGSVGElement;
            readyState: string;
            referrer: string;
            alinkColor: string;
            parentWindow: IWindow;
            xmlVersion: string;
            doctype: DocumentType;
            bgColor: string;
            linkColor: string;
            applets: HTMLCollection;
            body: HTMLElement;
            domain: string;
            xmlStandalone: boolean;
            selection: MSSelection;
            documentElement: HTMLElement;
            media: string;
            images: HTMLCollection;
            location: Location;
            lastModified: string;
            fgColor: string;
            compatMode: string;
            queryCommandValue(commandId: string): string;
            adoptNode(source: Node): Node;
            queryCommandIndeterm(commandId: string): boolean;
            getElementsByTagNameNS(namespaceURI: string, localName: string): NodeList;
            createProcessingInstruction(target: string, data: string): ProcessingInstruction;
            execCommand(commandId: string, showUI?: boolean, value?: any): boolean;
            elementFromPoint(x: number, y: number): Element;
            createCDATASection(data: string): CDATASection;
            queryCommandText(commandId: string): string;
            write(...content: string[]): void;
            updateSettings(): void;
            createElement(tagName: string): HTMLElement;
            releaseCapture(): void;
            writeln(...content: string[]): void;
            createElementNS(namespaceURI: string, qualifiedName: string): Element;
            open(url?: string, name?: string, features?: string, replace?: boolean): any;
            queryCommandSupported(commandId: string): boolean;
            createTreeWalker(root: Node, whatToShow: number, filter: NodeFilter, entityReferenceExpansion: boolean): TreeWalker;
            createAttributeNS(namespaceURI: string, qualifiedName: string): Attr;
            queryCommandEnabled(commandId: string): boolean;
            focus(): void;
            close(): void;
            getElementsByClassName(classNames: string): NodeList;
            importNode(importedNode: Node, deep: boolean): Node;
            createRange(): Range;
            fireEvent(eventName: string, eventObj?: any): boolean;
            createComment(data: string): Comment;
            getElementsByTagName(name: string): NodeList;
            createDocumentFragment(): DocumentFragment;
            createStyleSheet(href?: string, index?: number): CSSStyleSheet;
            getElementsByName(elementName: string): NodeList;
            queryCommandState(commandId: string): boolean;
            hasFocus(): boolean;
            execCommandShowHelp(commandId: string): boolean;
            createAttribute(name: string): Attr;
            createTextNode(data: string): Text;
            createNodeIterator(root: Node, whatToShow: number, filter: NodeFilter, entityReferenceExpansion: boolean): NodeIterator;
            createEventObject(eventObj?: any): MSEventObj;
            getSelection(): Selection;
            getElementById(elementId: string): HTMLElement;

            visibilityState: string;
            hidden: boolean;
            clear(): void;

            createEvent(eventInterface: string): Event;

            onkeydown: (ev: KeyboardEvent) => any;
            onkeyup: (ev: KeyboardEvent) => any;
            onreset: (ev: Event) => any;
            onhelp: (ev: Event) => any;
            ondragleave: (ev: DragEvent) => any;
            onfocusin: (ev: FocusEvent) => any;
            onseeked: (ev: Event) => any;
            onblur: (ev: FocusEvent) => any;
            onemptied: (ev: Event) => any;
            onseeking: (ev: Event) => any;
            ondeactivate: (ev: UIEvent) => any;
            oncanplay: (ev: Event) => any;
            ondatasetchanged: (ev: MSEventObj) => any;
            onrowsdelete: (ev: MSEventObj) => any;
            onloadstart: (ev: Event) => any;
            oncontrolselect: (ev: MSEventObj) => any;
            ondragenter: (ev: DragEvent) => any;
            onsubmit: (ev: Event) => any;
            onchange: (ev: Event) => any;
            ondurationchange: (ev: Event) => any;
            onbeforeactivate: (ev: UIEvent) => any;
            oncanplaythrough: (ev: Event) => any;
            onbeforeupdate: (ev: MSEventObj) => any;
            ondatasetcomplete: (ev: MSEventObj) => any;
            onsuspend: (ev: Event) => any;
            onerrorupdate: (ev: MSEventObj) => any;
            onmouseout: (ev: MouseEvent) => any;
            onmousewheel: (ev: MouseWheelEvent) => any;
            onvolumechange: (ev: Event) => any;
            oncellchange: (ev: MSEventObj) => any;
            onrowexit: (ev: MSEventObj) => any;
            onrowsinserted: (ev: MSEventObj) => any;
            onpropertychange: (ev: MSEventObj) => any;
            ondragend: (ev: DragEvent) => any;
            ondragover: (ev: DragEvent) => any;
            ondragstart: (ev: DragEvent) => any;
            onmouseup: (ev: MouseEvent) => any;
            ondrag: (ev: DragEvent) => any;
            onmouseover: (ev: MouseEvent) => any;
            onpause: (ev: Event) => any;
            onmousedown: (ev: MouseEvent) => any;
            onclick: (ev: MouseEvent) => any;
            onwaiting: (ev: Event) => any;
            onstop: (ev: Event) => any;
            onstalled: (ev: Event) => any;
            onmousemove: (ev: MouseEvent) => any;
            onbeforeeditfocus: (ev: MSEventObj) => any;
            onratechange: (ev: Event) => any;
            onprogress: (ev: any) => any;
            ondblclick: (ev: MouseEvent) => any;
            oncontextmenu: (ev: MouseEvent) => any;
            onloadedmetadata: (ev: Event) => any;
            onerror: (ev: Event) => any;
            onplay: (ev: Event) => any;
            onafterupdate: (ev: MSEventObj) => any;
            onplaying: (ev: Event) => any;
            onabort: (ev: UIEvent) => any;
            onfocusout: (ev: FocusEvent) => any;
            onselectionchange: (ev: Event) => any;
            onstoragecommit: (ev: StorageEvent) => any;
            ondataavailable: (ev: MSEventObj) => any;
            onreadystatechange: (ev: Event) => any;
            onkeypress: (ev: KeyboardEvent) => any;
            onloadeddata: (ev: Event) => any;
            onbeforedeactivate: (ev: UIEvent) => any;
            onactivate: (ev: UIEvent) => any;
            onselectstart: (ev: Event) => any;
            onfocus: (ev: FocusEvent) => any;
            ontimeupdate: (ev: Event) => any;
            onselect: (ev: UIEvent) => any;
            ondrop: (ev: DragEvent) => any;
            onended: (ev: Event) => any;
            onscroll: (ev: UIEvent) => any;
            onrowenter: (ev: MSEventObj) => any;
            onload: (ev: Event) => any;
            oninput: (ev: Event) => any;
            onpointerenter: (ev: PointerEvent) => any;
            onpointerout: (ev: PointerEvent) => any;
            onpointerdown: (ev: PointerEvent) => any;
            onpointerup: (ev: PointerEvent) => any;
            onpointercancel: (ev: PointerEvent) => any;
            onpointerover: (ev: PointerEvent) => any;
            onpointermove: (ev: PointerEvent) => any;
            onpointerleave: (ev: PointerEvent) => any;

            // - - - Start MS Properties ---
            onmsthumbnailclick: (ev: MSSiteModeEvent) => any;
            onmssitemodejumplistitemremoved: (ev: MSSiteModeEvent) => any;
            onmspointerdown: (ev: any) => any;
            onmsgesturedoubletap: (ev: any) => any;
            onmsmanipulationstatechanged: (ev: any) => any;
            onmspointerhover: (ev: any) => any;
            onmscontentzoom: (ev: any) => any;
            onmspointermove: (ev: any) => any;
            onmsgesturehold: (ev: any) => any;
            onmsgesturechange: (ev: any) => any;
            onmsgesturestart: (ev: any) => any;
            onmspointercancel: (ev: any) => any;
            onmsgestureend: (ev: any) => any;
            onmsgesturetap: (ev: any) => any;
            onmspointerout: (ev: any) => any;
            onmsinertiastart: (ev: any) => any;
            onmspointerover: (ev: any) => any;
            onmspointerup: (ev: any) => any;
            onmsfullscreenerror: (ev: any) => any;
            onmspointerenter: (ev: any) => any;
            onmsfullscreenchange: (ev: any) => any;
            onmspointerleave: (ev: any) => any;

            captureEvents(): void;
            releaseEvents(): void;

            attachEvent(event: string, listener: EventListener): boolean;
            detachEvent(event: string, listener: EventListener): void;

            msCapsLockWarningOff: boolean;
            msHidden: boolean;
            msVisibilityState: string;
            msCSSOMElementFloatMetrics: boolean;
            msElementsFromPoint(x: number, y: number): NodeList;
            msElementsFromRect(left: number, top: number, width: number, height: number): NodeList;

            msFullscreenEnabled: boolean;
            msFullscreenElement: Element;
            msExitFullscreen(): void;
            // - - - End MS Properties ---
        }

        export class Window extends EventTarget implements IWindow {

            localStorage: Storage;

            sessionStorage: Storage;

            clearTimeout(handle: number): void;
            setTimeout(handler: any, timeout?: any, ...args: any[]): number;
            clearInterval(handle: number): void;
            setInterval(handler: any, timeout?: any, ...args: any[]): number;

            screenX: number;
            history: History;
            pageXOffset: number;
            name: string;

            opener: IWindow;
            top: IWindow;
            innerHeight: number;
            frames: IWindow;
            outerWidth: number;
            innerWidth: number;
            length: number;
            screen: Screen;
            self: IWindow;
            document: IDocument;
            pageYOffset: number;
            parent: IWindow;
            location: Location;
            outerHeight: number;
            frameElement: Element;
            window: IWindow;
            navigator: Navigator;
            styleMedia: StyleMedia;
            screenY: number;
            performance: Performance;
            alert(message?: any): void;
            scroll(x?: number, y?: number): void;
            focus(): void;
            scrollTo(x?: number, y?: number): void;
            print(): void;
            prompt(message?: string, defaul?: string): string;
            toString(): string;
            open(url?: string, target?: string, features?: string, replace?: boolean): IWindow;
            scrollBy(x?: number, y?: number): void;
            confirm(message?: string): boolean;
            close(): void;
            postMessage(message: any, targetOrigin: string, ports?: any): void;
            showModalDialog(url?: string, argument?: any, options?: any): any;
            blur(): void;
            getSelection(): Selection;
            getComputedStyle(elt: Element, pseudoElt?: string): CSSStyleDeclaration;

            devicePixelRatio: number;
            msCrypto: Crypto;
            doNotTrack: string;

            ondragend: (ev: DragEvent) => any;
            onkeydown: (ev: KeyboardEvent) => any;
            ondragover: (ev: DragEvent) => any;
            onkeyup: (ev: KeyboardEvent) => any;
            onreset: (ev: Event) => any;
            onmouseup: (ev: MouseEvent) => any;
            ondragstart: (ev: DragEvent) => any;
            ondrag: (ev: DragEvent) => any;
            onmouseover: (ev: MouseEvent) => any;
            ondragleave: (ev: DragEvent) => any;
            onafterprint: (ev: Event) => any;
            onpause: (ev: Event) => any;
            onbeforeprint: (ev: Event) => any;
            onmousedown: (ev: MouseEvent) => any;
            onseeked: (ev: Event) => any;
            onclick: (ev: MouseEvent) => any;
            onwaiting: (ev: Event) => any;
            ononline: (ev: Event) => any;
            ondurationchange: (ev: Event) => any;
            onblur: (ev: FocusEvent) => any;
            onemptied: (ev: Event) => any;
            onseeking: (ev: Event) => any;
            oncanplay: (ev: Event) => any;
            onstalled: (ev: Event) => any;
            onmousemove: (ev: MouseEvent) => any;
            onbeforeunload: (ev: BeforeUnloadEvent) => any;
            onratechange: (ev: Event) => any;
            onstorage: (ev: StorageEvent) => any;
            onloadstart: (ev: Event) => any;
            ondragenter: (ev: DragEvent) => any;
            onsubmit: (ev: Event) => any;
            oncontextmenu: (ev: MouseEvent) => any;
            onchange: (ev: Event) => any;
            onloadedmetadata: (ev: Event) => any;
            onplay: (ev: Event) => any;
            onerror: ErrorEventHandler;
            onplaying: (ev: Event) => any;
            oncanplaythrough: (ev: Event) => any;
            onabort: (ev: UIEvent) => any;
            onreadystatechange: (ev: Event) => any;
            onloadeddata: (ev: Event) => any;
            onsuspend: (ev: Event) => any;
            onfocus: (ev: FocusEvent) => any;
            onmessage: (ev: MessageEvent) => any;
            ontimeupdate: (ev: Event) => any;
            onresize: (ev: UIEvent) => any;
            onselect: (ev: UIEvent) => any;
            ondrop: (ev: DragEvent) => any;
            onmouseout: (ev: MouseEvent) => any;
            onended: (ev: Event) => any;
            onhashchange: (ev: Event) => any;
            onunload: (ev: Event) => any;
            onscroll: (ev: UIEvent) => any;
            onmousewheel: (ev: MouseWheelEvent) => any;
            onload: (ev: Event) => any;
            onvolumechange: (ev: Event) => any;
            oninput: (ev: Event) => any;
            onpageshow: (ev: PageTransitionEvent) => any;
            ondevicemotion: (ev: DeviceMotionEvent) => any;
            ondeviceorientation: (ev: DeviceOrientationEvent) => any;
            onpagehide: (ev: PageTransitionEvent) => any;
            onmouseleave: (ev: MouseEvent) => any;
            onfocusout: (ev: FocusEvent) => any;
            onfocusin: (ev: FocusEvent) => any;
            onpointerenter: (ev: PointerEvent) => any;
            onpointerout: (ev: PointerEvent) => any;
            onpointerdown: (ev: PointerEvent) => any;
            onpointerup: (ev: PointerEvent) => any;
            onpointercancel: (ev: PointerEvent) => any;
            onpointerover: (ev: PointerEvent) => any;
            onpointermove: (ev: PointerEvent) => any;
            onpointerleave: (ev: PointerEvent) => any;
            onoffline: (ev: Event) => any;
            onkeypress: (ev: KeyboardEvent) => any;
            onpopstate: (ev: PopStateEvent) => any;
            onprogress: (ev: any) => any;
            ondblclick: (ev: MouseEvent) => any;
            onmouseenter: (ev: MouseEvent) => any;
            onhelp: (ev: Event) => any;

            // - - - Start MS Properties ---

            onmspointerenter: (ev: any) => any;
            onmspointerleave: (ev: any) => any;
            onmspointerdown: (ev: any) => any;
            onmsgesturedoubletap: (ev: any) => any;
            onmspointerhover: (ev: any) => any;
            onmsgesturehold: (ev: any) => any;
            onmspointermove: (ev: any) => any;
            onmsgesturechange: (ev: any) => any;
            onmsgesturestart: (ev: any) => any;
            onmspointercancel: (ev: any) => any;
            onmsgestureend: (ev: any) => any;
            onmsgesturetap: (ev: any) => any;
            onmspointerout: (ev: any) => any;
            onmsinertiastart: (ev: any) => any;
            onmspointerover: (ev: any) => any;
            onmspointerup: (ev: any) => any;

            attachEvent(event: string, listener: EventListener): boolean;
            detachEvent(event: string, listener: EventListener): void;

            status: string;
            screenLeft: number;
            offscreenBuffering: any;
            maxConnectionsPerServer: number;
            clipboardData: DataTransfer;
            defaultStatus: string;
            clientInformation: Navigator;
            closed: boolean;
            external: External;
            event: MSEventObj;
            screenTop: number;
            showModelessDialog(url?: string, argument?: any, options?: any): IWindow;
            navigate(url: string): void;
            resizeBy(x?: number, y?: number): void;
            item(index: any): any;
            resizeTo(x?: number, y?: number): void;
            createPopup(arguments?: any): MSPopupWindow;
            toStaticHTML(html: string): string;
            execScript(code: string, language?: string): any;
            msWriteProfilerMark(profilerMarkName: string): void;
            showHelp(url: string, helpArg?: any, features?: string): void;

            captureEvents(): void;
            releaseEvents(): void;

            animationStartTime: number;
            msAnimationStartTime: number;
            applicationCache: ApplicationCache;
            msCancelRequestAnimationFrame(handle: number): void;
            matchMedia(mediaQuery: string): MediaQueryList;
            cancelAnimationFrame(handle: number): void;
            msIsStaticHTML(html: string): boolean;
            msMatchMedia(mediaQuery: string): MediaQueryList;
            requestAnimationFrame(callback: FrameRequestCallback): number;
            msRequestAnimationFrame(callback: FrameRequestCallback): number;

            msIndexedDB: IDBFactory;

            msSetImmediate(expression: any, ...args: any[]): number;
            clearImmediate(handle: number): void;
            msClearImmediate(handle: number): void;
            setImmediate(expression: any, ...args: any[]): number;

            // - - - End MS Properties ---

            btoa(rawString: string): string;
            atob(encodedString: string): string;

            moveTo(x?: number, y?: number): void;
            moveBy(x?: number, y?: number): void;

            indexedDB: IDBFactory;
            console: Console;
        }

        document = <IDocument><any>new Document();
        window = <IWindow><any>new Window();

        function updateUI() {
            // ... send all the update requests to the UI if client side, or by WebSocket if server side ...
            if (Environment == Environments.Server) {
            } else {
            }
        }

        setTimeout(updateUI, 1000 / 60); // UI Update Timer
    }
}
