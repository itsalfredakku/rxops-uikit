/**
 * Healthcare Component Gallery - Live Examples
 * Interactive showcase for healthcare components
 */

import { component$ } from '@builder.io/qwik';
import { Alert } from '../core/atoms/alert/alert';
import { Button } from '../core/atoms/button/button';
import { Input } from '../core/atoms/input/index';
import { Badge } from '../core/atoms/badge/index';
import { Slider } from '../core/atoms/slider/index';
import { EmergencyAlert } from '../core/molecules/emergency-alert/emergency-alert';

export const HealthcareComponentGallery = component$(() => {
  return (
    <div class="healthcare-gallery p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-neutral-darker mb-4">
          RxOps Healthcare Component Gallery
        </h1>
        <p class="text-lg text-neutral-normal mb-4">
          Interactive showcase of our Medical industry-focused UI components
        </p>
        <div class="flex flex-wrap gap-2 mb-6">
          <Badge variant="flat" color="success" size="sm">
            ✅ 30.68KB Bundle Size
          </Badge>
          <Badge variant="flat" color="primary" size="sm">
            🏥 HIPAA Compliant
          </Badge>
          <Badge variant="flat" color="secondary" size="sm">
            ♿ WCAG 2.1 AA
          </Badge>
          <Badge variant="flat" color="warning" size="sm">
            📱 Mobile-First
          </Badge>
        </div>
      </div>

      {/* Emergency & Critical Components */}
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6 text-error-dark">
          🚨 Emergency & Patient Safety Components
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="p-6 border rounded-lg bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Emergency Alert</h3>
            <div class="space-y-4">
              <EmergencyAlert
                alert={{
                  id: "alert-001",
                  type: "code-blue",
                  severity: "critical",
                  status: "active",
                  title: "Code Blue - Room 302",
                  message: "Cardiac arrest - immediate response required",
                  location: { room: "302", floor: "3", building: "Main" },
                  patient: {
                    id: "P001",
                    name: "John Doe",
                    age: 65
                  },
                  reporter: {
                    id: "R001",
                    name: "Nurse Smith",
                    role: "RN"
                  },
                  timestamp: new Date().toISOString(),
                  requiredActions: ["call-emergency", "send-team"]
                }}
                compact={true}
                showActions={true}
                onAcknowledge$={() => console.log('Emergency acknowledged')}
              />
            </div>
          </div>

          <div class="p-6 border rounded-lg bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-4">System Alerts</h3>
            <div class="space-y-4">
              <Alert
                color="success"
                variant="soft"
                title="Lab Results Available"
              >
                Blood work completed - results within normal range
              </Alert>
              <Alert
                color="warning"
                variant="soft"
                title="Medication Reminder"
              >
                Patient due for next dose in 30 minutes
              </Alert>
              <Alert
                color="error"
                variant="soft"
                title="Critical Value Alert"
              >
                Blood pressure reading requires immediate attention
              </Alert>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Care Components */}
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6 text-success-dark">
          👤 Patient Care & Assessment
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="p-6 border rounded-lg bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Pain Assessment Scale</h3>
            <div class="space-y-4">
              <label class="block text-sm font-medium text-neutral-dark">
                Current Pain Level (0-10)
              </label>
              <Slider
                value={3}
                min={0}
                max={10}
                step={1}
                onValueChange$={(value) => console.log('Pain level:', value)}
              />
              <div class="text-sm text-neutral-normal">
                Current: 3/10 - Mild discomfort
              </div>
            </div>
          </div>

          <div class="p-6 border rounded-lg bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Treatment Progress</h3>
            <div class="text-sm space-y-3">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 bg-success-normal text-white rounded-full flex items-center justify-center text-xs font-semibold">✓</span>
                <div>
                  <div class="font-semibold">Initial Assessment</div>
                  <div class="text-neutral-normal text-xs">Patient intake completed</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 bg-success-normal text-white rounded-full flex items-center justify-center text-xs font-semibold">✓</span>
                <div>
                  <div class="font-semibold">Diagnosis Confirmed</div>
                  <div class="text-neutral-normal text-xs">Medical evaluation done</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 bg-primary-normal text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <div>
                  <div class="font-semibold text-primary-dark">Treatment Started</div>
                  <div class="text-primary-normal text-xs">Current phase - in progress</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 bg-neutral-light text-neutral-normal rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <div>
                  <div class="text-neutral-normal">Follow-up Scheduled</div>
                  <div class="text-neutral-light text-xs">Pending</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 bg-neutral-light text-neutral-normal rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                <div>
                  <div class="text-neutral-normal">Recovery Monitoring</div>
                  <div class="text-neutral-light text-xs">Pending</div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border rounded-lg bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Status Indicators</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Badge variant="flat" color="success" size="sm">Active</Badge>
                <span class="text-sm">Patient Status</span>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="flat" color="warning" size="sm">Pending</Badge>
                <span class="text-sm">Lab Results</span>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="flat" color="error" size="sm">Critical</Badge>
                <span class="text-sm">Vital Signs</span>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="flat" color="primary" size="sm">Scheduled</Badge>
                <span class="text-sm">Next Appointment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form & Input Components */}
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6 text-primary-dark">
          📝 Healthcare Forms & Inputs
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="p-6 border rounded-lg bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Patient Information Form</h3>
            <div class="space-y-4">
              <Input
                type="text"
                placeholder="Patient ID"
                required={true}
                value=""
              />
              <Input
                type="text"
                placeholder="Full Name"
                required={true}
                value=""
              />
              <Input
                type="date"
                placeholder="Date of Birth"
                required={true}
                value=""
              />
              <Button intent="primary" size="md" class="w-full">
                Save Patient Information
              </Button>
            </div>
          </div>

          <div class="p-6 border rounded-lg bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Vital Signs Input</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-dark mb-1">
                  Blood Pressure (mmHg)
                </label>
                <div class="flex gap-2">
                  <Input type="number" placeholder="120" value="" />
                  <span class="self-center">/</span>
                  <Input type="number" placeholder="80" value="" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-dark mb-1">
                  Heart Rate (bpm)
                </label>
                <Input type="number" placeholder="72" value="" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-dark mb-1">
                  Temperature (°F)
                </label>
                <Input type="number" placeholder="98.6" value="" />
              </div>
              <Button intent="secondary" size="md" class="w-full">
                Record Vital Signs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* System Performance */}
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6 text-neutral-dark">
          📊 System Performance & Metrics
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div class="p-4 text-center border rounded-lg bg-white shadow-sm">
            <div class="text-2xl font-bold text-success-normal">62</div>
            <div class="text-sm text-neutral-normal">Total Components</div>
          </div>
          <div class="p-4 text-center border rounded-lg bg-white shadow-sm">
            <div class="text-2xl font-bold text-primary-normal">30.68KB</div>
            <div class="text-sm text-neutral-normal">Bundle Size</div>
          </div>
          <div class="p-4 text-center border rounded-lg bg-white shadow-sm">
            <div class="text-2xl font-bold text-primary-normal">100%</div>
            <div class="text-sm text-neutral-normal">WCAG 2.1 AA</div>
          </div>
          <div class="p-4 text-center border rounded-lg bg-white shadow-sm">
            <div class="text-2xl font-bold text-warning-normal">19</div>
            <div class="text-sm text-neutral-normal">Healthcare Specific</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6 text-primary-dark">
          ⚡ Quick Actions & Common Workflows
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Button 
            intent="primary" 
            size="lg" 
            class="w-full h-16 text-lg"
            onClick$={() => console.log('Emergency protocol activated')}
          >
            🚨 Emergency Protocol
          </Button>
          <Button 
            intent="secondary" 
            size="lg" 
            class="w-full h-16 text-lg"
            onClick$={() => console.log('Patient admission started')}
          >
            📋 Patient Admission
          </Button>
          <Button 
            intent="neutral" 
            size="lg" 
            class="w-full h-16 text-lg"
            onClick$={() => console.log('Discharge planning opened')}
          >
            🏠 Discharge Planning
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer class="border-t pt-8 mt-12">
        <div class="text-center text-neutral-normal">
          <p class="mb-2">
            RxOps Healthcare UI Kit - Built for Clinical Excellence
          </p>
          <p class="text-sm">
            HIPAA Compliant • WCAG 2.1 AA • Mobile-First • Performance Optimized
          </p>
        </div>
      </footer>
    </div>
  );
});

export default HealthcareComponentGallery;
