// ############################################################################################################################
// Types for specialized object property management.
// ############################################################################################################################

namespace CoreXT.System.Platform {
    // ========================================================================================================================
    export interface IEvents { [index: string]: Events.IEventDispatcher<GraphNode, (ev: Event) => any>; }

    /** A graph item represents a single node on the application graph. */
    export class GraphNode extends PropertyEventBase {

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns a default accessor (get/set) function to be used when creating accessor functions in GraphItem derived types.
        * When 'GraphItem' is extended, the developer normally creates special "property functions" that get and set values in 
        * the internal 'properties' observable array (such as "x = obj.X()" for "get", and "obj.X(x)" for "set"+"get").
        * The 'observablePropertyName' parameter is the name that will be used when calling '{GraphItem}.setProperty()' and
        * '{GraphItem}.getProperty()' (which ultimately updates the 'properties' array, allowing listeners to be notified).
        * Typically, the properties used with accessors include HTML attributes specific to a particular element, but can
        * also include custom attributes not part of the element object as well. This allows creating special element
        * objects that are a combination of multiple elements, allowing for a very flexible UI model.
        */
        static accessor = (registeredProperty: StaticProperty): any => {
            return function (value: any) {
                if (arguments.length > 0)
                    return (<GraphNode>this).setValue(registeredProperty, value);
                return (<GraphNode>this).getValue(registeredProperty);
            };
        };

        // --------------------------------------------------------------------------------------------------------------------

        //?? private static __staticProperties: StaticProperty[] = [];

        /** Registers a list of UI attribute names that, when updated, should trigger a redraw event. 
        * @param {GraphItem} type Your derived 'GraphItem' type.
        * @param {string} name The property name to set internally (this can be different from the static property name).
        * Note: The name you choose will also be set as an attribute on the element, so for example, using 'id' or 'name'
        * as a name will also update the underlying element's 'id' and 'name' attributes.
        * @param {boolean} isVisual Set this to true on properties that affect the visual display of an element.  For example,
        * some derived graph items may contain text, size, or color type properties that, when updated, should be reflected on
        * the UI.  This is managed internally by automatically triggering a call to 'onRedraw()' to update the visual state.
        * @param {Function} changedCallback A callback to execute when the property has changed.
        * @param {Function} changingCallback A callback to execute before the property changes.
        */
        static registerProperty(type: typeof GraphNode, name: string, isVisual: boolean = false,
            changedCallback: ListenerCallback = null, changingCallback: InterceptorCallback = null): StaticProperty {

            if (!type) throw Exception.from("A class type [function] is required for property registration.");
            if (!name) throw Exception.from("A name is required for property registration.");

            var sProp = new StaticProperty(name, isVisual);

            if (changedCallback != null)
                sProp.registerListener(changedCallback);

            if (changingCallback != null)
                sProp.registerInterceptor(changingCallback);

            var currentSP: Array<StaticProperty> = type['__staticProperties'];

            if (currentSP === void 0) {
                type['__staticProperties'] = currentSP = [];
                (<any>currentSP).parent = null;
                (<any>currentSP).owner = type;
            }
            else if ((<any>currentSP).owner !== type) {
                // (since TS's '__extends' function copies forward all the static properties to derived objects, a new array needs to be created at each inheritance level)
                var typeSpecificSP: any[] = [];
                (<any>typeSpecificSP).parent = currentSP;
                (<any>typeSpecificSP).owner = type;
                //for (var i = 0, n = currentSP.length; i < n; ++i)
                //    typeSpecificSP.push(currentSP[i]);
                type['__staticProperties'] = currentSP = typeSpecificSP;
            }

            currentSP.push(sProp);

            return sProp;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Each new graph item instance will initially set its '__htmlTag' property to this value. */
        static defaultHTMLTag: string = "div";

        /** This is a counter used to get a unique ID to all graph items. */
        private static __nextID: number = 0;

        // --------------------------------------------------------------------------------------------------------------------

        /** The ID of this graph item, which is useful for synchronizing the graph tree with the server side. */
        _id: number = -1;

        /** A globally unique name for this graph item. */
        _name: string = "";

        /** The display name for this graph item, which is useful if developing in an IDE. */
        _displayName: string = "";

        __parent: GraphNode = null;
        __children: Array<GraphNode> = [];

        /** Represents the HTML element tag to use for this graph item.  The default value is set when a derived graph item is constructed.
        * Not all objects support this property, and changing it is only valid BEFORE the layout is updated for the first time.
        */
        htmlTag: string = GraphNode.defaultHTMLTag; // (warning: this may already be set from parsing an HTML template)
        __element: Node = null;
        __htmlElement: HTMLElement = null;

        /** Holds a collection of properties, indexed by property name, that are used by the active instance. 
        */
        __properties: IProperties = {}; // (warning: this may already be set from parsing an HTML template)

        /**
        * Holds a copy of the 'properties' collection before the application starts (set during the initial layout phase).
        * This allows quick restarting the application later if desired.
        */
        __initialProperties: IProperties = null;

        /** Holds a list of event handlers indexed by event name for this GraphItem instance. */
        __events: IEvents = {};

        /** Holds a list of registered handlers to be notified when any property changes within this graph item. */
        __propertyChangedHandlers: PropertyChangedHandler[] = null;

        // --------------------------------------------------------------------------------------------------------------------

        isInitialized(): boolean { return !!this.__initialProperties; }

        //getTypeName(): string {
        //    //var constructorfunctionStr = "" + (<any>this).constructor;
        //    //var i1 = constructorfunctionStr.indexOf("function") + 8, i2 = constructorfunctionStr.indexOf("(");
        //    //return constructorfunctionStr.substring(i1, i2).trim();
        //    return this.getTypeInfo().$__name;
        //}

        // --------------------------------------------------------------------------------------------------------------------

        constructor(parent: GraphNode = null) {
            super();

            this._id = GraphNode.__nextID++;

            // ... need to initialize the properties to the static defaults ...
            // (note: this pass only creates the property instances in their initial states - no state information is applied)

            var i: number, n: number, p: StaticProperty, type = (<any>this).constructor, sp = type.__staticProperties;

            if (sp !== void 0)
                while (sp) {
                    for (i = sp.length - 1; i >= 0; --i) {
                        p = sp[i];
                        this.__properties[p.name] = p.createPropertyInstance(this);
                    }
                    sp = sp.parent; // (each type has its own array of static properties that have a parent reference to the super class)
                }

            if (parent)
                parent.addChild(this);
        }

        /** Causes the instance '__properties' collection to be replaced by a brand-new copy of the property values in the '__initialProperties' collection. */
        resetProperties() {
            var i: number, n: number, p: string;
            for (p in this.__initialProperties)
                this.__properties[p] = this.__initialProperties[p].clone();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** This is called internally in the layout phase upon creating elements for the first time. */
        updateInitialProperties() {
            this.__initialProperties = {};
            for (var p in this.__properties)
                this.__initialProperties[p] = this.__properties[p].clone();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Sets an observable property value on the graph item object.
        * Observable properties can trigger events to allow the UI to update as required.
        * @see also: {@link getProperty}
        * @param {boolean} triggerChangeEvent If true (default), causes a change event to be triggered.  Set this to false to prevent any listeners from being called.
        */
        setValue(property: StaticProperty, value: any, triggerChangeEvents?: boolean): any;
        /** Sets an observable property value on the graph item object.
        * Observable properties can trigger events to allow the UI to update as required.
        * @see also: {@link getProperty}
        * @param {boolean} triggerChangeEvent If true (default), causes a change event to be triggered.  Set this to false to prevent any listeners from being called.
        */
        setValue(name: string, value: any, triggerChangeEvents?: boolean): any;
        setValue(index: any, value: any, triggerChangeEvents: boolean = true): any {
            var name = index.name || index;
            if (typeof value === 'object' && value instanceof Property)
                value = (<Property>value).getValue(); // (value is a property instance, so get its value)

            var property = this.__properties[name];
            if (property === void 0)
                this.__properties[name] = property = new Property(this, null, value); // (property doesn't exist yet, so create it [note: no static info exists])
            else
                property.setValue(value, triggerChangeEvents);

            // ... setting a local observable property will also set any corresponding element property ...
            if (this.__htmlElement && this.__htmlElement.setAttribute)
                this.__htmlElement.setAttribute(name, value);

            return property.getValue();
        }

        /** Gets an observable property value from the graph item object.
        * Observable properties can trigger events to allow the UI to update as required.
        * @see also: {@link setProperty}
        */
        getValue(property: StaticProperty): any;
        /** Gets an observable property value from the graph item object.
        * Observable properties can trigger events to allow the UI to update as required.
        * @see also: {@link setProperty}
        */
        getValue(name: string): any;
        getValue(index: any): any {
            var property = this.__properties[index.name || index];
            return (property === void 0) ? void 0 : property.getValue();
        }

        /** Returns the instance property details for the specified static property definition. */
        getProperty(property: StaticProperty): Property;
        /** Returns the instance property details for the specified property name. */
        getProperty(name: string): Property;
        getProperty(index: any): Property {
            var name = index.name || index;
            return this.__properties[name];
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Copies over properties from the specified graph item. */
        copyProperties(graphItem: GraphNode, ...excludeList: string[]): void {
            for (var pname in graphItem.__properties)
                if (excludeList && !~excludeList.indexOf(pname))
                    this.setValue(pname, graphItem.__properties[pname]);
        }

        // --------------------------------------------------------------------------------------------------------------------

        __DoOnAnyPropertyChanged(property: Property) {
            if (this.__propertyChangedHandlers != null)
                for (var i = 0, n = this.__propertyChangedHandlers.length; i < n; ++i)
                    this.__propertyChangedHandlers[i].call(this, this, property);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Adds a handler that will be called when a property is added, modified, or deleted.
        * @see also: {@link removePropertyChangedHandler}
        */
        addPropertyChangedHandler(handler: PropertyChangedHandler) {
            if (!this.__propertyChangedHandlers)
                this.__propertyChangedHandlers = [];
            var i = this.__propertyChangedHandlers.indexOf(handler);
            if (i == -1) this.__propertyChangedHandlers.push(handler);
        }

        /** Removes property change handlers.
        * @see also: {@link addPropertyChangedHandler}
        */
        removePropertyChangedHandler(handler: PropertyChangedHandler) {
            var i;
            if (this.__propertyChangedHandlers) {
                i = this.__propertyChangedHandlers.indexOf(handler);
                if (i > 0) this.__propertyChangedHandlers.splice(i, 1);
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns the event manager object for the specified event name. */
        getEvent(eventName: string) {
            return this.__events[eventName];
        }

        /** Attaches an event handler to the specified event name. */
        on(eventName: string, handler: (ev: Event) => any) {
            var existingEvent = this.__events[eventName];
            if (existingEvent === void 0) {
                this.__events[eventName] = existingEvent = Events.EventDispatcher.new<GraphNode, (ev: Event) => any>(this, eventName);
                if (this.__htmlElement) {
                    if (this.__htmlElement.addEventListener)
                        this.__htmlElement.addEventListener(eventName, (ev: any): any => { return existingEvent.dispatch(ev); }, false);
                    else if (this.__htmlElement['attachEvent']) {
                        this.__htmlElement['attachEvent']("on" + eventName, (ev: any): any => { return existingEvent.dispatch(ev); });
                    } else {
                        // (server, do nothing more)
                    }
                }
            }
            existingEvent.addListener(handler);
        }

        /** Detaches an event handler from the specified event name. */
        off(eventName: string, handler: (ev: Event) => any) {
            var existingEvent = this.__events[eventName];
            if (existingEvent !== void 0)
                existingEvent.removeListener(this, handler);
        }

        /** Removes all event handlers for the specified event name. */
        clearHandlers(eventName: string) {
            var existingEvent = this.__events[eventName];
            if (existingEvent !== void 0)
                existingEvent.removeAllListeners();
        }

        // --------------------------------------------------------------------------------------------------------------------

        addChild(item: GraphNode): GraphNode {
            // ... make sure the item doesn't exist, and move it from any other parent ...
            var i = this.__children.indexOf(item);
            if (i == -1) {
                if (item.__parent != null)
                    item.__parent.removeChild(item);
                item.__parent = this;
                this.__children.push(item);
            }
            return item;
        }

        /** Detaches this GraphItem from the logical graph tree, but does not remove it from the parent's child list.
        * Only call this function if you plan to manually remove the child from the parent.
        */
        detach(): GraphNode {
            if (this.__parent && this.__parent.__element && this.__element)
                this.__parent.__element.removeChild(this.__element);
            this.__parent = null;
            return this;
        }

        removeChildAt(itemIndex: number): GraphNode {
            if (itemIndex >= 0 && itemIndex < this.__children.length) {
                var item = this.__children[itemIndex];
                item.detach();
                return this.__children[itemIndex];
            }
            return null;
        }

        removeChild(item: GraphNode): GraphNode {
            if (item) {
                var i = this.__children.indexOf(item);
                if (i >= 0) this.removeChildAt(i);
            }
            return item;
        }

        removeAllChildren(): GraphNode[] {
            var items: GraphNode[] = this.__children;
            for (var i = items.length - 1; i >= 0; --i)
                items[i].detach();
            this.__children = [];
            return items;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Returns the graph item with the specified ID (similar to 'getElementById()'). */
        getItem(id: string): GraphNode { // TODO: Create a hash list for the IDs instead.
            var prop = this.__properties['id'], i, n, item;
            if (prop && prop.getValue() == id) return this;
            for (i = 0, n = this.__children.length; i < n; ++i) {
                item = this.__children[i].getItem(id);
                if (item !== void 0) return item;
            }
            return void 0;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** The function is called by the system in order to generate/update the initial properties and HTML elements for display.
        * @param {boolean} recursive Set to false to only update this graph item, ignoring all children.
        */
        updateLayout(recursive: boolean = true) {

            if (host.isClient()) { // (the server has no UI!)
                // ... create this item's element before the child items get updated ...

                var parentElement: Node = this.__parent ? this.__parent.__element : null;
                var i: number, n: number;
                var doRedraw = false;

                if (this.__element == null || this.__element.nodeName != this.htmlTag) {
                    if (this.__element != null && parentElement != null)
                        parentElement.removeChild(this.__element);

                    this.__element = this.createUIElement();
                    this.htmlTag = this.__element.nodeName; // (keep this the same, just in case it changes internally)

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

            // ... update the deepest items first (this is a logical pass only) ...

            if (recursive)
                for (i = 0, n = this.__children.length; i < n; ++i) {
                    this.__children[i].updateLayout(recursive);
                }

            if (this.__initialProperties == null) {
                // ... first time initializing: trigger 'changed' events for all properties in case listeners need to update/configure the graph item or underlying element ...
                for (var pname in this.__properties)
                    if (this.__properties[pname].triggerChangedEvent(true))
                        doRedraw = true;

                this.updateInitialProperties();
            }

            // ... redraw this item after all child items have been updated, and initial properties are set (the visual update pass) ...
            if (doRedraw) // (if not a client, then the server has no UI to redraw for!)
                this.onRedraw(false);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Changes the type of element to create (if supported by the derived type), and returns the underlying graph instance.
        * Changing this after a layout pass has already created elements will cause the existing element for this graph item to be deleted and replaced.
        * WARNING: This is not supported by all derived types, and calling this AFTER a layout pass has created elements for those unsupported types may have no effect.
        * For example, the UI 'PlaneText' graph item overrides 'createUIElement()' to return a node created from 'document.createTextNode()', 
        * and calling 'setHTMLTag("span")' will have no effect before OR after the first layout pass (this element will always be a text node).
        * Some derived types that override 'createUIElement()' my provide special logic to accept only supported types.
        */
        setHTMLTag(htmlTag: string): GraphNode {
            this.htmlTag = htmlTag;
            // .. if an element already exists, replace it if the tag is different ...
            if (this.__element != null && this.__element.nodeName != this.htmlTag) {
                this.updateLayout();
            }
            return this;
        }

        /** The function is called in order to produce an HTML element that represents the graph item.
        * The base class, by default, simply returns a new 'HTMLDivElement' element (which doesn't display anything).
        * It is expected that implementers will override this function in derived classes if any custom UI is to be generated.
        * If the derived type doesn't represent a UI element, don't override this function.
        */
        createUIElement(): Node {
            return document.createElement(this.htmlTag || GraphNode.defaultHTMLTag || "div");
        }

        /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate supported element types. */
        assertSupportedElementTypes(...args: string[]) {
            this.htmlTag = (this.htmlTag || "").toLowerCase();
            //??args = <string[]><any>arguments;
            if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length) args = <string[]><any>args[0];
            for (var i = 0; i < args.length; i++)
                if (this.htmlTag == args[i]) return true;
            throw Exception.from("The element type '" + this.htmlTag + "' is not supported for this GraphItem type.");
        }

        /** Call this at the beginning of an overridden 'createUIElement()' function on a derived GraphItem type to validate unsupported element types. */
        assertUnsupportedElementTypes(...args: string[]) {
            this.htmlTag = (this.htmlTag || "").toLowerCase();
            //??args = <string[]><any>arguments;
            if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length) args = <string[]><any>args[0];
            for (var i = 0; i < args.length; i++)
                if (this.htmlTag == args[i])
                    throw Exception.from("The element type '" + this.htmlTag + "' is not supported for this GraphItem type.");
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Updates the visual display of all child graph items (@see GraphItem.updateLayout). 
        * Expected to be overridden by derived types that store their layout/css information in the observable properties. 
        * This function is called when properties are completely replaced (such as when loading a project), rather than
        * calling an event for each property set, which can be much slower.
        * Typically, derived types simply update their CSS, innerHTML, or both, in this function.
        */
        onRedraw(recursive: boolean = true) {
            if (recursive)
                for (var i = 0; i < this.__children.length; i++)
                    this.__children[i].onRedraw();
        }

        // --------------------------------------------------------------------------------------------------------------------
        // Iteration Support

        /** Returns an enumerable that can be used to iterate over the child graph items. */
        asEnumerable(): IEnumerable<GraphNode> {
            return null; //Enumerable.From(this.__children);
        }

        /**
         * Returns an iterator to support Iteration for ES5/ES3.
         */
        iterator() { return this.asEnumerable(); }

        // --------------------------------------------------------------------------------------------------------------------
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
    export function parse(html: string = null, strictMode?: boolean): { rootElements: GraphNode[]; templates: { [id: string]: IDataTemplate; } } {
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

        var storeRunningText = (parent: GraphNode) => {
            if (htmlReader.runningText) { // (if there is running text, then create a text node for it for the CURRENT graph item [not the parent])
                if (!UI)
                    new GraphNode(parent).setValue((htmlReader.runningText.indexOf('&') < 0 ? "text" : "html"), htmlReader.runningText);
                else if (htmlReader.runningText.indexOf('&') < 0)
                    new UI.PlainText(parent, htmlReader.runningText);
                else
                    new UI.HTMLText(parent, htmlReader.runningText);
            }
        };

        var rootElements: GraphNode[] = [];
        var dataTemplates: { [id: string]: IDataTemplate; } = {};

        var processTags = (parent: GraphNode): IDataTemplate[] => { // (returns the data templates found for the immediate children only)
            var graphItemType: string, graphItemTypePrefix: string;
            var graphType: { new (parent: GraphNode): GraphNode; defaultHTMLTag: string; };
            var graphItem: GraphNode;
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

                                    graphType = <typeof GraphNode>Utilities.dereferencePropertyPath(CoreXT['parent'], Scripts.translateModuleTypeName(graphItemType));

                                    if (graphType === void 0)
                                        throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " was not found.");

                                    if (typeof graphType !== 'function' || typeof graphType.defaultHTMLTag === void 0)
                                        throw Exception.from("The graph item type '" + graphItemType + "' for tag '<" + currentTagName + "' on line " + htmlReader.getCurrentLineNumber() + " does not resolve to a GraphItem class type.");
                                }

                                if (graphType == null) {
                                    if (UI) { // (make sure the UI module is available)
                                        // ... auto detect the DreamSpace UI GraphItem type based on the tag name (all valid HTML4/5 tags: http://www.w3schools.com/tags/) ...
                                        switch (currentTagName) {
                                            case 'a': graphType = UI.Anchor; break;

                                            // (phrases)
                                            case 'abbr': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Abbreviation; break;
                                            case 'acronym': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Acronym; break;
                                            case 'em': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Emphasis; break;
                                            case 'strong': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Strong; break;
                                            case 'cite': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Cite; break;
                                            case 'dfn': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Defining; break;
                                            case 'code': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Code; break;
                                            case 'samp': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Sample; break;
                                            case 'kbd': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Keyboard; break;
                                            case 'var': graphType = UI.Phrase; properties['phraseTypes'] = UI.PhraseTypes.Variable; break;

                                            // (headers)
                                            case 'h1': graphType = UI.Header; properties['headerLevel'] = 1; break;
                                            case 'h2': graphType = UI.Header; properties['headerLevel'] = 2; break;
                                            case 'h3': graphType = UI.Header; properties['headerLevel'] = 3; break;
                                            case 'h4': graphType = UI.Header; properties['headerLevel'] = 4; break;
                                            case 'h5': graphType = UI.Header; properties['headerLevel'] = 5; break;
                                            case 'h6': graphType = UI.Header; properties['headerLevel'] = 6; break;

                                            default: graphType = UI.HTML; // (just create a basic object to use with htmlReader.tagName)
                                        }
                                    } else graphType = GraphNode; // (UI not loaded, so just create simple GraphItem objects)
                                }

                                if (!graphItem) { // (only create if not explicitly created)
                                    graphItem = new graphType(isDataTemplate ? null : parent);
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

    // ========================================================================================================================
}

// ############################################################################################################################
