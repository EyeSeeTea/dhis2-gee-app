export type Pager = {
    page: number;
    pageSize: number;
    totalItems: number;
};

export type Page<T> = {
    pager: Pager;
    items: T[];
};

export type PaginationFilters = {
    page: number;
    pageSize: number;
};

export type Sorting<T> = {
    field: keyof T;
    order: "asc" | "desc";
};
