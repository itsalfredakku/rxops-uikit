import { component$, useSignal, useStore, $, type QRL } from '@builder.io/qwik';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Button } from '../../../core/atoms/button/button';
import { Textarea } from '../../../core/atoms/textarea/textarea';
import { Text } from '../../../core/atoms/text/text';
import { Input } from '../../../core/atoms/input/input';
import { Card } from '../../../core/organisms/card/card';
import { Badge } from '../../../core/atoms/badge';
import { Icon } from '../../../core/atoms/icon';
// import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { FormField } from '../../../core/molecules/form-field/form-field';
import { Modal } from '../../../core/organisms/modal/modal';
import { Row, Column } from '../../../layouts';
// import { Column } from '../../../layouts/column';
import { Stack } from '../../../layouts/stack';
import { Alert } from '../../../core/atoms/alert/alert';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  refillsRemaining: number;
  totalRefills: number;
  isActive: boolean;
  category: 'prescription' | 'over-counter' | 'supplement' | 'emergency';
  interactions?: string[];
  sideEffects?: string[];
  foodRestrictions?: string[];
}

export interface MedicationDose {
  id: string;
  medicationId: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  takenBy?: 'patient' | 'caregiver' | 'nurse';
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  reminderTime: string;
  isEnabled: boolean;
  reminderType: 'push' | 'sms' | 'email' | 'call';
  advanceNotice: number; // minutes before dose
}

export interface DrugInteraction {
  id: string;
  medication1: string;
  medication2: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  description: string;
  recommendation: string;
}

export interface MedicationTrackerProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  patientId: string;
  medications?: Medication[];
  doses?: MedicationDose[];
  reminders?: MedicationReminder[];
  interactions?: DrugInteraction[];
  userRole?: 'patient' | 'caregiver' | 'provider' | 'pharmacist';
  showAdherence?: boolean;
  showInteractions?: boolean;
  showReminders?: boolean;
  showRefills?: boolean;
  allowEdit?: boolean;
  onAddMedication?: QRL<(medication: Omit<Medication, 'id'>) => void>;
  onEditMedication?: QRL<(medicationId: string, updates: Partial<Medication>) => void>;
  onRemoveMedication?: QRL<(medicationId: string) => void>;
  onMarkDoseTaken?: QRL<(doseId: string, actualTime: string, notes?: string) => void>;
  onMarkDoseMissed?: QRL<(doseId: string, reason?: string) => void>;
  onSetReminder?: QRL<(reminder: Omit<MedicationReminder, 'id'>) => void>;
  onRequestRefill?: QRL<(medicationId: string) => void>;
  onReportSideEffect?: QRL<(medicationId: string, sideEffect: string) => void>;
}

export const MedicationTracker = component$<MedicationTrackerProps>((props) => {
  const {
    medications = [],
    doses = [],
    interactions = [],
    userRole = 'patient',
    showAdherence = true,
    showInteractions = true,
    showRefills = true,
    allowEdit = true,
    onAddMedication,
    onRemoveMedication,
    onMarkDoseTaken,
    onMarkDoseMissed,
    onRequestRefill,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const activeTab = useSignal('current');
  const selectedMedication = useSignal<string | null>(null);
  const showAddForm = useSignal(false);

  const newMedication = useStore({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    prescribedBy: '',
    category: 'prescription' as 'prescription' | 'over-counter' | 'supplement' | 'emergency',
    startDate: new Date().toISOString().split('T')[0]
  });

  // Calculate adherence rate
  const adherenceRate = () => {
    const totalDoses = doses.length;
    const takenDoses = doses.filter(d => d.status === 'taken').length;
    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  // Get today's doses
  const todaysDoses = () => {
    const today = new Date().toISOString().split('T')[0];
    return doses.filter(dose => dose.scheduledTime.startsWith(today));
  };

  // Get upcoming doses (next 24 hours)
  const upcomingDoses = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return doses.filter(dose => {
      const doseTime = new Date(dose.scheduledTime);
      return doseTime >= now && doseTime <= tomorrow && dose.status === 'scheduled';
    }).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  };

  // Get medications needing refill
  const medicationsNeedingRefill = () => {
    return medications.filter(med => med.refillsRemaining <= 1 && med.isActive);
  };

  // Get severe interactions
  const severeInteractions = () => {
    return interactions.filter(int => int.severity === 'severe' || int.severity === 'major');
  };

  const handleAddMedication = $(() => {
    if (onAddMedication && newMedication.name && newMedication.dosage) {
      onAddMedication({
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        instructions: newMedication.instructions,
        prescribedBy: newMedication.prescribedBy,
        prescribedDate: new Date().toISOString(),
        startDate: newMedication.startDate,
        refillsRemaining: 5,
        totalRefills: 5,
        isActive: true,
        category: newMedication.category
      });
      
      // Reset form
      newMedication.name = '';
      newMedication.dosage = '';
      newMedication.frequency = '';
      newMedication.instructions = '';
      newMedication.prescribedBy = '';
      newMedication.category = 'prescription';
      newMedication.startDate = new Date().toISOString().split('T')[0];
      showAddForm.value = false;
    }
  });

  const handleMarkDoseTaken = $((doseId: string) => {
    if (onMarkDoseTaken) {
      const now = new Date().toISOString();
      onMarkDoseTaken(doseId, now);
    }
  });

  const handleMarkDoseMissed = $((doseId: string) => {
    if (onMarkDoseMissed) {
      onMarkDoseMissed(doseId, 'Patient reported missed dose');
    }
  });

  const handleRequestRefill = $((medicationId: string) => {
    if (onRequestRefill) {
      onRequestRefill(medicationId);
    }
  });

  const getMedicationById = (id: string) => {
    return medications.find(med => med.id === id);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prescription': return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'over-counter': return 'bg-success-50 text-success-700 border-green-200';
      case 'supplement': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'emergency': return 'bg-error-50 text-error-700 border-red-200';
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'text-success-600';
      case 'missed': return 'text-error-600';
      case 'skipped': return 'text-warning-600';
      case 'scheduled': return 'text-neutral-600';
      default: return 'text-neutral-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return 'check-circle';
      case 'missed': return 'x-circle';
      case 'skipped': return 'alert-triangle';
      case 'scheduled': return 'clock';
      default: return 'clock';
    }
  };

  const trackerClasses = mergeClasses(
    'medication-tracker bg-white rounded-lg shadow-sm border border-neutral-200',
    qwikClass,
    className
  );

  return (
    <Card 
      class={trackerClasses}
      style={style}
      {...rest}
    >
      {/* Header */}
      <Card.Body class="border-b border-neutral-200">
        <Row alignItems="center" justifyContent="between">
          <Row alignItems="center" gap="3">
            <Row class="w-12 h-12 bg-primary-100 rounded-lg" alignItems="center" justifyContent="center">
              <Icon icon="pill" class="w-6 h-6 text-primary-600" />
            </Row>
            <Column>
              <Text as="h2" weight="semibold" size="lg">Medication Tracker</Text>
              <Text as="p" size="sm" color="muted">
                {medications.filter(m => m.isActive).length} active medications
              </Text>
            </Column>
          </Row>
          
          {allowEdit && userRole !== 'patient' && (
            <Button
              onClick$={() => showAddForm.value = true}
              intent="primary"
              class="transition-colors"
            >
              <Row alignItems="center" gap="2">
                <Icon icon="plus" class="w-4 h-4" />
                <Text>Add Medication</Text>
              </Row>
            </Button>
          )}
        </Row>

        {/* Key Metrics */}
        {showAdherence && (
          <Row  gap="4" class="mt-4">
            <Column size={{ sm: 1, md: 2, lg: 4 }} class="bg-success-50 p-3 rounded-lg border border-green-200">
              <Row alignItems="center" justifyContent="between">
                <Column>
                  <Text as="p" size="sm" weight="medium" color="green-600">Adherence Rate</Text>
                  <Text as="p" size="xl" weight="bold" color="green-700">{adherenceRate()}%</Text>
                </Column>
                <Icon icon="trending-up" class="w-8 h-8 text-success-600" />
              </Row>
            </Column>

            <Column size={{ sm: 1, md: 2, lg: 4 }} class="bg-primary-50 p-3 rounded-lg border border-primary-200">
              <Row alignItems="center" justifyContent="between">
                <Column>
                  <Text as="p" size="sm" weight="medium" color="blue-600">Today's Doses</Text>
                  <Text as="p" size="xl" weight="bold" color="blue-700">{todaysDoses().length}</Text>
                </Column>
                <Icon icon="clock" class="w-8 h-8 text-primary-600" />
              </Row>
            </Column>

            <Column size={{ sm: 1, md: 2, lg: 4 }} class="bg-warning-50 p-3 rounded-lg border border-yellow-200">
              <Row alignItems="center" justifyContent="between">
                <Column>
                  <Text as="p" size="sm" weight="medium" color="yellow-600">Refills Needed</Text>
                  <Text as="p" size="xl" weight="bold" color="yellow-700">{medicationsNeedingRefill().length}</Text>
                </Column>
                <Icon icon="bell" class="w-8 h-8 text-warning-600" />
              </Row>
            </Column>

            <Column size={{ sm: 1, md: 2, lg: 4 }} class="bg-error-50 p-3 rounded-lg border border-red-200">
              <Row alignItems="center" justifyContent="between">
                <Column>
                  <Text as="p" size="sm" weight="medium" color="red-600">Interactions</Text>
                  <Text as="p" size="xl" weight="bold" color="red-700">{severeInteractions().length}</Text>
                </Column>
                <Icon icon="alert-triangle" class="w-8 h-8 text-error-600" />
              </Row>
            </Column>
          </Row>
        )}
      </Card.Body>

      {/* Interaction Alerts */}
      {showInteractions && severeInteractions().length > 0 && (
        <Alert 
          color="error" 
          variant="soft" 
          title="Drug Interaction Alert"
          class="px-6 py-4 border-b border-red-200"
        >
          {severeInteractions().length} severe interactions detected. Please consult your healthcare provider.
          <Card class="mt-2 space-y-1">
            {severeInteractions().slice(0, 2).map((interaction) => (
              <Text as="p" key={interaction.id} size="xs" color="red-600">
                {interaction.medication1} + {interaction.medication2}: {interaction.description}
              </Text>
            ))}
          </Card>
        </Alert>
      )}

      {/* Tabs */}
      <Card.Body class="border-b border-neutral-200">
        <nav>
          <Row gap="8">{[
            { id: 'current', label: 'Current Medications', count: medications.filter(m => m.isActive).length },
            { id: 'schedule', label: 'Today\'s Schedule', count: todaysDoses().length },
            { id: 'history', label: 'History', count: medications.filter(m => !m.isActive).length },
            { id: 'refills', label: 'Refills', count: medicationsNeedingRefill().length }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick$={() => activeTab.value = tab.id}
              variant="text"
              class={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab.value === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge 
                  class={`ml-2 ${
                    activeTab.value === tab.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
          </Row>
        </nav>
      </Card.Body>

      {/* Content */}
      <Card.Body>
        {/* Current Medications Tab */}
        {activeTab.value === 'current' && (
          <Stack gap="4">
            {medications.filter(med => med.isActive).map((medication) => (
              <Card key={medication.id} variant="outlined" class="transition-colors duration-200 hover:bg-neutral-50 transition-colors">
                <Card.Body>
                  <Row alignItems="start" justifyContent="between">
                    <Column class="flex-1">
                      <Row alignItems="center" gap="3" class="mb-2">
                        <Text as="h3" weight="medium" size="md">{medication.name}</Text>
                        <Badge class={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(medication.category)}`}>
                          {medication.category}
                        </Badge>
                      </Row>
                    
                    <Row gap="4" class="text-sm">
                      <Column size={{ sm: 1, md: 2, lg: 3 }}>
                        <Text as="p" color="muted">Dosage:</Text>
                        <Text as="p" weight="medium" color="gray-900">{medication.dosage}</Text>
                      </Column>
                      <Column size={{ sm: 1, md: 2, lg: 3 }}>
                        <Text as="p" color="muted">Frequency:</Text>
                        <Text as="p" weight="medium" color="gray-900">{medication.frequency}</Text>
                      </Column>
                      <Column size={{ sm: 1, md: 2, lg: 3 }}>
                        <Text as="p" color="muted">Prescribed by:</Text>
                        <Text as="p" weight="medium" color="gray-900">{medication.prescribedBy}</Text>
                      </Column>
                      <Column size={{ sm: 1, md: 2, lg: 3 }}>
                        <Text as="p" color="muted">Start Date:</Text>
                        <Text as="p" weight="medium" color="gray-900">{new Date(medication.startDate).toLocaleDateString()}</Text>
                      </Column>
                      <Column size={{ sm: 1, md: 2, lg: 3 }}>
                        <Text as="p" color="muted">Refills Remaining:</Text>
                        <Text as="p" weight="medium" class={medication.refillsRemaining <= 1 ? 'text-error-600' : 'text-neutral-900'}>
                          {medication.refillsRemaining} of {medication.totalRefills}
                        </Text>
                      </Column>
                      {medication.instructions && (
                        <Column size={{ md: 2, lg: 3 }}>
                          <Text as="p" color="muted">Instructions:</Text>
                          <Text as="p" weight="medium" color="gray-900">{medication.instructions}</Text>
                        </Column>
                      )}
                    </Row>
                    </Column>

                    {/* Side Effects & Interactions */}
                    {(medication.sideEffects?.length || medication.interactions?.length) && (
                      <Card class="mt-3 pt-3 border-t border-neutral-200">
                        {medication.sideEffects?.length && (
                          <Column class="mb-2">
                            <Text as="p" size="xs" color="muted" class="mb-1">Common Side Effects:</Text>
                            <Row wrap gap="1">
                              {medication.sideEffects.slice(0, 3).map((effect, index) => (
                                <Badge key={index} class="px-2 py-1 bg-warning-100 text-warning-700 text-xs rounded">
                                  {effect}
                                </Badge>
                              ))}
                            </Row>
                          </Column>
                        )}
                        
                        {medication.interactions?.length && (
                          <Column>
                            <Text as="p" size="xs" color="muted" class="mb-1">Interactions:</Text>
                            <Row wrap gap="1">
                              {medication.interactions.slice(0, 3).map((interaction, index) => (
                                <Badge key={index} class="px-2 py-1 bg-error-100 text-error-700 text-xs rounded">
                                  {interaction}
                                </Badge>
                              ))}
                            </Row>
                          </Column>
                        )}
                      </Card>
                    )}
                  </Row>

                  {/* Actions */}
                  <Stack gap="2" class="ml-4">
                    {showRefills && medication.refillsRemaining <= 1 && (
                      <Button
                        onClick$={() => handleRequestRefill(medication.id)}
                        intent="warning"
                        size="sm"
                        class="text-sm"
                      >
                        Request Refill
                      </Button>
                    )}
                    
                    {allowEdit && userRole !== 'patient' && (
                      <Row gap="2">
                        <Button
                          onClick$={() => selectedMedication.value = medication.id}
                          variant="text"
                          size="sm"
                          class="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200 hover:bg-primary-50 rounded transition-colors"
                        >
                          <Icon icon="edit" class="w-4 h-4" />
                        </Button>
                        <Button
                          onClick$={() => onRemoveMedication?.(medication.id)}
                          variant="text"
                          size="sm"
                          class="p-2 text-neutral-600 hover:text-error-600 transition-colors duration-200 hover:bg-error-50 rounded transition-colors"
                        >
                          <Icon icon="trash" class="w-4 h-4" />
                        </Button>
                      </Row>
                    )}
                  </Stack>
              </Card.Body>
            </Card>
            ))}

            {medications.filter(med => med.isActive).length === 0 && (
              <div class="text-center py-8">
                <Icon icon="pill" class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <Text as="p" color="muted">No active medications</Text>
                {allowEdit && (
                  <Button
                    onClick$={() => showAddForm.value = true}
                    variant="text"
                    class="mt-2 text-primary-600 hover:text-primary-500"
                  >
                    Add your first medication
                  </Button>
                )}
              </div>
            )}
          </Stack>
        )}

        {/* Today's Schedule Tab */}
        {activeTab.value === 'schedule' && (
          <div class="space-y-4">
            {upcomingDoses().length > 0 && (
              <div class="mb-6">
                <Text as="h3" weight="medium" size="md" class="mb-4">Upcoming Doses</Text>
                <div class="space-y-3">
                  {upcomingDoses().slice(0, 5).map((dose) => {
                    const medication = getMedicationById(dose.medicationId);
                    if (!medication) return null;
                    
                    const statusIconName = getStatusIcon(dose.status);
                    
                    return (
                      <div key={dose.id} class="border border-neutral-200 rounded-lg p-4">
                        <Row alignItems="center" justifyContent="between">
                          <Row alignItems="center" gap="4">
                            <div class={`p-2 rounded-full ${dose.status === 'taken' ? 'bg-success-100' : 'bg-neutral-100'}`}>
                              <Icon icon={statusIconName} class={`w-5 h-5 ${getStatusColor(dose.status)}`} />
                            </div>
                            <div>
                              <Text as="h4" weight="medium" size="sm">{medication.name}</Text>
                              <Text as="p" size="sm" color="muted">{medication.dosage}</Text>
                              <Text as="p" size="xs" color="gray-500">
                                {new Date(dose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </div>
                          </Row>
                        
                        {dose.status === 'scheduled' && (
                          <Row gap="2">
                            <Button
                              onClick$={() => handleMarkDoseTaken(dose.id)}
                              intent="success"
                              size="sm"
                            >
                              Mark Taken
                            </Button>
                            <Button
                              onClick$={() => handleMarkDoseMissed(dose.id)}
                              intent="neutral"
                              size="sm"
                            >
                              Mark Missed
                            </Button>
                          </Row>
                        )}
                        </Row>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {todaysDoses().length > 0 && (
              <div>
                <Text as="h3" weight="medium" size="md" class="mb-4">All Today's Doses</Text>
                <div class="space-y-2">
                  {todaysDoses().map((dose) => {
                    const medication = getMedicationById(dose.medicationId);
                    if (!medication) return null;
                    
                    const statusIconName = getStatusIcon(dose.status);
                    
                    return (
                      <div key={dose.id} class="p-3 border border-neutral-200 rounded">
                        <Row alignItems="center" justifyContent="between">
                          <Row alignItems="center" gap="3">
                            <Icon icon={statusIconName} class={`w-4 h-4 ${getStatusColor(dose.status)}`} />
                            <span class="font-medium text-neutral-900">{medication.name}</span>
                            <span class="text-sm text-neutral-600">{medication.dosage}</span>
                            <span class="text-xs text-neutral-500">
                              {new Date(dose.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </Row>
                        
                        <span class={`px-2 py-1 text-xs font-medium rounded ${
                          dose.status === 'taken' ? 'bg-success-100 text-success-700' :
                          dose.status === 'missed' ? 'bg-error-100 text-error-700' :
                          dose.status === 'skipped' ? 'bg-warning-100 text-warning-700' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {dose.status}
                        </span>
                        </Row>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {todaysDoses().length === 0 && (
              <div class="text-center py-8">
                <Icon icon="calendar" class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <Text as="p" color="muted">No doses scheduled for today</Text>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab.value === 'history' && (
          <div class="space-y-4">
            {medications.filter(med => !med.isActive).map((medication) => (
              <div key={medication.id} class="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                <Row alignItems="start" justifyContent="between">
                  <div>
                    <Text as="h3" weight="medium" size="md" color="text-neutral-700">{medication.name}</Text>
                    <Text as="p" size="sm" color="muted">{medication.dosage} - {medication.frequency}</Text>
                    <Text as="p" size="xs" color="gray-500" class="mt-1">
                      {new Date(medication.startDate).toLocaleDateString()} - 
                      {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'Discontinued'}
                    </Text>
                  </div>
                  <span class="px-2 py-1 text-xs font-medium rounded bg-neutral-200 text-neutral-700">
                    Inactive
                  </span>
                </Row>
              </div>
            ))}

            {medications.filter(med => !med.isActive).length === 0 && (
              <div class="text-center py-8">
                <Icon icon="shield" class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <Text as="p" color="muted">No medication history</Text>
              </div>
            )}
          </div>
        )}

        {/* Refills Tab */}
        {activeTab.value === 'refills' && (
          <div class="space-y-4">
            {medicationsNeedingRefill().map((medication) => (
              <div key={medication.id} class="border border-yellow-200 rounded-lg p-4 bg-warning-50">
                <Row alignItems="start" justifyContent="between">
                  <div>
                    <Text as="h3" weight="medium" size="md">{medication.name}</Text>
                    <Text as="p" size="sm" color="muted">{medication.dosage}</Text>
                    <Text as="p" size="sm" color="yellow-700" weight="medium" class="mt-1">
                      {medication.refillsRemaining} refill{medication.refillsRemaining !== 1 ? 's' : ''} remaining
                    </Text>
                    <Text as="p" size="xs" color="gray-500">
                      Prescribed by {medication.prescribedBy}
                    </Text>
                  </div>
                  <Button
                    onClick$={() => handleRequestRefill(medication.id)}
                    intent="warning"
                    size="sm"
                  >
                    Request Refill
                  </Button>
                </Row>
              </div>
            ))}

            {medicationsNeedingRefill().length === 0 && (
              <div class="text-center py-8">
                <Icon icon="heart" class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <Text as="p" color="muted">All medications have sufficient refills</Text>
              </div>
            )}
          </div>
        )}
      </Card.Body>

      {/* Add Medication Modal */}
      <Modal
        open={showAddForm.value}
        title="Add New Medication"
        size="md"
        closable={true}
        closeOnBackdrop={true}
        showFooter={true}
        onClose$={() => showAddForm.value = false}
      >
        <div class="space-y-4">
          <div>
            <FormField 
              label="Medication Name"
              hint="Enter the complete medication name"
            >
              <Input
                type="text"
                value={newMedication.name}
                placeholder="e.g., Metformin"
                size="sm"
                onInput$={(e) => newMedication.name = (e.target as HTMLInputElement).value}
              />
            </FormField>
          </div>
          
          <div>
            <FormField 
              label="Dosage"
              hint="Specify the dosage amount and units"
            >
              <Input
                type="text"
                value={newMedication.dosage}
                placeholder="e.g., 500mg"
                size="sm"
                onInput$={(e) => newMedication.dosage = (e.target as HTMLInputElement).value}
              />
            </FormField>
          </div>
          
          <div>
            <FormField 
              label="Frequency"
              hint="How often the medication should be taken"
            >
              <Input
                type="text"
                value={newMedication.frequency}
                placeholder="e.g., Twice daily"
                size="sm"
                onInput$={(e) => newMedication.frequency = (e.target as HTMLInputElement).value}
              />
            </FormField>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <select
              value={newMedication.category}
              onChange$={(e) => newMedication.category = (e.target as HTMLSelectElement).value as 'prescription' | 'over-counter' | 'supplement' | 'emergency'}
              class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="prescription">Prescription</option>
              <option value="over-counter">Over-the-Counter</option>
              <option value="supplement">Supplement</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          
          <div>
            <FormField 
              label="Prescribed By"
              hint="Healthcare provider who prescribed this medication"
            >
              <Input
                type="text"
                value={newMedication.prescribedBy}
                placeholder="Dr. Smith"
                size="sm"
                onInput$={(e) => newMedication.prescribedBy = (e.target as HTMLInputElement).value}
              />
            </FormField>
          </div>
          
          <Textarea
            purpose="medication"
            label="Instructions"
            value={newMedication.instructions}
            onChange$={(value) => newMedication.instructions = value}
            placeholder="Take with food..."
          />
        </div>

        <Row slot="footer" justifyContent="end" gap="3">
          <Button
            onClick$={() => showAddForm.value = false}
            intent="neutral"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick$={handleAddMedication}
            intent="primary"
            size="md"
          >
            Add Medication
          </Button>
        </Row>
      </Modal>
    </Card>
  );
});
