import { component$, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Row } from "../../../layouts/row";

export type TableVariant = "default" | "striped" | "bordered";
export type TableSize = "sm" | "md" | "lg";

export interface TableProps extends BaseComponentProps<HTMLTableElement> {
  variant?: TableVariant;
  size?: TableSize;
  stickyHeader?: boolean;
  hoverable?: boolean;
  responsive?: boolean;
}

export const Table = component$<TableProps>((props) => {
  const {
    variant = "default",
    size = "md",
    stickyHeader = false,
    hoverable = false,
    responsive = false,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const tableClasses = mergeClasses(
    "table-base",
    `table-${variant}`,
    `table-${size}`,
    stickyHeader && "table-sticky-header",
    hoverable && "table-hoverable",
    qwikClass,
    className
  );

  const TableElement = (
    <table 
      class={tableClasses} 
      style={style}
      {...rest}
    >
      <Slot />
    </table>
  );

  if (responsive) {
    return (
      <div class="table-responsive">
        {TableElement}
      </div>
    );
  }

  return TableElement;
});

export const TableHeader = component$<BaseComponentProps<HTMLTableSectionElement>>((props) => {
  const {
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  return (
    <thead 
      class={mergeClasses("table-header", qwikClass, className)}
      style={style}
      {...rest}
    >
      <Slot />
    </thead>
  );
});

export const TableBody = component$<BaseComponentProps<HTMLTableSectionElement>>((props) => {
  const {
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  return (
    <tbody 
      class={mergeClasses("table-body", qwikClass, className)}
      style={style}
      {...rest}
    >
      <Slot />
    </tbody>
  );
});

export interface TableRowProps extends BaseComponentProps<HTMLTableRowElement> {
  selected?: boolean;
  clickable?: boolean;
}

export const TableRow = component$<TableRowProps>((props) => {
  const {
    selected = false,
    clickable = false,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const rowClasses = mergeClasses(
    "table-row",
    selected && "table-row-selected",
    clickable && "table-row-clickable",
    qwikClass,
    className
  );

  return (
    <tr 
      class={rowClasses} 
      style={style}
      {...rest}
    >
      <Slot />
    </tr>
  );
});

export interface TableCellProps extends BaseComponentProps<HTMLTableCellElement> {
  header?: boolean;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
}

export const TableCell = component$<TableCellProps>((props) => {
  const {
    header = false,
    align = "left",
    sortable = false,
    sortDirection,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const cellClasses = mergeClasses(
    header ? "table-header-cell" : "table-cell",
    `table-cell-align-${align}`,
    sortable && "table-cell-sortable",
    sortDirection && `table-cell-sort-${sortDirection}`,
    qwikClass,
    className
  );

  const CellElement = header ? "th" : "td";

  return (
    <CellElement 
      class={cellClasses} 
      style={style}
      {...rest}
    >
      <Row alignItems="center" justifyContent={align === "center" ? "center" : align === "right" ? "end" : "start"}>
        <Slot />
        {sortable && (
          <span class="table-sort-icon ml-2">
            {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : "↕"}
          </span>
        )}
      </Row>
    </CellElement>
  );
});
