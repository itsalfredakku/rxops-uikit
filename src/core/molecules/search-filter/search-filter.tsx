import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";
import { Card } from "../../organisms/card/card";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Select } from "../select/select";
import { Icon } from "../../atoms/icon";
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";
import { Stack } from "../../../layouts/stack";

export interface SearchFilter {
  key: string;
  label: string;
  type: "select" | "multiselect" | "range" | "toggle" | "date";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export type FilterValue = string | string[] | boolean | { min: number; max: number };

export interface SearchAndFilterProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  placeholder?: string;
  searchValue?: string;
  filters?: SearchFilter[];
  onSearch$?: (query: string, filters: Record<string, FilterValue>) => void;
  onFilterChange$?: (filters: Record<string, FilterValue>) => void;
  showFilters?: boolean;
}

export const SearchAndFilter = component$<SearchAndFilterProps>((props) => {
  const {
    placeholder = "Search...",
    searchValue = "",
    filters = [],
    onSearch$,
    onFilterChange$,
    showFilters = true,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;
  
  const searchQuery = useSignal(searchValue);
  const filterValues = useSignal<Record<string, FilterValue>>({});
  const showFilterPanel = useSignal(false);
  const isSearching = useSignal(false);

  // Initialize filter values
  useTask$(() => {
    const initialValues: Record<string, FilterValue> = {};
    filters.forEach(filter => {
      switch (filter.type) {
        case "multiselect":
          initialValues[filter.key] = [];
          break;
        case "toggle":
          initialValues[filter.key] = false;
          break;
        case "range":
          initialValues[filter.key] = { min: filter.min || 0, max: filter.max || 100 };
          break;
        default:
          initialValues[filter.key] = "";
      }
    });
    filterValues.value = initialValues;
  });

  const handleSearch = $(async () => {
    isSearching.value = true;
    try {
      await onSearch$?.(searchQuery.value, filterValues.value);
    } finally {
      isSearching.value = false;
    }
  });

  const handleFilterChange = $((key: string, value: FilterValue) => {
    filterValues.value = { ...filterValues.value, [key]: value };
    onFilterChange$?.(filterValues.value);
  });

  const clearFilters = $(() => {
    const clearedValues: Record<string, FilterValue> = {};
    filters.forEach(filter => {
      switch (filter.type) {
        case "multiselect":
          clearedValues[filter.key] = [];
          break;
        case "toggle":
          clearedValues[filter.key] = false;
          break;
        case "range":
          clearedValues[filter.key] = { min: filter.min || 0, max: filter.max || 100 };
          break;
        default:
          clearedValues[filter.key] = "";
      }
    });
    filterValues.value = clearedValues;
    onFilterChange$?.(clearedValues);
  });

  const activeFilterCount = Object.values(filterValues.value).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    if (typeof value === "object" && value && 'min' in value && 'max' in value) {
      const rangeValue = value as { min: number; max: number };
      const matchingFilter = filters.find(f => 
        Object.keys(filterValues.value).find(k => filterValues.value[k] === value) === f.key
      );
      return rangeValue.min !== (matchingFilter?.min || 0) ||
             rangeValue.max !== (matchingFilter?.max || 100);
    }
    return value !== "";
  }).length;

  const wrapperClass = mergeClasses(
    "space-y-4",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <Stack 
        class={wrapperClass} 
      style={style}
      data-testid={testId}
      gap="4"
      {...rest}
    >
      {/* Search Bar */}
      <Column class="relative">
        <Row class="relative">
          <Input
            type="text"
            value={searchQuery.value}
            onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
            onKeyDown$={(e) => (e as KeyboardEvent).key === "Enter" && handleSearch()}
            placeholder={placeholder}
            class="w-full pl-10 pr-20 py-3 border border-neutral-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <Column class="absolute inset-y-0 left-0 pl-3">
            <Row alignItems="center" class="h-full pointer-events-none">
              <Icon icon="search" class="text-neutral" />
            </Row>
          </Column>
          <Row alignItems="center" class="absolute inset-y-0 right-0">
            {showFilters && (
              <Button
                type="button"
                onClick$={() => showFilterPanel.value = !showFilterPanel.value}
                variant={showFilterPanel.value || activeFilterCount > 0 ? "outlined" : "flat"}
                size="sm"
                class="mr-2"
              >
                <Row alignItems="center" gap="1">
                  <Icon icon="filter" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span class="ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Row>
              </Button>
            )}
            <Button
              type="button"
              onClick$={handleSearch}
              disabled={isSearching.value}
              variant="elevated"
              size="sm"
              class="mr-3"
            >
              {isSearching.value ? (
                <Icon icon="refresh-cw" class="animate-spin" />
              ) : (
                <Icon icon="search" />
              )}
            </Button>
          </Row>
        </Row>
      </Column>

      {/* Filter Panel */}
      {showFilters && showFilterPanel.value && (
        <Card variant="elevated" padding="6" class="shadow-sm">
          <Row alignItems="center" justifyContent="between" class="mb-4">
            <h3 class="text-lg font-semibold text-neutral-darker">Filters</h3>
            <Row alignItems="center" gap="2">
              <Button
                type="button"
                onClick$={clearFilters}
                variant="text"
                size="sm"
                class="text-neutral hover:text-neutral-darker"
              >
                Clear All
              </Button>
              <Button
                type="button"
                onClick$={() => showFilterPanel.value = false}
                variant="text"
                size="sm"
                class="p-1 text-neutral hover:text-neutral-darker"
              >
                <Icon icon="x-circle" />
              </Button>
            </Row>
          </Row>

          <Stack gap="6">
            {filters.map((filter) => (
              <Stack key={filter.key} gap="2">
                <label class="block text-sm font-medium text-neutral-darker">
                  {filter.label}
                </label>

                {filter.type === "select" && (
                  <Select
                    value={(filterValues.value[filter.key] as string) || ""}
                    onChange$={(e: Event) => handleFilterChange(filter.key, (e.target as HTMLSelectElement).value)}
                    class="w-full max-w-xs"
                    placeholder={filter.placeholder || "Select option"}
                    options={filter.options?.map(opt => ({ value: opt.value, label: opt.label })) || []}
                  />
                )}

                {filter.type === "multiselect" && (
                  <Column class="flex flex-wrap gap-x-6 gap-y-2">
                    {filter.options?.map(option => {
                      const currentArray = (filterValues.value[filter.key] as string[]) || [];
                      const isSelected = currentArray.includes(option.value);
                      return (
                        <Row key={option.value} alignItems="center" gap="2" class="cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange$={(e) => {
                              const checked = (e.target as HTMLInputElement).checked;
                              const current = (filterValues.value[filter.key] as string[]) || [];
                              const updated = checked 
                                ? [...current, option.value]
                                : current.filter((v: string) => v !== option.value);
                              handleFilterChange(filter.key, updated);
                            }}
                            class="w-4 h-4 text-primary bg-neutral-lighter border-neutral-light rounded focus:ring-primary"
                          />
                          <span class="text-sm text-neutral-darker">{option.label}</span>
                        </Row>
                      );
                    })}
                  </Column>
                )}

                {filter.type === "range" && (
                  <Row alignItems="center" gap="3" class="max-w-sm">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={String(((filterValues.value[filter.key] as { min: number; max: number }) || { min: filter.min || 0, max: filter.max || 100 }).min)}
                      onChange$={(e) => {
                        const value = parseInt((e.target as HTMLInputElement).value) || 0;
                        const currentRange = (filterValues.value[filter.key] as { min: number; max: number }) || { min: filter.min || 0, max: filter.max || 100 };
                        handleFilterChange(filter.key, {
                          ...currentRange,
                          min: value
                        });
                      }}
                      class="w-20"
                      size="sm"
                    />
                    <span class="text-neutral text-sm">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={String(((filterValues.value[filter.key] as { min: number; max: number }) || { min: filter.min || 0, max: filter.max || 100 }).max)}
                      onChange$={(e) => {
                        const value = parseInt((e.target as HTMLInputElement).value) || 100;
                        const currentRange = (filterValues.value[filter.key] as { min: number; max: number }) || { min: filter.min || 0, max: filter.max || 100 };
                        handleFilterChange(filter.key, {
                          ...currentRange,
                          max: value
                        });
                      }}
                      class="w-20"
                      size="sm"
                    />
                  </Row>
                )}

                {filter.type === "toggle" && (
                  <Row alignItems="center" gap="2" class="cursor-pointer max-w-xs">
                    <input
                      type="checkbox"
                      checked={(filterValues.value[filter.key] as boolean) || false}
                      onChange$={(e) => handleFilterChange(filter.key, (e.target as HTMLInputElement).checked)}
                      class="w-4 h-4 text-primary bg-neutral-lighter border-neutral-light rounded focus:ring-primary"
                    />
                    <span class="text-sm text-neutral-darker">{filter.placeholder || "Enable"}</span>
                  </Row>
                )}

                {filter.type === "date" && (
                  <Input
                    type="date"
                    value={(filterValues.value[filter.key] as string) || ""}
                    onChange$={(e) => handleFilterChange(filter.key, (e.target as HTMLInputElement).value)}
                    class="w-full"
                  />
                )}
              </Stack>
            ))}
          </Stack>

          <Row justifyContent="end" gap="3" class="mt-6">
            <Button
              type="button"
              onClick$={() => showFilterPanel.value = false}
              variant="text"
              class="text-neutral hover:text-neutral-darker"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick$={() => {
                handleSearch();
                showFilterPanel.value = false;
              }}
              variant="elevated"
            >
              Apply Filters
            </Button>
          </Row>
        </Card>
      )}
    </Stack>
    </div>
  );
});

// Healthcare-specific search presets
export const DoctorSearch = component$<Omit<SearchAndFilterProps, 'filters'>>((props) => {
  const healthcareFilters: SearchFilter[] = [
    {
      key: "specialization",
      label: "Specialization",
      type: "select",
      options: [
        { value: "cardiology", label: "Cardiology" },
        { value: "dermatology", label: "Dermatology" },
        { value: "neurology", label: "Neurology" },
        { value: "orthopedics", label: "Orthopedics" },
        { value: "pediatrics", label: "Pediatrics" },
        { value: "psychiatry", label: "Psychiatry" },
        { value: "general", label: "General Medicine" }
      ]
    },
    {
      key: "experience",
      label: "Years of Experience",
      type: "range",
      min: 0,
      max: 50
    },
    {
      key: "availability",
      label: "Availability",
      type: "multiselect",
      options: [
        { value: "today", label: "Available Today" },
        { value: "tomorrow", label: "Available Tomorrow" },
        { value: "this-week", label: "This Week" },
        { value: "next-week", label: "Next Week" }
      ]
    },
    {
      key: "rating",
      label: "Minimum Rating",
      type: "select",
      options: [
        { value: "4", label: "4+ Stars" },
        { value: "4.5", label: "4.5+ Stars" },
        { value: "5", label: "5 Stars" }
      ]
    },
    {
      key: "online-consultation",
      label: "Online Consultation",
      type: "toggle",
      placeholder: "Offers video consultations"
    },
    {
      key: "location",
      label: "Location",
      type: "select",
      options: [
        { value: "nearby", label: "Nearby (< 5km)" },
        { value: "city", label: "Within City" },
        { value: "state", label: "Within State" }
      ]
    }
  ];

  return (
    <SearchAndFilter
      {...props}
      filters={healthcareFilters}
      placeholder="Search doctors by name, specialization..."
    />
  );
});

export const AppointmentSearch = component$<Omit<SearchAndFilterProps, 'filters'>>((props) => {
  const appointmentFilters: SearchFilter[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "confirmed", label: "Confirmed" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" }
      ]
    },
    {
      key: "date-range",
      label: "Date Range",
      type: "select",
      options: [
        { value: "today", label: "Today" },
        { value: "this-week", label: "This Week" },
        { value: "this-month", label: "This Month" },
        { value: "last-month", label: "Last Month" }
      ]
    },
    {
      key: "appointment-type",
      label: "Appointment Type",
      type: "select",
      options: [
        { value: "consultation", label: "Consultation" },
        { value: "follow-up", label: "Follow-up" },
        { value: "emergency", label: "Emergency" },
        { value: "check-up", label: "Check-up" }
      ]
    },
    {
      key: "doctor",
      label: "Doctor",
      type: "select",
      options: [] // Would be populated dynamically
    }
  ];

  return (
    <SearchAndFilter
      {...props}
      filters={appointmentFilters}
      placeholder="Search appointments..."
    />
  );
});
