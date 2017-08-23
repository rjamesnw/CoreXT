declare var module: CoreXT.Scripts.IModule;
declare var exports: { };

CoreXT.using // (this just confirms that the 'CoreXT.UI.HTML' module is available before continuing)
    .System.UI()
    .System.UI_HTML();

if (CoreXT.Environment == CoreXT.Environments.Browser) { // (just in case [should load from the cache if already in place] ...)
    // ... write this inline with the page so it's available asap ...
    //var link = <HTMLLinkElement>document.createElement("link");
    //??link.href = CoreXT.System.IO.moduleFilesBasePath + "Bootstrap/css/bootstrap.min.css";
    //link.rel = "stylesheet";
    //document.getElementsByTagName("head")[0].appendChild(link);

    //link = <HTMLLinkElement>document.createElement("link");
    //link.href = CoreXT.moduleFilesBasePath + "Bootstrap/css/bootstrap-theme.min.css";
    //link.rel = "stylesheet";
    //document.getElementsByTagName("head")[0].appendChild(link);
}

namespace CoreXT.System.Platform.UI.HTML {

    /** Contains Bootstrap related styling, elements, and components wrapped in GraphItem derived classes. */
    export module Bootstrap {

        // ===================================================================================================================

        //import StaticProperty = CoreXT.StaticProperty;
        //import GraphItem = CoreXT.GraphItem;
        //import Property = CoreXT.Property;

        // ===================================================================================================================

        export enum ButtonTypes {
            /** Standard gray button. */
            Default = <ButtonTypes><any>"btn",
            /** Provides extra visual weight and identifies the primary action in a set of buttons. */
            Primary = <ButtonTypes><any>"btn btn-primary",
            /** Used as an alternative to the default styles. */
            Info = <ButtonTypes><any>"btn btn-info",
            /** Indicates a successful or positive action. */
            Success = <ButtonTypes><any>"btn btn-success",
            /** Indicates caution should be taken with this action. */
            Warning = <ButtonTypes><any>"btn btn-warning",
            /** Indicates a dangerous or potentially negative action. */
            Danger = <ButtonTypes><any>"btn btn-danger",
            /** Alternate dark gray button, not tied to a semantic action or use. */
            Inverse = <ButtonTypes><any>"btn btn-inverse",
            /** Deemphasize a button by making it look like a link while maintaining button behavior. */
            Link = <ButtonTypes><any>"btn btn-link"
        }

        export class ButtonSize {
            static Large: ButtonSize = "btn-large";
            static Default: ButtonSize = "";
            static Small: ButtonSize = "btn-small";
            static Mini: ButtonSize = "btn-mini";
        }

        export class RowStates {
            static Default: RowStates = "";
            static Success: RowStates = "success";
            static Error: RowStates = "error";
            static Warning: RowStates = "warning";
            static Info: RowStates = "info";
        }

        // ===================================================================================================================

        export declare function Button(parent?: GraphItem.$Type, buttonType?: ButtonTypes, buttonSize?: ButtonSize): Button.$Type;
        /** Represents a button type in Bootstrap. */
        export module Button {
            export var ButtonType = Events.EventDispatcher.registerEvent(Button, "buttonType", true, ButtonTypes.Success);
            export var ButtonSize = Events.EventDispatcher.registerEvent(Button, "buttonSize", true, ButtonSize.Default);
            export var BLockLevel = Events.EventDispatcher.registerEvent(Button, "blockLevel", true, <boolean>void 0);
            export var IsDisabled = Property.register(Button, "isDisabled", true, false);

            export class $Type extends __HTMLElement.HTMLElement {
                // ---------------------------------------------------------------------------------------------------------------

                _buttonType: typeof Button.ButtonType.propertyGetSetHandler;
                buttonType: typeof Button.ButtonType.defaultValue;

                _buttonSize: typeof Button.ButtonSize.propertyGetSetHandler;
                buttonSize: typeof Button.ButtonSize.defaultValue;

                _buttonLevel: typeof Button.BLockLevel.propertyGetSetHandler;
                buttonLevel: typeof Button.BLockLevel.defaultValue;

                _isDisabled: typeof Button.IsDisabled.propertyGetSetHandler;
                isDisabled: typeof Button.IsDisabled.defaultValue;


                // ---------------------------------------------------------------------------------------------------------------

                constructor(parent: GraphItem.$Type = null, buttonType: ButtonTypes = ButtonTypes.Success, buttonSize: ButtonSize = ButtonSize.Default) {
                    super(parent)
                    this._buttonType(buttonType);
                    this._buttonSize(buttonSize);
                    this.htmlTag = "button";
                }

                // ---------------------------------------------------------------------------------------------------------------

                createUIElement(): Node {
                    this.assertUnsupportedElementTypes("html", "head", "body", "script", "audio", "canvas", "object");
                    return super.createUIElement();
                }

                // ---------------------------------------------------------------------------------------------------------------

                onUpdateVisual() {
                    this.setValue("class", this.__properties[Button.ButtonType.name]
                        + " " + this.__properties[Button.ButtonSize.name]
                        + " " + (this.__properties[Button.BLockLevel.name] ? "btn-block" : "")
                        + " " + (this.__properties[Button.IsDisabled.name] ? "disabled" : "")
                        , false);
                }

                // ---------------------------------------------------------------------------------------------------------------
            }

            AppDomain.registerClass(Button, [CoreXT, System, Platform, UI, HTML, Bootstrap]);
        }

        // ===================================================================================================================

        export declare function Table(parent?: GraphItem.$Type): Table.$Type;
        /** Represents a button type in Bootstrap. */
        export module Table {
            export class $Type extends HTML.Table.$Type {
                // ---------------------------------------------------------------------------------------------------------------

                constructor(parent: GraphItem.$Type = null) {
                    super(parent)
                    this.htmlTag = "table";
                }

                // ---------------------------------------------------------------------------------------------------------------

                createUIElement(): Node {
                    this.assertSupportedElementTypes("table");
                    return super.createUIElement();
                }

                // ---------------------------------------------------------------------------------------------------------------

                onUpdateVisual() {
                    //??this.setValue("class", "table", false);
                }

                // ---------------------------------------------------------------------------------------------------------------
            }

            AppDomain.registerClass(Table, [CoreXT, System, Platform, UI, HTML, Bootstrap]);
        }

        // ===================================================================================================================

        export declare function TableRow(parent?: GraphItem.$Type): TableRow.$Type;
        /** Represents a row on a table type in Bootstrap. */
        export module TableRow {
            export var RowState = Property.register(TableRow, "rowState", true, RowStates.Default, UNDEFINED, $Type.prototype._rowStateChanged);

            export class $Type extends HTML.TableRow.$Type {

                // ---------------------------------------------------------------------------------------------------------------

                _rowState: typeof TableRow.RowState.propertyGetSetHandler;
                rowState: typeof TableRow.RowState.defaultValue;
                _rowStateChanged(property: typeof TableRow.RowState.propertyType) {
                    this._cssclass(this._rowState());
                }

                // ---------------------------------------------------------------------------------------------------------------

                constructor(parent: GraphItem.$Type = null, rowState: RowStates = RowStates.Default) {
                    super(parent)
                    this._rowState(rowState);
                }

                // ---------------------------------------------------------------------------------------------------------------

                onUpdateVisual() {
                    this.setValue("class", this.__properties[TableRow.RowState.name], false);
                }

                // ---------------------------------------------------------------------------------------------------------------
            }

            AppDomain.registerClass(TableRow, [CoreXT, System, Platform, UI, HTML, Bootstrap]);
        }

        // ===================================================================================================================

        /** Return a new model window. */
        export declare function Modal(parent?: GraphItem.$Type): Modal.$Type;
        /** Represents a modal window in Bootstrap. */
        export module Modal {
            export class $Type extends __HTMLElement.HTMLElement {
                // ---------------------------------------------------------------------------------------------------------------

                constructor(parent: GraphItem.$Type) {
                    super(parent)
                    }

                // ---------------------------------------------------------------------------------------------------------------

                createUIElement(): Node {
                    this.assertSupportedElementTypes("div", "span");
                    return super.createUIElement();
                }

                // ---------------------------------------------------------------------------------------------------------------

                onUpdateVisual() {
                    this.setValue("class", "table", false);
                }

                // ---------------------------------------------------------------------------------------------------------------
            }

            AppDomain.registerClass(Modal, [CoreXT, System, Platform, UI, HTML, Bootstrap]);
        }

        // ===================================================================================================================
    }
}