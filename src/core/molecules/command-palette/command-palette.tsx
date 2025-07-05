/**
 * Command Palette Component
 * Healthcare-focused command launcher with search, keyboard shortcuts, and workflows
 * 
 * Features:
 * - Fast command search and execution
 * - Healthcare-specific command categories (Patient, Provider, Emergency, etc.)
 * - Keyboard shortcuts and hotkeys
 * - Recent commands and favorites
 * - Role-based command filtering
 * - Emergency command prioritization
 * - Voice command integration readiness
 * - Accessibility with screen reader support
 */

import { component$, useSignal, useStore, $, useTask$, type QRL } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Button } from "../../atoms/button/button";
import { Text } from "../../atoms/text/text";
import { Input } from "../../atoms/input/input";
import { Badge } from "../../atoms/badge/index";
import { Kbd } from "../../atoms/kbd/kbd";
import type { Color } from "../../../design-system/types";

export type CommandCategory = 
  | 'patient' 
  | 'provider' 
  | 'emergency' 
  | 'medication' 
  | 'appointment' 
  | 'lab' 
  | 'billing' 
  | 'navigation' 
  | 'system' 
  | 'workflow';

export type CommandPriority = 'emergency' | 'urgent' | 'normal' | 'low';

export type UserRole = 'patient' | 'provider' | 'nurse' | 'admin' | 'staff';

export interface Command {
  id: string;
  title: string;
  description?: string;
  category: CommandCategory;
  priority: CommandPriority;
  keywords: string[];
  shortcut?: string[];
  icon?: string;
  roles: UserRole[];
  action: () => void | Promise<void>;
  disabled?: boolean;
  requiresConfirmation?: boolean;
  emergencyCommand?: boolean;
}

export interface CommandPaletteProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  /**
   * Whether the command palette is open
   */
  open?: boolean;
  
  /**
   * Available commands
   */
  commands?: Command[];
  
  /**
   * Current user role for filtering commands
   */
  userRole?: UserRole;
  
  /**
   * Recent commands (for quick access)
   */
  recentCommands?: string[];
  
  /**
   * Favorite commands
   */
  favoriteCommands?: string[];
  
  /**
   * Maximum number of results to show
   */
  maxResults?: number;
  
  /**
   * Placeholder text for search input
   */
  placeholder?: string;
  
  /**
   * Enable voice command trigger
   */
  enableVoiceCommands?: boolean;
  
  /**
   * High contrast mode for accessibility
   */
  highContrast?: boolean;
  
  /**
   * Compact mode for smaller screens
   */
  compact?: boolean;
  
  /**
   * Emergency mode (prioritizes emergency commands)
   */
  emergencyMode?: boolean;
  
  /**
   * Custom trigger shortcut
   */
  triggerShortcut?: string[];
  
  /**
   * Command execution callback
   */
  onCommandExecute$?: QRL<(command: Command) => void>;
  
  /**
   * Search callback
   */
  onSearch$?: QRL<(query: string) => void>;
  
  /**
   * Open/close callback
   */
  onToggle$?: QRL<(open: boolean) => void>;
  
  /**
   * Command favorite callback
   */
  onToggleFavorite$?: QRL<(commandId: string) => void>;
}

const categoryConfig = {
  patient: {
    label: 'Patient',
    color: 'primary' as Color,
    icon: '👤',
    priority: 1
  },
  provider: {
    label: 'Provider',
    color: 'success' as Color,
    icon: '👩‍⚕️',
    priority: 2
  },
  emergency: {
    label: 'Emergency',
    color: 'error' as Color,
    icon: '🚨',
    priority: 0
  },
  medication: {
    label: 'Medication',
    color: 'warning' as Color,
    icon: '💊',
    priority: 3
  },
  appointment: {
    label: 'Appointment',
    color: 'info' as Color,
    icon: '📅',
    priority: 4
  },
  lab: {
    label: 'Lab Results',
    color: 'secondary' as Color,
    icon: '🧪',
    priority: 5
  },
  billing: {
    label: 'Billing',
    color: 'neutral' as Color,
    icon: '💳',
    priority: 6
  },
  navigation: {
    label: 'Navigation',
    color: 'neutral' as Color,
    icon: '🧭',
    priority: 7
  },
  system: {
    label: 'System',
    color: 'neutral' as Color,
    icon: '⚙️',
    priority: 8
  },
  workflow: {
    label: 'Workflow',
    color: 'info' as Color,
    icon: '📋',
    priority: 9
  }
};

const priorityConfig = {
  emergency: {
    color: 'error' as Color,
    weight: 1000,
    badge: '🚨'
  },
  urgent: {
    color: 'warning' as Color,
    weight: 100,
    badge: '⚡'
  },
  normal: {
    color: 'primary' as Color,
    weight: 10,
    badge: ''
  },
  low: {
    color: 'neutral' as Color,
    weight: 1,
    badge: ''
  }
};

// Default healthcare commands
const defaultCommands: Command[] = [
  // Emergency Commands
  {
    id: 'emergency-code-blue',
    title: 'Code Blue - Cardiac Emergency',
    description: 'Activate cardiac emergency response team',
    category: 'emergency',
    priority: 'emergency',
    keywords: ['code', 'blue', 'cardiac', 'emergency', 'heart'],
    shortcut: ['Ctrl', 'Shift', 'E'],
    roles: ['provider', 'nurse', 'admin'],
    action: () => console.log('Emergency: Code Blue activated'),
    emergencyCommand: true,
    requiresConfirmation: true
  },
  {
    id: 'emergency-code-red',
    title: 'Code Red - Fire Emergency',
    description: 'Activate fire emergency response',
    category: 'emergency',
    priority: 'emergency',
    keywords: ['code', 'red', 'fire', 'emergency', 'evacuation'],
    shortcut: ['Ctrl', 'Shift', 'F'],
    roles: ['provider', 'nurse', 'admin', 'staff'],
    action: () => console.log('Emergency: Code Red activated'),
    emergencyCommand: true,
    requiresConfirmation: true
  },
  
  // Patient Commands
  {
    id: 'patient-search',
    title: 'Search Patients',
    description: 'Find patient records by name or ID',
    category: 'patient',
    priority: 'normal',
    keywords: ['patient', 'search', 'find', 'record', 'chart'],
    shortcut: ['Ctrl', 'P'],
    roles: ['provider', 'nurse', 'admin', 'staff'],
    action: () => console.log('Opening patient search')
  },
  {
    id: 'patient-new',
    title: 'Add New Patient',
    description: 'Register a new patient in the system',
    category: 'patient',
    priority: 'normal',
    keywords: ['patient', 'new', 'add', 'register', 'create'],
    shortcut: ['Ctrl', 'N'],
    roles: ['provider', 'nurse', 'admin', 'staff'],
    action: () => console.log('Creating new patient')
  },
  {
    id: 'patient-vitals',
    title: 'Record Vital Signs',
    description: 'Enter patient vital signs',
    category: 'patient',
    priority: 'urgent',
    keywords: ['vitals', 'blood', 'pressure', 'temperature', 'heart', 'rate'],
    shortcut: ['Ctrl', 'V'],
    roles: ['provider', 'nurse'],
    action: () => console.log('Recording vital signs')
  },
  
  // Medication Commands
  {
    id: 'medication-search',
    title: 'Search Medications',
    description: 'Find medication information and interactions',
    category: 'medication',
    priority: 'normal',
    keywords: ['medication', 'drug', 'search', 'interactions', 'dosage'],
    shortcut: ['Ctrl', 'M'],
    roles: ['provider', 'nurse'],
    action: () => console.log('Searching medications')
  },
  {
    id: 'medication-prescribe',
    title: 'Prescribe Medication',
    description: 'Create new prescription for patient',
    category: 'medication',
    priority: 'normal',
    keywords: ['prescribe', 'prescription', 'medication', 'drug', 'rx'],
    shortcut: ['Ctrl', 'R'],
    roles: ['provider'],
    action: () => console.log('Creating prescription')
  },
  
  // Appointment Commands
  {
    id: 'appointment-schedule',
    title: 'Schedule Appointment',
    description: 'Book new appointment for patient',
    category: 'appointment',
    priority: 'normal',
    keywords: ['appointment', 'schedule', 'book', 'calendar'],
    shortcut: ['Ctrl', 'A'],
    roles: ['provider', 'nurse', 'admin', 'staff'],
    action: () => console.log('Scheduling appointment')
  },
  {
    id: 'appointment-today',
    title: 'Today\'s Appointments',
    description: 'View appointments scheduled for today',
    category: 'appointment',
    priority: 'normal',
    keywords: ['appointment', 'today', 'schedule', 'calendar'],
    shortcut: ['Ctrl', 'T'],
    roles: ['provider', 'nurse', 'admin', 'staff'],
    action: () => console.log('Viewing today\'s appointments')
  },
  
  // Lab Commands
  {
    id: 'lab-order',
    title: 'Order Lab Tests',
    description: 'Request laboratory tests for patient',
    category: 'lab',
    priority: 'normal',
    keywords: ['lab', 'test', 'order', 'blood', 'urine', 'culture'],
    shortcut: ['Ctrl', 'L'],
    roles: ['provider'],
    action: () => console.log('Ordering lab tests')
  },
  {
    id: 'lab-results',
    title: 'View Lab Results',
    description: 'Check pending and completed lab results',
    category: 'lab',
    priority: 'urgent',
    keywords: ['lab', 'results', 'report', 'pending', 'completed'],
    shortcut: ['Ctrl', 'Shift', 'L'],
    roles: ['provider', 'nurse'],
    action: () => console.log('Viewing lab results')
  },
  
  // Navigation Commands
  {
    id: 'nav-dashboard',
    title: 'Go to Dashboard',
    description: 'Navigate to main dashboard',
    category: 'navigation',
    priority: 'normal',
    keywords: ['dashboard', 'home', 'main', 'overview'],
    shortcut: ['Ctrl', 'H'],
    roles: ['provider', 'nurse', 'admin', 'staff', 'patient'],
    action: () => console.log('Navigating to dashboard')
  },
  {
    id: 'nav-settings',
    title: 'Open Settings',
    description: 'Access system settings and preferences',
    category: 'system',
    priority: 'low',
    keywords: ['settings', 'preferences', 'config', 'options'],
    shortcut: ['Ctrl', ','],
    roles: ['provider', 'nurse', 'admin', 'staff', 'patient'],
    action: () => console.log('Opening settings')
  }
];

export const CommandPalette = component$<CommandPaletteProps>((props) => {
  const {
    open = false,
    commands = defaultCommands,
    userRole = 'provider',
    recentCommands = [],
    favoriteCommands = [],
    maxResults = 10,
    placeholder = 'Search commands...',
    enableVoiceCommands = false,
    highContrast = false,
    compact = false,
    emergencyMode = false,
    triggerShortcut = ['Ctrl', 'K'],
    onCommandExecute$,
    onSearch$,
    onToggle$,
    onToggleFavorite$,
    class: className,
    ...rest
  } = props;

  const isOpen = useSignal(open);
  const searchQuery = useSignal('');
  const selectedIndex = useSignal(0);
  const inputRef = useSignal<HTMLInputElement>();
  
  const state = useStore({
    filteredCommands: [] as Command[],
    showRecents: true,
    isExecuting: false,
    voiceListening: false
  });

  // Filter and sort commands based on search query and user role
  const filterCommands = $(() => {
    const query = searchQuery.value.toLowerCase().trim();
    let filtered = commands.filter(cmd => {
      // Role-based filtering
      if (!cmd.roles.includes(userRole)) return false;
      
      // Search filtering
      if (!query) return true;
      
      return (
        cmd.title.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query) ||
        cmd.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
        cmd.category.toLowerCase().includes(query)
      );
    });

    // Sort by priority, category, and relevance
    filtered.sort((a, b) => {
      // Emergency mode prioritizes emergency commands
      if (emergencyMode) {
        if (a.emergencyCommand && !b.emergencyCommand) return -1;
        if (!a.emergencyCommand && b.emergencyCommand) return 1;
      }
      
      // Priority weight
      const priorityDiff = priorityConfig[b.priority].weight - priorityConfig[a.priority].weight;
      if (priorityDiff !== 0) return priorityDiff;
      
      // Category priority
      const categoryDiff = categoryConfig[a.category].priority - categoryConfig[b.category].priority;
      if (categoryDiff !== 0) return categoryDiff;
      
      // Favorites first
      const aFav = favoriteCommands.includes(a.id);
      const bFav = favoriteCommands.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      
      // Recent commands next
      const aRecent = recentCommands.indexOf(a.id);
      const bRecent = recentCommands.indexOf(b.id);
      if (aRecent !== -1 && bRecent === -1) return -1;
      if (aRecent === -1 && bRecent !== -1) return 1;
      if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
      
      // Alphabetical
      return a.title.localeCompare(b.title);
    });

    return filtered.slice(0, maxResults);
  });

  // Update filtered commands when search or other factors change
  useTask$(async ({ track }) => {
    track(() => searchQuery.value);
    track(() => userRole);
    track(() => emergencyMode);
    state.filteredCommands = await filterCommands();
    selectedIndex.value = 0;
  });

  // Keyboard event handlers
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!isOpen.value) return;
    
    const { key } = event;
    const commandCount = state.filteredCommands.length;
    
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex.value = (selectedIndex.value + 1) % commandCount;
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex.value = selectedIndex.value === 0 ? commandCount - 1 : selectedIndex.value - 1;
        break;
      case 'Enter':
        event.preventDefault();
        if (state.filteredCommands[selectedIndex.value]) {
          executeCommand(state.filteredCommands[selectedIndex.value]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeCommandPalette();
        break;
    }
  });

  const executeCommand = $(async (command: Command) => {
    if (command.disabled || state.isExecuting) return;
    
    state.isExecuting = true;
    
    try {
      if (command.requiresConfirmation) {
        const confirmed = confirm(`Are you sure you want to execute: ${command.title}?`);
        if (!confirmed) {
          state.isExecuting = false;
          return;
        }
      }
      
      await command.action();
      
      if (onCommandExecute$) {
        onCommandExecute$(command);
      }
      
      closeCommandPalette();
    } catch (error) {
      console.error('Command execution error:', error);
    } finally {
      state.isExecuting = false;
    }
  });

  const closeCommandPalette = $(() => {
    isOpen.value = false;
    searchQuery.value = '';
    selectedIndex.value = 0;
    state.showRecents = true;
    
    if (onToggle$) {
      onToggle$(false);
    }
  });

  const openCommandPalette = $(() => {
    isOpen.value = true;
    
    // Focus input after opening
    setTimeout(() => {
      inputRef.value?.focus();
    }, 100);
    
    if (onToggle$) {
      onToggle$(true);
    }
  });

  const handleSearchInput = $((value: string) => {
    searchQuery.value = value;
    state.showRecents = !value.trim();
    
    if (onSearch$) {
      onSearch$(value);
    }
  });

  const toggleFavorite = $((commandId: string) => {
    if (onToggleFavorite$) {
      onToggleFavorite$(commandId);
    }
  });

  // Initialize keyboard shortcuts
  useTask$(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Check for trigger shortcut
      const isTrigger = triggerShortcut.every((key, index) => {
        if (index === 0 && key === 'Ctrl') return event.ctrlKey;
        if (index === 0 && key === 'Alt') return event.altKey;
        if (index === 0 && key === 'Shift') return event.shiftKey;
        return event.key === key;
      });
      
      if (isTrigger) {
        event.preventDefault();
        if (isOpen.value) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  });

  if (!isOpen.value) return null;

  const containerClasses = mergeClasses(
    'command-palette-overlay fixed inset-0 z-50 flex items-start justify-center',
    'bg-black bg-opacity-50 backdrop-blur-sm',
    compact ? 'pt-20' : 'pt-32',
    className
  );

  const paletteClasses = mergeClasses(
    'command-palette bg-white rounded-lg shadow-2xl border border-neutral-200',
    'w-full max-w-2xl mx-4',
    compact ? 'max-h-80' : 'max-h-96',
    'overflow-hidden',
    highContrast && 'border-2 border-neutral-800 bg-white'
  );

  const inputClasses = mergeClasses(
    'w-full px-4 py-3 text-base border-0 focus:ring-0 focus:outline-none',
    compact ? 'py-2 text-sm' : 'py-3 text-base',
    highContrast && 'bg-white text-black'
  );

  const commandItemClasses = (command: Command, index: number) => mergeClasses(
    'command-item flex items-center px-4 py-3 cursor-pointer transition-colors',
    'border-b border-neutral-100 last:border-b-0',
    index === selectedIndex.value && 'bg-primary-50',
    command.disabled && 'opacity-50 cursor-not-allowed',
    command.emergencyCommand && 'bg-red-50 border-red-200',
    compact && 'py-2',
    highContrast && index === selectedIndex.value && 'bg-neutral-800 text-white'
  );

  return (
    <div class={containerClasses} onClick$={closeCommandPalette} {...rest}>
      <div class={paletteClasses} onClick$={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div class="command-search border-b border-neutral-200">
          <Input
            ref={inputRef}
            class={inputClasses}
            placeholder={placeholder}
            value={searchQuery.value}
            onInput$={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
            onKeyDown$={handleKeyDown}
          />
        </div>

        {/* Commands List */}
        <div class="command-list overflow-y-auto max-h-80">
          {state.filteredCommands.length === 0 ? (
            <div class="p-8 text-center text-neutral-500">
              <Text>No commands found</Text>
            </div>
          ) : (
            state.filteredCommands.map((command, index) => (
              <div
                key={command.id}
                class={commandItemClasses(command, index)}
                onClick$={() => executeCommand(command)}
              >
                {/* Command Icon & Category */}
                <div class="flex items-center space-x-2 mr-3">
                  <span class="text-lg">{categoryConfig[command.category].icon}</span>
                  {command.priority !== 'normal' && (
                    <span class="text-sm">{priorityConfig[command.priority].badge}</span>
                  )}
                </div>

                {/* Command Details */}
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <Text weight="medium" class="truncate">
                      {command.title}
                    </Text>
                    <Badge
                      size="sm"
                      color={categoryConfig[command.category].color}
                      variant="flat"
                    >
                      {categoryConfig[command.category].label}
                    </Badge>
                    {favoriteCommands.includes(command.id) && (
                      <span class="text-yellow-500">⭐</span>
                    )}
                  </div>
                  {command.description && (
                    <Text size="sm" color="gray-500" class="truncate">
                      {command.description}
                    </Text>
                  )}
                </div>

                {/* Keyboard Shortcut */}
                {command.shortcut && (
                  <div class="flex items-center space-x-1">
                    {command.shortcut.map((key) => (
                      <Kbd key={key} size="sm">
                        {key}
                      </Kbd>
                    ))}
                  </div>
                )}

                {/* Favorite Toggle */}
                <Button
                  size="xs"
                  variant="text"
                  onClick$={(e) => {
                    e.stopPropagation();
                    toggleFavorite(command.id);
                  }}
                  class="ml-2 opacity-0 group-hover:opacity-100"
                >
                  {favoriteCommands.includes(command.id) ? '★' : '☆'}
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div class="command-footer flex items-center justify-between px-4 py-2 bg-neutral-50 border-t">
          <div class="flex items-center space-x-2">
            <Kbd size="sm">↑↓</Kbd>
            <Text size="xs" color="gray-500">Navigate</Text>
            <Kbd size="sm">Enter</Kbd>
            <Text size="xs" color="gray-500">Execute</Text>
            <Kbd size="sm">Esc</Kbd>
            <Text size="xs" color="gray-500">Close</Text>
          </div>
          
          {emergencyMode && (
            <Badge color="error" size="sm">
              Emergency Mode
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

export default CommandPalette;
