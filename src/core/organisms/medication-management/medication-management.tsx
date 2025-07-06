import { component$, useSignal, useTask$, $, type QRL } from "@builder.io/qwik";
import { mergeClasses } from "../../../design-system/props";
import type { Color } from "../../../design-system/types";
import { Stack } from "../../../layouts/stack";
import { Row } from "../../../layouts/row";
import { Button } from "../../atoms/button/button";
import { Text } from "../../atoms/text/text";
import { Icon, type IconName } from "../../atoms/icon";
import { Badge } from "../../atoms/badge";
import { Tag } from "../../atoms/tag";
import { ProgressBar } from "../../atoms/progress-bar";
import { hipaaAuditor } from "../../../utils/hipaa";

// Medication frequency types
export type MedicationFrequency = 
  | 'once-daily'
  | 'twice-daily'
  | 'three-times-daily'
  | 'four-times-daily'
  | 'as-needed'
  | 'weekly'
  | 'monthly'
  | 'custom';

// Medication form types
export type MedicationForm = 
  | 'tablet'
  | 'capsule'
  | 'liquid'
  | 'injection'
  | 'topical'
  | 'inhaler'
  | 'patch'
  | 'drops';

// Medication status
export type MedicationStatus = 
  | 'active'
  | 'paused'
  | 'discontinued'
  | 'completed';

// Medication data structure
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: MedicationForm;
  frequency: MedicationFrequency;
  customFrequency?: string;
  instructions: string;
  status: MedicationStatus;
  prescribedBy: {
    name: string;
    npi?: string;
    specialty?: string;
  };
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  refillsRemaining?: number;
  totalRefills?: number;
  sideEffects?: string[];
  interactions?: string[];
  allergies?: string[];
  adherence?: {
    percentage: number;
    lastTaken?: string;
    missedDoses: number;
    totalDoses: number;
  };
  pharmacy?: {
    name: string;
    phone: string;
    address: string;
  };
  notes?: string;
  criticalWarnings?: string[];
}

// Component props
export interface MedicationManagementProps {
  /** List of medications */
  medications: Medication[];
  /** Current patient information */
  patient?: {
    id: string;
    name: string;
    allergies?: string[];
    conditions?: string[];
  };
  /** Whether the component is in read-only mode */
  readOnly?: boolean;
  /** Show adherence tracking */
  showAdherence?: boolean;
  /** Show interaction warnings */
  showInteractions?: boolean;
  /** Compact view for smaller spaces */
  compact?: boolean;
  /** CSS class names to apply */
  class?: string;
  /** Callback when medication is updated */
  onMedicationUpdate$?: QRL<(medication: Medication) => void>;
  /** Callback when medication is discontinued */
  onDiscontinue$?: QRL<(medicationId: string, reason: string) => void>;
  /** Callback when adherence is logged */
  onAdherenceLog$?: QRL<(medicationId: string, taken: boolean, timestamp: string) => void>;
  /** HIPAA audit settings */
  hipaaAudit?: {
    enabled: boolean;
    patientId: string;
    providerId?: string;
  };
}

export const MedicationManagement = component$<MedicationManagementProps>((props) => {
  const selectedMedication = useSignal<Medication | null>(null);
  const adherenceView = useSignal(false);
  const interactionWarnings = useSignal<string[]>([]);
  
  // Calculate medication interactions
  useTask$(({ track }) => {
    track(() => props.medications);
    
    if (props.showInteractions) {
      const warnings: string[] = [];
      
      // Simple interaction detection (in production, use clinical database)
      props.medications.forEach((med, index) => {
        props.medications.slice(index + 1).forEach((otherMed) => {
          if (med.interactions?.includes(otherMed.name) || 
              otherMed.interactions?.includes(med.name)) {
            warnings.push(`Potential interaction: ${med.name} + ${otherMed.name}`);
          }
        });
      });
      
      interactionWarnings.value = warnings;
    }
  });

  const logMedicationAccess = $((action: string, medicationId: string) => {
    if (props.hipaaAudit?.enabled) {
      hipaaAuditor.logAccess({
        action,
        component: 'medication-management',
        itemId: medicationId,
        category: 'medication',
        patientId: props.hipaaAudit.patientId,
        timestamp: new Date().toISOString()
      });
    }
  });

  const takeMedication = $((medication: Medication) => {
    logMedicationAccess('medication-taken', medication.id);
    
    if (props.onAdherenceLog$) {
      props.onAdherenceLog$(medication.id, true, new Date().toISOString());
    }
  });

  const skipMedication = $((medication: Medication, _reason: string) => {
    logMedicationAccess('medication-skipped', medication.id);
    
    if (props.onAdherenceLog$) {
      props.onAdherenceLog$(medication.id, false, new Date().toISOString());
    }
  });

  const getStatusColor = (status: MedicationStatus): Color => {
    const colors: Record<MedicationStatus, Color> = {
      active: 'success',
      paused: 'warning', 
      discontinued: 'error',
      completed: 'info'
    };
    return colors[status];
  };

  const getFormIcon = (form: MedicationForm): IconName => {
    const icons: Record<MedicationForm, IconName> = {
      tablet: 'pill',
      capsule: 'pill',
      liquid: 'activity', // Using activity as placeholder for droplets
      injection: 'plus', // Using plus as placeholder for syringe
      topical: 'pen-tool', // Using pen-tool as placeholder for tube
      inhaler: 'activity', // Using activity as placeholder for inhaler
      patch: 'copy', // Using copy as placeholder for patch
      drops: 'activity' // Using activity as placeholder for eye-dropper
    };
    return icons[form] || 'pill';
  };

  const formatFrequency = (frequency: MedicationFrequency, custom?: string): string => {
    const frequencies = {
      'once-daily': 'Once daily',
      'twice-daily': 'Twice daily',
      'three-times-daily': '3 times daily',
      'four-times-daily': '4 times daily',
      'as-needed': 'As needed',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'custom': custom || 'Custom schedule'
    };
    return frequencies[frequency];
  };

  return (
    <div class="themed-content">
      <div
      class={mergeClasses(
        "medication-management",
        props.compact ? "space-y-2" : "space-y-4",
        props.class
      )}
      data-healthcare-element="medication-management"
    >
      {/* Header */}
      <Row gap="3" justifyContent="between" alignItems="center">
        <div>
          <Text size="lg" weight="bold">Medications</Text>
          {props.patient && (
            <Text size="sm" color="secondary">
              Patient: {props.patient.name}
            </Text>
          )}
        </div>
        
        {props.showAdherence && (
          <Button
            variant={adherenceView.value ? 'elevated' : 'outlined'}
            size="sm"
            onClick$={() => {
              adherenceView.value = !adherenceView.value;
              logMedicationAccess('adherence-view-toggle', 'all');
            }}
          >
            <Icon icon="activity" size={16} />
            Adherence View
          </Button>
        )}
      </Row>

      {/* Interaction Warnings */}
      {interactionWarnings.value.length > 0 && (
        <div class="p-4 bg-error-50 border border-error-light rounded-lg">
          <Row gap="2" alignItems="start">
            <Icon icon="alert-triangle" size={20} class="text-error-600 mt-0.5" />
            <Stack gap="1">
              <Text weight="medium" class="text-error-800">
                Drug Interaction Warnings
              </Text>
              {interactionWarnings.value.map((warning, index) => (
                <Text key={index} size="sm" class="text-error-700">
                  • {warning}
                </Text>
              ))}
            </Stack>
          </Row>
        </div>
      )}

      {/* Medications List */}
      <Stack gap={props.compact ? "2" : "3"}>
        {props.medications.map((medication) => (
          <div
            key={medication.id}
            class={mergeClasses(
              "medication-card p-4 border rounded-lg transition-all",
              selectedMedication.value?.id === medication.id
                ? "border-primary-300 bg-primary-50"
                : "border-neutral-light hover:border-neutral-light hover:bg-neutral-lighter",
              medication.status === 'discontinued' ? "opacity-60" : "",
              medication.criticalWarnings?.length ? "border-error-light bg-error-50" : ""
            )}
            onClick$={() => {
              selectedMedication.value = medication;
              logMedicationAccess('medication-select', medication.id);
            }}
          >
            {/* Critical Warnings */}
            {medication.criticalWarnings?.length && (
              <div class="mb-3 p-2 bg-error-100 border border-error-light rounded">
                <Row gap="2" alignItems="start">
                  <Icon icon="alert-triangle" size={16} class="text-error-600" />
                  <Stack gap="1">
                    {medication.criticalWarnings.map((warning, index) => (
                      <Text key={index} size="sm" weight="medium" class="text-error-800">
                        {warning}
                      </Text>
                    ))}
                  </Stack>
                </Row>
              </div>
            )}

            <Row gap="3" alignItems="start">
              {/* Medication Icon */}
              <div class="flex-shrink-0 p-2 bg-neutral-lighter rounded-lg">
                <Icon icon={getFormIcon(medication.form)} size={24} />
              </div>

              {/* Main Info */}
              <Stack gap="2" class="flex-1 min-w-0">
                {/* Name and Status */}
                <Row gap="2" alignItems="center" wrap>
                  <Text weight="bold" class="truncate">
                    {medication.name}
                  </Text>
                  {medication.genericName && (
                    <Text size="sm" color="secondary" class="truncate">
                      ({medication.genericName})
                    </Text>
                  )}
                  <Badge 
                    color={getStatusColor(medication.status)}
                    size="sm"
                  >
                    {medication.status}
                  </Badge>
                </Row>

                {/* Dosage and Frequency */}
                <Row gap="4" wrap>
                  <div>
                    <Text size="sm" color="secondary">Dosage</Text>
                    <Text size="sm" weight="medium">{medication.dosage}</Text>
                  </div>
                  <div>
                    <Text size="sm" color="secondary">Frequency</Text>
                    <Text size="sm" weight="medium">
                      {formatFrequency(medication.frequency, medication.customFrequency)}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" color="secondary">Form</Text>
                    <Text size="sm" weight="medium" class="capitalize">{medication.form}</Text>
                  </div>
                </Row>

                {/* Instructions */}
                <div>
                  <Text size="sm" color="secondary">Instructions</Text>
                  <Text size="sm">{medication.instructions}</Text>
                </div>

                {/* Adherence Progress */}
                {props.showAdherence && medication.adherence && (
                  <div>
                    <Row gap="2" alignItems="center" justifyContent="between">
                      <Text size="sm" color="secondary">Adherence</Text>
                      <Text size="sm" weight="medium">
                        {medication.adherence.percentage}%
                      </Text>
                    </Row>
                    <ProgressBar
                      value={medication.adherence.percentage}
                      size="sm"
                      color={medication.adherence.percentage >= 80 ? 'success' : 
                             medication.adherence.percentage >= 60 ? 'warning' : 'error'}
                      variant="medical"
                      healthcareContext={{
                        type: 'medication-compliance',
                        patientId: props.patient?.id,
                        critical: medication.adherence.percentage < 60,
                      }}
                    />
                  </div>
                )}

                {/* Allergies and Side Effects */}
                {(medication.allergies?.length || medication.sideEffects?.length) && (
                  <Row gap="3" wrap>
                    {medication.allergies?.length && (
                      <div>
                        <Text size="sm" color="secondary">Allergies</Text>
                        <Row gap="1" wrap>
                          {medication.allergies.map((allergy) => (
                            <Tag
                              key={allergy}
                              label={allergy}
                              color="error"
                              size="xs"
                              variant="soft"
                              healthcare={{
                                type: 'allergy',
                                severity: 'high',
                                patientId: props.patient?.id,
                              }}
                            />
                          ))}
                        </Row>
                      </div>
                    )}
                    
                    {medication.sideEffects?.length && (
                      <div>
                        <Text size="sm" color="secondary">Side Effects</Text>
                        <Row gap="1" wrap>
                          {medication.sideEffects.slice(0, 3).map((effect) => (
                            <Tag
                              key={effect}
                              label={effect}
                              color="warning"
                              size="xs"
                              variant="soft"
                            />
                          ))}
                          {medication.sideEffects.length > 3 && (
                            <Tag
                              label={`+${medication.sideEffects.length - 3} more`}
                              color="neutral"
                              size="xs"
                              variant="outlined"
                            />
                          )}
                        </Row>
                      </div>
                    )}
                  </Row>
                )}
              </Stack>

              {/* Actions */}
              {!props.readOnly && medication.status === 'active' && (
                <Stack gap="2" class="flex-shrink-0">
                  <Button
                    size="sm"
                    color="success"
                    onClick$={(e) => {
                      e.stopPropagation();
                      takeMedication(medication);
                    }}
                  >
                    <Icon icon="check" size={14} />
                    Take
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="secondary"
                    onClick$={(e) => {
                      e.stopPropagation();
                      skipMedication(medication, 'user-skipped');
                    }}
                  >
                    <Icon icon="x" size={14} />
                    Skip
                  </Button>
                </Stack>
              )}
            </Row>

            {/* Prescription Details */}
            {!props.compact && (
              <Row gap="4" class="mt-3 pt-3 border-t border-neutral-light" wrap>
                <div>
                  <Text size="xs" color="secondary">Prescribed by</Text>
                  <Text size="xs">{medication.prescribedBy.name}</Text>
                </div>
                <div>
                  <Text size="xs" color="secondary">Start Date</Text>
                  <Text size="xs">{new Date(medication.startDate).toLocaleDateString()}</Text>
                </div>
                {medication.refillsRemaining !== undefined && (
                  <div>
                    <Text size="xs" color="secondary">Refills</Text>
                    <Text size="xs">
                      {medication.refillsRemaining} of {medication.totalRefills} remaining
                    </Text>
                  </div>
                )}
                {medication.pharmacy && (
                  <div>
                    <Text size="xs" color="secondary">Pharmacy</Text>
                    <Text size="xs">{medication.pharmacy.name}</Text>
                  </div>
                )}
              </Row>
            )}
          </div>
        ))}
      </Stack>

      {/* Empty State */}
      {props.medications.length === 0 && (
        <div class="text-center py-8">
          <Icon icon="pill" size={48} class="text-neutral-light mb-4" />
          <Text color="secondary">No medications found</Text>
          <Text size="sm" color="secondary">
            Medications will appear here when prescribed
          </Text>
        </div>
      )}
    </div>
    </div>
  );
});

export default MedicationManagement;
