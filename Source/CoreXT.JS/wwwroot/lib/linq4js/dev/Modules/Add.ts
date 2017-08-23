﻿Array.prototype.Add = function<T> (this: T[], object: T, generateId?: boolean): T[] {
    let that: T[] = this;

    if (object != null) {
        if (generateId === true) {
            let newIndex: number;

            let castedObject: Linq4JS.GeneratedEntity = object as any;
            let last: Linq4JS.GeneratedEntity = that.Where((x: any) => x._GeneratedId_ != null).OrderBy((x: any) => x._GeneratedId_).LastOrDefault() as any;
            if (last != null) {
                newIndex = last._GeneratedId_ != null ? last._GeneratedId_ : 1;

                while (that.Any(function(x: any) {
                    return (x as Linq4JS.GeneratedEntity)._GeneratedId_ === newIndex;
                })) {
                    newIndex++;
                }

                castedObject._GeneratedId_ = newIndex;
            } else {
                castedObject._GeneratedId_ = 1;
            }
        }

        that.push(object);
    }

    return that;
};