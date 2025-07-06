import { component$, useSignal, useStore, $ } from '@builder.io/qwik';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Text } from '../../../core/atoms/text/text';
import { Card } from '../../../core/organisms/card/card';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge';
import { Alert } from '../../../core/atoms/alert/alert';
import { Input } from '../../../core/atoms/input/input';
import { FormField } from '../../../core/molecules/form-field/form-field';
import { DateTimePicker } from '../../../core/molecules/date-time-picker/date-time-picker';
import { Row, Column, Stack } from '../../../layouts';
import { Icon } from '../../../core/atoms/icon';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';

export interface LabResult {
  id: string;
  testName: string;
  testCode?: string;
  category: string;
  value: number | string;
  unit: string;
  referenceRange: {
    min?: number;
    max?: number;
    normal?: string;
  };
  status: 'normal' | 'high' | 'low' | 'critical' | 'abnormal';
  collectionDate: string;
  resultDate: string;
  orderingProvider: string;
  facility: string;
  fasting?: boolean;
  notes?: string;
  methodology?: string;
  specimen?: string;
  critical?: boolean;
  trend?: 'up' | 'down' | 'stable';
  previousValue?: number | string;
  previousDate?: string;
}

export interface LabResultsProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$` | 'results'> {
  patientId: string;
  results: LabResult[];
  onResultClick?: (result: LabResult) => void;
  onDownloadReport?: (resultId: string) => void;
  onFilterChange?: (filters: LabFilters) => void;
  showTrends?: boolean;
  showFilters?: boolean;
  groupByCategory?: boolean;
}

export interface LabFilters {
  categories?: string[];
  status?: string[];
  providers?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  searchTerm?: string;
  criticalOnly?: boolean;
}

export const LabResults = component$<LabResultsProps>((props) => {
  const {
    results = [],
    onResultClick,
    onDownloadReport,
    onFilterChange,
    showTrends = true,
    showFilters = true,
    groupByCategory = true,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const searchTerm = useSignal('');
  const showFiltersPanel = useSignal(false);

  const filters = useStore<LabFilters>({
    categories: [],
    status: [],
    providers: [],
    dateRange: {},
    searchTerm: '',
    criticalOnly: false
  });

  const _statusColors = {
    normal: 'bg-success-100 text-success-800 border-success-light',
    high: 'bg-error-100 text-error-800 border-error-light',
    low: 'bg-primary-100 text-primary-800 border-primary-200',
    critical: 'bg-error-200 text-error-900 border-error-light',
    abnormal: 'bg-warning-100 text-warning-800 border-warning-light'
  };

  // Convert status to Badge component props
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'normal':
        return { color: 'success' as const, shade: 'light' as const };
      case 'high':
        return { color: 'error' as const, shade: 'light' as const };
      case 'low':
        return { color: 'info' as const, shade: 'light' as const };
      case 'critical':
        return { color: 'error' as const, shade: 'normal' as const };
      case 'abnormal':
        return { color: 'warning' as const, shade: 'light' as const };
      default:
        return { color: 'secondary' as const, shade: 'light' as const };
    }
  };

  const trendIcons = {
    up: 'trending-up' as const,
    down: 'trending-down' as const,
    stable: null
  };

  const trendColors = {
    up: 'text-error-500',
    down: 'text-primary-500',
    stable: 'text-neutral-normal'
  };

  // Get unique categories
  const categories = Array.from(new Set(results.map(result => result.category)));

  // Filter results
  const filteredResults = results.filter(result => {
    if (filters.searchTerm &&
      !result.testName.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !result.category.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(result.category)) {
      return false;
    }

    if (filters.status && filters.status.length > 0 && !filters.status.includes(result.status)) {
      return false;
    }

    if (filters.providers && filters.providers.length > 0 && !filters.providers.includes(result.orderingProvider)) {
      return false;
    }

    if (filters.criticalOnly && !result.critical) {
      return false;
    }

    if (filters.dateRange) {
      const resultDate = new Date(result.collectionDate);
      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        if (resultDate < startDate) return false;
      }
      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        if (resultDate > endDate) return false;
      }
    }

    return true;
  });

  // Group results by category
  const groupedResults = groupByCategory ?
    categories.reduce((groups, category) => {
      groups[category] = filteredResults.filter(result => result.category === category);
      return groups;
    }, {} as Record<string, LabResult[]>) :
    { 'All Results': filteredResults };

  const handleSearchChange = $((term: string) => {
    searchTerm.value = term;
    filters.searchTerm = term;
    onFilterChange && onFilterChange(filters);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatValue = (value: number | string, unit: string) => {
    return typeof value === 'number' ? `${value} ${unit}` : `${value} ${unit}`;
  };

  const formatReferenceRange = (range: LabResult['referenceRange']) => {
    if (range.normal) return range.normal;
    if (range.min !== undefined && range.max !== undefined) {
      return `${range.min} - ${range.max}`;
    }
    if (range.min !== undefined) return `> ${range.min}`;
    if (range.max !== undefined) return `< ${range.max}`;
    return 'N/A';
  };

  const isOutOfRange = (result: LabResult) => {
    if (typeof result.value !== 'number') return false;

    const { referenceRange } = result;
    if (referenceRange.min !== undefined && result.value < referenceRange.min) return true;
    if (referenceRange.max !== undefined && result.value > referenceRange.max) return true;

    return false;
  };

  const LabResultCard = component$<{ result: LabResult }>((props) => {
    const { result } = props;
    const trendIconName = result.trend ? trendIcons[result.trend] : null;

    return (
      <Card variant="outlined" padding="4" class="hover:shadow-md transition-shadow">
        <Row alignItems="start" justifyContent="between" class="mb-3">
          <Column class="flex-1">
            <Text as="h4" weight="semibold" size="sm">{result.testName}</Text>
            {result.testCode && (
              <Text as="p" size="sm" color="gray-600">Code: {result.testCode}</Text>
            )}
            <Row alignItems="center" gap="2" class="mt-1">
              <Badge
                variant="flat"
                size="sm"
                pill
                {...getStatusBadgeProps(result.status)}
              >
                {result.status}
              </Badge>
              {result.critical && (
                <Icon icon="alert-triangle" class="w-4 h-4 text-error-500" />
              )}
              {result.fasting && (
                <Badge variant="flat" color="info" shade="lighter" size="sm" pill>
                  Fasting
                </Badge>
              )}
            </Row>
          </Column>
          <Row alignItems="center" gap="2">
            {showTrends && trendIconName && (
              <div class={`w-5 h-5 ${trendColors[result.trend!]}`}>
                <Icon icon={trendIconName} class="w-5 h-5" />
              </div>
            )}
            <Tooltip content="View details">
              <Button
                onClick$={() => onResultClick && onResultClick(result)}
                variant="text"
                size="xs"
                color="secondary"
              >
                <Icon icon="eye" class="w-4 h-4" />
              </Button>
            </Tooltip>
          </Row>
        </Row>

        <Stack gap="4">
          <Row alignItems="center" justifyContent="between">
            <Text as="span" size="xl" weight="bold" color="gray-900">
              {formatValue(result.value, result.unit)}
            </Text>
            <Text as="span" size="sm" color="gray-600">
              Reference: {formatReferenceRange(result.referenceRange)}
            </Text>
          </Row>

          {isOutOfRange(result) && (
            <Alert color="warning" variant="soft">
              Outside reference range
            </Alert>
          )}

          {showTrends && result.previousValue && (
            <Card variant="flat" padding="2" class="bg-neutral-lighter">
              <Row alignItems="center" justifyContent="between" class="text-sm">
                <Text color="gray-600">Previous:</Text>
                <Text weight="medium">
                  {formatValue(result.previousValue, result.unit)}
                </Text>
              </Row>
              {result.previousDate && (
                <Text size="xs" color="gray-500" class="mt-1">
                  {formatDate(result.previousDate)}
                </Text>
              )}
            </Card>
          )}

          <Column class="border-t border-neutral-lighter pt-3" gap="2">
            <Row alignItems="center" justifyContent="between" class="text-sm">
              <Text color="gray-600" class="flex items-center">
                <Icon icon="calendar" class="w-4 h-4 mr-1" />
                Collected:
              </Text>
              <Text weight="medium">{formatDate(result.collectionDate)}</Text>
            </Row>
            <Row alignItems="center" justifyContent="between" class="text-sm">
              <Text color="gray-600">Result Date:</Text>
              <Text weight="medium">{formatDate(result.resultDate)}</Text>
            </Row>
            <Row alignItems="center" justifyContent="between" class="text-sm">
              <Text color="gray-600">Ordered by:</Text>
              <Text weight="medium">Dr. {result.orderingProvider}</Text>
            </Row>
            <Row alignItems="center" justifyContent="between" class="text-sm">
              <Text color="gray-600">Facility:</Text>
              <Text weight="medium">{result.facility}</Text>
            </Row>
          </Column>

          {result.notes && (
            <Card variant="flat" padding="2" class="bg-primary-50">
              <Text as="p" size="sm" color="blue-800">{result.notes}</Text>
            </Card>
          )}

          <Row alignItems="center" justifyContent="between" class="pt-2">
            <Button
              onClick$={() => onResultClick && onResultClick(result)}
              variant="text"
              size="sm"
              color="primary"
            >
              View Full Report
            </Button>
            {onDownloadReport && (
              <Button
                onClick$={() => onDownloadReport(result.id)}
                variant="outlined"
                size="sm"
                color="secondary"
              >
                <Icon icon="download" class="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
          </Row>
        </Stack>
      </Card>
    );
  });

  const containerClasses = mergeClasses(
    'lab-results bg-white rounded-lg shadow-sm border border-neutral-light',
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <Card
        class={containerClasses}
        style={style}
        {...rest}
      >
      {/* Header */}
      <Card.Body class="border-b border-neutral-light">
        <Row alignItems="center" justifyContent="between" class="mb-4">
          <Row alignItems="center" gap="3">
            <Icon icon="file-text" class="w-5 h-5 text-primary-600" />
            <Text as="h3" weight="semibold" size="md">Lab Results</Text>
            <Text size="sm" color="secondary">({filteredResults.length} results)</Text>
          </Row>
          {showFilters && (
            <Button
              variant="outlined" 
              size="sm"
              onClick$={() => showFiltersPanel.value = !showFiltersPanel.value}
            >
              <Icon icon="filter" class="w-4 h-4 mr-1" />
              Filters
            </Button>
          )}
        </Row>

        {/* Search */}
        <Stack gap="2">
          <FormField
            label="Search Lab Results"
            hint="Search by test name, date, or result values"
          >
            <Row alignItems="center" class="relative">
              <Icon icon="search" class="w-4 h-4 absolute left-3 text-neutral-light" />
              <Input
                type="text"
                placeholder="Search lab results..."
                value={searchTerm.value}
                size="sm"
                class="pl-10"
                onInput$={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
              />
            </Row>
          </FormField>
        </Stack>

        {/* Filters Panel */}
        {showFiltersPanel.value && (
          <Card class="mt-4 p-4 bg-neutral-lighter rounded-md">
            <Row gap="4">
              <Column size={{ sm: 1, md: 4 }}>
                <label class="block text-sm font-medium text-neutral-dark mb-1">Categories</label>
                <select
                  multiple
                  value={filters.categories}
                  onChange$={(e) => {
                    const select = e.target as HTMLSelectElement;
                    filters.categories = Array.from(select.selectedOptions).map(option => option.value);
                    onFilterChange && onFilterChange(filters);
                  }}
                  class="w-full px-3 py-1.5 text-sm border border-neutral-light rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:ring-1 focus:ring-primary-normal"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </Column>
              <Column size={{ sm: 1, md: 4 }}>
                <label class="block text-sm font-medium text-neutral-dark mb-1">Status</label>
                <select
                  multiple
                  value={filters.status}
                  onChange$={(e) => {
                    const select = e.target as HTMLSelectElement;
                    filters.status = Array.from(select.selectedOptions).map(option => option.value);
                    onFilterChange && onFilterChange(filters);
                  }}
                  class="w-full px-3 py-1.5 text-sm border border-neutral-light rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:ring-1 focus:ring-primary-normal"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical</option>
                  <option value="abnormal">Abnormal</option>
                </select>
              </Column>
              <Column size={{ sm: 1, md: 4 }}>
                <FormField
                  label="Date Range"
                  hint="Filter lab results by date range"
                >
                  <Row gap="2">
                    <DateTimePicker
                      value={filters.dateRange?.start || ''}
                      size="sm"
                      variant="outlined"
                      placeholder="Start date"
                      class="flex-1"
                      onChange$={(date) => {
                        filters.dateRange = { ...filters.dateRange, start: date };
                        onFilterChange && onFilterChange(filters);
                      }}
                    />
                    <DateTimePicker
                      value={filters.dateRange?.end || ''}
                      size="sm"
                      variant="outlined"
                      placeholder="End date"
                      class="flex-1"
                      onChange$={(date) => {
                        filters.dateRange = { ...filters.dateRange, end: date };
                        onFilterChange && onFilterChange(filters);
                      }}
                    />
                  </Row>
                </FormField>
              </Column>
              <Column>
                <Row alignItems="center">
                  <input
                    type="checkbox"
                    id="criticalOnly"
                    checked={filters.criticalOnly}
                    onChange$={(e) => {
                      filters.criticalOnly = (e.target as HTMLInputElement).checked;
                      onFilterChange && onFilterChange(filters);
                    }}
                    class="h-4 w-4 text-primary-600 focus:ring-primary-normal border-neutral-light rounded"
                  />
                  <label for="criticalOnly" class="ml-2 text-sm text-neutral-dark">
                    Critical Only
                  </label>
                </Row>
              </Column>
            </Row>
          </Card>
        )}
      </Card.Body>

      {/* Content */}
      <div class="p-4">
        {filteredResults.length === 0 ? (
          <div class="text-center py-8">
            <Icon icon="file-text" class="w-12 h-12 text-neutral-light mx-auto mb-4" />
            <Text as="p" color="muted">No lab results found</Text>
          </div>
        ) : (
          <Column gap="6">
            {Object.entries(groupedResults).map(([category, categoryResults]) => {
              if (categoryResults.length === 0) return null;

              return (
                <div key={category}>
                  {groupByCategory && (
                    <Text as="h4" weight="semibold" size="md" class="mb-4">{category}</Text>
                  )}
                  <Row gap="4">
                    {categoryResults.map((result) => (
                      <Column size={{ sm: 1, md: 2, lg: 3 }} key={result.id}>
                        <LabResultCard result={result} />
                      </Column>
                    ))}
                  </Row>
                </div>
              );
            })}
          </Column>
        )}
      </div>
    </Card>
    </div>
  );
});
