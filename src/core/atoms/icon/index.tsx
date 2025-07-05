import { component$, type SVGProps } from '@builder.io/qwik';
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
 * Universal Icon component for rendering SVG icons by name.
 * 
 * Usage examples:
 * - `<Icon icon="user" />`
 * - `<Icon icon="heart" class="text-error-500" />`
 * - `<Icon icon="calendar" size={24} />`
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
    ...rest 
  } = props;
  
  const IconComponent = iconMap[icon];
  
  // Merge class names
  const finalClass = mergeClasses(qwikClass, className);
  
  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);
  
  if (!IconComponent) {
    // Fallback for unknown icons - could log a warning in development
    console.warn(`Icon "${icon}" not found. Available icons:`, Object.keys(iconMap));
    return (
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
        {...rest}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  
  return <IconComponent 
    class={finalClass} 
  />;
});

export default Icon;
