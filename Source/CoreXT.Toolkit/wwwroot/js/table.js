var CDS;
(function (CDS) {
    var Tables;
    (function (Tables) {
        // =====================================================================================================================
        var TableRow = /** @class */ (function () {
            function TableRow(rowID) {
                this._rowID = rowID;
                // ... get all parts of the ID ...
                var parts = rowID.split("."); // (Table.tableID.rowID.Entity.propertyName)
                if (parts.length < 3)
                    throw "Invalid number of parts in row ID: '" + rowID + "'";
                this._tableID = parts[0] + "." + parts[1];
                this._tr = document.getElementById(rowID);
                this._input_RowIndex = document.getElementById(rowID + '.$rowIndex');
                this._input_RowID = document.getElementById(rowID + '.RowID');
                this._input_New = document.getElementById(rowID + '.New');
                this._input_Deleted = document.getElementById(rowID + '.Deleted');
                this._btn_delete = document.getElementById(rowID + '.delete');
            }
            Object.defineProperty(TableRow.prototype, "isReady", {
                /** Returns true if the required row elements have fully loaded into the DOM. */
                get: function () { return !!(this._rowID && this._tr && this._input_RowIndex && this._input_RowID && this._input_New && this._input_Deleted && this._btn_delete); },
                enumerable: true,
                configurable: true
            });
            /** Returns an array of columns (aka entity property names) for this row. */
            TableRow.prototype.getColumns = function () {
                var columnNameElements = document.getElementsByName(this._tableID + ".Columns");
                var columns = [];
                for (var i = 0, n = columnNameElements.length; i < n; i++)
                    columns.push(columnNameElements[i].value);
                return columns;
            };
            TableRow.prototype.editCellByIndex = function (colIndex) {
                var celIndexElement = document.getElementById(this._rowID + "." + colIndex);
                if (celIndexElement)
                    Tables.onEditCell(celIndexElement.value);
                else
                    Tables.endEdit();
            };
            TableRow.prototype.remove = function () {
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
            };
            TableRow.prototype.recalculate = function () {
                var columns = this.getColumns();
                var rowPrefix = this._rowID;
                var cellPrefix = rowPrefix + ".Entity";
                var deleted = document.getElementById(rowPrefix + ".Deleted").value == "true";
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
                        xhr.onerror = function (ev) {
                            alert("Failed to update auto-calculated columns. Please check your internet connection.\r\nMessage (status " + xhr.status + "): " + ev.message);
                        };
                        xhr.onload = function (ev) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                            }
                            catch (ex) {
                                data = { message: xhr.responseText };
                            }
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
            };
            return TableRow;
        }());
        Tables.TableRow = TableRow;
        // =====================================================================================================================
        var TableCell = /** @class */ (function () {
            function TableCell(cellID) {
                this._cellID = cellID;
                // ... get all parts of the ID ...
                var parts = cellID.split("."); // (Table.tableID.rowID.Entity.propertyName)
                if (parts.length < 5)
                    throw "Invalid number of parts in cell ID: '" + cellID + "'";
                this._tableID = parts[0] + "." + parts[1];
                this._rowID = this._tableID + "." + parts[2];
                this._propertyName = parts[4];
                this._value = document.getElementById(cellID + '.value');
                this._input = document.getElementById(cellID + '.input');
                this._input_display = document.getElementById(cellID + '.display');
                this._input_prompt = document.getElementById(cellID + '.prompt');
                if (!this._value)
                    console.log("Value element for '" + cellID + "' is missing.");
                if (!this._input)
                    console.log("Input element for '" + cellID + "' is missing.");
                if (!this._input_display)
                    console.log("Display element for '" + cellID + "' is missing.");
                if (!this._input_prompt)
                    console.log("Prompt element for '" + cellID + "' is missing.");
            }
            Object.defineProperty(TableCell.prototype, "columnID", {
                /** A prefix ID for the column specific data for this cell. */
                get: function () { return this._tableID + ".Column." + this._propertyName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TableCell.prototype, "isCalculated", {
                /** Returns true if this cell is calculated (i.e. not from a database field). */
                get: function () { var e = document.getElementById(this.columnID + ".Calculated"); return !!e && e.value == "true"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TableCell.prototype, "dataType", {
                /** Returns the expected data type for the column this cell belongs to. */
                get: function () { var e = document.getElementById(this.columnID + ".Type"); return e ? e.value : ""; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TableCell.prototype, "isReady", {
                /** Returns true if the required cell elements have fully loaded into the DOM. */
                get: function () { return !!(this._cellID && this._input && this._input_display && this._input_prompt); },
                enumerable: true,
                configurable: true
            });
            TableCell.prototype._getValue = function (e) {
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
            };
            /** Returns the current value that will be posted to the back-end. */
            TableCell.prototype.getValue = function () { return this._getValue(this._value); };
            /** Returns the current value the user entered in the edit control for this cell. */
            TableCell.prototype.getInputValue = function () { return this._getValue(this._input); };
            TableCell.prototype._getDisplayText = function (valueEl) {
                var displaySrc = this._input; // (display values are always dependent on input element sources)
                if (displaySrc instanceof HTMLInputElement) { // (then only simple text is needed)
                    var input = valueEl;
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
                            if (displaySrc.options[i].value == valueEl.value) {
                                selectedIndex = i;
                                break;
                            }
                    }
                    return selectedIndex >= 0 ? displaySrc.options[selectedIndex].text : "";
                }
                else
                    return "";
            };
            /** Returns the current display value for the value that will be posted to the back-end. */
            TableCell.prototype.getDisplayText = function () { return this._getDisplayText(this._value); };
            /** Returns the current display value based on what the user entered in the edit control for this cell. */
            TableCell.prototype.getInputDisplayText = function () { return this._getDisplayText(this._input); };
            TableCell.prototype._setValue = function (value, e) {
                var changed = false; // (will remain false unless the new value is actually different from the current value)
                if (e instanceof HTMLInputElement) {
                    if (e.type.toLowerCase() == "checkbox") {
                        value = ("" + value).toLowerCase();
                        var checked = value == "yes" || value == "true" || !!+value;
                        ;
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
            };
            /** Sets the current value for the value that will be posted to the back-end. */
            TableCell.prototype.setValue = function (value) { return this._setValue(value, this._value); };
            /** Sets the current value for the edit control for this cell. */
            TableCell.prototype.setInputValue = function (value) { return this._setValue(value, this._input); };
            TableCell.prototype.edit = function () {
                if (this._input_display.style.display != 'none') { // (only if span is visible)
                    this._input_display.style.display = 'none';
                    this._input.style.display = '';
                    this._input_prompt.style.display = '';
                    var currentValue = "" + this.getValue();
                    this.setInputValue(currentValue); // (move current active value into the input control for editing)
                    if (!('oldValue' in this._input)) {
                        this._input.oldValue = currentValue; // (cache the old value in case user wishes to revert back the original value)
                        this._input.oldDisplayText = this.getDisplayText(); // (cache the old value in case user wishes to revert back the original value)
                        // ... since the initial value is now stored, update the select element to show it, since it was hidden until now)
                        if (this._input instanceof HTMLSelectElement)
                            this._input.value = currentValue;
                    }
                    this._input.focus();
                    if (this._input instanceof HTMLInputElement && this._input.type.toLowerCase() != "checkbox")
                        this._input.setSelectionRange(0, currentValue.length);
                    Tables.edited = true;
                }
            };
            TableCell.prototype.endEdit = function () {
                if (this._input.style.display != 'none') { // (only if input is visible)
                    this.changeValue(this.getInputValue(), this.getInputDisplayText());
                    this._input.style.display = 'none';
                    this._input_prompt.style.display = 'none';
                    this._input_display.style.display = '';
                }
            };
            TableCell.prototype.changeValue = function (newValue, displayValue, recalculate) {
                if (recalculate === void 0) { recalculate = true; }
                this._input_display.innerHTML = "";
                this._input_display.appendChild(document.createTextNode(displayValue || newValue));
                var changed = this.setValue(newValue);
                if (changed && recalculate) {
                    // ... trigger an update to all calculated columns ...
                    var row = new TableRow(this._rowID);
                    row.recalculate(); // (does nothing if there are no columns to recalculate)
                }
                return changed;
            };
            TableCell.prototype.revertValue = function () {
                if ('oldValue' in this._input)
                    this.changeValue(this._input.oldValue, this._input.oldDisplayText);
            };
            return TableCell;
        }());
        Tables.TableCell = TableCell;
        // =====================================================================================================================
        function getRow(trID) {
            var row = new TableRow(trID);
            if (row.isReady)
                return row;
            return null;
        }
        Tables.getRow = getRow;
        function getCell(cellID) {
            var cell = new TableCell(cellID);
            if (cell.isReady)
                return cell;
            return null;
        }
        Tables.getCell = getCell;
        function endEdit(nextCellID) {
            if (!Tables.currentCell)
                return true;
            if (Tables.currentCell._cellID != nextCellID) {
                Tables.currentCell.endEdit();
                Tables.prevCell = Tables.currentCell;
                Tables.currentCell = null;
                return true;
            }
            return false; // (the next cell ID is the same, so edit will not end)
        }
        Tables.endEdit = endEdit;
        function onEditCell(cellID) {
            if (endEdit(cellID)) {
                Tables.currentCell = getCell(cellID);
                if (Tables.currentCell) {
                    Tables.currentCell.edit();
                    Tables.edited = true;
                }
            }
        }
        Tables.onEditCell = onEditCell;
        function onLeaveCell(cellID) {
            if (Tables.ignoreBlur)
                return;
            var cell = new TableCell(cellID);
            if (cell) {
                cell.endEdit();
                if (Tables.currentCell && Tables.currentCell._cellID == cell._cellID)
                    Tables.currentCell = null;
            }
        }
        Tables.onLeaveCell = onLeaveCell;
        function onCellChanged(cellID) {
            // ... update the cell display text/value ...
            var cell = new TableCell(cellID);
            if (cell) {
                cell.changeValue(cell.getInputValue(), cell.getInputDisplayText());
            }
        }
        Tables.onCellChanged = onCellChanged;
        function onRevertCell(cellID) {
            var cell = new TableCell(cellID);
            if (cell)
                cell.revertValue();
        }
        Tables.onRevertCell = onRevertCell;
        function onDeleteRow(trID) {
            endEdit();
            var row = getRow(trID);
            if (row)
                row.remove();
        }
        Tables.onDeleteRow = onDeleteRow;
        function onAddRow(tablePrefixID) {
            endEdit();
            var table = document.getElementById(tablePrefixID);
            var tableRowIDCounter = document.getElementById(tablePrefixID + '._RowIDCounter');
            if (tableRowIDCounter == null)
                throw ("Cannot add a new table: the table row counter element is missing.");
            var tableRowIndex = document.getElementById(tablePrefixID + '.$rowIndex');
            if (tableRowIndex == null)
                throw ("Cannot add a new table: the table row index element is missing.");
            var templateTableRow = document.getElementById(tablePrefixID + '.{{rowIndex}}');
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
            table.lastChild.insertAdjacentHTML('beforeend', html);
            table.lastChild.lastChild.style.display = ""; // (unhide the new row)
            $('.datepicker').datepicker();
        }
        Tables.onAddRow = onAddRow;
        function onValidateTable(tablePrefixID) {
            endEdit();
            var rowIndexes = document.getElementsByName(tablePrefixID + '.RowIndex');
            var columns = document.getElementsByName(tablePrefixID + '.Columns');
            var columnPrefix = tablePrefixID + ".Column";
            var submit = true;
            for (var i = 0; i < rowIndexes.length; ++i) {
                var rowIndex = +rowIndexes[i].value;
                if (!isNaN(rowIndex)) {
                    var rowPrefix = tablePrefixID + '.' + rowIndex;
                    var cellPrefix = rowPrefix + ".Entity";
                    var deleted = document.getElementById(rowPrefix + ".Deleted").value == "true";
                    if (!deleted)
                        for (var ci = 0; ci < columns.length; ++ci) {
                            var propertyName = columns[ci].value;
                            var required = document.getElementById(columnPrefix + "." + propertyName + ".Required").value == "true";
                            var tableCell = document.getElementById(cellPrefix + "." + propertyName);
                            var cellValue = document.getElementById(cellPrefix + "." + propertyName + ".value");
                            // (no input element means this is either read-only, or auto calculated)
                            if (cellValue) {
                                var currentValue = cellValue.value;
                                if (required && !((currentValue || "").trim())) {
                                    tableCell.classList.add("tableCellError");
                                    tableCell.title = "A value is required here.";
                                    submit = false;
                                }
                                else {
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
                Tables.edited = false;
            return submit;
        }
        Tables.onValidateTable = onValidateTable;
        function onCellInputKeyPress(evt, cellID, trID, colIndex) {
            Tables.ignoreBlur = true;
            var evt = (evt) ? evt : ((event) ? event : null);
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
            Tables.ignoreBlur = false;
        }
        Tables.onCellInputKeyPress = onCellInputKeyPress;
        function stopEnterKey(evt) {
            var evt = (evt) ? evt : ((event) ? event : null);
            if (evt != null) {
                var node = ((evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null));
                if (evt.keyCode == 13 && node.nodeName == 'INPUT' && node.name) {
                    try {
                        onLeaveCell(node.name);
                    }
                    catch (e) { } // ('node.name' is the general cell ID)
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                    return false;
                }
            }
        }
        Tables.stopEnterKey = stopEnterKey;
        // =====================================================================================================================
        document.addEventListener("keydown", stopEnterKey);
        window.addEventListener("beforeunload", function () { if (Tables.edited)
            return "You didn't save yet, are you sure you want to exit?"; });
        history.replaceState(null, document.title, location.href);
        // =====================================================================================================================
        function getData(id, url) {
            id = id.replace(/\./g, "\\.");
            $('#' + id).dataTable({
                sPaginationType: "full_numbers",
                order: [[1, "asc"]],
                bServerSide: true,
                sAjaxSource: url,
                fnServerData: function (sSource, aoData, fnCallback, oSettings) {
                    oSettings.jqXHR = $.ajax({
                        dataType: 'json',
                        type: oSettings.sServerMethod || "GET",
                        url: sSource,
                        data: aoData,
                        success: fnCallback,
                        timeout: 15000,
                        error: function (jqXHR, textStatus, errorThrown) {
                            CoreXT.Errors.logError("dataTable", jqXHR.statusText + ": " + jqXHR.responseText);
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
                    }
                ]
            });
        }
        Tables.getData = getData;
        // =====================================================================================================================
    })(Tables = CDS.Tables || (CDS.Tables = {}));
})(CDS || (CDS = {}));
// ... set a custom error handle for the data table client control ...
$(document).ready(function () {
    if ($.fn && $.fn.dataTable)
        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            throw "Data table error: " + message;
        };
});
//# sourceMappingURL=table.js.map