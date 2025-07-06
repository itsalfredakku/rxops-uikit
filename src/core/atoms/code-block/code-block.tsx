/**
 * Code Block Component
 * Medical industry-focused code display for medical protocols, scripts, and technical documentation
 * 
 * Features:
 * - Medical protocol display with syntax highlighting
 * - Copy-to-clipboard functionality for medical codes
 * - Line numbering for medical protocol steps
 * - Collapsible sections for long medical procedures
 * - Healthcare-specific language support (HL7, FHIR, ICD-10)
 * - HIPAA-compliant code display with data masking
 * - Accessibility support for screen readers
 */

import { component$, useSignal, useTask$, useStore, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Color } from "../../../design-system/types";
import { Icon, IconName } from "../icon";
import { Text } from "../text/text";
import { Button } from "../button/button";
import { Badge } from "../badge/index";

// Medical type configurations
type MedicalTypeConfig = {
  icon: IconName;
  label: string;
  color: Color;
  bgColor: string;
};

// Healthcare-specific code languages
export type CodeLanguage = 
  | 'javascript' | 'typescript' | 'python' | 'sql' | 'json' | 'xml'
  | 'hl7' | 'fhir' | 'cql' | 'protocol' | 'markdown' | 'yaml'
  | 'bash' | 'powershell' | 'plaintext';

// Medical code types for healthcare workflows
export type MedicalCodeType = 
  | 'protocol' | 'procedure' | 'medication' | 'icd10' | 'cpt' 
  | 'hl7_message' | 'fhir_resource' | 'lab_result' | 'prescription'
  | 'clinical_note' | 'discharge_summary';

// Code display themes
export type CodeTheme = 'light' | 'dark' | 'clinical' | 'high-contrast';

export interface CodeBlockProps extends BaseComponentProps<HTMLDivElement> {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: CodeLanguage;
  /** Medical code type for specialized formatting */
  medicalType?: MedicalCodeType;
  /** Display theme */
  theme?: CodeTheme;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether code is copyable */
  copyable?: boolean;
  /** Whether code block is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: string;
  /** Title/label for the code block */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Whether to highlight specific lines */
  highlightLines?: number[];
  /** Whether code contains sensitive data */
  containsPHI?: boolean;
  /** Whether to mask sensitive data */
  maskSensitiveData?: boolean;
  /** File name or identifier */
  fileName?: string;
  /** Code execution context */
  executionContext?: 'development' | 'staging' | 'production' | 'clinical';
  /** Callback when code is copied */
  onCopy?: () => void;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Code block context for healthcare applications */
  codeContext?: 'protocol' | 'procedure' | 'medication' | 'lab-results' | 'documentation' | 'default';
}

export interface CodeExecutorProps extends BaseComponentProps<HTMLDivElement> {
  /** Code to execute */
  code: string;
  /** Language/runtime */
  language: CodeLanguage;
  /** Whether execution is allowed */
  allowExecution?: boolean;
  /** Execution environment */
  environment?: 'sandbox' | 'clinical' | 'test';
  /** Callback when code is executed */
  onExecute?: (code: string) => Promise<string>;
  /** Whether to show output panel */
  showOutput?: boolean;
}

export interface MedicalProtocolViewerProps extends BaseComponentProps<HTMLDivElement> {
  /** Protocol data */
  protocol: {
    id: string;
    title: string;
    version: string;
    steps: Array<{
      id: string;
      title: string;
      description: string;
      code?: string;
      language?: CodeLanguage;
      required: boolean;
      duration?: string;
      warnings?: string[];
    }>;
    metadata?: {
      author?: string;
      dateCreated?: string;
      lastModified?: string;
      approvedBy?: string;
      category?: string;
    };
  };
  /** Whether protocol steps are interactive */
  interactive?: boolean;
  /** Current step (for guided execution) */
  currentStep?: number;
  /** Callback when step is completed */
  onStepComplete?: (stepId: string) => void;
}

export const CodeBlock = component$<CodeBlockProps>((props) => {
  const {
    code,
    language = 'plaintext',
    medicalType,
    theme = 'light',
    showLineNumbers = false,
    copyable = true,
    collapsible = false,
    defaultCollapsed = false,
    maxHeight = '400px',
    title,
    subtitle,
    highlightLines = [],
    containsPHI = false,
    maskSensitiveData = false,
    fileName,
    executionContext = 'development',
    onCopy,
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    codeContext = 'default',
    class: qwikClass,
    className,
    style,
    ..._ // Rest props (unused but needed for proper prop passing)
  } = props;

  const isCollapsed = useSignal(defaultCollapsed);
  const isCopied = useSignal(false);
  const maskedCode = useSignal(code);

  // Medical device keyboard state
  const keyboardState = useStore({
    focusedLine: -1,
    scrollPosition: 0,
    instructionsId: `code-block-instructions-${Math.random().toString(36).substr(2, 9)}`,
  });

  // HIPAA-compliant data masking
  useTask$(({ track }) => {
    track(() => [code, maskSensitiveData, containsPHI]);
    
    if (maskSensitiveData && containsPHI) {
      // Mask common PHI patterns
      const masked = code
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX') // SSN
        .replace(/\b\d{3}-\d{3}-\d{4}\b/g, 'XXX-XXX-XXXX') // Phone
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'email@masked.com') // Email
        .replace(/\b\d{16}\b/g, 'XXXX-XXXX-XXXX-XXXX') // Credit card
        .replace(/\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g, 'YYYY-MM-DD'); // DOB
      
      maskedCode.value = masked;
    } else {
      maskedCode.value = code;
    }
  });

  // Copy to clipboard functionality
  const handleCopy = $(async () => {
    try {
      await navigator.clipboard.writeText(code);
      isCopied.value = true;
      onCopy?.();
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  });

  // Toggle collapsed state
  const toggleCollapsed = $(() => {
    isCollapsed.value = !isCollapsed.value;
  });

  // Format code lines with syntax highlighting (basic)
  const formatCode = (codeText: string) => {
    const lines = codeText.split('\n');
    
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const isHighlighted = highlightLines.includes(lineNumber);
      
      return (
        <div
          key={index}
          class={mergeClasses(
            'code-line flex',
            isHighlighted ? 'bg-warning-lighter border-l-2 border-warning-normal' : ''
          )}
        >
          {showLineNumbers && (
            <span class="line-number select-none text-neutral-light text-right pr-4 min-w-[3rem] text-sm">
              {lineNumber}
            </span>
          )}
          <span class="flex-1 text-sm font-mono whitespace-pre">
            {line || ' '}
          </span>
        </div>
      );
    });
  };

  // Medical code type configurations
  const medicalTypeConfig: Record<string, MedicalTypeConfig> = {
    protocol: {
      icon: 'file-text',
      label: 'Medical Protocol',
      color: 'primary',
      bgColor: 'bg-info-lighter'
    },
    procedure: {
      icon: 'activity',
      label: 'Procedure',
      color: 'success',
      bgColor: 'bg-success-lighter'
    },
    medication: {
      icon: 'pill',
      label: 'Medication',
      color: 'warning',
      bgColor: 'bg-warning-lighter'
    },
    icd10: {
      icon: 'clipboard',
      label: 'ICD-10 Code',
      color: 'secondary',
      bgColor: 'bg-neutral-lighter'
    },
    cpt: {
      icon: 'credit-card',
      label: 'CPT Code',
      color: 'secondary',
      bgColor: 'bg-neutral-lighter'
    },
    hl7_message: {
      icon: 'mail',
      label: 'HL7 Message',
      color: 'info',
      bgColor: 'bg-info-lighter'
    },
    fhir_resource: {
      icon: 'database',
      label: 'FHIR Resource',
      color: 'info',
      bgColor: 'bg-info-lighter'
    },
    lab_result: {
      icon: 'flask',
      label: 'Lab Result',
      color: 'warning',
      bgColor: 'bg-warning-lighter'
    },
    prescription: {
      icon: 'file-text',
      label: 'Prescription',
      color: 'primary',
      bgColor: 'bg-primary-lighter'
    },
    clinical_note: {
      icon: 'edit',
      label: 'Clinical Note',
      color: 'secondary',
      bgColor: 'bg-neutral-lighter'
    },
    discharge_summary: {
      icon: 'check-circle',
      label: 'Discharge Summary',
      color: 'success',
      bgColor: 'bg-success-lighter'
    }
  };

  const typeConfig = medicalType ? medicalTypeConfig[medicalType] : null;

  // Theme configurations
  const themeClasses = {
    light: 'bg-neutral-lighter text-neutral-darker border-neutral-light',
    dark: 'bg-neutral-darker text-neutral-lighter border-neutral-darker',
    clinical: 'bg-white text-neutral-darker border-neutral-light shadow-sm',
    'high-contrast': 'bg-black text-white border-white'
  };

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(
          'code-block rounded-lg border overflow-hidden',
          themeClasses[theme],
          typeConfig?.bgColor || '',
          qwikClass || className
        )}
        style={style}
        data-healthcare-element="code-block"
        data-language={language}
        data-medical-type={medicalType}
        data-execution-context={executionContext}
      >
      {/* Header */}
      {(title || subtitle || fileName || copyable || collapsible || typeConfig) && (
        <div class="flex items-center justify-between p-3 border-b border-inherit">
          <div class="flex items-center gap-3">
            {/* Medical type indicator */}
            {typeConfig && (
              <Badge color={typeConfig.color} size="sm" variant="flat">
                <Icon icon={typeConfig.icon} size={12} class="mr-1" />
                {typeConfig.label}
              </Badge>
            )}
            
            {/* Title and subtitle */}
            <div>
              {title && (
                <Text weight="medium" size="sm">{title}</Text>
              )}
              {subtitle && (
                <Text size="xs" class="text-neutral-normal">{subtitle}</Text>
              )}
              {fileName && !title && (
                <Text size="sm" class="font-mono text-neutral-dark">{fileName}</Text>
              )}
            </div>

            {/* Language indicator */}
            {language !== 'plaintext' && (
              <Badge color="secondary" size="sm" variant="outlined">
                {language.toUpperCase()}
              </Badge>
            )}

            {/* PHI indicator */}
            {containsPHI && (
              <Badge color="warning" size="sm" variant="flat">
                <Icon icon="shield" size={12} class="mr-1" />
                PHI
              </Badge>
            )}

            {/* Execution context */}
            {executionContext !== 'development' && (
              <Badge 
                color={executionContext === 'production' || executionContext === 'clinical' ? 'error' : 'warning'} 
                size="sm" 
                variant="flat"
              >
                {executionContext.toUpperCase()}
              </Badge>
            )}
          </div>

          <div class="flex items-center gap-2">
            {/* Copy button */}
            {copyable && (
              <Button
                variant="text"
                size="sm"
                onClick$={handleCopy}
                disabled={isCopied.value}
                aria-label="Copy code"
              >
                <Icon 
                  icon={isCopied.value ? 'check' : 'copy'} 
                  size={14} 
                  class={isCopied.value ? 'text-success' : ''} 
                />
              </Button>
            )}

            {/* Collapse button */}
            {collapsible && (
              <Button
                variant="text"
                size="sm"
                onClick$={toggleCollapsed}
                aria-label={isCollapsed.value ? 'Expand code' : 'Collapse code'}
              >
                <Icon 
                  icon={isCollapsed.value ? 'chevron-down' : 'chevron-up'} 
                  size={14} 
                />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Code content */}
      {!isCollapsed.value && (
        <div 
          class={mergeClasses(
            "code-content overflow-auto",
            medicalDeviceMode && "focus:outline-2 focus:outline-blue-500 focus:outline-offset-1"
          )}
          style={{ maxHeight }}
          tabIndex={medicalDeviceMode ? 0 : -1}
          role={medicalDeviceMode ? "textbox" : undefined}
          aria-readonly="true"
          aria-multiline="true"
          aria-label={`Code block: ${language} ${codeContext !== 'default' ? `for ${codeContext}` : ''}`}
          aria-describedby={medicalDeviceMode ? keyboardState.instructionsId : undefined}
          onKeyDown$={(event) => {
            if (!medicalDeviceMode) return;
            
            const currentTarget = event.target as HTMLElement;
            const lines = maskedCode.value.split('\n');
            
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (keyboardState.focusedLine < lines.length - 1) {
                keyboardState.focusedLine++;
                // Scroll to focused line
                const lineHeight = 20; // Approximate line height
                currentTarget.scrollTop = keyboardState.focusedLine * lineHeight;
              }
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              if (keyboardState.focusedLine > 0) {
                keyboardState.focusedLine--;
                const lineHeight = 20;
                currentTarget.scrollTop = keyboardState.focusedLine * lineHeight;
              }
            } else if (event.key === 'Home') {
              event.preventDefault();
              keyboardState.focusedLine = 0;
              currentTarget.scrollTop = 0;
            } else if (event.key === 'End') {
              event.preventDefault();
              keyboardState.focusedLine = lines.length - 1;
              currentTarget.scrollTop = currentTarget.scrollHeight;
            } else if (event.key === 'PageDown') {
              event.preventDefault();
              const visibleLines = Math.floor(currentTarget.clientHeight / 20);
              keyboardState.focusedLine = Math.min(keyboardState.focusedLine + visibleLines, lines.length - 1);
              currentTarget.scrollTop += currentTarget.clientHeight;
            } else if (event.key === 'PageUp') {
              event.preventDefault();
              const visibleLines = Math.floor(currentTarget.clientHeight / 20);
              keyboardState.focusedLine = Math.max(keyboardState.focusedLine - visibleLines, 0);
              currentTarget.scrollTop -= currentTarget.clientHeight;
            } else if (event.key === 'Escape') {
              event.preventDefault();
              currentTarget.blur();
            } else if (medicalDeviceMode && enableWorkflowShortcuts) {
              // Healthcare workflow shortcuts
              if (event.ctrlKey || event.metaKey) {
                if (event.key === 'c' && copyable) {
                  event.preventDefault();
                  handleCopy();
                } else if (event.key === 'f') {
                  event.preventDefault();
                  // Open browser find
                  return;
                } else if (event.key === 'a') {
                  event.preventDefault();
                  // Select all text (browser behavior)
                  return;
                }
              }
              
              // Quick navigation for medical contexts
              if (codeContext === 'protocol') {
                if (event.key === 'n') {
                  event.preventDefault();
                  // Navigate to next step/procedure
                  const stepMatch = lines.findIndex((line, index) => 
                    index > keyboardState.focusedLine && 
                    line.toLowerCase().includes('step')
                  );
                  if (stepMatch !== -1) {
                    keyboardState.focusedLine = stepMatch;
                    currentTarget.scrollTop = stepMatch * 20;
                  }
                } else if (event.key === 'p') {
                  event.preventDefault();
                  // Navigate to previous step/procedure
                  const stepMatch = lines.slice(0, keyboardState.focusedLine).reverse().findIndex(line => 
                    line.toLowerCase().includes('step')
                  );
                  if (stepMatch !== -1) {
                    keyboardState.focusedLine = keyboardState.focusedLine - stepMatch - 1;
                    currentTarget.scrollTop = (keyboardState.focusedLine - stepMatch - 1) * 20;
                  }
                }
              } else if (codeContext === 'medication') {
                if (event.key === 'd') {
                  event.preventDefault();
                  // Navigate to dosage information
                  const dosageMatch = lines.findIndex((line, index) => 
                    index > keyboardState.focusedLine && 
                    (line.toLowerCase().includes('dose') || line.toLowerCase().includes('mg') || line.toLowerCase().includes('ml'))
                  );
                  if (dosageMatch !== -1) {
                    keyboardState.focusedLine = dosageMatch;
                    currentTarget.scrollTop = dosageMatch * 20;
                  }
                }
              } else if (codeContext === 'lab-results') {
                if (event.key === 'r') {
                  event.preventDefault();
                  // Navigate to results/values
                  const resultMatch = lines.findIndex((line, index) => 
                    index > keyboardState.focusedLine && 
                    (line.toLowerCase().includes('result') || line.toLowerCase().includes('value'))
                  );
                  if (resultMatch !== -1) {
                    keyboardState.focusedLine = resultMatch;
                    currentTarget.scrollTop = resultMatch * 20;
                  }
                }
              }
            }
          }}
        >
          <pre 
            class="p-4 text-sm font-mono whitespace-pre-wrap break-words"
          >
            {formatCode(maskedCode.value)}
          </pre>
        </div>
      )}

      {/* Collapsed state */}
      {isCollapsed.value && (
        <div class="p-4 text-center">
          <Text size="sm" class="text-neutral-normal">
            Code collapsed ({maskedCode.value.split('\n').length} lines)
          </Text>
        </div>
      )}

      {/* Footer with metadata */}
      {(maskedCode.value.split('\n').length > 1 || showLineNumbers) && !isCollapsed.value && (
        <div class="flex justify-between items-center p-2 border-t border-inherit text-xs text-neutral-normal">
          <span>{maskedCode.value.split('\n').length} lines</span>
          <span>{maskedCode.value.length} characters</span>
        </div>
      )}
      
      {/* Medical Device Keyboard Instructions */}
      {medicalDeviceMode && (
        <div 
          id={keyboardState.instructionsId}
          class="sr-only"
        >
          Code block navigation: Use arrow keys to navigate lines, Page Up/Down for pages, 
          Home/End for first/last line, Escape to exit focus.
          {copyable && ' Ctrl+C to copy code.'}
          {enableWorkflowShortcuts && codeContext === 'protocol' && ' N for next step, P for previous step.'}
          {enableWorkflowShortcuts && codeContext === 'medication' && ' D to find dosage information.'}
          {enableWorkflowShortcuts && codeContext === 'lab-results' && ' R to find results.'}
          {enableWorkflowShortcuts && ' Healthcare shortcuts enabled.'}
        </div>
      )}
      </div>
    </div>
  );
});

export const CodeExecutor = component$<CodeExecutorProps>((props) => {
  const {
    code,
    language,
    allowExecution = false,
    environment = 'sandbox',
    onExecute,
    showOutput = true,
    class: qwikClass,
    className,
    style,
    ...domProps
  } = props;

  const isExecuting = useSignal(false);
  const output = useSignal<string>('');
  const editableCode = useSignal(code);

  const executeCode = $(async () => {
    if (!allowExecution || !onExecute) return;
    
    isExecuting.value = true;
    try {
      const result = await onExecute(editableCode.value);
      output.value = result;
    } catch (error) {
      output.value = `Error: ${error}`;
    } finally {
      isExecuting.value = false;
    }
  });

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(
          'code-executor border rounded-lg overflow-hidden',
          qwikClass || className
        )}
        style={style}
        data-healthcare-element="code-executor"
        {...domProps}
      >
      {/* Header */}
      <div class="flex items-center justify-between p-3 bg-neutral-lighter border-b">
        <div class="flex items-center gap-2">
          <Icon icon="play" size={16} class="text-neutral-normal" />
          <Text weight="medium">Code Executor</Text>
          <Badge color="secondary" size="sm" variant="outlined">
            {language.toUpperCase()}
          </Badge>
          <Badge 
            color={environment === 'clinical' ? 'error' : 'warning'} 
            size="sm" 
            variant="flat"
          >
            {environment.toUpperCase()}
          </Badge>
        </div>
        
        {allowExecution && (
          <Button
            variant="flat"
            size="sm"
            onClick$={executeCode}
            disabled={isExecuting.value}
          >
            {isExecuting.value ? (
              <Icon icon="refresh-cw" size={14} class="animate-spin mr-1" />
            ) : (
              <Icon icon="play" size={14} class="mr-1" />
            )}
            Run
          </Button>
        )}
      </div>

      {/* Code editor */}
      <div class="p-4">
        <textarea
          class="w-full h-32 font-mono text-sm border rounded p-2 resize-none"
          value={editableCode.value}
          onInput$={(event) => {
            editableCode.value = (event.target as HTMLTextAreaElement).value;
          }}
          placeholder="Enter code here..."
        />
      </div>

      {/* Output panel */}
      {showOutput && output.value && (
        <div class="border-t">
          <div class="p-3 bg-neutral-lighter border-b">
            <Text weight="medium" size="sm">Output</Text>
          </div>
          <div class="p-4">
            <pre class="text-sm font-mono whitespace-pre-wrap text-neutral-dark">
              {output.value}
            </pre>
          </div>
        </div>
      )}
      </div>
    </div>
  );
});

export const MedicalProtocolViewer = component$<MedicalProtocolViewerProps>((props) => {
  const {
    protocol,
    interactive = false,
    currentStep = 0,
    onStepComplete,
    class: qwikClass,
    className,
    style,
    ...domProps
  } = props;

  const activeStep = useSignal(currentStep);
  const completedSteps = useSignal<string[]>([]);

  const handleStepComplete = $((stepId: string) => {
    if (!completedSteps.value.includes(stepId)) {
      completedSteps.value = [...completedSteps.value, stepId];
    }
    onStepComplete?.(stepId);
    
    // Move to next step
    const currentIndex = protocol.steps.findIndex(step => step.id === stepId);
    if (currentIndex < protocol.steps.length - 1) {
      activeStep.value = currentIndex + 1;
    }
  });

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(
          'medical-protocol-viewer bg-white border rounded-lg shadow-sm',
          qwikClass || className
        )}
        style={style}
        data-healthcare-element="medical-protocol-viewer"
        {...domProps}
      >
      {/* Protocol header */}
      <div class="p-4 border-b bg-neutral-lighter">
        <div class="flex items-start justify-between">
          <div>
            <Text size="lg" weight="bold">{protocol.title}</Text>
            <Text size="sm" class="text-neutral-normal mt-1">
              Version {protocol.version}
            </Text>
            {protocol.metadata?.category && (
              <Badge color="secondary" size="sm" variant="outlined" class="mt-2">
                {protocol.metadata.category}
              </Badge>
            )}
          </div>
          
          {interactive && (
            <div class="text-right">
              <Text size="sm" class="text-neutral-normal">
                Progress: {completedSteps.value.length}/{protocol.steps.length}
              </Text>
              <div class="w-32 bg-neutral-light rounded-full h-2 mt-1">
                <div 
                  class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(completedSteps.value.length / protocol.steps.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        {protocol.metadata && (
          <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
            {protocol.metadata.author && (
              <div>
                <Text class="text-neutral-normal">Author:</Text>
                <Text weight="medium">{protocol.metadata.author}</Text>
              </div>
            )}
            {protocol.metadata.lastModified && (
              <div>
                <Text class="text-neutral-normal">Last Modified:</Text>
                <Text weight="medium">{protocol.metadata.lastModified}</Text>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Protocol steps */}
      <div class="divide-y divide-neutral-200">
        {protocol.steps.map((step, index) => {
          const isCompleted = completedSteps.value.includes(step.id);
          const isActive = interactive && activeStep.value === index;
          const isPending = interactive && index > activeStep.value;
          
          return (
            <div
              key={step.id}
              class={mergeClasses(
                'p-4 transition-all duration-200',
                isActive ? 'bg-info-lighter border-l-4 border-primary-normal' : '',
                isCompleted ? 'bg-success-lighter' : '',
                isPending ? 'opacity-60' : ''
              )}
            >
              <div class="flex items-start gap-3">
                {/* Step indicator */}
                <div class={mergeClasses(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  isCompleted 
                    ? 'bg-success-normal text-white' 
                    : isActive 
                      ? 'bg-primary-normal text-white'
                      : 'bg-neutral-light text-neutral-normal'
                )}>
                  {isCompleted ? (
                    <Icon icon="check" size={14} />
                  ) : (
                    index + 1
                  )}
                </div>

                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <Text weight="medium" class="mb-1">{step.title}</Text>
                      {step.required && (
                        <Badge color="error" size="sm" variant="outlined" class="mb-2">
                          Required
                        </Badge>
                      )}
                      <Text size="sm" class="text-neutral-normal mb-3">
                        {step.description}
                      </Text>
                    </div>
                    
                    {step.duration && (
                      <Badge color="secondary" size="sm" variant="flat">
                        {step.duration}
                      </Badge>
                    )}
                  </div>

                  {/* Step code */}
                  {step.code && (
                    <div class="mb-3">
                      <CodeBlock
                        code={step.code}
                        language={step.language}
                        theme="clinical"
                        copyable={true}
                        showLineNumbers={false}
                        maxHeight="200px"
                      />
                    </div>
                  )}

                  {/* Warnings */}
                  {step.warnings && step.warnings.length > 0 && (
                    <div class="mb-3 p-3 bg-warning-lighter border border-warning-light rounded">
                      <div class="flex items-start gap-2">
                        <Icon icon="alert-triangle" size={16} class="text-warning-normal mt-0.5 flex-shrink-0" />
                        <div>
                          <Text size="sm" weight="medium" class="text-warning-darker mb-1">
                            Warnings:
                          </Text>
                          <ul class="text-sm text-warning-dark space-y-1">
                            {step.warnings.map((warning, idx) => (
                              <li key={idx}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive controls */}
                  {interactive && isActive && !isCompleted && (
                    <div class="flex gap-2">
                      <Button
                        variant="flat"
                        size="sm"
                        onClick$={() => handleStepComplete(step.id)}
                      >
                        <Icon icon="check" size={14} class="mr-1" />
                        Complete Step
                      </Button>
                      {index > 0 && (
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick$={() => activeStep.value = index - 1}
                        >
                          Previous
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
});

export default CodeBlock;
