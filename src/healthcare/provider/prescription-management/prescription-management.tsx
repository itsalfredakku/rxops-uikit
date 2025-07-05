import { component$, useSignal, useStore, $ } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Card } from '../../../core/organisms/card/card';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge';
// Icons migrated to Icon component from utils/icons - removed: Pill, Calendar, AlertTriangle, Clock, MapPin, RefreshCw, Plus, Search, Filter
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Icon } from '../../..';
import { Row, Column } from '../../../layouts';

export interface Prescription {
  id: string;
  medicationName: string;
  genericName?: string;
  strength: string;
  dosage: string;
  frequency: string;
  route: string; // oral, topical, injection, etc.
  quantity: number;
  refillsRemaining: number;
  totalRefills: number;
  prescribedDate: string;
  expiryDate: string;
  lastRefillDate?: string;
  nextRefillDate?: string;
  prescriber: string;
  pharmacy: string;
  pharmacyAddress?: string;
  pharmacyPhone?: string;
  ndc?: string; // National Drug Code
  status: 'active' | 'expired' | 'discontinued' | 'pending' | 'completed';
  instructions: string;
  warnings?: string[];
  interactions?: string[];
  sideEffects?: string[];
  cost?: number;
  insuranceCovered?: boolean;
  isGeneric?: boolean;
  isPrn?: boolean; // Pro re nata (as needed)
  notes?: string;
}

export interface PrescriptionManagementProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  patientId: string;
  prescriptions: Prescription[];
  onPrescriptionClick?: (prescription: Prescription) => void;
  onRefillRequest?: (prescriptionId: string) => void;
  onAddPrescription?: () => void;
  onFilterChange?: (filters: PrescriptionFilters) => void;
  isEditable?: boolean;
  showFilters?: boolean;
}

export interface PrescriptionFilters {
  status?: string[];
  prescriber?: string[];
  pharmacy?: string[];
  searchTerm?: string;
  expiringWithin?: number; // days
  needsRefill?: boolean;
}

export const PrescriptionManagement = component$<PrescriptionManagementProps>((props) => {
  const {
    prescriptions = [],
    onPrescriptionClick,
    onRefillRequest,
    onAddPrescription,
    onFilterChange,
    isEditable = false,
    showFilters = true,
    // BaseComponentProps
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const searchTerm = useSignal('');
  const showFiltersPanel = useSignal(false);
  
  const filters = useStore<PrescriptionFilters>({
    status: [],
    prescriber: [],
    pharmacy: [],
    searchTerm: '',
    expiringWithin: undefined,
    needsRefill: false
  });

  const _statusColors = {
    active: 'bg-success-100 text-success-800 border-green-200',
    expired: 'bg-error-100 text-error-800 border-red-200',
    discontinued: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    pending: 'bg-warning-100 text-warning-800 border-yellow-200',
    completed: 'bg-primary-100 text-primary-800 border-primary-200'
  };

  const _routeColors = {
    oral: 'bg-primary-50 text-primary-700',
    topical: 'bg-success-50 text-success-700',
    injection: 'bg-purple-50 text-purple-700',
    inhaled: 'bg-orange-50 text-orange-700',
    sublingual: 'bg-pink-50 text-pink-700'
  };

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filters.searchTerm && 
        !prescription.medicationName.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !prescription.genericName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !prescription.prescriber.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    if (filters.status && filters.status.length > 0 && !filters.status.includes(prescription.status)) {
      return false;
    }

    if (filters.prescriber && filters.prescriber.length > 0 && !filters.prescriber.includes(prescription.prescriber)) {
      return false;
    }

    if (filters.pharmacy && filters.pharmacy.length > 0 && !filters.pharmacy.includes(prescription.pharmacy)) {
      return false;
    }

    if (filters.needsRefill && prescription.refillsRemaining <= 0) {
      return false;
    }

    if (filters.expiringWithin) {
      const daysUntilExpiry = Math.ceil(
        (new Date(prescription.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry > filters.expiringWithin) {
        return false;
      }
    }

    return true;
  });

  const handleSearchChange = $((term: string) => {
    searchTerm.value = term;
    filters.searchTerm = term;
    onFilterChange && onFilterChange(filters);
  });

  const handleRefillRequest = $((prescriptionId: string) => {
    onRefillRequest && onRefillRequest(prescriptionId);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const isExpiringSoon = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) <= 30;
  };

  const PrescriptionCard = component$<{ prescription: Prescription }>((props) => {
    const { prescription } = props;
    const daysUntilExpiry = getDaysUntilExpiry(prescription.expiryDate);

    return (
      <Card variant="elevated" padding="4" class="hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <Text as="h4" weight="semibold" size="lg" color="blue-900">{prescription.medicationName}</Text>
            {prescription.genericName && (
              <Text as="p" size="sm" color="gray-600">Generic: {prescription.genericName}</Text>
            )}
            <div class="flex items-center space-x-2 mt-1">
              <Badge
                color={prescription.status === 'active' ? 'success' : 
                       prescription.status === 'expired' ? 'error' :
                       prescription.status === 'pending' ? 'warning' : 'secondary'}
                variant="outlined"
                size="sm"
              >
                {prescription.status}
              </Badge>
              <Badge
                color="info"
                variant="flat"
                size="sm"
              >
                {prescription.route}
              </Badge>
              {prescription.isPrn && (
                <Badge
                  color="warning"
                  variant="flat"
                  size="sm"
                >
                  PRN
                </Badge>
              )}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            {isExpiringSoon(prescription.expiryDate) && (
              <Icon icon="alert-triangle" class="w-5 h-5 text-orange-500" />
            )}
            {prescription.refillsRemaining <= 2 && prescription.refillsRemaining > 0 && (
              <Icon icon="clock" class="w-5 h-5 text-warning-500" />
            )}
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-neutral-600">Strength:</span>
            <span class="font-medium">{prescription.strength}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-neutral-600">Dosage:</span>
            <span class="font-medium">{prescription.dosage}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-neutral-600">Frequency:</span>
            <span class="font-medium">{prescription.frequency}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-neutral-600">Refills:</span>
            <span class={`font-medium ${prescription.refillsRemaining <= 2 ? 'text-orange-600' : 'text-neutral-900'}`}>
              {prescription.refillsRemaining} of {prescription.totalRefills}
            </span>
          </div>
        </div>

        <div class="border-t border-neutral-100 pt-3 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-neutral-600 flex items-center">
              <Icon icon="calendar" class="w-4 h-4 mr-1" />
              Expires:
            </span>
            <span class={`font-medium ${isExpiringSoon(prescription.expiryDate) ? 'text-orange-600' : 'text-neutral-900'}`}>
              {formatDate(prescription.expiryDate)}
              {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                <span class="ml-1 text-xs text-orange-500">
                  ({daysUntilExpiry} days)
                </span>
              )}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-neutral-600">Prescriber:</span>
            <span class="font-medium">Dr. {prescription.prescriber}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-neutral-600 flex items-center">
              <Icon icon="map-pin" class="w-4 h-4 mr-1" />
              Pharmacy:
            </span>
            <span class="font-medium">{prescription.pharmacy}</span>
          </div>
        </div>

        {prescription.instructions && (
          <div class="mt-3 p-2 bg-primary-50 rounded text-sm">
            <Text as="p" color="blue-800">{prescription.instructions}</Text>
          </div>
        )}

        {prescription.warnings && prescription.warnings.length > 0 && (
          <div class="mt-3 p-2 bg-error-50 rounded">
            <div class="flex items-start">
              <Icon icon="alert-triangle" class="w-4 h-4 text-error-600 mt-0.5 mr-2 flex-shrink-0" />
              <div class="text-sm text-error-800">
                {prescription.warnings.map((warning, index) => (
                  <Text as="p" key={index}>{warning}</Text>
                ))}
              </div>
            </div>
          </div>
        )}

        <div class="mt-4 flex items-center justify-between">
          <Button
            onClick$={() => onPrescriptionClick && onPrescriptionClick(prescription)}
            variant="text"
            color="primary"
            size="sm"
          >
            View Details
          </Button>
          {prescription.refillsRemaining > 0 && prescription.status === 'active' && (
            <Button
              onClick$={() => handleRefillRequest(prescription.id)}
              variant="elevated"
              color="primary"
              size="sm"
              leftIcon={true}
            >
              <Icon icon="refresh-cw" class="w-4 h-4 mr-1" />
              Request Refill
            </Button>
          )}
        </div>
      </Card>
    );
  });

  // Create merged class names for consistent styling
  const prescriptionManagementClasses = mergeClasses(
    "prescription-management bg-white rounded-lg shadow-sm border border-neutral-200",
    qwikClass,
    className
  );

  return (
    <div class={prescriptionManagementClasses} style={style} {...rest}>
      {/* Header */}
      <div class="border-b border-neutral-200 p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <Icon icon="pill" class="w-5 h-5 text-primary-600" />
            <Text as="h3" weight="semibold" size="lg" color="blue-900">Prescription Management</Text>
            <span class="text-sm text-neutral-500">({filteredPrescriptions.length} prescriptions)</span>
          </div>
          <div class="flex items-center space-x-2">
            {showFilters && (
              <Button
                onClick$={() => showFiltersPanel.value = !showFiltersPanel.value}
                variant="outlined"
                color="secondary"
                size="sm"
                leftIcon={true}
              >
                <Icon icon="filter" class="w-4 h-4 mr-1" />
                Filters
              </Button>
            )}
            {isEditable && onAddPrescription && (
              <Button
                onClick$={onAddPrescription}
                variant="elevated"
                color="primary"
                size="sm"
                leftIcon={true}
              >
                <Icon icon="plus" class="w-4 h-4 mr-1" />
                Add Prescription
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div class="relative">
          <Icon icon="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchTerm.value}
            onInput$={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
            class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters Panel */}
        {showFiltersPanel.value && (
          <div class="mt-4 p-4 bg-neutral-50 rounded-md">
            <Row gap="4">
              <Column size={{ sm: 12, md: 3 }}>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  multiple
                  value={filters.status}
                  onChange$={(e) => {
                    const select = e.target as HTMLSelectElement;
                    filters.status = Array.from(select.selectedOptions).map(option => option.value);
                    onFilterChange && onFilterChange(filters);
                  }}
                  class="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </Column>
              <Column size={{ sm: 12, md: 3 }}>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Expiring Within</label>
                <select
                  value={filters.expiringWithin || ''}
                  onChange$={(e) => {
                    const value = (e.target as HTMLSelectElement).value;
                    filters.expiringWithin = value ? parseInt(value) : undefined;
                    onFilterChange && onFilterChange(filters);
                  }}
                  class="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any time</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </Column>
              <Column size={{ sm: 12, md: 3 }} class="flex items-center">
                <input
                  type="checkbox"
                  id="needsRefill"
                  checked={filters.needsRefill}
                  onChange$={(e) => {
                    filters.needsRefill = (e.target as HTMLInputElement).checked;
                    onFilterChange && onFilterChange(filters);
                  }}
                  class="h-4 w-4 text-primary-600 focus:ring-blue-500 border-neutral-300 rounded"
                />
                <label for="needsRefill" class="ml-2 text-sm text-neutral-700">
                  Needs Refill
                </label>
              </Column>
            </Row>
          </div>
        )}
      </div>

      {/* Content */}
      <div class="p-4">
        {filteredPrescriptions.length === 0 ? (
          <div class="text-center py-8">
            <Icon icon="pill" class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <Text as="p" color="gray-500">No prescriptions found</Text>
            {isEditable && onAddPrescription && (
              <Button
                onClick$={onAddPrescription}
                variant="text"
                color="primary"
                size="sm"
                class="mt-4"
              >
                Add the first prescription
              </Button>
            )}
          </div>
        ) : (
          <Row gap="4">
            {filteredPrescriptions.map((prescription) => (
              <Column key={prescription.id} size={{ sm: 12, md: 6, lg: 4 }}>
                <PrescriptionCard prescription={prescription} />
              </Column>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
});
