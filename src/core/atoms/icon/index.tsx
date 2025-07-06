import { component$, type SVGProps, $, useStore } from '@builder.io/qwik';
import { mergeClasses, mergeStyles } from '../../../design-system/props';
import {
  ActivityIcon,
  AlertTriangleIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  FilterIcon,
  HeartIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TabletIcon as PillIcon, // Using TabletIcon as alternative for PillIcon
  PlusIcon,
  RefreshCwIcon,
  RulerIcon,
  SearchIcon,
  SettingsIcon,
  Share2Icon,
  StethoscopeIcon,
  ThermometerIcon,
  ZapIcon as BrainIcon, // Using ZapIcon as alternative for BrainIcon
  TrendingUpIcon,
  TrendingDownIcon,
  UserIcon,
  ScaleIcon as WeightIcon, // Using ScaleIcon as alternative for WeightIcon
  XCircleIcon,
  SmartphoneIcon,
  MonitorIcon,
  LockIcon,
  ClipboardIcon,
  PenToolIcon,
  ZoomInIcon,
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  HandIcon,
  RotateCwIcon,
  TrashIcon,
  ScreenShareIcon,
  StopCircleIcon,
  CircleIcon as RecordIcon, // Using CircleIcon as alternative for RecordIcon
  SkipBackIcon,
  SkipForwardIcon,
  HomeIcon,
  MenuIcon,
  XIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LogOutIcon,
  LogInIcon,
  UploadIcon,
  CameraIcon,
  InfoIcon,
  StarIcon,
  FolderIcon,
  CopyIcon,
  LinkIcon,
  MessageSquareIcon,
  MessageCircleIcon,
  CrownIcon,
  HelpCircleIcon,
  ShieldIcon,
  DatabaseIcon,
  WifiIcon,
  BatteryIcon,
  PrinterIcon,
  SendIcon,
  BookIcon,
  AwardIcon,
  GlobeIcon,
  SyringeIcon,
  HeadphonesIcon,
  AccessibilityIcon as WheelchairIcon, // Using AccessibilityIcon as alternative for WheelchairIcon
  ShoppingCartIcon,
  BuildingIcon as HospitalIcon, // Using BuildingIcon as alternative for HospitalIcon
  TruckIcon as AmbulanceIcon, // Using TruckIcon as alternative for AmbulanceIcon
  DropletIcon,
  BedIcon,
  FlaskConicalIcon as FlaskIcon, // Using FlaskConicalIcon as alternative for FlaskIcon
  BriefcaseIcon as BriefcaseMedicalIcon, // Using BriefcaseIcon as alternative for BriefcaseMedicalIcon
  QrCodeIcon,
  CreditCardIcon,
  CheckIcon,
  PauseIcon,
  PlayIcon,
  InfoIcon as InfoCircleIcon, // Using InfoIcon as alternative for InfoCircleIcon
  LayersIcon,
  BoxIcon as CubeIcon, // Using BoxIcon as alternative for CubeIcon
  CircleDotIcon as AtomIcon, // Using CircleDotIcon as alternative for AtomIcon
  UsersIcon,
  LayoutDashboardIcon,
} from 'lucide-qwik';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'size' | 'children'> {
  /** The name of the icon to render */
  icon: IconName;
  /** Size of the icon in pixels */
  size?: number;
  /** CSS class names to apply (Qwik standard) */
  class?: string;
  /** CSS class names to apply (React compatibility) */
  className?: string;
  /** Whether the icon is interactive (clickable/focusable) */
  interactive?: boolean;
  /** Click handler for interactive icons */
  onClick$?: (event: MouseEvent) => void;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical icons */
  emergencyMode?: boolean;
  /** Healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Icon purpose for healthcare contexts */
  purpose?: 'action' | 'status' | 'navigation' | 'emergency' | 'info' | 'decorative';
  /** Accessible label for screen readers */
  label?: string;
}

// Define all available icon names as a union type for better TypeScript support
export type IconName =
  | 'activity'
  | 'alert-triangle'
  | 'bell'
  | 'calendar'
  | 'check-circle'
  | 'chevron-down'
  | 'chevron-up'
  | 'clock'
  | 'download'
  | 'edit'
  | 'eye'
  | 'file-text'
  | 'filter'
  | 'heart'
  | 'mail'
  | 'map-pin'
  | 'phone'
  | 'pill'
  | 'plus'
  | 'refresh-cw'
  | 'ruler'
  | 'search'
  | 'settings'
  | 'share2'
  | 'stethoscope'
  | 'thermometer'
  | 'brain'
  | 'trending-up'
  | 'trending-down'
  | 'user'
  | 'weight'
  | 'x-circle'
  | 'smartphone'
  | 'monitor'
  | 'lock'
  | 'clipboard'
  | 'pen-tool'
  | 'zoom-in'
  | 'video'
  | 'video-off'
  | 'mic'
  | 'mic-off'
  | 'hand'
  | 'rotate-cw'
  | 'trash'
  | 'screen-share'
  | 'stop-circle'
  | 'record'
  | 'skip-back'
  | 'skip-forward'
  | 'home'
  | 'menu'
  | 'x'
  | 'arrow-right'
  | 'arrow-left'
  | 'log-out'
  | 'log-in'
  | 'upload'
  | 'camera'
  | 'info'
  | 'star'
  | 'folder'
  | 'copy'
  | 'link'
  | 'message-square'
  | 'message-circle'
  | 'crown'
  | 'help-circle'
  | 'shield'
  | 'database'
  | 'wifi'
  | 'battery'
  | 'printer'
  | 'send'
  | 'book'
  | 'award'
  | 'globe'
  | 'syringe'
  | 'headphones'
  | 'wheelchair'
  | 'shopping-cart'
  | 'hospital'
  | 'ambulance'
  | 'droplet'
  | 'bed'
  | 'flask'
  | 'briefcase-medical'
  | 'qr-code'
  | 'credit-card'
  | 'check'
  | 'pause'
  | 'play'
  | 'info-circle'
  | 'layers'
  | 'cube'
  | 'atom'
  | 'users'
  | 'layout-dashboard';

// Map icon names to their corresponding components
const iconMap = {
  'activity': ActivityIcon,
  'alert-triangle': AlertTriangleIcon,
  'bell': BellIcon,
  'calendar': CalendarIcon,
  'check-circle': CheckCircleIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'clock': ClockIcon,
  'download': DownloadIcon,
  'edit': EditIcon,
  'eye': EyeIcon,
  'file-text': FileTextIcon,
  'filter': FilterIcon,
  'heart': HeartIcon,
  'mail': MailIcon,
  'map-pin': MapPinIcon,
  'phone': PhoneIcon,
  'pill': PillIcon,
  'plus': PlusIcon,
  'refresh-cw': RefreshCwIcon,
  'ruler': RulerIcon,
  'search': SearchIcon,
  'settings': SettingsIcon,
  'share2': Share2Icon,
  'stethoscope': StethoscopeIcon,
  'thermometer': ThermometerIcon,
  'brain': BrainIcon,
  'trending-up': TrendingUpIcon,
  'trending-down': TrendingDownIcon,
  'user': UserIcon,
  'weight': WeightIcon,
  'x-circle': XCircleIcon,
  'smartphone': SmartphoneIcon,
  'monitor': MonitorIcon,
  'lock': LockIcon,
  'clipboard': ClipboardIcon,
  'pen-tool': PenToolIcon,
  'zoom-in': ZoomInIcon,
  'video': VideoIcon,
  'video-off': VideoOffIcon,
  'mic': MicIcon,
  'mic-off': MicOffIcon,
  'hand': HandIcon,
  'rotate-cw': RotateCwIcon,
  'trash': TrashIcon,
  'screen-share': ScreenShareIcon,
  'stop-circle': StopCircleIcon,
  'record': RecordIcon,
  'skip-back': SkipBackIcon,
  'skip-forward': SkipForwardIcon,
  'home': HomeIcon,
  'menu': MenuIcon,
  'x': XIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-left': ArrowLeftIcon,
  'log-out': LogOutIcon,
  'log-in': LogInIcon,
  'upload': UploadIcon,
  'camera': CameraIcon,
  'info': InfoIcon,
  'star': StarIcon,
  'folder': FolderIcon,
  'copy': CopyIcon,
  'link': LinkIcon,
  'message-square': MessageSquareIcon,
  'message-circle': MessageCircleIcon,
  'crown': CrownIcon,
  'help-circle': HelpCircleIcon,
  'shield': ShieldIcon,
  'database': DatabaseIcon,
  'wifi': WifiIcon,
  'battery': BatteryIcon,
  'printer': PrinterIcon,
  'send': SendIcon,
  'book': BookIcon,
  'award': AwardIcon,
  'globe': GlobeIcon,
  'syringe': SyringeIcon,
  'headphones': HeadphonesIcon,
  'wheelchair': WheelchairIcon,
  'shopping-cart': ShoppingCartIcon,
  'hospital': HospitalIcon,
  'ambulance': AmbulanceIcon,
  'droplet': DropletIcon,
  'bed': BedIcon,
  'flask': FlaskIcon,
  'briefcase-medical': BriefcaseMedicalIcon,
  'qr-code': QrCodeIcon,
  'credit-card': CreditCardIcon,
  'check': CheckIcon,
  'pause': PauseIcon,
  'play': PlayIcon,
  'info-circle': InfoCircleIcon,
  'layers': LayersIcon,
  'cube': CubeIcon,
  'atom': AtomIcon,
  'users': UsersIcon,
  'layout-dashboard': LayoutDashboardIcon,
};

/**
 * Universal Icon component with Medical Device Keyboard Accessibility.
 * 
 * Medical Device Keyboard Accessibility (for interactive icons):
 * - Enter/Space: Activate icon action (when interactive=true)
 * - Enhanced focus indicators for clinical environments
 * - WCAG 2.1 AA+ compliance with Section 508 support
 * - Screen reader optimization for medical workflows
 * 
 * Usage examples:
 * - `<Icon icon="user" />` (decorative)
 * - `<Icon icon="heart" class="text-error-500" interactive onClick$={...} />` (interactive)
 * - `<Icon icon="emergency" medicalDeviceMode interactive emergencyMode />` (medical emergency)
 * 
 * This component provides a single entry point for all icons in the system,
 * similar to Radzen Blazor's RadzenIcon component.
 */
export const Icon = component$<IconProps>((props) => {
  const { 
    icon, 
    class: qwikClass,
    className, 
    size, 
    style,
    interactive = false,
    onClick$,
    medicalDeviceMode = false,
    emergencyMode = false,
    enableWorkflowShortcuts = true,
    purpose = 'decorative',
    label,
    ...svgProps
  } = props;
  
  const IconComponent = iconMap[icon];
  
  // Medical device keyboard accessibility state
  const keyboardState = useStore({
    hasFocus: false,
    isEmergencyMode: emergencyMode,
    shortcutPressed: false
  });

  // Enhanced keyboard navigation for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!interactive || !enableWorkflowShortcuts) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Primary activation - Enter and Space both activate
        event.preventDefault();
        if (onClick$) {
          const syntheticEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            detail: 1,
            clientX: 0,
            clientY: 0
          });
          onClick$(syntheticEvent);
        }
        break;
    }
    
    // Enhanced visual feedback for medical devices
    if ((event.ctrlKey || event.metaKey) && medicalDeviceMode) {
      keyboardState.shortcutPressed = true;
      
      switch (event.key.toLowerCase()) {
        case 'e':
          // Ctrl+E: Toggle emergency mode
          event.preventDefault();
          keyboardState.isEmergencyMode = !keyboardState.isEmergencyMode;
          break;
      }
      
      // Reset shortcut state
      setTimeout(() => {
        keyboardState.shortcutPressed = false;
      }, 200);
    }
  });

  // Enhanced focus handlers for medical device accessibility
  const handleFocus = $(() => {
    if (interactive) {
      keyboardState.hasFocus = true;
    }
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
  });

  // Handle click events
  const handleClick = $((event: MouseEvent) => {
    if (interactive && onClick$) {
      onClick$(event);
    }
  });
  
  // Merge class names with medical device enhancements
  const finalClass = mergeClasses(
    qwikClass,
    className,
    // Interactive styling
    interactive && [
      'cursor-pointer transition-all duration-200',
      'hover:scale-110 hover:opacity-80',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
    ],
    // Medical device enhanced focus indicators
    interactive && medicalDeviceMode && keyboardState.hasFocus && [
      'ring-4 ring-blue-200 shadow-lg scale-110'
    ],
    // Emergency mode styling
    keyboardState.isEmergencyMode && [
      'ring-2 ring-orange-400 bg-warning-lighter p-1 rounded'
    ]
  );
  
  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);
  
  if (!IconComponent) {
    // Fallback for unknown icons - could log a warning in development
    console.warn(`Icon "${icon}" not found. Available icons:`, Object.keys(iconMap));
    return (
      <div class="themed-content">
        <svg 
          class={finalClass || "w-5 h-5"} 
          width={size} 
          height={size} 
          style={finalStyle}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          {...svgProps}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
    );
  }
  
  const iconElement = (
    <IconComponent 
      class={finalClass}
    />
  );
  
  // Wrap interactive icons with proper accessibility
  if (interactive) {
    return (
      <div class="themed-content">
        <div
          role="button"
          tabIndex={0}
          class="inline-flex items-center justify-center relative"
          data-medical-device={medicalDeviceMode}
          data-emergency-mode={keyboardState.isEmergencyMode}
          data-purpose={purpose}
          onClick$={handleClick}
          onKeyDown$={handleKeyDown}
          onFocus$={handleFocus}
          onBlur$={handleBlur}
          // Enhanced ARIA for medical device accessibility
          aria-label={
            label || (medicalDeviceMode 
              ? `${icon} icon - Use Enter or Space to activate`
              : `${icon} icon`)
          }
          aria-pressed={keyboardState.isEmergencyMode ? 'true' : 'false'}
        >
          {iconElement}
          
          {/* Emergency mode indicator */}
          {keyboardState.isEmergencyMode && (
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-warning-normal rounded-full border-2 border-white"></div>
          )}
          
          {/* Medical device keyboard shortcut indicator */}
          {medicalDeviceMode && keyboardState.shortcutPressed && (
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-info-lighter text-primary-darker px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              Shortcut Active
            </div>
          )}
        </div>
        
        {/* Medical device keyboard shortcuts help */}
        {medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
          <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-neutral-normal whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border">
            Keys: Enter/Space (activate), Ctrl+E (emergency)
          </div>
        )}
      </div>
    );
  }
  
  // Non-interactive icons (decorative)
  return (
    <div class="themed-content">
      {iconElement}
    </div>
  );
});

export default Icon;
