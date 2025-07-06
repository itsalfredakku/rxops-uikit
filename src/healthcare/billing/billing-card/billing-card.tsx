import { component$, useSignal, $, type QRL } from '@builder.io/qwik';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { Textarea } from '../../../core/atoms/textarea/textarea';
import { Text } from '../../../core/atoms/text/text';
import { Alert } from '../../../core/atoms/alert/alert';
import { Card } from '../../../core/organisms/card/card';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Modal } from '../../../core/organisms/modal/modal';
import { Row } from '../../../layouts/row/index';
import { Column } from '../../../layouts/column/index';
import { Stack } from '../../../layouts/stack/index';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../../core/organisms/table/table';
import { Icon } from '../../../core/atoms/icon';

export interface BillingItem {
  id: string;
  description: string;
  code?: string; // CPT/HCPCS code
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'consultation' | 'procedure' | 'medication' | 'lab' | 'imaging' | 'other';
  date: string;
  provider?: string;
  insuranceCovered?: boolean;
  patientResponsibility?: number;
  notes?: string;
}

export interface Insurance {
  id: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  memberId: string;
  copay?: number;
  deductible?: number;
  deductibleMet?: number;
  coinsurance?: number;
  outOfPocketMax?: number;
  outOfPocketMet?: number;
  verified: boolean;
  verifiedDate?: string;
  preAuthRequired?: boolean;
  preAuthNumber?: string;
  coverage: {
    type: 'primary' | 'secondary' | 'tertiary';
    percentage: number;
    startDate: string;
    endDate?: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'hsa' | 'fsa' | 'cash' | 'check';
  last4?: string;
  brand?: string; // Visa, MasterCard, etc.
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isDefault?: boolean;
  verified?: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  date: string;
  transactionId?: string;
  reference?: string;
  notes?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
}

export interface BillingCardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  billId: string;
  patientId: string;
  patientName: string;
  dateOfService: string;
  dueDate?: string;
  items: BillingItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  amountPaid?: number;
  balance: number;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  insurance?: Insurance[];
  insuranceClaims?: {
    id: string;
    insuranceId: string;
    claimNumber?: string;
    submittedDate?: string;
    status: 'submitted' | 'processing' | 'approved' | 'denied' | 'appeal';
    approvedAmount?: number;
    deniedAmount?: number;
    denialReason?: string;
    paidAmount?: number;
    paidDate?: string;
  }[];
  payments?: Payment[];
  paymentMethods?: PaymentMethod[];
  facility?: {
    name: string;
    address: string;
    phone: string;
    taxId?: string;
    npi?: string;
  };
  provider?: {
    name: string;
    npi?: string;
    specialty?: string;
  };
  isEditable?: boolean;
  allowPayment?: boolean;
  showInsuranceInfo?: boolean;
  showPaymentHistory?: boolean;
  showDetailedItems?: boolean;
  onPayment?: QRL<(amount: number, method: PaymentMethod) => Promise<void>>;
  onInsuranceUpdate?: QRL<(insurance: Insurance) => Promise<void>>;
  onDispute?: QRL<(reason: string) => Promise<void>>;
  onPrintInvoice?: QRL<() => void>;
  onEmailInvoice?: QRL<(email: string) => Promise<void>>;
  onSetupPaymentPlan?: QRL<(plan: { months: number; downPayment?: number }) => Promise<void>>;
}

export default component$<BillingCardProps>((props) => {
  const {
    billId,
    patientName,
    dateOfService,
    dueDate,
    items,
    subtotal,
    tax = 0,
    discount = 0,
    total,
    amountPaid = 0,
    balance,
    status,
    insurance = [],
    insuranceClaims = [],
    payments = [],
    paymentMethods = [],
    facility,
    provider,
    isEditable = false,
    allowPayment = true,
    showInsuranceInfo = true,
    showPaymentHistory = true,
    showDetailedItems = true,
    onPayment,
    onInsuranceUpdate,
    onDispute,
    onPrintInvoice,
    onEmailInvoice,
    onSetupPaymentPlan,
    // BaseComponentProps
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const activeTab = useSignal<'overview' | 'items' | 'insurance' | 'payments' | 'history'>('overview');
  const showPaymentForm = useSignal(false);
  const showDisputeForm = useSignal(false);
  const showEmailForm = useSignal(false);
  const showPaymentPlanForm = useSignal(false);
  const selectedPaymentMethod = useSignal<PaymentMethod | null>(null);
  const paymentAmount = useSignal(balance);
  const disputeReason = useSignal('');
  const emailAddress = useSignal('');
  const paymentPlanMonths = useSignal(12);
  const paymentPlanDownPayment = useSignal(0);

  const handlePayment = $(async () => {
    if (onPayment && selectedPaymentMethod.value) {
      await onPayment(paymentAmount.value, selectedPaymentMethod.value);
      showPaymentForm.value = false;
    }
  });

  const handleDispute = $(async () => {
    if (onDispute && disputeReason.value.trim()) {
      await onDispute(disputeReason.value);
      showDisputeForm.value = false;
    }
  });

  const handleEmailInvoice = $(async () => {
    if (onEmailInvoice && emailAddress.value.trim()) {
      await onEmailInvoice(emailAddress.value);
      showEmailForm.value = false;
    }
  });

  const handleSetupPaymentPlan = $(async () => {
    if (onSetupPaymentPlan) {
      await onSetupPaymentPlan({
        months: paymentPlanMonths.value,
        downPayment: paymentPlanDownPayment.value || undefined
      });
      showPaymentPlanForm.value = false;
    }
  });

  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-success-dark bg-success-lighter';
      case 'overdue': return 'text-error-dark bg-error-lighter';
      case 'disputed': return 'text-warning-dark bg-warning-lighter';
      case 'cancelled': return 'text-neutral-dark bg-neutral-lighter';
      case 'pending': return 'text-warning-dark bg-warning-lighter';
      default: return 'text-primary-dark bg-primary-lighter';
    }
  };

  // Convert status to Badge component props
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'paid': 
        return { color: 'success' as const, shade: 'light' as const };
      case 'overdue': 
        return { color: 'error' as const, shade: 'light' as const };
      case 'disputed': 
        return { color: 'warning' as const, shade: 'normal' as const };
      case 'cancelled': 
        return { color: 'secondary' as const, shade: 'light' as const };
      case 'pending': 
        return { color: 'warning' as const, shade: 'light' as const };
      default: 
        return { color: 'info' as const, shade: 'light' as const };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consultation': return 'fas fa-user-md';
      case 'procedure': return 'fas fa-procedures';
      case 'medication': return 'fas fa-pills';
      case 'lab': return 'fas fa-vial';
      case 'imaging': return 'fas fa-x-ray';
      default: return 'fas fa-medical-kit';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create merged class names for consistent styling
  const billingCardClasses = mergeClasses(
    "bg-white rounded-lg shadow-lg border border-neutral-light max-w-4xl mx-auto",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <Card class={billingCardClasses} style={style} {...rest}>
      {/* Header */}
      <Card.Body class="border-b border-neutral-light">
        <Row alignItems="center" justifyContent="between" class="mb-4">
          <Column>
            <Text as="h2" weight="bold" size="lg">Medical Bill</Text>
            <Text as="p" size="sm" color="muted">Bill #{billId}</Text>
          </Column>
          <Row alignItems="center" gap="2">
            <Badge 
              variant="flat" 
              size="sm" 
              pill 
              {...getStatusBadgeProps(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Row alignItems="center" gap="2" class="ml-4">
              <Tooltip content="Email Invoice" position="top">
                <Button
                  onClick$={() => showEmailForm.value = true}
                  variant="text"
                  color="secondary"
                  size="sm"
                  class="p-2 transition-colors duration-normal hover:bg-primary-lighter"
                >
                  <Icon icon="mail" />
                </Button>
              </Tooltip>
              <Tooltip content="Print Invoice" position="top">
                <Button
                  onClick$={() => onPrintInvoice?.()}
                  variant="text" 
                  color="secondary"
                  size="sm"
                  class="p-2 transition-colors duration-normal hover:bg-primary-lighter"
                >
                  <Icon icon="printer" />
                </Button>
              </Tooltip>
            </Row>
          </Row>
        </Row>

        {/* Basic Info */}
        <Row gap="4" class="text-sm">
          <Column size={{ sm: 12, md: 4 }}>
            <Text as="p" color="muted">Patient</Text>
            <Text as="p" weight="medium">{patientName}</Text>
          </Column>
          <Column size={{ sm: 12, md: 4 }}>
            <Text as="p" color="muted">Date of Service</Text>
            <Text as="p" weight="medium">{formatDate(dateOfService)}</Text>
          </Column>
          {dueDate && (
            <Column size={{ sm: 12, md: 4 }}>
              <Text as="p" color="muted">Due Date</Text>
              <Text as="p" weight="medium">{formatDate(dueDate)}</Text>
            </Column>
          )}
        </Row>

        {/* Financial Summary */}
        <Card class="mt-6 p-4 bg-neutral-lighter rounded-lg">
          <Row gap="4" class="text-center">
            <Column size={{ sm: 6, md: 3 }}>
              <Text as="p" size="sm" color="muted">Total Amount</Text>
              <Text as="p" size="lg" weight="bold" color="neutral-darker">{formatCurrency(total)}</Text>
            </Column>
            <Column size={{ sm: 6, md: 3 }}>
              <Text as="p" size="sm" color="muted">Amount Paid</Text>
              <Text as="p" size="lg" weight="bold" color="success-dark">{formatCurrency(amountPaid)}</Text>
            </Column>
            <Column size={{ sm: 6, md: 3 }}>
              <Text as="p" size="sm" color="muted">Balance</Text>
              <Text as="p" size="lg" weight="bold" color="error-dark">{formatCurrency(balance)}</Text>
            </Column>
            <Column size={{ sm: 6, md: 3 }}>
              <Text as="p" size="sm" color="muted">Insurance</Text>
              <Text as="p" size="lg" weight="bold" color="primary-dark">
                {insurance.length > 0 ? insurance[0].provider : 'None'}
              </Text>
            </Column>
          </Row>
        </Card>
      </Card.Body>

      {/* Navigation Tabs */}
      <Card.Body class="border-b border-neutral-light">
        <Row gap="8">
          {(['overview', 'items', 'insurance', 'payments', 'history'] as const).map((tab) => (
            <Button
              key={tab}
              onClick$={() => activeTab.value = tab}
              variant="text"
              intent={activeTab.value === tab ? "primary" : "neutral"}
              size="sm"
              class={`py-3 px-1 border-b-2 ${
                activeTab.value === tab
                  ? 'border-primary-normal'
                  : 'border-transparent hover:border-neutral-normal'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </Row>
      </Card.Body>

      {/* Tab Content */}
      <div class="p-6">
        {/* Overview Tab */}
        {activeTab.value === 'overview' && (
          <Column gap="6">
            {/* Facility & Provider Info */}
            {(facility || provider) && (
              <Row gap="6">
                {facility && (
                  <Column size={{ sm: 12, md: 6 }}>
                    <Text as="h3" weight="semibold" size="md" class="mb-3">Billing Facility</Text>
                    <div class="text-sm space-y-1">
                      <Text as="p" weight="medium">{facility.name}</Text>
                      <Text as="p" color="muted">{facility.address}</Text>
                      <Text as="p" color="muted">{facility.phone}</Text>
                      {facility.taxId && (
                        <Text as="p" color="muted">Tax ID: {facility.taxId}</Text>
                      )}
                      {facility.npi && (
                        <Text as="p" color="muted">NPI: {facility.npi}</Text>
                      )}
                    </div>
                  </Column>
                )}
                {provider && (
                  <Column size={{ sm: 12, md: 6 }}>
                    <Text as="h3" weight="semibold" size="md" class="mb-3">Provider</Text>
                    <div class="text-sm space-y-1">
                      <Text as="p" weight="medium">{provider.name}</Text>
                      {provider.specialty && (
                        <Text as="p" color="muted">{provider.specialty}</Text>
                      )}
                      {provider.npi && (
                        <Text as="p" color="muted">NPI: {provider.npi}</Text>
                      )}
                    </div>
                  </Column>
                )}
              </Row>
            )}

            {/* Quick Actions */}
            {balance > 0 && allowPayment && (
              <div class="bg-primary-lighter p-4 rounded-lg">
                <Text as="h3" weight="semibold" size="md" class="mb-3">Payment Options</Text>
                <Row wrap gap="3">
                  <Button
                    onClick$={() => showPaymentForm.value = true}
                    intent="primary"
                    size="md"
                    leftIcon
                  >
                    <Icon icon="credit-card" class="mr-2" />
                    Pay Now
                  </Button>
                  <Button
                    onClick$={() => showPaymentPlanForm.value = true}
                    intent="success"
                    size="md"
                    leftIcon
                  >
                    <Icon icon="calendar" class="mr-2" />
                    Payment Plan
                  </Button>
                  <Button
                    onClick$={() => showDisputeForm.value = true}
                    intent="warning"
                    size="md"
                    leftIcon
                  >
                    <Icon icon="alert-triangle" class="mr-2" />
                    Dispute Bill
                  </Button>
                </Row>
              </div>
            )}

            {/* Recent Items Demo */}
            {showDetailedItems && items.length > 0 && (
              <div>
                <Text as="h3" weight="semibold" size="md" class="mb-3">Recent Items</Text>
                <Stack gap="3">
                  {items.slice(0, 3).map((item) => (
                    <Row key={item.id} alignItems="center" justifyContent="between" class="p-3 bg-neutral-lighter rounded-lg">
                      <Row alignItems="center" gap="3">
                        <Row alignItems="center" justifyContent="center" class="w-8 h-8 bg-primary-lighter rounded-full">
                          <i class={`${getCategoryIcon(item.category)} text-primary-dark text-sm`}></i>
                        </Row>
                        <div>
                          <Text as="p" weight="medium">{item.description}</Text>
                          <Text as="p" size="sm" color="muted">
                            {item.code && `${item.code} • `}
                            {formatDate(item.date)}
                          </Text>
                        </div>
                      </Row>
                      <div class="text-right">
                        <Text as="p" weight="medium">{formatCurrency(item.total)}</Text>
                        {item.insuranceCovered && (
                          <Text as="p" size="xs" color="success-dark">Insurance Covered</Text>
                        )}
                      </div>
                    </Row>
                  ))}
                  {items.length > 3 && (
                    <Button
                      onClick$={() => activeTab.value = 'items'}
                      variant="text"
                      intent="primary"
                      size="sm"
                    >
                      View all {items.length} items →
                    </Button>
                  )}
                </Stack>
              </div>
            )}
          </Column>
        )}

        {/* Items Tab */}
        {activeTab.value === 'items' && (
          <Column gap="4">
            <Text as="h3" weight="semibold" size="md">Billing Items</Text>
            <div class="overflow-x-auto">
              <Table variant="striped" size="md" hoverable responsive>
                <TableHeader>
                  <TableRow>
                    <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                      Description
                    </TableCell>
                    <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                      Code
                    </TableCell>
                    <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                      Date
                    </TableCell>
                    <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                      Qty
                    </TableCell>
                    <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                      Unit Price
                    </TableCell>
                    <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                      Total
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell class="px-4 py-4 whitespace-nowrap">
                        <Row alignItems="center">
                          <Row alignItems="center" justifyContent="center" class="w-8 h-8 bg-primary-100 rounded-full mr-3">
                            <i class={`${getCategoryIcon(item.category)} text-primary-dark text-sm`}></i>
                          </Row>
                          <div>
                            <div class="text-sm font-medium text-neutral-darker">{item.description}</div>
                            {item.provider && (
                              <div class="text-sm text-neutral-light">{item.provider}</div>
                            )}
                          </div>
                        </Row>
                      </TableCell>
                      <TableCell class="px-4 py-4 whitespace-nowrap text-sm text-neutral-darker">
                        {item.code || '-'}
                      </TableCell>
                      <TableCell class="px-4 py-4 whitespace-nowrap text-sm text-neutral-darker">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell class="px-4 py-4 whitespace-nowrap text-sm text-neutral-darker">
                        {item.quantity}
                      </TableCell>
                      <TableCell class="px-4 py-4 whitespace-nowrap text-sm text-neutral-darker">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell class="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-darker">
                        {formatCurrency(item.total)}
                        {item.insuranceCovered && (
                          <div class="text-xs text-success-dark">Insurance Covered</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div class="border-t pt-4">
              <Row justifyContent="end">
                <Stack gap="2" class="w-64">
                  <Row justifyContent="between">
                    <span class="text-neutral-normal">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </Row>
                  {discount > 0 && (
                    <Row justifyContent="between" class="text-success-dark">
                      <span>Discount:</span>
                      <span>-{formatCurrency(discount)}</span>
                    </Row>
                  )}
                  {tax > 0 && (
                    <Row justifyContent="between">
                      <span class="text-neutral-normal">Tax:</span>
                      <span>{formatCurrency(tax)}</span>
                    </Row>
                  )}
                  <Row justifyContent="between" class="font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </Row>
                </Stack>
              </Row>
            </div>
          </Column>
        )}

        {/* Insurance Tab */}
        {activeTab.value === 'insurance' && showInsuranceInfo && (
          <Column gap="6">
            <Text as="h3" weight="semibold" size="md">Insurance Information</Text>
            
            {insurance.length > 0 ? (
              <Column gap="4">
                {insurance.map((ins) => (
                  <div key={ins.id} class="border border-neutral-light rounded-lg p-4">
                    <Row alignItems="center" justifyContent="between" class="mb-4">
                      <div>
                        <Text as="h4" weight="semibold" size="sm">{ins.provider}</Text>
                        <Text as="p" size="sm" color="muted">{ins.coverage.type} Insurance</Text>
                      </div>
                      <Row alignItems="center" gap="2">
                        <span class={`px-2 py-1 rounded-full text-xs font-medium ${
                          ins.verified ? 'bg-success-lighter text-success-darker' : 'bg-warning-lighter text-warning-darker'
                        }`}>
                          {ins.verified ? 'Verified' : 'Unverified'}
                        </span>
                        {isEditable && (
                          <Button
                            onClick$={() => onInsuranceUpdate?.(ins)}
                            variant="text"
                            intent="primary"
                            size="xs"
                          >
                            <Icon icon="edit" />
                          </Button>
                        )}
                      </Row>
                    </Row>
                    
                    <Row gap="4" class="text-sm">
                      <Column size={{ sm: 12, md: 4 }}>
                        <Text as="p" color="muted">Policy Number</Text>
                        <Text as="p" weight="medium">{ins.policyNumber}</Text>
                      </Column>
                      <Column size={{ sm: 12, md: 4 }}>
                        <Text as="p" color="muted">Member ID</Text>
                        <Text as="p" weight="medium">{ins.memberId}</Text>
                      </Column>
                      <Column size={{ sm: 12, md: 4 }}>
                        <Text as="p" color="muted">Coverage %</Text>
                        <Text as="p" weight="medium">{ins.coverage.percentage}%</Text>
                      </Column>
                      {ins.copay && (
                        <Column size={{ sm: 12, md: 4 }}>
                          <Text as="p" color="muted">Copay</Text>
                          <Text as="p" weight="medium">{formatCurrency(ins.copay)}</Text>
                        </Column>
                      )}
                      {ins.deductible && (
                        <Column size={{ sm: 12, md: 4 }}>
                          <Text as="p" color="muted">Deductible</Text>
                          <Text as="p" weight="medium">{formatCurrency(ins.deductible)}</Text>
                        </Column>
                      )}
                      {ins.deductibleMet && (
                        <Column size={{ sm: 12, md: 4 }}>
                          <Text as="p" color="muted">Deductible Met</Text>
                          <Text as="p" weight="medium">{formatCurrency(ins.deductibleMet)}</Text>
                        </Column>
                      )}
                    </Row>
                  </div>
                ))}
              </Column>
            ) : (
              <div class="text-center py-8">
                <Icon icon="shield" class="text-neutral-normal text-4xl mb-4" />
                <Text as="p" color="muted">No insurance information available</Text>
              </div>
            )}

            {/* Insurance Claims */}
            {insuranceClaims.length > 0 && (
              <div>
                <Text as="h4" weight="semibold" size="sm" class="mb-3">Insurance Claims</Text>
                <div class="space-y-3">
                  {insuranceClaims.map((claim) => (
                    <div key={claim.id} class="border border-neutral-light rounded-lg p-4">
                      <Row alignItems="center" justifyContent="between" class="mb-2">
                        <div>
                          <Text as="p" weight="medium">
                            Claim #{claim.claimNumber || claim.id}
                          </Text>
                          <Text as="p" size="sm" color="muted">
                            {insurance.find(ins => ins.id === claim.insuranceId)?.provider}
                          </Text>
                        </div>
                        <Badge 
                          variant="flat" 
                          size="sm" 
                          pill 
                          {...getStatusBadgeProps(claim.status)}
                        >
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </Badge>
                      </Row>
                      <Row gap="4" class="text-sm">
                        {claim.submittedDate && (
                          <Column size={{ sm: 12, md: 4 }}>
                            <Text as="p" color="muted">Submitted</Text>
                            <Text as="p" weight="medium">{formatDate(claim.submittedDate)}</Text>
                          </Column>
                        )}
                        {claim.approvedAmount && (
                          <Column size={{ sm: 12, md: 4 }}>
                            <Text as="p" color="muted">Approved</Text>
                            <Text as="p" weight="medium">{formatCurrency(claim.approvedAmount)}</Text>
                          </Column>
                        )}
                        {claim.paidAmount && (
                          <Column size={{ sm: 12, md: 4 }}>
                            <Text as="p" color="muted">Paid</Text>
                            <Text as="p" weight="medium">{formatCurrency(claim.paidAmount)}</Text>
                          </Column>
                        )}
                      </Row>
                      {claim.denialReason && (
                        <Alert color="error" variant="soft" class="mt-2">
                          {claim.denialReason}
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Column>
        )}

        {/* Payments Tab */}
        {activeTab.value === 'payments' && (
          <Column gap="6">
            <Row alignItems="center" justifyContent="between">
              <Text as="h3" weight="semibold" size="md">Payment Methods</Text>
              {allowPayment && balance > 0 && (
                <Button
                  onClick$={() => showPaymentForm.value = true}
                  intent="primary"
                  size="md"
                  leftIcon
                >
                  <Icon icon="plus" class="mr-2" />
                  Make Payment
                </Button>
              )}
            </Row>

            {/* Payment Methods */}
            {paymentMethods.length > 0 && (
              <div>
                <Text as="h4" weight="semibold" size="sm" class="mb-3">Saved Payment Methods</Text>
                <Row gap="4">
                  {paymentMethods.map((method) => (
                    <Column
                      key={method.id}
                      size={{ sm: 12, md: 6 }}
                      class={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPaymentMethod.value?.id === method.id
                          ? 'border-primary-dark bg-primary-lighter'
                          : 'border-neutral-light hover:border-neutral-normal'
                      }`}
                      onClick$={() => selectedPaymentMethod.value = method}
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 bg-neutral-lighter rounded-full flex items-center justify-center">
                            <i class={`fas ${
                              method.type === 'credit_card' || method.type === 'debit_card'
                                ? 'fa-credit-card'
                                : method.type === 'bank_account'
                                ? 'fa-university'
                                : 'fa-wallet'
                            } text-neutral-normal`}></i>
                          </div>
                          <div>
                            <Text as="p" weight="medium">
                              {method.brand || method.type.replace('_', ' ')} 
                              {method.last4 && ` ****${method.last4}`}
                            </Text>
                            <Text as="p" size="sm" color="muted">
                              {method.holderName}
                            </Text>
                          </div>
                        </div>
                        {method.isDefault && (
                          <span class="px-2 py-1 bg-success-lighter text-success-darker text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </Column>
                  ))}
                </Row>
              </div>
            )}
          </Column>
        )}

        {/* History Tab */}
        {activeTab.value === 'history' && showPaymentHistory && (
          <Column gap="6">
            <Text as="h3" weight="semibold" size="md">Payment History</Text>
            
            {payments.length > 0 ? (
              <div class="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} class="border border-neutral-light rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <Text as="p" weight="medium">{formatCurrency(payment.amount)}</Text>
                        <Text as="p" size="sm" color="muted">
                          {payment.method.brand || payment.method.type.replace('_', ' ')}
                          {payment.method.last4 && ` ****${payment.method.last4}`}
                        </Text>
                      </div>
                      <div class="text-right">
                        <Badge 
                          variant="flat" 
                          size="sm" 
                          pill 
                          {...getStatusBadgeProps(payment.status)}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                        <Text as="p" size="sm" color="muted" class="mt-1">
                          {formatDate(payment.date)}
                        </Text>
                      </div>
                    </div>
                    {payment.transactionId && (
                      <Text as="p" size="xs" color="muted">
                        Transaction ID: {payment.transactionId}
                      </Text>
                    )}
                    {payment.notes && (
                      <Text as="p" size="sm" color="muted" class="mt-2">{payment.notes}</Text>
                    )}
                    {payment.refundAmount && (
                      <Text as="p" size="sm" color="destructive" class="mt-2">
                        Refunded: {formatCurrency(payment.refundAmount)} on {formatDate(payment.refundDate!)}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div class="text-center py-8">
                <Icon icon="file-text" class="text-neutral-normal text-4xl mb-4" />
                <Text as="p" color="muted">No payment history available</Text>
              </div>
            )}
          </Column>
        )}
      </div>

      {/* Payment Form Modal */}
      <Modal
        open={showPaymentForm.value}
        title="Make Payment"
        size="md"
        closable={true}
        closeOnBackdrop={true}
        showFooter={true}
        onClose$={() => showPaymentForm.value = false}
      >
        <Column gap="4">
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">
              Payment Amount
            </label>
            <input
              type="number"
              value={paymentAmount.value}
              onInput$={(e) => paymentAmount.value = parseFloat((e.target as HTMLInputElement).value) || 0}
              max={balance}
              step="0.01"
              class="w-full px-3 py-2 border border-neutral-normal rounded-lg focus:ring-2 focus:ring-primary focus:border-primary-dark"
            />
            <Text as="p" size="sm" color="muted" class="mt-1">
              Balance: {formatCurrency(balance)}
            </Text>
          </div>

          {paymentMethods.length > 0 && (
            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Payment Method
              </label>
              <div class="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    class={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPaymentMethod.value?.id === method.id
                        ? 'border-primary-dark bg-primary-lighter'
                        : 'border-neutral-light hover:border-neutral-normal'
                    }`}
                    onClick$={() => selectedPaymentMethod.value = method}
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <i class={`fas ${
                          method.type === 'credit_card' || method.type === 'debit_card'
                            ? 'fa-credit-card'
                            : method.type === 'bank_account'
                            ? 'fa-university'
                            : 'fa-wallet'
                        } text-neutral-normal`}></i>
                        <span class="text-sm">
                          {method.brand || method.type.replace('_', ' ')}
                          {method.last4 && ` ****${method.last4}`}
                        </span>
                      </div>
                      {selectedPaymentMethod.value?.id === method.id && (
                        <Icon icon="check" class="text-primary-dark" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Column>

        <Row slot="footer" justifyContent="end" gap="3">
          <Button
            onClick$={() => showPaymentForm.value = false}
            intent="neutral"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick$={handlePayment}
            disabled={!selectedPaymentMethod.value || paymentAmount.value <= 0}
            intent="primary"
            size="md"
          >
            Pay {formatCurrency(paymentAmount.value)}
          </Button>
        </Row>
      </Modal>

      {/* Dispute Form Modal */}
      <Modal
        open={showDisputeForm.value}
        title="Dispute Bill"
        size="md"
        closable={true}
        closeOnBackdrop={true}
        showFooter={true}
        onClose$={() => showDisputeForm.value = false}
      >
        <div class="space-y-4">
          <Textarea 
            purpose="reason"
            label="Reason for Dispute"
            value={disputeReason.value}
            onChange$={(value) => disputeReason.value = value}
            required
            placeholder="Please describe the reason for your dispute..."
          />
        </div>

        <Row slot="footer" justifyContent="end" gap="3">
          <Button
            onClick$={() => showDisputeForm.value = false}
            intent="neutral"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick$={handleDispute}
            disabled={!disputeReason.value.trim()}
            intent="warning"
            size="md"
          >
            Submit Dispute
          </Button>
        </Row>
      </Modal>

      {/* Email Form Modal */}
      <Modal
        open={showEmailForm.value}
        title="Email Invoice"
        size="md"
        closable={true}
        closeOnBackdrop={true}
        showFooter={true}
        onClose$={() => showEmailForm.value = false}
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={emailAddress.value}
              onInput$={(e) => emailAddress.value = (e.target as HTMLInputElement).value}
              class="w-full px-3 py-2 border border-neutral-normal rounded-lg focus:ring-2 focus:ring-primary focus:border-primary-dark"
              placeholder="Enter email address..."
            />
          </div>
        </div>

        <Row slot="footer" justifyContent="end" gap="3">
          <Button
            onClick$={() => showEmailForm.value = false}
            intent="neutral"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick$={handleEmailInvoice}
            disabled={!emailAddress.value.trim()}
            intent="primary"
            size="md"
          >
            Send Email
          </Button>
        </Row>
      </Modal>

      {/* Payment Plan Form Modal */}
      <Modal
        open={showPaymentPlanForm.value}
        title="Setup Payment Plan"
        size="md"
        closable={true}
        closeOnBackdrop={true}
        showFooter={true}
        onClose$={() => showPaymentPlanForm.value = false}
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">
              Payment Plan Duration
            </label>
            <select
              value={paymentPlanMonths.value}
              onChange$={(e) => paymentPlanMonths.value = parseInt((e.target as HTMLSelectElement).value)}
              class="w-full px-3 py-2 border border-neutral-normal rounded-lg focus:ring-2 focus:ring-primary focus:border-primary-dark"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">
              Down Payment (Optional)
            </label>
            <input
              type="number"
              value={paymentPlanDownPayment.value}
              onInput$={(e) => paymentPlanDownPayment.value = parseFloat((e.target as HTMLInputElement).value) || 0}
              max={balance}
              step="0.01"
              class="w-full px-3 py-2 border border-neutral-normal rounded-lg focus:ring-2 focus:ring-primary focus:border-primary-dark"
            />
          </div>

          <div class="bg-neutral-lighter p-3 rounded-lg">
            <Text as="p" size="sm" color="muted">
              Monthly Payment: {formatCurrency((balance - paymentPlanDownPayment.value) / paymentPlanMonths.value)}
            </Text>
          </div>
        </div>

        <Row slot="footer" justifyContent="end" gap="3">
          <Button
            onClick$={() => showPaymentPlanForm.value = false}
            intent="neutral"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick$={handleSetupPaymentPlan}
            intent="success"
            size="md"
          >
            Setup Plan
          </Button>
        </Row>
      </Modal>
    </Card>
    </div>
  );
});
