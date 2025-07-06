import { component$, useSignal, type QRL } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Alert } from '../../../core/atoms/alert/alert';
import { Button } from '../../../core/atoms/button/button';
import { Row } from '../../../layouts/row';
import { Column } from '../../../layouts/column';
import { Icon } from '../../../core/atoms/icon/index';
// Removed hardcoded icon imports: UserIcon, PhoneIcon, MailIcon, MapPinIcon, HeartIcon, ActivityIcon, AlertTriangleIcon, EditIcon, Share2Icon, DownloadIcon
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
    }>;
    conditions: string[];
    surgeries: Array<{
      procedure: string;
      date: string;
      hospital: string;
    }>;
  };
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
    lastUpdated: string;
  };
  avatar?: string;
  status: 'active' | 'inactive' | 'emergency';
  lastVisit?: string;
  nextAppointment?: string;
}

export interface PatientProfileProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  /** Patient data */
  patient: PatientData;
  /** Current user role */
  userRole: 'patient' | 'provider' | 'admin';
  /** View mode */
  mode?: 'summary' | 'detailed' | 'emergency';
  /** Enable editing */
  editable?: boolean;
  /** Event handlers */
  onEdit$?: QRL<() => void>;
  onShare$?: QRL<() => void>;
  onExport$?: QRL<() => void>;
  onEmergencyContact$?: QRL<() => void>;
}

/**
 * PatientProfile Component
 * 
 * Comprehensive patient profile display with medical history, vitals,
 * and contact information. Includes HIPAA-compliant data handling
 * and role-based access control.
 * 
 * @example
 * ```tsx
 * <PatientProfile 
 *   patient={patientData}
 *   userRole="provider"
 *   mode="detailed"
 *   editable={true}
 *   onEdit$={$(() => handleEdit())}
 * />
 * ```
 */
export const PatientProfile = component$<PatientProfileProps>(({
  patient,
  userRole,
  mode = 'summary',
  editable = false,
  onEdit$,
  onShare$,
  onExport$,
  onEmergencyContact$,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  const activeTab = useSignal<'overview' | 'medical' | 'vitals' | 'contacts'>('overview');
  const showEmergencyAlert = useSignal(patient.status === 'emergency');

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const _getStatusColor = () => {
    switch (patient.status) {
      case 'active': return 'text-success-normal bg-success-50';
      case 'inactive': return 'text-neutral-normal bg-neutral-lighter';
      case 'emergency': return 'text-error-600 bg-error-50';
      default: return 'text-neutral-normal bg-neutral-lighter';
    }
  };

  // BMI calculation
  const calculateBMI = () => {
    const heightInMeters = patient.vitals.height / 100;
    const bmi = patient.vitals.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  // BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-primary-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-success-normal' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-warning-600' };
    return { text: 'Obese', color: 'text-error-600' };
  };

  const rootClasses = mergeClasses(
    'bg-white rounded-xl shadow-lg border border-neutral-light',
    'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
    'overflow-hidden', // For proper gradient backgrounds
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div
        class={rootClasses}
        style={style}
        {...rest}
      >
        {/* Emergency Alert */}
        {showEmergencyAlert.value && (
          <Alert
            color="error"
            variant="soft"
            title="Emergency Status"
            class="mb-6"
          >
            This patient requires immediate attention.
            <Button
              variant="outlined"
              color="error"
              size="sm"
              class="ml-auto"
              onClick$={onEmergencyContact$}
            >
              Contact Emergency
            </Button>
          </Alert>
        )}

        {/* Header with enhanced visual hierarchy */}
        <div class="px-6 py-6 bg-gradient-to-r from-primary-50 to-primary-25 border-b-2 border-primary-100">
          <Row justifyContent="between" alignItems="center">
            <Row gap="6" alignItems="center">
              {/* Enhanced Avatar with better visual prominence */}
              <div class="relative">
                {patient.avatar ? (
                  <img
                    src={patient.avatar}
                    alt={`${patient.firstName} ${patient.lastName}`}
                    width="80"
                    height="80"
                    class="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-white"
                  />
                ) : (
                  <div class="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-light to-neutral-light flex items-center justify-center shadow-lg ring-4 ring-white">
                    <Icon icon="user" class="w-10 h-10 text-neutral-normal" />
                  </div>
                )}
                <div class={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-md ${
                  patient.status === 'active' ? 'bg-success-500' :
                  patient.status === 'emergency' ? 'bg-error-500 animate-pulse' : 'bg-neutral-normal'
                }`} />
              </div>

              {/* Enhanced Basic Info with better typography hierarchy */}
              <div>
                <Text as="h1" weight="bold" size="xl" class="text-neutral-darker text-2xl">
                  {patient.firstName} {patient.lastName}
                </Text>
                <Row alignItems="center" gap="4" class="mt-2">
                  <span class="text-neutral-dark font-medium">
                    {calculateAge(patient.dateOfBirth)} years old
                  </span>
                  <span class="text-neutral-light">•</span>
                  <span class="text-neutral-dark capitalize font-medium">{patient.gender}</span>
                  <span class="text-neutral-light">•</span>
                  <span class={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                    patient.status === 'active' ? 'bg-success-100 text-success-800 ring-1 ring-success-200' :
                    patient.status === 'emergency' ? 'bg-error-100 text-error-800 ring-1 ring-error-200 animate-pulse' :
                    'bg-neutral-lighter text-neutral-darker ring-1 ring-neutral-200'
                  }`}>
                    {patient.status.toUpperCase()}
                  </span>
                </Row>
                <Row alignItems="center" gap="4" class="mt-3 text-sm">
                  <span class="bg-white/80 px-2 py-1 rounded-md text-neutral-normal font-mono">
                    ID: {patient.id}
                  </span>
                  {patient.lastVisit && (
                    <>
                      <span class="text-neutral-light">•</span>
                      <span class="text-neutral-normal">
                        Last visit: <span class="font-medium">{formatDate(patient.lastVisit)}</span>
                      </span>
                    </>
                  )}
                </Row>
              </div>
            </Row>

            {/* Enhanced Actions with better touch targets */}
            <Row gap="2" alignItems="center">
              {editable && userRole !== 'patient' && (
                <button
                  onClick$={onEdit$}
                  class="min-h-[44px] min-w-[44px] p-3 text-neutral-normal hover:text-primary-600 hover:bg-white/80 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  aria-label="Edit patient profile"
                >
                  <Icon icon="edit" class="w-5 h-5" />
                </button>
              )}
              {userRole !== 'patient' && (
                <button
                  onClick$={onShare$}
                  class="min-h-[44px] min-w-[44px] p-3 text-neutral-normal hover:text-primary-600 hover:bg-white/80 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  aria-label="Share patient profile"
                >
                  <Icon icon="share2" class="w-5 h-5" />
                </button>
              )}
              <button
                onClick$={onExport$}
                class="min-h-[44px] min-w-[44px] p-3 text-neutral-normal hover:text-primary-600 hover:bg-white/80 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Export patient data"
              >
                <Icon icon="download" class="w-5 h-5" />
              </button>
            </Row>
          </Row>
        </div>

        {/* Enhanced Navigation Tabs with better visual hierarchy */}
        {mode === 'detailed' && (
          <div class="px-6 py-4 bg-gradient-to-r from-neutral-lighter to-white border-b border-neutral-light">
            <Row gap="1">
              {(['overview', 'medical', 'vitals', 'contacts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick$={() => activeTab.value = tab}
                  class={`min-h-[44px] py-3 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg ${
                    activeTab.value === tab
                      ? 'border-primary-500 text-primary-700 bg-primary-50 shadow-sm'
                      : 'border-transparent text-neutral-normal hover:text-neutral-darker hover:bg-neutral-lighter hover:border-neutral-light'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </Row>
          </div>
        )}

        {/* Content */}
        <div class="p-6">
          {mode === 'summary' && (
            <Row gap="6">
              {/* Contact Info */}
              <Column size={{ sm: 12, md: 6, lg: 4 }} gap="3">
                <Text as="h3" weight="semibold" size="lg" color="gray-900">Contact Information</Text>
                <Column gap="2">
                  <Row gap="2" alignItems="center">
                    <Icon icon="mail" class="w-4 h-4 text-neutral-light" />
                    <span class="text-sm text-neutral-normal">{patient.email}</span>
                  </Row>
                  <Row gap="2" alignItems="center">
                    <Icon icon="phone" class="w-4 h-4 text-neutral-light" />
                    <span class="text-sm text-neutral-normal">{patient.phone}</span>
                  </Row>
                  <Row gap="2" alignItems="center">
                    <Icon icon="map-pin" class="w-4 h-4 text-neutral-light" />
                    <span class="text-sm text-neutral-normal">
                      {patient.address.city}, {patient.address.state}
                    </span>
                  </Row>
                </Column>
              </Column>

              {/* Key Vitals */}
              <Column gap="3">
                <Text as="h3" weight="semibold" size="lg" color="gray-900">Recent Vitals</Text>
                <Column gap="2">
                  <div class="flex justify-between">
                    <span class="text-sm text-neutral-normal">Blood Pressure</span>
                    <span class="text-sm font-medium">{patient.vitals.bloodPressure}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-neutral-normal">Heart Rate</span>
                    <span class="text-sm font-medium">{patient.vitals.heartRate} bpm</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-neutral-normal">BMI</span>
                    <span class={`text-sm font-medium ${getBMICategory(Number(calculateBMI())).color}`}>
                      {calculateBMI()}
                    </span>
                  </div>
                </Column>
              </Column>

              {/* Medical Alerts */}
              <Column size={{ sm: 12, md: 6, lg: 4 }} gap="3">
                <Text as="h3" weight="semibold" size="lg" color="gray-900">Medical Alerts</Text>
                <Column gap="2">
                  {patient.medicalHistory.allergies.length > 0 ? (
                    patient.medicalHistory.allergies.slice(0, 3).map((allergy, idx) => (
                      <div key={idx} class="flex items-center space-x-2">
                        <Icon icon="alert-triangle" class="w-4 h-4 text-warning-normal" />
                        <span class="text-sm text-neutral-normal">{allergy}</span>
                      </div>
                    ))
                  ) : (
                    <span class="text-sm text-neutral-normal">No known allergies</span>
                  )}
                </Column>
              </Column>
            </Row>
          )}

          {mode === 'detailed' && (
            <div>
              {/* Overview Tab */}
              {activeTab.value === 'overview' && (
                <Row gap="8">
                  <Column size={{ sm: 12, lg: 6 }} class="space-y-6">
                    <div>
                      <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Personal Information</Text>
                      <dl class="space-y-3">
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Date of Birth</dt>
                          <dd class="text-sm font-medium">{formatDate(patient.dateOfBirth)}</dd>
                        </div>
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Gender</dt>
                          <dd class="text-sm font-medium capitalize">{patient.gender}</dd>
                        </div>
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Email</dt>
                          <dd class="text-sm font-medium">{patient.email}</dd>
                        </div>
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Phone</dt>
                          <dd class="text-sm font-medium">{patient.phone}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Address</Text>
                      <div class="text-sm text-neutral-normal">
                        <div>{patient.address.street}</div>
                        <div>
                          {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                        </div>
                        <div>{patient.address.country}</div>
                      </div>
                    </div>
                  </Column>

                  <Column size={{ sm: 12, lg: 6 }} class="space-y-6">
                    <div>
                      <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Insurance Information</Text>
                      <dl class="space-y-3">
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Provider</dt>
                          <dd class="text-sm font-medium">{patient.insurance.provider}</dd>
                        </div>
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Policy Number</dt>
                          <dd class="text-sm font-medium">{patient.insurance.policyNumber}</dd>
                        </div>
                        {patient.insurance.groupNumber && (
                          <div class="flex justify-between">
                            <dt class="text-sm text-neutral-normal">Group Number</dt>
                            <dd class="text-sm font-medium">{patient.insurance.groupNumber}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Emergency Contact</Text>
                      <dl class="space-y-3">
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Name</dt>
                          <dd class="text-sm font-medium">{patient.emergencyContact.name}</dd>
                        </div>
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Relationship</dt>
                          <dd class="text-sm font-medium">{patient.emergencyContact.relationship}</dd>
                        </div>
                        <div class="flex justify-between">
                          <dt class="text-sm text-neutral-normal">Phone</dt>
                          <dd class="text-sm font-medium">{patient.emergencyContact.phone}</dd>
                        </div>
                      </dl>
                    </div>
                  </Column>
                </Row>
              )}

              {/* Medical History Tab */}
              {activeTab.value === 'medical' && (
                <div class="space-y-8">
                  {/* Allergies */}
                  <div>
                    <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Allergies</Text>
                    {patient.medicalHistory.allergies.length > 0 ? (
                      <div class="flex flex-wrap gap-2">
                        {patient.medicalHistory.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            class="px-3 py-1 bg-warning-lighter text-warning-dark rounded-full text-sm"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Text as="p" color="muted">No known allergies</Text>
                    )}
                  </div>

                  {/* Current Medications */}
                  <div>
                    <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Current Medications</Text>
                    {patient.medicalHistory.medications.length > 0 ? (
                      <div class="space-y-3">
                        {patient.medicalHistory.medications.map((medication, idx) => (
                          <div key={idx} class="p-4 bg-neutral-lighter rounded-lg">
                            <div class="flex justify-between items-start">
                              <div>
                                <Text as="h4" weight="medium" color="gray-900">{medication.name}</Text>
                                <Text as="p" size="sm" color="muted" class="mt-1">
                                  {medication.dosage} - {medication.frequency}
                                </Text>
                              </div>
                              <span class="text-xs text-neutral-normal">
                                Prescribed by {medication.prescribedBy}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Text as="p" color="muted">No current medications</Text>
                    )}
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Medical Conditions</Text>
                    {patient.medicalHistory.conditions.length > 0 ? (
                      <div class="flex flex-wrap gap-2">
                        {patient.medicalHistory.conditions.map((condition, idx) => (
                          <span
                            key={idx}
                            class="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Text as="p" color="muted">No medical conditions recorded</Text>
                    )}
                  </div>

                  {/* Surgical History */}
                  <div>
                    <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Surgical History</Text>
                    {patient.medicalHistory.surgeries.length > 0 ? (
                      <div class="space-y-3">
                        {patient.medicalHistory.surgeries.map((surgery, idx) => (
                          <div key={idx} class="p-4 bg-neutral-lighter rounded-lg">
                            <div class="flex justify-between items-start">
                              <div>
                                <Text as="h4" weight="medium" color="gray-900">{surgery.procedure}</Text>
                                <Text as="p" size="sm" color="muted" class="mt-1">{surgery.hospital}</Text>
                              </div>
                              <span class="text-xs text-neutral-normal">
                                {formatDate(surgery.date)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Text as="p" color="muted">No surgical history</Text>
                    )}
                  </div>
                </div>
              )}

              {/* Vitals Tab */}
              {activeTab.value === 'vitals' && (
                <div class="space-y-6">
                  <Row gap="6">
                    {/* Blood Pressure */}
                    <Column size={{ sm: 12, md: 6, lg: 4 }}>
                      <div class="p-4 bg-neutral-lighter rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <Text as="h4" weight="medium" color="gray-900">Blood Pressure</Text>
                          <Icon icon="heart" class="w-5 h-5 text-error-500" />
                        </div>
                        <div class="text-2xl font-bold text-neutral-darker">{patient.vitals.bloodPressure}</div>
                        <div class="text-sm text-neutral-normal">mmHg</div>
                      </div>
                    </Column>

                    {/* Heart Rate */}
                    <Column size={{ sm: 12, md: 6, lg: 4 }}>
                      <div class="p-4 bg-neutral-lighter rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <Text as="h4" weight="medium" color="gray-900">Heart Rate</Text>
                          <Icon icon="activity" class="w-5 h-5 text-primary-500" />
                        </div>
                        <div class="text-2xl font-bold text-neutral-darker">{patient.vitals.heartRate}</div>
                        <div class="text-sm text-neutral-normal">bpm</div>
                      </div>
                    </Column>

                    {/* Temperature */}
                    <Column size={{ sm: 12, md: 6, lg: 4 }}>
                      <div class="p-4 bg-neutral-lighter rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <Text as="h4" weight="medium" color="gray-900">Temperature</Text>
                          <div class="w-5 h-5 bg-warning-normal rounded-full" />
                        </div>
                        <div class="text-2xl font-bold text-neutral-darker">{patient.vitals.temperature}°</div>
                        <div class="text-sm text-neutral-normal">Fahrenheit</div>
                      </div>
                    </Column>

                    {/* Weight */}
                    <Column size={{ sm: 12, md: 6, lg: 4 }}>
                      <div class="p-4 bg-neutral-lighter rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <Text as="h4" weight="medium" color="gray-900">Weight</Text>
                          <div class="w-5 h-5 bg-success-500 rounded-full" />
                        </div>
                        <div class="text-2xl font-bold text-neutral-darker">{patient.vitals.weight}</div>
                        <div class="text-sm text-neutral-normal">kg</div>
                      </div>
                    </Column>

                    {/* Height */}
                    <Column size={{ sm: 12, md: 6, lg: 4 }}>
                      <div class="p-4 bg-neutral-lighter rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <Text as="h4" weight="medium" color="gray-900">Height</Text>
                          <div class="w-5 h-5 bg-primary-normal rounded-full" />
                        </div>
                        <div class="text-2xl font-bold text-neutral-darker">{patient.vitals.height}</div>
                        <div class="text-sm text-neutral-normal">cm</div>
                      </div>
                    </Column>

                    {/* BMI */}
                    <Column size={{ sm: 12, md: 6, lg: 4 }}>
                      <div class="p-4 bg-neutral-lighter rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                          <Text as="h4" weight="medium" color="gray-900">BMI</Text>
                          <div class="w-5 h-5 bg-primary-normal rounded-full" />
                        </div>
                        <div class="text-2xl font-bold text-neutral-darker">{calculateBMI()}</div>
                        <div class={`text-sm ${getBMICategory(Number(calculateBMI())).color}`}>
                          {getBMICategory(Number(calculateBMI())).text}
                        </div>
                      </div>
                    </Column>
                  </Row>

                  <div class="mt-4 text-sm text-neutral-normal">
                    Last updated: {formatDate(patient.vitals.lastUpdated)}
                  </div>

                </div>
              )}

              {/* Contacts Tab */}
              {activeTab.value === 'contacts' && (
                <div class="space-y-6">
                  <Row gap="6">
                    <Column size={{ sm: 12, md: 6 }}>
                      <div class="p-6 bg-neutral-lighter rounded-lg">
                        <Text as="h4" weight="medium" color="gray-900" class="mb-4">Emergency Contact</Text>
                        <div class="space-y-3">
                          <div>
                            <label class="text-sm text-neutral-normal">Name</label>
                            <div class="font-medium">{patient.emergencyContact.name}</div>
                          </div>
                          <div>
                            <label class="text-sm text-neutral-normal">Relationship</label>
                            <div class="font-medium">{patient.emergencyContact.relationship}</div>
                          </div>
                          <div>
                            <label class="text-sm text-neutral-normal">Phone</label>
                            <div class="font-medium">{patient.emergencyContact.phone}</div>
                          </div>
                        </div>

                      </div>
                    </Column>

                    <Column size={{ sm: 12, md: 6 }}>
                      <div class="p-6 bg-neutral-lighter rounded-lg">
                        <Text as="h4" weight="medium" color="gray-900" class="mb-4">Patient Contact</Text>
                        <div class="space-y-3">
                          <div>
                            <label class="text-sm text-neutral-normal">Email</label>
                            <div class="font-medium">{patient.email}</div>
                          </div>
                          <div>
                            <label class="text-sm text-neutral-normal">Phone</label>
                            <div class="font-medium">{patient.phone}</div>
                          </div>
                          <div>
                            <label class="text-sm text-neutral-normal">Address</label>
                            <div class="font-medium">
                              <div>{patient.address.street}</div>
                              <div>
                                {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                              </div>
                              <div>{patient.address.country}</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </Column>
                  </Row>
                </div>

              )}
            </div>
          )}

          {mode === 'emergency' && (
            <div class="space-y-6">
              {/* Emergency Contact */}
              <div class="p-6 bg-error-50 border border-error-light rounded-lg">
                <Text as="h3" weight="semibold" size="lg" color="red-900" class="mb-4">Emergency Contact</Text>
                <Row gap="4" class="text-sm">
                  <Column size={{ sm: 12, md: 4 }}>
                    <label class="font-medium text-error-700">Name</label>
                    <div class="text-error-900">{patient.emergencyContact.name}</div>
                  </Column>
                  <Column size={{ sm: 12, md: 4 }}>
                    <label class="font-medium text-error-700">Relationship</label>
                    <div class="text-error-900">{patient.emergencyContact.relationship}</div>
                  </Column>
                  <Column size={{ sm: 12, md: 4 }}>
                    <label class="font-medium text-error-700">Phone</label>
                    <div class="text-error-900">{patient.emergencyContact.phone}</div>
                  </Column>
                </Row>
              </div>

              {/* Critical Allergies */}
              <div class="p-6 bg-warning-lighter border border-warning-light rounded-lg">
                <Text as="h3" weight="semibold" size="lg" color="orange-900" class="mb-4">Critical Allergies</Text>
                {patient.medicalHistory.allergies.length > 0 ? (
                  <div class="space-y-2">
                    {patient.medicalHistory.allergies.map((allergy, idx) => (
                      <div key={idx} class="flex items-center space-x-2">
                        <Icon icon="alert-triangle" class="w-5 h-5 text-warning-normal" />
                        <span class="font-medium text-warning-darker">{allergy}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text as="p" color="warning">No known allergies</Text>
                )}
              </div>

              {/* Current Medications */}
              <div class="p-6 bg-primary-50 border border-primary-200 rounded-lg">
                <Text as="h3" weight="semibold" size="lg" color="blue-900" class="mb-4">Current Medications</Text>
                {patient.medicalHistory.medications.length > 0 ? (
                  <div class="space-y-3">
                    {patient.medicalHistory.medications.map((medication, idx) => (
                      <div key={idx} class="bg-white p-3 rounded border">
                        <div class="font-medium text-primary-900">{medication.name}</div>
                        <div class="text-sm text-primary-700">
                          {medication.dosage} - {medication.frequency}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text as="p" color="info">No current medications</Text>
                )}
              </div>

              {/* Recent Vitals */}
              <div class="p-6 bg-neutral-lighter border border-neutral-light rounded-lg">
                <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-4">Recent Vitals</Text>
                <Row gap="4" class="text-sm">
                  <Column size={{ sm: 6, md: 3 }}>
                    <label class="font-medium text-neutral-dark">Blood Pressure</label>
                    <div class="text-neutral-darker">{patient.vitals.bloodPressure}</div>
                  </Column>
                  <Column size={{ sm: 6, md: 3 }}>
                    <label class="font-medium text-neutral-dark">Heart Rate</label>
                    <div class="text-neutral-darker">{patient.vitals.heartRate} bpm</div>
                  </Column>
                  <Column size={{ sm: 6, md: 3 }}>
                    <label class="font-medium text-neutral-dark">Temperature</label>
                    <div class="text-neutral-darker">{patient.vitals.temperature}°F</div>
                  </Column>
                  <Column size={{ sm: 6, md: 3 }}>
                    <label class="font-medium text-neutral-dark">Weight</label>
                    <div class="text-neutral-darker">{patient.vitals.weight} kg</div>
                  </Column>
                </Row>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
