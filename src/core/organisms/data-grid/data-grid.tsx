import { component$, useSignal, $, type QRL, Slot, type JSXNode, useStore } from "@builder.io/qwik";
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
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical data grids */
  emergencyMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Data grid context for healthcare applications */
  gridContext?: 'patient-records' | 'lab-results' | 'medication-history' | 'vital-signs' | 'appointment-schedule' | 'emergency-log' | 'default';
  /** Enable row-based keyboard navigation */
  keyboardNavigable?: boolean;
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
    medicalDeviceMode = false,
    emergencyMode = false,
    enableWorkflowShortcuts = false,
    gridContext = 'default',
    keyboardNavigable = false,
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

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    focusedRowIndex: -1,
    focusedColumnIndex: -1,
    emergencyHighlight: false,
    shortcutPressed: false,
    isEditing: false,
    searchQuery: '',
    searchTimeout: null as any
  });

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;

    // Quick search in medical device mode
    if (medicalDeviceMode && /^[a-zA-Z0-9]$/.test(event.key) && !keyboardState.isEditing) {
      keyboardState.searchQuery += event.key.toLowerCase();
      
      // Clear search after 1 second
      if (keyboardState.searchTimeout) {
        clearTimeout(keyboardState.searchTimeout);
      }
      keyboardState.searchTimeout = setTimeout(() => {
        keyboardState.searchQuery = '';
      }, 1000);

      // Find matching row based on first visible column
      const firstColumn = columns.find(col => !col.hidden);
      if (firstColumn && data.length > 0) {
        const matchIndex = data.findIndex((record, index) => 
          index > keyboardState.focusedRowIndex && 
          String(record[firstColumn.key]).toLowerCase().startsWith(keyboardState.searchQuery)
        );
        if (matchIndex !== -1) {
          keyboardState.focusedRowIndex = matchIndex;
        }
      }
      return;
    }

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'a':
            // Select all rows
            if (selectable === 'multiple') {
              event.preventDefault();
              const allRows = data.map((_, index) => index);
              selectedRowsSignal.value = allRows;
              onSelectionChange$?.(allRows);
              keyboardState.shortcutPressed = true;
              setTimeout(() => keyboardState.shortcutPressed = false, 200);
            }
            break;
          case 'e':
            // Emergency action
            if (emergencyMode && keyboardState.focusedRowIndex >= 0) {
              event.preventDefault();
              keyboardState.emergencyHighlight = true;
              setTimeout(() => keyboardState.emergencyHighlight = false, 1000);
            }
            break;
          case 'f':
            // Start search mode
            event.preventDefault();
            keyboardState.searchQuery = '';
            break;
          case 'r':
            // Refresh data (emit event for parent to handle)
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
            break;
        }
      }
    }

    // Keyboard navigation for medical devices
    if (keyboardNavigable && data.length > 0) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          keyboardState.focusedRowIndex = Math.min(data.length - 1, keyboardState.focusedRowIndex + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          keyboardState.focusedRowIndex = Math.max(0, keyboardState.focusedRowIndex - 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          keyboardState.focusedColumnIndex = Math.max(0, keyboardState.focusedColumnIndex - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          keyboardState.focusedColumnIndex = Math.min(columns.length - 1, keyboardState.focusedColumnIndex + 1);
          break;
        case 'Home':
          event.preventDefault();
          if (event.ctrlKey) {
            keyboardState.focusedRowIndex = 0;
            keyboardState.focusedColumnIndex = 0;
          } else {
            keyboardState.focusedColumnIndex = 0;
          }
          break;
        case 'End':
          event.preventDefault();
          if (event.ctrlKey) {
            keyboardState.focusedRowIndex = data.length - 1;
            keyboardState.focusedColumnIndex = columns.length - 1;
          } else {
            keyboardState.focusedColumnIndex = columns.length - 1;
          }
          break;
        case 'PageDown':
          event.preventDefault();
          keyboardState.focusedRowIndex = Math.min(data.length - 1, keyboardState.focusedRowIndex + 10);
          break;
        case 'PageUp':
          event.preventDefault();
          keyboardState.focusedRowIndex = Math.max(0, keyboardState.focusedRowIndex - 10);
          break;
        case 'Enter':
        case ' ':
          // Select row or click
          if (keyboardState.focusedRowIndex >= 0 && keyboardState.focusedRowIndex < data.length) {
            event.preventDefault();
            const record = data[keyboardState.focusedRowIndex];
            
            if (selectable) {
              // Toggle selection
              const isSelected = selectedRowsSignal.value.includes(keyboardState.focusedRowIndex);
              let newSelection: number[];
              
              if (selectable === 'single') {
                newSelection = isSelected ? [] : [keyboardState.focusedRowIndex];
              } else {
                newSelection = isSelected 
                  ? selectedRowsSignal.value.filter(i => i !== keyboardState.focusedRowIndex)
                  : [...selectedRowsSignal.value, keyboardState.focusedRowIndex];
              }
              
              selectedRowsSignal.value = newSelection;
              onSelectionChange$?.(newSelection);
            } else {
              // Row click
              onRowClick$?.(record, keyboardState.focusedRowIndex);
            }
          }
          break;
        case 'Escape':
          // Clear selection and highlights
          keyboardState.focusedRowIndex = -1;
          keyboardState.focusedColumnIndex = -1;
          keyboardState.emergencyHighlight = false;
          keyboardState.searchQuery = '';
          keyboardState.isEditing = false;
          break;
      }
    }

    // Context-specific shortcuts
    switch (gridContext) {
      case 'emergency-log':
        if (event.key === 'F1') {
          event.preventDefault();
          keyboardState.emergencyHighlight = true;
        }
        break;
      case 'lab-results':
        if (event.key === 'F2') {
          event.preventDefault();
          // In real implementation, this would highlight abnormal results
          keyboardState.shortcutPressed = true;
        }
        break;
      case 'vital-signs':
        if (event.key === 'F3') {
          event.preventDefault();
          // In real implementation, this would highlight critical values
          keyboardState.emergencyHighlight = true;
        }
        break;
    }
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
    medicalDeviceMode && "medical-device-mode",
    emergencyMode && "emergency-mode",
    enableWorkflowShortcuts && "workflow-shortcuts-enabled",
    keyboardNavigable && "keyboard-navigable",
    gridContext !== 'default' && `grid-context-${gridContext}`,
    keyboardState.emergencyHighlight && "emergency-highlight",
    keyboardState.shortcutPressed && "shortcut-pressed",
    qwikClass,
    className
  );

  // Enhanced ARIA attributes for medical contexts
  const gridRole = medicalDeviceMode ? 'grid' : undefined;
  const ariaLabel = medicalDeviceMode 
    ? `${gridContext} data grid - Medical device mode enabled${keyboardNavigable ? ' - Keyboard navigable' : ''}`
    : undefined;

  const ariaDescription = [
    emergencyMode && 'Emergency data grid',
    enableWorkflowShortcuts && 'Ctrl+A select all, Ctrl+F search, Ctrl+R refresh',
    keyboardNavigable && 'Arrow keys to navigate, Enter to select, Space to toggle',
    gridContext !== 'default' && `${gridContext} context`
  ].filter(Boolean).join('. ');

  return (
    <div class="themed-content">
      <Stack 
        class={dataGridClasses}
        style={style}
        onKeyDown$={handleKeyDown}
        tabIndex={medicalDeviceMode && keyboardNavigable ? 0 : undefined}
        role={gridRole}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'data-grid-description' : undefined}
        aria-rowcount={data.length}
        aria-colcount={columns.filter(col => !col.hidden).length}
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

      {/* Search indicator for medical devices */}
      {medicalDeviceMode && keyboardState.searchQuery && (
        <div 
          class="search-indicator absolute top-2 right-2 bg-primary-100 border border-primary-300 rounded px-2 py-1 text-sm z-20"
          role="status"
          aria-live="polite"
        >
          Search: {keyboardState.searchQuery}
        </div>
      )}

      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && (
        <div 
          id="data-grid-description"
          class="medical-shortcuts-help p-2 border-t border-neutral-light bg-neutral-lighter text-xs"
        >
          <div class="flex flex-wrap gap-4 text-neutral-normal">
            <span><kbd>Ctrl+A</kbd> Select All</span>
            <span><kbd>Ctrl+F</kbd> Search</span>
            <span><kbd>Ctrl+R</kbd> Refresh</span>
            <span><kbd>←→↑↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Select</span>
            <span><kbd>PgUp/PgDn</kbd> Page</span>
            <span><kbd>Home/End</kbd> First/Last</span>
            <span><kbd>Esc</kbd> Clear</span>
          </div>
        </div>
      )}
    </Stack>
    </div>
  );
});
