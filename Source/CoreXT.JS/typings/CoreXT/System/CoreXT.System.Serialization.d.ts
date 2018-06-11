declare namespace CoreXT.System {
    /** An empty object that contains prototype methods for serializing data.
    */
    class SerializedData {
        /** Add a string value as a serialized data property. */
        addValue(name: string, value: string): void;
        /** Add a numerical value as a serialized data property. */
        addValue(name: string, value: number): void;
        /** Add a boolean value as a serialized data property. */
        addValue(name: string, value: boolean): void;
        /** Add a serializable object as a serialized data property.
        * (Note: If the object doesn't produce any serialized data, the result will be a null property.)
        */
        addObject(name: string, obj: ISerializable): SerializedData;
        /** Returns the requested property value, or a default value if not found.
        * This always returns a string, since serialized data is in string form.
        */
        getValue(name: string, valueIfUndefined?: string): string;
        /** Returns the requested property value as a number, or a default value if not found.
        */
        getNumber(name: string, valueIfUndefined?: number): number;
        /** Returns the requested property value as an object, or a default value if not found.
        */
        getObject<T extends {}>(name: string, valueIfUndefined?: T): T;
        /** Returns true if the specific property exists, and false otherwise. */
        valueExists(name: string): boolean;
    }
    /** Implement this on an object that you wish to support serialization.
    * Serializing objects is the process of breaking the property values into simplified string values in order to transmit
    * or store the data.  If you have objects you need to persist, or save states on, then trying using this interface.
    */
    interface ISerializable {
        /** The implementation should expect to be passed in an object (which may not be empty) in which all serialized
        * properties should be placed.  Each property name usually represents the exact name on the object to be serialized,
        * but in string form.
        */
        getData(data: SerializedData): void;
        /** Does the opposite of 'getData()', which is to deserialize the data into the current object instance.
        * In most cases, a new object instance of the required type will be created before this function is called on it.
        */
        setData(data: SerializedData): void;
    }
}
