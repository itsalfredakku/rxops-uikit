import { component$ } from '@builder.io/qwik';
import { 
  ThemeToggle, 
  ThemeStatusIndicator, 
  EmergencyThemeControls 
} from '../design-system/theme-toggle';

/**
 * Theme System Demo - Interactive showcase of healthcare themes
 */
export const ThemeDemo = component$(() => {
  return (
    <div class="theme-demo p-6 space-y-8">
      {/* Header */}
      <div class="space-y-4">
        <h1 class="text-3xl font-bold text-base-darker dark:text-base-lighter">
          🎨 Healthcare Theme System Demo
        </h1>
        <p class="text-lg text-base-dark dark:text-base-light">
          Interactive demonstration of the RxOps Medical industry-focused theme system with 
          clinical, comfort, high-contrast, and vibrant contexts.
        </p>
      </div>

      {/* Theme Controls */}
      <div class="grid gap-6 lg:grid-cols-2">
        {/* Full Theme Toggle */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-base-darker dark:text-base-lighter">
            Full Theme Controls
          </h2>
          <ThemeToggle variant="full" showLabels={true} />
        </div>

        {/* Compact Theme Toggle */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-base-darker dark:text-base-lighter">
            Compact Controls
          </h2>
          <div class="flex gap-4 items-center">
            <ThemeToggle variant="compact" />
            <ThemeStatusIndicator />
          </div>
        </div>
      </div>

      {/* Tab Style Toggle */}
      <div class="space-y-3">
        <h2 class="text-xl font-semibold text-base-darker dark:text-base-lighter">
          Tab Style Controls
        </h2>
        <ThemeToggle variant="tabs" showLabels={true} />
      </div>

      {/* Emergency Controls */}
      <div class="space-y-3">
        <h2 class="text-xl font-semibold text-error-darker dark:text-error-lighter">
          🚨 Emergency Theme Override
        </h2>
        <p class="text-sm text-base-dark dark:text-base-light mb-3">
          For patient safety situations requiring maximum visibility
        </p>
        <EmergencyThemeControls />
      </div>

      {/* Component Showcase */}
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold text-base-darker dark:text-base-lighter">
          Component Theme Examples
        </h2>

        {/* Healthcare Cards */}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Critical Alert Card */}
          <div class="clinical-priority-critical p-4 rounded-lg bg-critical-lighter dark:bg-critical-darker">
            <h3 class="font-semibold text-critical-darker dark:text-critical-lighter">
              🚨 Critical Alert
            </h3>
            <p class="text-sm text-critical-dark dark:text-critical-light mt-2">
              Patient vital signs require immediate attention
            </p>
          </div>

          {/* Urgent Warning Card */}
          <div class="clinical-priority-urgent p-4 rounded-lg bg-urgent-lighter dark:bg-urgent-darker">
            <h3 class="font-semibold text-urgent-darker dark:text-urgent-lighter">
              ⚠️ Urgent Warning
            </h3>
            <p class="text-sm text-urgent-dark dark:text-urgent-light mt-2">
              Medication dosage needs review within 2 hours
            </p>
          </div>

          {/* Routine Info Card */}
          <div class="clinical-priority-routine p-4 rounded-lg bg-routine-lighter dark:bg-routine-darker">
            <h3 class="font-semibold text-routine-darker dark:text-routine-lighter">
              📋 Routine Check
            </h3>
            <p class="text-sm text-routine-dark dark:text-routine-light mt-2">
              Scheduled follow-up appointment reminder
            </p>
          </div>

          {/* Stable Status Card */}
          <div class="clinical-priority-stable p-4 rounded-lg bg-stable-lighter dark:bg-stable-darker">
            <h3 class="font-semibold text-stable-darker dark:text-stable-lighter">
              ✅ Stable Status
            </h3>
            <p class="text-sm text-stable-dark dark:text-stable-light mt-2">
              All vital signs within normal ranges
            </p>
          </div>
        </div>

        {/* Interactive Elements */}
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-base-darker dark:text-base-lighter">
            Interactive Elements
          </h3>
          
          <div class="flex flex-wrap gap-3">
            {/* Buttons */}
            <button class="px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-all focus:ring-2 focus:ring-primary-normal">
              Primary Action
            </button>
            
            <button class="px-4 py-2 bg-success-normal text-white rounded-lg hover:bg-success-dark transition-all focus:ring-2 focus:ring-success-normal">
              Confirm Treatment
            </button>
            
            <button class="px-4 py-2 bg-warning-normal text-white rounded-lg hover:bg-warning-dark transition-all focus:ring-2 focus:ring-warning-normal">
              Review Required
            </button>
            
            <button class="px-4 py-2 bg-error-normal text-white rounded-lg hover:bg-error-dark transition-all focus:ring-2 focus:ring-error-normal">
              Emergency Stop
            </button>
          </div>
        </div>

        {/* Form Elements */}
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-base-darker dark:text-base-lighter">
            Form Elements
          </h3>
          
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-base-darker dark:text-base-lighter mb-2">
                Patient ID
              </label>
              <input 
                type="text" 
                placeholder="Enter patient ID"
                class="w-full px-3 py-2 border border-base-light dark:border-base-dark rounded-lg bg-base-lighter dark:bg-base-darker text-base-darker dark:text-base-lighter focus:ring-2 focus:ring-primary-normal focus:border-primary-normal"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-base-darker dark:text-base-lighter mb-2">
                Priority Level
              </label>
              <select class="w-full px-3 py-2 border border-base-light dark:border-base-dark rounded-lg bg-base-lighter dark:bg-base-darker text-base-darker dark:text-base-lighter focus:ring-2 focus:ring-primary-normal focus:border-primary-normal">
                <option>Routine</option>
                <option>Urgent</option>
                <option>Critical</option>
                <option>Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Typography Showcase */}
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-base-darker dark:text-base-lighter">
            Typography Hierarchy
          </h3>
          
          <div class="space-y-3">
            <h1 class="text-4xl font-bold text-base-darker dark:text-base-lighter">
              Heading 1 - Patient Record
            </h1>
            <h2 class="text-3xl font-semibold text-base-darker dark:text-base-lighter">
              Heading 2 - Medical History
            </h2>
            <h3 class="text-2xl font-medium text-base-darker dark:text-base-lighter">
              Heading 3 - Current Medications
            </h3>
            <p class="text-lg text-base-dark dark:text-base-light">
              Large text - Primary information that requires emphasis for quick scanning
            </p>
            <p class="text-base text-base-dark dark:text-base-light">
              Body text - Standard medical documentation and detailed patient information
            </p>
            <p class="text-sm text-base-normal dark:text-base-normal">
              Small text - Additional details, timestamps, and secondary information
            </p>
            <p class="text-xs text-base-light dark:text-base-dark">
              Extra small text - Fine print, disclaimers, and metadata
            </p>
          </div>
        </div>
      </div>

      {/* Theme Context Information */}
      <div class="space-y-4 bg-base-lighter dark:bg-base-darker p-6 rounded-lg border border-base-light dark:border-base-dark">
        <h3 class="text-lg font-semibold text-base-darker dark:text-base-lighter">
          🏥 Healthcare Theme Contexts
        </h3>
        
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <h4 class="font-medium text-base-darker dark:text-base-lighter">🏥 Clinical</h4>
            <p class="text-sm text-base-dark dark:text-base-light">
              Professional medical environment with muted colors, high contrast, and reduced alarm fatigue
            </p>
          </div>
          
          <div>
            <h4 class="font-medium text-base-darker dark:text-base-lighter">🤗 Comfort</h4>
            <p class="text-sm text-base-dark dark:text-base-light">
              Patient-facing interfaces with warmer, softer, welcoming colors for reduced anxiety
            </p>
          </div>
          
          <div>
            <h4 class="font-medium text-base-darker dark:text-base-lighter">👁️ High Contrast</h4>
            <p class="text-sm text-base-dark dark:text-base-light">
              Maximum accessibility and medical device compatibility with enhanced contrast ratios
            </p>
          </div>
          
          <div>
            <h4 class="font-medium text-base-darker dark:text-base-lighter">🎨 Vibrant</h4>
            <p class="text-sm text-base-dark dark:text-base-light">
              Energetic, positive colors for pediatric and wellness applications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ThemeDemo;
