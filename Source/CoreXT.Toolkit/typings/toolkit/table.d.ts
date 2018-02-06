declare var baseURL: string;
declare module CDS {
    module Tables {
        class TableRow {
            _tableID: string;
            _rowID: string;
            _tr: HTMLTableRowElement;
            _input_RowIndex: HTMLInputElement;
            _input_RowID: HTMLInputElement;
            _input_New: HTMLInputElement;
            _input_Deleted: HTMLInputElement;
            _btn_delete: HTMLButtonElement;
            /** Returns true if the required row elements have fully loaded into the DOM. */
            readonly isReady: boolean;
            constructor(rowID: string);
            /** Returns an array of columns (aka entity property names) for this row. */
            getColumns(): string[];
            editCellByIndex(colIndex: number): void;
            remove(): void;
            recalculate(): boolean;
        }
        class TableCell {
            _tableID: string;
            _rowID: string;
            _cellID: string;
            _propertyName: string;
            _value: HTMLInputElement;
            _input: HTMLElement;
            _input_display: HTMLSpanElement;
            _input_prompt: HTMLSpanElement;
            /** A prefix ID for the column specific data for this cell. */
            readonly columnID: string;
            /** Returns true if this cell is calculated (i.e. not from a database field). */
            readonly isCalculated: boolean;
            /** Returns the expected data type for the column this cell belongs to. */
            readonly dataType: string;
            /** Returns true if the required cell elements have fully loaded into the DOM. */
            readonly isReady: boolean;
            constructor(cellID: string);
            private _getValue(e);
            /** Returns the current value that will be posted to the back-end. */
            getValue(): any;
            /** Returns the current value the user entered in the edit control for this cell. */
            getInputValue(): any;
            private _getDisplayText(valueEl);
            /** Returns the current display value for the value that will be posted to the back-end. */
            getDisplayText(): string;
            /** Returns the current display value based on what the user entered in the edit control for this cell. */
            getInputDisplayText(): string;
            private _setValue(value, e);
            /** Sets the current value for the value that will be posted to the back-end. */
            setValue(value: any): boolean;
            /** Sets the current value for the edit control for this cell. */
            setInputValue(value: any): boolean;
            edit(): void;
            endEdit(): void;
            changeValue(newValue: string, displayValue: string, recalculate?: boolean): boolean;
            revertValue(): void;
        }
        var currentCell: TableCell, prevCell: TableCell;
        var ignoreBlur: boolean;
        var edited: boolean;
        function getRow(trID: string): TableRow;
        function getCell(cellID: string): TableCell;
        function endEdit(nextCellID?: string): boolean;
        function onEditCell(cellID: string): void;
        function onLeaveCell(cellID: string): void;
        function onCellChanged(cellID: string): void;
        function onRevertCell(cellID: string): void;
        function onDeleteRow(trID: string): void;
        function onAddRow(tablePrefixID: string): void;
        function onValidateTable(tablePrefixID: string): boolean;
        function onCellInputKeyPress(evt: KeyboardEvent, cellID: string, trID: string, colIndex: number): void;
        function stopEnterKey(evt: KeyboardEvent): boolean;
        function getData(id: string, url: string): void;
    }
}
