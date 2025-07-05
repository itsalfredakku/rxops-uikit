import { component$, useSignal, $, type QRL, Slot, type JSXNode } from "@builder.io/qwik";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../table/table";
import { Button } from "../../atoms/button/button";
import { Spinner } from "../../atoms/spinner/spinner";
import { Icon, type IconName } from "../../atoms/icon";
import { Dropdown, type DropdownItem } from "../../molecules/dropdown/dropdown";
import { SplitButton } from "../../molecules/split-button/split-button";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Row } from "../../../layouts/row";
import { Stack } from "../../../layouts/stack";

export type DataGridColumnType = "text" | "number" | "date" | "boolean" | "custom" | "actions";
export type DataGridSortDirection = "asc" | "desc" | undefined;

// Generic type for grid data records
export type DataGridRecord = Record<string, unknown>;

export interface DataGridColumn {
  key: string;
  title: string;
  type?: DataGridColumnType;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  hidden?: boolean;
  template?: QRL<(value: unknown, record: DataGridRecord, index: number) => JSXNode>;
  headerTemplate?: QRL<() => JSXNode>;
  footerTemplate?: QRL<(records: DataGridRecord[]) => JSXNode>;
  // Action column specific props
  actions?: ActionItem[];
}

export interface ActionItem {
  id: string;
  label: string;
  icon?: IconName;
  variant?: "elevated" | "flat" | "outlined" | "text";
  disabled?: boolean | ((record: DataGridRecord) => boolean);
  onClick$?: QRL<(record: DataGridRecord, index: number) => void>;
  items?: DropdownItem[]; // For split button actions
}

export interface DataGridProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  data: DataGridRecord[];
  columns: DataGridColumn[];
  loading?: boolean;
  emptyText?: string;
  selectable?: boolean | "single" | "multiple";
  selectedRows?: number[];
  onSelectionChange$?: QRL<(selectedRows: number[]) => void>;
  onSort$?: QRL<(column: string, direction: DataGridSortDirection) => void>;
  onFilter$?: QRL<(filters: Record<string, unknown>) => void>;
  onRowClick$?: QRL<(record: DataGridRecord, index: number) => void>;
  onColumnResize$?: QRL<(column: string, width: number) => void>;
  contextMenu?: DropdownItem[];
  onContextMenu$?: QRL<(record: DataGridRecord, index: number, items: DropdownItem[]) => void>;
  class?: string;
  // Customization options inspired by Radzen
  showHeader?: boolean;
  showFooter?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  virtualScrolling?: boolean;
  pageSize?: number;
  allowColumnReorder?: boolean;
  allowColumnHiding?: boolean;
  exportable?: boolean;
}

export const DataGrid = component$<DataGridProps>((props) => {
  const {
    data,
    columns,
    loading = false,
    emptyText = "No data available",
    selectable = false,
    selectedRows = [],
    onSelectionChange$,
    onSort$,
    onRowClick$,
    onFilter$: _onFilter$,
    onColumnResize$: _onColumnResize$,
    contextMenu = [],
    onContextMenu$,
    class: qwikClass,
    className,
    style,
    showHeader = true,
    showFooter = false,
    hoverable = true,
    bordered = true,
    compact = false,
    allowColumnReorder: _allowColumnReorder = false,
    allowColumnHiding: _allowColumnHiding = false,
    exportable: _exportable = false,
    virtualScrolling: _virtualScrolling = false,
    pageSize: _pageSize,
    striped: _striped = false,
    ...rest
  } = props;
  const sortColumn = useSignal<string>("");
  const sortDirection = useSignal<DataGridSortDirection>(undefined);
  const selectedRowsSignal = useSignal<number[]>(selectedRows);
  const contextMenuPosition = useSignal<{ 
    x: number; 
    y: number; 
    show: boolean; 
    record: DataGridRecord | null; 
    index: number 
  }>({
    x: 0,
    y: 0,
    show: false,
    record: null,
    index: -1
  });

  const handleSort = $((columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    let direction: DataGridSortDirection = "asc";
    if (sortColumn.value === columnKey) {
      direction = sortDirection.value === "asc" ? "desc" : sortDirection.value === "desc" ? undefined : "asc";
    }
    
    sortColumn.value = columnKey;
    sortDirection.value = direction;
    
    onSort$ && onSort$(columnKey, direction);
  });

  const handleRowSelect = $((index: number, selected: boolean) => {
    if (selectable === "single") {
      selectedRowsSignal.value = selected ? [index] : [];
    } else if (selectable === "multiple") {
      if (selected) {
        selectedRowsSignal.value = [...selectedRowsSignal.value, index];
      } else {
        selectedRowsSignal.value = selectedRowsSignal.value.filter(i => i !== index);
      }
    }
    onSelectionChange$ && onSelectionChange$(selectedRowsSignal.value);
  });

  const handleSelectAll = $((selected: boolean) => {
    if (selectable === "multiple") {
      selectedRowsSignal.value = selected ? data.map((_, index) => index) : [];
      onSelectionChange$ && onSelectionChange$(selectedRowsSignal.value);
    }
  });

  const handleContextMenu = $((event: MouseEvent, record: DataGridRecord, index: number) => {
    if (contextMenu.length > 0) {
      event.preventDefault();
      contextMenuPosition.value = {
        x: event.clientX,
        y: event.clientY,
        show: true,
        record,
        index
      };
      onContextMenu$ && onContextMenu$(record, index, contextMenu);
    }
  });

  const handleActionClick = $((action: ActionItem, record: DataGridRecord, index: number) => {
    const isDisabled = typeof action.disabled === 'function' ? action.disabled(record) : action.disabled;
    if (!isDisabled && action.onClick$) {
      action.onClick$(record, index);
    }
  });

  const renderActionColumn = (record: DataGridRecord, index: number) => {
    const actionColumn = columns.find(col => col.type === "actions");
    if (!actionColumn?.actions) return null;

    return (
      <Row alignItems="center" gap="2">
        {actionColumn.actions.map((action) => {
          const isDisabled = typeof action.disabled === 'function' ? action.disabled(record) : action.disabled;
          
          if (action.items && action.items.length > 0) {
            return (
              <SplitButton
                key={action.id}
                label={action.label}
                variant={action.variant || "outlined"}
                size="sm"
                disabled={isDisabled}
                items={action.items}
                onClick$={() => handleActionClick(action, record, index)}
              />
            );
          } else {
            return (
              <Button
                key={action.id}
                variant={action.variant || "outlined"}
                size="sm"
                disabled={isDisabled}
                onClick$={() => handleActionClick(action, record, index)}
              >
                <Row alignItems="center" gap="1">
                  {action.icon && <Icon icon={action.icon} size={16} />}
                  <span>{action.label}</span>
                </Row>
              </Button>
            );
          }
        })}
      </Row>
    );
  };

  const renderCellContent = (column: DataGridColumn, record: DataGridRecord, index: number) => {
    if (column.type === "actions") {
      return renderActionColumn(record, index);
    }
    
    if (column.template) {
      return <Slot />;
    }
    
    const value = record[column.key];
    
    switch (column.type) {
      case "boolean":
        return <span class="text-content">{value ? "Yes" : "No"}</span>;
      case "date":
        return <span class="text-content">{value ? new Date(String(value)).toLocaleDateString() : ""}</span>;
      case "number":
        return <span class="text-content">{typeof value === "number" ? value.toLocaleString() : String(value || "")}</span>;
      default:
        return <span class="text-content">{String(value || "")}</span>;
    }
  };

  const visibleColumns = columns.filter(col => !col.hidden);
  const allSelected = selectable === "multiple" && selectedRowsSignal.value.length === data.length;
  const indeterminate = selectable === "multiple" && selectedRowsSignal.value.length > 0 && selectedRowsSignal.value.length < data.length;

  const dataGridClasses = mergeClasses(
    "data-grid",
    loading && "data-grid-loading",
    compact && "data-grid-compact",
    qwikClass,
    className
  );

  return (
    <Stack 
      class={dataGridClasses}
      style={style}
      {...rest}
    >
      {loading && (
        <Stack class="absolute inset-0 bg-surface opacity-75 transition-colors duration-200 z-10" alignItems="center" justifyContent="center">
          <Row alignItems="center" gap="3">
            <Spinner size="md" variant="circular" color="primary-dark" />
            <span class="text-content-secondary">Loading...</span>
          </Row>
        </Stack>
      )}
      
      <Table 
        variant={bordered ? "bordered" : "default"} 
        hoverable={hoverable}
        responsive
      >
        {showHeader && (
          <TableHeader>
            <TableRow>
              {selectable !== false && (
                <TableCell header class="w-12">
                  {selectable === "multiple" && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      indeterminate={indeterminate}
                      onChange$={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                      class="rounded border-border text-primary focus:ring-primary"
                    />
                  )}
                </TableCell>
              )}
              
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.key}
                  header
                  align={column.align}
                  sortable={column.sortable}
                  sortDirection={
                    sortColumn.value === column.key ? sortDirection.value : undefined
                  }
                  onClick$={column.sortable ? $(() => handleSort(column.key)) : undefined}
                  style={column.width ? { width: column.width } : undefined}
                  class={[
                    column.fixed === "left" && "sticky left-0 bg-surface z-10",
                    column.fixed === "right" && "sticky right-0 bg-surface z-10",
                    column.resizable && "resize-handle"
                  ].filter(Boolean).join(" ")}
                >
                  {column.headerTemplate ? (
                    <Slot />
                  ) : (
                    column.title
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
        )}
        
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                align="center"
                class="data-grid-empty py-12 text-content-secondary"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((record, index) => (
              <TableRow 
                key={index}
                class={[
                  selectedRowsSignal.value.includes(index) && "bg-primary-light",
                  onRowClick$ && "cursor-pointer"
                ].filter(Boolean).join(" ")}
                onClick$={onRowClick$ ? $(() => onRowClick$(record, index)) : undefined}
                onContextMenu$={(e) => handleContextMenu(e as MouseEvent, record, index)}
              >
                {selectable !== false && (
                  <TableCell class="w-12">
                    <input
                      type={selectable === "single" ? "radio" : "checkbox"}
                      checked={selectedRowsSignal.value.includes(index)}
                      onChange$={(e) => handleRowSelect(index, (e.target as HTMLInputElement).checked)}
                      class="rounded border-border text-primary focus:ring-primary"
                    />
                  </TableCell>
                )}
                
                {visibleColumns.map((column) => (
                  <TableCell 
                    key={column.key} 
                    align={column.align}
                    class={[
                      column.fixed === "left" && "sticky left-0 bg-surface z-10",
                      column.fixed === "right" && "sticky right-0 bg-surface z-10"
                    ].filter(Boolean).join(" ")}
                  >
                    {renderCellContent(column, record, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
        
        {showFooter && (
          <tfoot>
            <TableRow>
              {selectable !== false && <TableCell />}
              {visibleColumns.map((column) => (
                <TableCell key={column.key}>
                  {column.footerTemplate ? (
                    <Slot />
                  ) : null}
                </TableCell>
              ))}
            </TableRow>
          </tfoot>
        )}
      </Table>

      {/* Context Menu */}
      {contextMenuPosition.value.show && (
        <Stack
          class="fixed z-50"
          style={{
            left: `${contextMenuPosition.value.x}px`,
            top: `${contextMenuPosition.value.y}px`
          }}
        >
          <Dropdown
            items={contextMenu}
            placement="bottom-start"
            onItemSelected={$((dropdownItem: DropdownItem) => {
              dropdownItem.onClick$ && dropdownItem.onClick$();
              contextMenuPosition.value = { ...contextMenuPosition.value, show: false };
            })}
          />
        </Stack>
      )}
    </Stack>
  );
});
