declare var baseURL: string;

module CDS {
    export module Tables {
        // =====================================================================================================================

        export class TableRow {
            _tableID: string; // ("Table.tableID")
            _rowID: string; // ("Table.tableID.rowID")
            // (Note: Other values are stored as "Table.tableID.rowID.rowPropertyNames" and "Table.tableID.rowID.Entity.entityPropertyNames")

            _tr: HTMLTableRowElement;
            _input_RowIndex: HTMLInputElement;
            _input_RowID: HTMLInputElement;
            _input_New: HTMLInputElement;
            _input_Deleted: HTMLInputElement;
            _btn_delete: HTMLButtonElement;

            /** Returns true if the required row elements have fully loaded into the DOM. */
            get isReady(): boolean { return !!(this._rowID && this._tr && this._input_RowIndex && this._input_RowID && this._input_New && this._input_Deleted && this._btn_delete); }

            constructor(rowID: string) {
                this._rowID = rowID;

                // ... get all parts of the ID ...
                var parts = rowID.split("."); // (Table.tableID.rowID.Entity.propertyName)
                if (parts.length < 3)
                    throw "Invalid number of parts in row ID: '" + rowID + "'";
                this._tableID = parts[0] + "." + parts[1];

                this._tr = <HTMLTableRowElement>document.getElementById(rowID);
                this._input_RowIndex = <HTMLInputElement>document.getElementById(rowID + '.$rowIndex');
                this._input_RowID = <HTMLInputElement>document.getElementById(rowID + '.RowID');
                this._input_New = <HTMLInputElement>document.getElementById(rowID + '.New');
                this._input_Deleted = <HTMLInputElement>document.getElementById(rowID + '.Deleted');
                this._btn_delete = <HTMLButtonElement>document.getElementById(rowID + '.delete');
            }

            /** Returns an array of columns (aka entity property names) for this row. */
            getColumns(): string[] {
                var columnNameElements = <NodeListOf<HTMLInputElement>>document.getElementsByName(this._tableID + ".Columns");
                var columns = [];
                for (var i = 0, n = columnNameElements.length; i < n; i++)
                    columns.push(columnNameElements[i].value);
                return columns;
            }

            editCellByIndex(colIndex: number): void {
                var celIndexElement = <HTMLInputElement>document.getElementById(this._rowID + "." + colIndex);
                if (celIndexElement)
                    Tables.onEditCell(celIndexElement.value);
                else
                    Tables.endEdit();
            }

            remove(): void {
                if (this._input_Deleted.value == 'true') {
                    this._input_Deleted.value = 'false';
                    this._btn_delete.value = "Delete";
                    this._tr.classList.remove('deletedTableRow');
                }
                else {
                    this._input_Deleted.value = 'true';
                    this._btn_delete.value = "Undelete";
                    this._tr.classList.add('deletedTableRow');
                }
            }

            recalculate(): boolean {
                var columns = this.getColumns();

                var rowPrefix = this._rowID;
                var cellPrefix = rowPrefix + ".Entity";
                var deleted = (<HTMLInputElement>document.getElementById(rowPrefix + ".Deleted")).value == "true";
                var recalculating = false;

                if (!deleted) {
                    var currentRowData = {}, doRecalc = false;

                    for (var ci = 0; ci < columns.length; ++ci) {
                        var propertyName = columns[ci];
                        var cellID = cellPrefix + "." + propertyName;
                        var cell = new TableCell(cellID);
                        //? var tableCell = <HTMLTableCellElement>document.getElementById(cellPrefix + "." + propertyName);
                        //? var cellInput = <HTMLInputElement>document.getElementById(cellPrefix + "." + propertyName + ".input");
                        // (note: no input element also means this is either read-only, or auto calculated)
                        currentRowData[propertyName] = cell.getValue();
                        if (cell.isCalculated)
                            doRecalc = true;
                    }

                    if (doRecalc) {
                        recalculating = true;
                        // ... request a recalculation of auto calculated columns ...
                        var xhr = new XMLHttpRequest();
                        xhr.onerror = (ev: ErrorEvent) => {
                            alert("Failed to update auto-calculated columns. Please check your internet connection.\r\nMessage (status " + xhr.status + "): " + ev.message);
                        };
                        xhr.onload = (ev: Event) => {
                            try {
                                var data: {
                                    stacktrace: string; exceptiontype: string; exceptionmessage: string; message: string;
                                } = JSON.parse(xhr.responseText);
                            }
                            catch (ex) { data = <any>{ message: xhr.responseText }; }
                            if (xhr.status != 200) {
                                alert("Failed to update auto-calculated columns. Please check your internet connection.\r\nMessage (status " + xhr.status + "): " + data.message);
                                console.error("message: " + data.message + "\r\n  exceptiontype: " + data.exceptiontype + "\r\n  exceptionmessage: " + data.exceptionmessage + "\r\n  stacktrace: " + data.stacktrace);
                            }
                            else if (xhr.responseText) {
                                // ... cycle though the properties and copy values back to their respective columns ...
                                for (var ci = 0; ci < columns.length; ++ci) {
                                    var propertyName = columns[ci];
                                    if (propertyName in data) {
                                        var cellID = rowPrefix + ".Entity." + propertyName;
                                        var cell = new TableCell(cellID);
                                        var value = data[propertyName];
                                        var displayText = data[propertyName + ".displayText"] || value;
                                        cell.setInputValue(value); // (set the input to the new value first; note: calculated columns don't have input controls)
                                        //? cell.setValue(value); // (set the actual value to the new value)
                                        cell.changeValue(value, displayText, false); // (updates the display text)
                                    }
                                }
                            }
                        };
                        xhr.open("POST", baseURL + "/api/action?cmd=recalc", true);
                        xhr.setRequestHeader("Content-type", "application/json"); // (MUST be AFTER calling 'open()')
                        xhr.send(JSON.stringify(currentRowData));
                    }
                }

                return recalculating;
            }
        }

        // =====================================================================================================================

        export class TableCell {
            _tableID: string; // ("Table.tableID")
            _rowID: string; // ("Table.tableID.rowID")
            _cellID: string; // ("Table.tableID.rowID.Entity.propertyName")
            _propertyName: string;

            _value: HTMLInputElement; // (holds the original value on start, and the post back value if edited)
            _input: HTMLElement;
            _input_display: HTMLSpanElement;
            _input_prompt: HTMLSpanElement;

            /** A prefix ID for the column specific data for this cell. */
            get columnID(): string { return this._tableID + ".Column." + this._propertyName; }

            /** Returns true if this cell is calculated (i.e. not from a database field). */
            get isCalculated(): boolean { var e = <HTMLInputElement>document.getElementById(this.columnID + ".Calculated"); return !!e && e.value == "true"; }

            /** Returns the expected data type for the column this cell belongs to. */
            get dataType(): string { var e = <HTMLInputElement>document.getElementById(this.columnID + ".Type"); return e ? e.value : ""; }

            /** Returns true if the required cell elements have fully loaded into the DOM. */
            get isReady(): boolean { return !!(this._cellID && this._input && this._input_display && this._input_prompt); }

            constructor(cellID: string) {
                this._cellID = cellID;

                // ... get all parts of the ID ...
                var parts = cellID.split("."); // (Table.tableID.rowID.Entity.propertyName)
                if (parts.length < 5)
                    throw "Invalid number of parts in cell ID: '" + cellID + "'";
                this._tableID = parts[0] + "." + parts[1];
                this._rowID = this._tableID + "." + parts[2];
                this._propertyName = parts[4];

                this._value = <HTMLInputElement>document.getElementById(cellID + '.value');
                this._input = document.getElementById(cellID + '.input');
                this._input_display = <HTMLSpanElement>document.getElementById(cellID + '.display');
                this._input_prompt = <HTMLSpanElement>document.getElementById(cellID + '.prompt');

                if (!this._value) console.log("Value element for '" + cellID + "' is missing.");
                if (!this._input) console.log("Input element for '" + cellID + "' is missing.");
                if (!this._input_display) console.log("Display element for '" + cellID + "' is missing.");
                if (!this._input_prompt) console.log("Prompt element for '" + cellID + "' is missing.");
            }

            private _getValue(e: HTMLElement): any {
                if (e instanceof HTMLInputElement) {
                    if (e.type.toLowerCase() == "checkbox")
                        return e.checked;
                    else
                        return e.value;
                }
                else if (e instanceof HTMLSelectElement) {
                    // (the 'value' attribute on the select element has the initial default value; however this should only be pulled the first time)
                    if (!('oldValue' in e)) {
                        var attr = e.attributes.getNamedItem("value"); // (note: 'getNamedItem' requires IE 9.0+)
                        if (attr)
                            return attr.value;
                        else
                            return e.value;
                    }
                    else
                        return e.value;
                }
                else if (e instanceof HTMLTextAreaElement) {
                    return e.value;
                }
                return void 0;
            }
            /** Returns the current value that will be posted to the back-end. */
            getValue(): any { return this._getValue(this._value); }
            /** Returns the current value the user entered in the edit control for this cell. */
            getInputValue(): any { return this._getValue(this._input); }

            private _getDisplayText(valueEl: HTMLElement): string {
                var displaySrc = this._input; // (display values are always dependent on input element sources)
                if (displaySrc instanceof HTMLInputElement) { // (then only simple text is needed)
                    var input = <HTMLInputElement>valueEl;
                    if (displaySrc.type.toLowerCase() == "checkbox") {
                        if (input.type.toLowerCase() == "checkbox")
                            return input.checked ? "Yes" : "No";
                        else
                            return input.value == "true" ? "True" : input.value == "false" ? "False" : input.value;
                    }
                    else
                        return input.value;
                }
                else if (displaySrc instanceof HTMLSelectElement) { // (then a display value is expected from a dropdown control)
                    var selectedIndex = -1;
                    if (valueEl instanceof HTMLSelectElement)
                        selectedIndex = valueEl.selectedIndex;
                    else if (valueEl instanceof HTMLInputElement) {
                        for (var i = 0, n = displaySrc.options.length; i < n; ++i)
                            if ((<HTMLOptionElement>displaySrc.options[i]).value == valueEl.value) {
                                selectedIndex = i;
                                break;
                            }
                    }
                    return selectedIndex >= 0 ? (<HTMLOptionElement>displaySrc.options[selectedIndex]).text : "";
                }
                else
                    return "";
            }
            /** Returns the current display value for the value that will be posted to the back-end. */
            getDisplayText(): string { return this._getDisplayText(this._value); }
            /** Returns the current display value based on what the user entered in the edit control for this cell. */
            getInputDisplayText(): string { return this._getDisplayText(this._input); }

            private _setValue(value: any, e: HTMLElement): boolean {
                var changed = false; // (will remain false unless the new value is actually different from the current value)
                if (e instanceof HTMLInputElement) {
                    if (e.type.toLowerCase() == "checkbox") {
                        value = ("" + value).toLowerCase();
                        var checked = value == "yes" || value == "true" || !!+value;;
                        if (e.checked != checked) {
                            e.checked = checked;
                            changed = true;
                        }
                    }
                    else if (e.value != value) {
                        e.value = value;
                        changed = true;
                    }
                }
                else if (e instanceof HTMLSelectElement)
                    if (e.value != value) {
                        e.value = value;
                        changed = true;
                    }
                    else if (e instanceof HTMLTextAreaElement) {
                        if (e.value != value) {
                            e.value = value;
                            changed = true;
                        }
                    }
                return changed;
            }
            /** Sets the current value for the value that will be posted to the back-end. */
            setValue(value: any): boolean { return this._setValue(value, this._value); }
            /** Sets the current value for the edit control for this cell. */
            setInputValue(value: any): boolean { return this._setValue(value, this._input); }

            edit(): void {
                if (this._input_display.style.display != 'none') { // (only if span is visible)
                    this._input_display.style.display = 'none';
                    this._input.style.display = '';
                    this._input_prompt.style.display = '';
                    var currentValue = "" + this.getValue();
                    this.setInputValue(currentValue); // (move current active value into the input control for editing)
                    if (!('oldValue' in this._input)) {
                        (<any>this._input).oldValue = currentValue; // (cache the old value in case user wishes to revert back the original value)
                        (<any>this._input).oldDisplayText = this.getDisplayText(); // (cache the old value in case user wishes to revert back the original value)
                        // ... since the initial value is now stored, update the select element to show it, since it was hidden until now)
                        if (this._input instanceof HTMLSelectElement)
                            (<HTMLSelectElement>this._input).value = currentValue;
                    }
                    this._input.focus();
                    if (this._input instanceof HTMLInputElement && (<HTMLInputElement>this._input).type.toLowerCase() != "checkbox")
                        (<HTMLInputElement>this._input).setSelectionRange(0, currentValue.length);
                    edited = true;
                }
            }

            endEdit(): void {
                if (this._input.style.display != 'none') { // (only if input is visible)
                    this.changeValue(this.getInputValue(), this.getInputDisplayText());
                    this._input.style.display = 'none';
                    this._input_prompt.style.display = 'none';
                    this._input_display.style.display = '';
                }
            }

            changeValue(newValue: string, displayValue: string, recalculate = true): boolean {
                this._input_display.innerHTML = "";
                this._input_display.appendChild(document.createTextNode(displayValue || newValue));
                var changed = this.setValue(newValue);
                if (changed && recalculate) {
                    // ... trigger an update to all calculated columns ...
                    var row = new TableRow(this._rowID);
                    row.recalculate(); // (does nothing if there are no columns to recalculate)
                }
                return changed;
            }

            revertValue(): void {
                if ('oldValue' in this._input)
                    this.changeValue((<any>this._input).oldValue, (<any>this._input).oldDisplayText);
            }
        }

        // =====================================================================================================================

        export var currentCell: TableCell, prevCell: TableCell;
        export var ignoreBlur: boolean;
        export var edited: boolean;

        // =====================================================================================================================

        export function getRow(trID: string): TableRow {
            var row = new TableRow(trID);
            if (row.isReady)
                return row;
            return null;
        }

        export function getCell(cellID: string): TableCell {
            var cell = new TableCell(cellID);
            if (cell.isReady)
                return cell;
            return null;
        }

        export function endEdit(nextCellID?: string) {
            if (!currentCell) return true;
            if (currentCell._cellID != nextCellID) {
                currentCell.endEdit();
                prevCell = currentCell;
                currentCell = null;
                return true;
            }
            return false; // (the next cell ID is the same, so edit will not end)
        }

        export function onEditCell(cellID: string) {
            if (endEdit(cellID)) {
                currentCell = getCell(cellID);
                if (currentCell) {
                    currentCell.edit();
                    edited = true;
                }
            }
        }

        export function onLeaveCell(cellID: string) {
            if (ignoreBlur) return;
            var cell = new TableCell(cellID);
            if (cell) {
                cell.endEdit();
                if (currentCell && currentCell._cellID == cell._cellID)
                    currentCell = null;
            }
        }

        export function onCellChanged(cellID: string) {
            // ... update the cell display text/value ...
            var cell = new TableCell(cellID);
            if (cell) {
                cell.changeValue(cell.getInputValue(), cell.getInputDisplayText());
            }
        }

        export function onRevertCell(cellID: string) {
            var cell = new TableCell(cellID);
            if (cell)
                cell.revertValue();
        }

        export function onDeleteRow(trID: string) {
            endEdit();
            var row = getRow(trID);
            if (row)
                row.remove();
        }

        export function onAddRow(tablePrefixID: string) {
            endEdit();

            var table = <HTMLTableElement>document.getElementById(tablePrefixID);

            var tableRowIDCounter = <HTMLInputElement>document.getElementById(tablePrefixID + '._RowIDCounter');
            if (tableRowIDCounter == null)
                throw ("Cannot add a new table: the table row counter element is missing.");

            var tableRowIndex = <HTMLInputElement>document.getElementById(tablePrefixID + '.$rowIndex');
            if (tableRowIndex == null)
                throw ("Cannot add a new table: the table row index element is missing.");

            var templateTableRow = <HTMLTableRowElement>document.getElementById(tablePrefixID + '.{{rowIndex}}');
            if (templateTableRow == null)
                throw ("Cannot add a a new table: the template is missing.");

            if (!tableRowIDCounter.value)
                tableRowIDCounter.value = '' + 1;
            else
                tableRowIDCounter.value = +tableRowIDCounter.value + 1 + '';

            if (!tableRowIndex.value)
                tableRowIndex.value = '' + 1;
            else
                tableRowIndex.value = +tableRowIndex.value + 1 + '';

            var html = templateTableRow.outerHTML;
            html = html.replace(/{{rowID}}/g, tableRowIDCounter.value);
            html = html.replace(/{{rowIndex}}/g, tableRowIndex.value);
            html = html.replace(/{{Deleted}}/g, "false");
            html = html.replace(/{{New}}/g, "true");
            html = html.replace(/{{.*?}}/g, ""); // (make all other fields empty by default)
            (<HTMLTableSectionElement>table.lastChild).insertAdjacentHTML('beforeend', html);
            (<HTMLElement>table.lastChild.lastChild).style.display = ""; // (unhide the new row)

            (<any>$('.datepicker')).datepicker();
        }

        export function onValidateTable(tablePrefixID: string) {
            endEdit();

            var rowIndexes = document.getElementsByName(tablePrefixID + '.RowIndex');
            var columns = document.getElementsByName(tablePrefixID + '.Columns');
            var columnPrefix = tablePrefixID + ".Column";
            var submit = true;

            for (var i = 0; i < rowIndexes.length; ++i) {
                var rowIndex = +(<HTMLInputElement>rowIndexes[i]).value;
                if (!isNaN(rowIndex)) {
                    var rowPrefix = tablePrefixID + '.' + rowIndex;
                    var cellPrefix = rowPrefix + ".Entity";
                    var deleted = (<HTMLInputElement>document.getElementById(rowPrefix + ".Deleted")).value == "true";
                    if (!deleted)
                        for (var ci = 0; ci < columns.length; ++ci) {
                            var propertyName = (<HTMLInputElement>columns[ci]).value;
                            var required = (<HTMLInputElement>document.getElementById(columnPrefix + "." + propertyName + ".Required")).value == "true";
                            var tableCell = <HTMLTableCellElement>document.getElementById(cellPrefix + "." + propertyName);
                            var cellValue = <HTMLInputElement>document.getElementById(cellPrefix + "." + propertyName + ".value");
                            // (no input element means this is either read-only, or auto calculated)
                            if (cellValue) {
                                var currentValue = cellValue.value;
                                if (required && !((currentValue || "").trim())) {
                                    tableCell.classList.add("tableCellError");
                                    tableCell.title = "A value is required here.";
                                    submit = false;
                                } else {
                                    tableCell.classList.remove("tableCellError");
                                    tableCell.title = "";
                                }
                            }
                        }
                }
            }

            if (!submit)
                alert("Cannot save changes - some values are not valid or missing.  Please correct the errors (cells marked red) and try again.");
            else
                edited = false;

            return submit;
        }

        export function onCellInputKeyPress(evt: KeyboardEvent, cellID: string, trID: string, colIndex: number) {
            ignoreBlur = true;
            var evt = (evt) ? evt : <KeyboardEvent>((event) ? event : null);
            if (evt != null) {
                switch (evt.keyCode) {
                    case 9: // (tab)
                        evt.preventDefault();
                        var row = getRow(trID);
                        if (row)
                            row.editCellByIndex(colIndex + 1);
                        break;

                    case 27: // (esc)
                        evt.preventDefault();
                        var cell = getCell(cellID);
                        if (cell)
                            cell.revertValue();
                        break;
                }
            }
            ignoreBlur = false;
        }

        export function stopEnterKey(evt: KeyboardEvent) {
            var evt = (evt) ? evt : <KeyboardEvent>((event) ? event : null);
            if (evt != null) {
                var node = <HTMLInputElement>((evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null));
                if (evt.keyCode == 13 && node.nodeName == 'INPUT' && node.name) {
                    try { onLeaveCell(node.name); } catch (e) { } // ('node.name' is the general cell ID)
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                    return false;
                }
            }
        }

        // =====================================================================================================================

        document.addEventListener("keydown", stopEnterKey);
        window.addEventListener("beforeunload", () => { if (edited) return "You didn't save yet, are you sure you want to exit?"; });
        history.replaceState(null, document.title, location.href);

        // =====================================================================================================================

        export function getData(id: string, url: string) {
            id = id.replace(/\./g, "\\.");
            $('#' + id).dataTable({
                sPaginationType: "full_numbers",
                order: [[1, "asc"]],
                bServerSide: true,
                sAjaxSource: url,
                fnServerData: function (sSource, aoData, fnCallback, oSettings) {
                    oSettings.jqXHR = $.ajax(<JQueryAjaxSettings>{
                        dataType: 'json',
                        type: oSettings.sServerMethod || "GET",
                        url: sSource,
                        data: aoData,
                        success: fnCallback,
                        timeout: 15000, // optional if you want to handle timeouts (which you should)
                        error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): any => {
                            CDS.Errors.LogError("dataTable", jqXHR.statusText + ": " + jqXHR.responseText);
                        }
                    });
                },
                sServerMethod: "GET",
                bProcessing: true,
                aoColumnDefs: [
                    {
                        "bSearchable": false,
                        "bSortable": false,
                        "aTargets": [0],
                        "sDefaultContent": "<!--NULL-->"
                    }]
            });
        }

        // =====================================================================================================================
    }
}

// ... set a custom error handle for the data table client control ...

$(document).ready(() => {
    if ($.fn && $.fn.dataTable)
        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            throw "Data table error: " + message;
        };
});
