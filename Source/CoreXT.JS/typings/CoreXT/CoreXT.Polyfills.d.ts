interface Array<T> {
    last: () => T;
    first: () => T;
    append: (items: Array<T>) => Array<T>;
    select: <T2>(selector: {
        (item: T): T2;
    }) => Array<T2>;
    where: (selector: {
        (item: T): boolean;
    }) => Array<T>;
}
declare namespace CoreXT {
}
