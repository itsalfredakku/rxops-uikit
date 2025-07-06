import { component$, Slot, useSignal, $ } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

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
      <div class="themed-content">
        <div class="table-responsive">
          {TableElement}
        </div>
      </div>
    );
  }

  return (
    <div class="themed-content">
      {TableElement}
    </div>
  );
});

export const TableHeader = component$<BaseComponentProps<HTMLTableSectionElement>>((props) => {
  const {
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  return (
    <div class="themed-content">
      <thead 
        class={mergeClasses("table-header", qwikClass, className)}
        style={style}
        {...rest}
      >
        <Slot />
      </thead>
    </div>
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
    <div class="themed-content">
      <tbody 
        class={mergeClasses("table-body", qwikClass, className)}
        style={style}
        {...rest}
      >
        <Slot />
      </tbody>
    </div>
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
    onClick$,
    ...rest
  } = props;

  // Focus state for enhanced medical device accessibility
  const isFocused = useSignal(false);
  
  // Enhanced keyboard event handler for clickable rows
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    if (!clickable) return;
    
    // Universal Enter/Space activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick$) {
        (event.target as HTMLElement).click();
      }
    }
    
    // Escape key for quick navigation
    if (event.key === 'Escape') {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    }
  });
  
  const handleFocus$ = $((event: FocusEvent) => {
    isFocused.value = true;
  });

  const handleBlur$ = $((event: FocusEvent) => {
    isFocused.value = false;
  });

  const rowClasses = mergeClasses(
    "table-row",
    selected && "table-row-selected",
    clickable && "table-row-clickable cursor-pointer",
    clickable && "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
    clickable && isFocused.value && "bg-primary-50",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <tr 
        class={rowClasses} 
        style={style}
        tabIndex={clickable ? 0 : -1}
        role={clickable ? "button" : undefined}
        aria-selected={selected}
        onClick$={onClick$}
        onKeyDown$={clickable ? handleKeyDown$ : undefined}
        onFocus$={clickable ? handleFocus$ : undefined}
        onBlur$={clickable ? handleBlur$ : undefined}
        {...rest}
      >
        <Slot />
      </tr>
    </div>
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
    onClick$,
    ...rest
  } = props;

  // Focus state for enhanced medical device accessibility
  const isFocused = useSignal(false);
  
  // Enhanced keyboard event handler for medical devices
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    if (!sortable) return;
    
    // Universal Enter/Space activation for sortable cells
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick$) {
        (event.target as HTMLElement).click();
      }
    }
    
    // Escape key for quick navigation
    if (event.key === 'Escape') {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    }
  });
  
  const handleFocus$ = $((event: FocusEvent) => {
    isFocused.value = true;
  });

  const handleBlur$ = $((event: FocusEvent) => {
    isFocused.value = false;
  });

  const cellClasses = mergeClasses(
    header ? "table-header-cell" : "table-cell",
    `table-cell-align-${align}`,
    sortable && "table-cell-sortable cursor-pointer",
    sortable && "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
    sortable && isFocused.value && "bg-primary-50",
    sortDirection && `table-cell-sort-${sortDirection}`,
    qwikClass,
    className
  );

  const CellElement = header ? "th" : "td";

  return (
    <div class="themed-content">
      <CellElement 
        class={cellClasses} 
        style={style}
        tabIndex={sortable ? 0 : -1}
        role={sortable ? "button" : undefined}
        aria-sort={sortDirection ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
        onClick$={onClick$}
        onKeyDown$={sortable ? handleKeyDown$ : undefined}
        onFocus$={sortable ? handleFocus$ : undefined}
        onBlur$={sortable ? handleBlur$ : undefined}
        {...rest}
      >
        <div class={`flex items-center ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"}`}>
          <Slot />
          {sortable && (
            <span class="table-sort-icon ml-2" aria-hidden="true">
              {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : "↕"}
            </span>
          )}
        </div>
      </CellElement>
    </div>
  );
});
