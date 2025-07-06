import { component$, Slot, $, type QRL, type JSXNode } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Button } from "../../atoms/button/button";
import { Spinner } from "../../atoms/spinner/spinner";
import { Dropdown, type DropdownItem } from "../dropdown/dropdown";
import { SplitButton } from "../split-button/split-button";
import { Icon, type IconName } from '../../atoms/icon';
import { Card } from '../../organisms/card/card';
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";
import { Stack } from "../../../layouts/stack";

export type DataListVariant = "default" | "cards" | "compact";
export type DataListSize = "sm" | "md" | "lg";

export interface DataListItem {
  id: string;
  title?: string;
  name?: string;
  status?: 'active' | 'pending' | 'inactive';
  description?: string;
  timestamp?: string;
  patientInfo?: {
    name: string;
    id: string;
    avatar?: string;
  };
  [key: string]: unknown;
}

export interface DataListAction {
  id: string;
  label: string;
  icon?: IconName;
  variant?: "elevated" | "flat" | "outlined" | "text";
  disabled?: boolean | ((item: DataListItem) => boolean);
  onClick$?: QRL<(item: DataListItem, index: number) => void>;
  items?: DropdownItem[]; // For split button actions
}

export interface DataListProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  data: DataListItem[];
  variant?: DataListVariant;
  size?: DataListSize;
  loading?: boolean;
  emptyText?: string;
  selectable?: boolean | "single" | "multiple";
  selectedItems?: string[];
  onSelectionChange$?: QRL<(selectedItems: string[]) => void>;
  onItemClick$?: QRL<(item: DataListItem, index: number) => void>;
  actions?: DataListAction[];
  contextMenu?: DropdownItem[];
  onContextMenu$?: QRL<(item: DataListItem, index: number) => void>;
  // Template props
  itemTemplate?: QRL<(item: DataListItem, index: number) => JSXNode>;
  headerTemplate?: QRL<() => JSXNode>;
  footerTemplate?: QRL<() => JSXNode>;
  // Healthcare specific
  showPatientInfo?: boolean;
  showMedicalStatus?: boolean;
  showTimestamp?: boolean;
}

export const DataList = component$<DataListProps>(({
  data,
  variant = "default",
  size = "md",
  loading = false,
  emptyText = "No items found",
  selectable = false,
  selectedItems = [],
  onSelectionChange$,
  onItemClick$,
  actions = [],
  onContextMenu$,
  itemTemplate,
  headerTemplate,
  footerTemplate,
  showPatientInfo = false,
  showMedicalStatus = false,
  showTimestamp = false,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {

  const handleItemSelect = $((itemId: string, selected: boolean) => {
    let newSelection: string[] = [];
    
    if (selectable === "single") {
      newSelection = selected ? [itemId] : [];
    } else if (selectable === "multiple") {
      if (selected) {
        newSelection = [...selectedItems, itemId];
      } else {
        newSelection = selectedItems.filter(id => id !== itemId);
      }
    }
    
    onSelectionChange$ && onSelectionChange$(newSelection);
  });

  const handleActionClick = $((action: DataListAction, item: DataListItem, index: number) => {
    const isDisabled = typeof action.disabled === 'function' ? action.disabled(item) : action.disabled;
    if (!isDisabled && action.onClick$) {
      action.onClick$(item, index);
    }
  });

  const renderDefaultItem = (item: DataListItem, index: number) => {
    return (
      <Card variant="outlined" padding="4" class="transition-colors duration-200 hover:bg-neutral-lighter">
        <Row alignItems="center" justifyContent="between">
          <Row alignItems="center" gap="4">
            {selectable !== false && (
              <input
                type={selectable === "single" ? "radio" : "checkbox"}
                checked={selectedItems.includes(item.id)}
                onChange$={(e) => handleItemSelect(item.id, (e.target as HTMLInputElement).checked)}
                class="rounded border-neutral text-primary-dark focus:ring-primary"
              />
            )}
            
            <Column class="flex-1 min-w-0">
              <Row alignItems="center" gap="2">
                <h3 class="text-sm font-medium text-neutral-darker truncate">
                  {item.title || item.name || `Item ${index + 1}`}
                </h3>
                {showMedicalStatus && item.status && (
                  <span class={`px-2 py-1 text-xs rounded-full font-medium ${
                    item.status === 'active' ? 'bg-success-lighter text-success-darker' :
                    item.status === 'pending' ? 'bg-warning-lighter text-warning-darker' :
                    'bg-error-lighter text-error-darker'
                  }`}>
                    {item.status}
                  </span>
                )}
              </Row>
              
              {item.description && (
                <p class="mt-1 text-sm text-neutral truncate">
                  {item.description}
                </p>
              )}
              
              {showPatientInfo && (item.patientName || item.patientId) ? (
                <Row class="mt-2 text-xs text-neutral-light">
                  Patient: {String(item.patientName || item.patientId)}
                </Row>
              ) : null}
              
              {showTimestamp && (item.timestamp || item.createdAt) ? (
                <Row class="mt-1 text-xs text-neutral-light">
                  {new Date(String(item.timestamp || item.createdAt)).toLocaleString()}
                </Row>
              ) : null}
            </Column>
          </Row>
          
          {actions.length > 0 && (
            <Row alignItems="center" gap="2">
              {actions.map((action) => {
                const isDisabled = typeof action.disabled === 'function' ? action.disabled(item) : action.disabled;
                
                if (action.items && action.items.length > 0) {
                  return (
                    <SplitButton
                      key={action.id}
                      label={action.label}
                      variant={action.variant || "outlined"}
                      size="sm"
                      disabled={isDisabled}
                      items={action.items}
                      onClick$={() => handleActionClick(action, item, index)}
                    />
                  );
                } else {
                  return (
                    <Button
                      key={action.id}
                      variant={action.variant || "outlined"}
                      size="sm"
                      disabled={isDisabled}
                      onClick$={() => handleActionClick(action, item, index)}
                    >
                      {action.icon && <span class="mr-1">{action.icon}</span>}
                      {action.label}
                    </Button>
                  );
                }
              })}
            </Row>
          )}
        </Row>
      </Card>
    );
  };

  const renderCardItem = (item: DataListItem, index: number) => {
    return (
      <Card variant="elevated" padding="6" class="hover:shadow-md transition-shadow">
        {selectable !== false && (
          <Row justifyContent="end" class="mb-4">
            <input
              type={selectable === "single" ? "radio" : "checkbox"}
              checked={selectedItems.includes(item.id)}
              onChange$={(e) => handleItemSelect(item.id, (e.target as HTMLInputElement).checked)}
              class="rounded border-neutral-light text-primary-dark focus:ring-primary"
            />
          </Row>
        )}
        
        <Stack alignItems="center" class="text-center">
          {item.avatar ? (
            <Column alignItems="center" class="mx-auto h-16 w-16 bg-neutral-light rounded-full mb-4">
              <img src={String(item.avatar)} alt="Avatar" width="64" height="64" class="h-16 w-16 rounded-full object-cover" />
            </Column>
          ) : null}
          
          <Column class="text-lg font-medium text-neutral-darker">
            {item.title || item.name || `Item ${index + 1}`}
          </Column>
          
          {item.description && (
            <p class="mt-2 text-sm text-neutral">
              {item.description}
            </p>
          )}
          
          {showMedicalStatus && item.status && (
            <Column class="mt-3">
              <span class={`px-3 py-1 text-sm rounded-full font-medium ${
                item.status === 'active' ? 'bg-success-lighter text-success-darker' :
                item.status === 'pending' ? 'bg-warning-lighter text-warning-darker' :
                'bg-error-lighter text-error-darker'
              }`}>
                {item.status}
              </span>
            </Column>
          )}
          
          {actions.length > 0 && (
            <Row justifyContent="center" gap="2" class="mt-4">
              {actions.map((action) => {
                const isDisabled = typeof action.disabled === 'function' ? action.disabled(item) : action.disabled;
                
                return (
                  <Button
                    key={action.id}
                    variant={action.variant || "outlined"}
                    size="sm"
                    disabled={isDisabled}
                    onClick$={() => handleActionClick(action, item, index)}
                  >
                    {action.icon && <span class="mr-1">{action.icon}</span>}
                    {action.label}
                  </Button>
                );
              })}
            </Row>
          )}
        </Stack>
      </Card>
    );
  };

  const renderCompactItem = (item: DataListItem, index: number) => {
    return (
      <Row alignItems="center" justifyContent="between" class="py-2 px-4 transition-colors duration-200 hover:bg-neutral-lighter">
        <Row alignItems="center" gap="3">
          {selectable !== false && (
            <input
              type={selectable === "single" ? "radio" : "checkbox"}
              checked={selectedItems.includes(item.id)}
              onChange$={(e) => handleItemSelect(item.id, (e.target as HTMLInputElement).checked)}
              class="rounded border-neutral-light text-primary-dark focus:ring-primary"
            />
          )}
          
          <Column class="flex-1 min-w-0">
            <Row alignItems="center" gap="2">
              <span class="text-sm font-medium text-neutral-darker">
                {item.title || item.name || `Item ${index + 1}`}
              </span>
              {showMedicalStatus && item.status && (
                <span class={`px-2 py-1 text-xs rounded font-medium ${
                  item.status === 'active' ? 'bg-success-lighter text-success-darker' :
                  item.status === 'pending' ? 'bg-warning-lighter text-warning-darker' :
                  'bg-error-lighter text-error-darker'
                }`}>
                  {item.status}
                </span>
              )}
            </Row>
            
            {item.description && (
              <p class="text-xs text-neutral truncate">
                {item.description}
              </p>
            )}
          </Column>
        </Row>
        
        {actions.length > 0 && (
          <Row alignItems="center" gap="1">
            {actions.slice(0, 2).map((action) => {
              const isDisabled = typeof action.disabled === 'function' ? action.disabled(item) : action.disabled;
              
              return (
                <Button
                  key={action.id}
                  variant="text"
                  size="sm"
                  disabled={isDisabled}
                  onClick$={() => handleActionClick(action, item, index)}
                >
                  {action.icon || action.label}
                </Button>
              );
            })}
            
            {actions.length > 2 && (
              <Dropdown
                items={actions.slice(2).map(action => ({
                  id: action.id,
                  label: action.label,
                  icon: action.icon,
                  disabled: typeof action.disabled === 'function' ? action.disabled(item) : action.disabled,
                  onClick$: $(() => handleActionClick(action, item, index))
                }))}
                placement="bottom-end"
              >
                <Button q:slot="trigger" variant="text" size="sm">
                  ⋯
                </Button>
              </Dropdown>
            )}
          </Row>
        )}
      </Row>
    );
  };

  const renderItem = (item: DataListItem, index: number) => {
    if (itemTemplate) {
      return <Slot />;
    }
    
    switch (variant) {
      case "cards":
        return renderCardItem(item, index);
      case "compact":
        return renderCompactItem(item, index);
      default:
        return renderDefaultItem(item, index);
    }
  };

  const containerClasses = mergeClasses(
    "enhanced-data-list",
    variant === "cards" && "grid gap-6",
    variant === "cards" && size === "sm" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    variant === "cards" && size === "md" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    variant === "cards" && size === "lg" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    variant === "default" && "space-y-3",
    variant === "compact" && "divide-y divide-neutral-light",
    loading && "opacity-50",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div 
        class={containerClasses}
      style={style}
      {...rest}
    >
      {headerTemplate && (
        <Column class="mb-4">
          <Slot name="header" />
        </Column>
      )}
      
      {loading && (
        <Row alignItems="center" justifyContent="center" class="py-8">
          <Row alignItems="center" gap="3">
            <Spinner size="md" variant="circular" color="primary-dark" />
            <span class="text-neutral-dark">Loading...</span>
          </Row>
        </Row>
      )}
      
      {!loading && data.length === 0 && (
        <Stack alignItems="center" class="text-center py-12">
          <Row justifyContent="center" class="text-neutral text-lg mb-2">
            <Icon icon="clipboard" class="w-6 h-6" />
          </Row>
          <p class="text-neutral">{emptyText}</p>
        </Stack>
      )}
      
      {!loading && data.length > 0 && (
        <>
          {data.map((item, index) => (
            <Column
              key={item.id}
              onClick$={onItemClick$ ? $(() => onItemClick$(item, index)) : undefined}
              onContextMenu$={onContextMenu$ ? $((e) => {
                e.preventDefault();
                onContextMenu$(item, index);
              }) : undefined}
              class={onItemClick$ ? "cursor-pointer" : ""}
            >
              {renderItem(item, index)}
            </Column>
          ))}
        </>
      )}
      
      {footerTemplate && (
        <Column class="mt-4">
          <Slot name="footer" />
        </Column>
      )}
    </div>
    </div>
  );
});
