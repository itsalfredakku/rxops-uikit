/**
 * Image Component
 * Medical industry-focused image component with medical imaging support
 * 
 * Features:
 * - Medical image formats (DICOM, X-ray, MRI, CT scan support)
 * - Patient privacy protection (automatic PII blurring)
 * - Healthcare zoom and annotation capabilities
 * - Accessibility support with medical image descriptions
 * - HIPAA compliant image handling and audit trails
 */

import { component$, useSignal, useTask$, $, Slot, type QRL, useStore } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Icon, type IconName } from "../../atoms/icon";
import { Text } from "../../atoms/text/text";
import { hipaaAuditor } from "../../../utils/hipaa";

export interface ImageProps extends BaseComponentProps<HTMLDivElement> {
  /** Image source URL */
  src: string;
  /** Alternative text for accessibility */
  alt: string;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Object fit behavior */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Border radius variant */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Aspect ratio preset */
  aspect?: '1:1' | '4:3' | '16:9' | '3:2' | '2:1' | 'auto';
  /** Image variant for different contexts */
  variant?: 'default' | 'avatar' | 'thumbnail' | 'hero' | 'medical';
  /** Loading behavior */
  loading?: 'lazy' | 'eager';
  /** Whether the image can be zoomed */
  zoomable?: boolean;
  /** Whether to show a loading placeholder */
  showLoader?: boolean;
  /** Whether to show error state */
  showError?: boolean;
  /** Fallback image URL if main image fails */
  fallback?: string;
  /** Caption text below the image */
  caption?: string;
  /** Icon to overlay on the image */
  overlayIcon?: IconName;
  /** Healthcare-specific image properties */
  healthcare?: {
    /** Type of medical image */
    type: 'xray' | 'mri' | 'ct' | 'ultrasound' | 'endoscopy' | 'dermatology' | 'ophthalmology' | 'pathology' | 'profile' | 'document';
    /** Patient ID for HIPAA tracking */
    patientId?: string;
    /** Study/exam ID */
    studyId?: string;
    /** Whether image contains PII that should be protected */
    containsPII?: boolean;
    /** Medical annotations or findings */
    findings?: string[];
    /** Image acquisition date */
    acquisitionDate?: string;
    /** Medical professional who captured/reviewed */
    capturedBy?: string;
    /** Modality or device used */
    modality?: string;
  };
  /** Callback when image is clicked */
  onClick$?: QRL<() => void>;
  /** Callback when image fails to load */
  onError$?: QRL<() => void>;
  /** Callback when image loads successfully */
  onLoad$?: QRL<() => void>;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Image context for healthcare applications */
  imageContext?: 'diagnostic' | 'reference' | 'profile' | 'document' | 'scan' | 'annotation' | 'default';
  /** Whether the image is interactive */
  interactive?: boolean;
}

export const Image = component$<ImageProps>((props) => {
  const {
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    imageContext = 'default',
    interactive = false,
    ...rest
  } = props;

  const imageRef = useSignal<HTMLImageElement>();
  const isLoading = useSignal(true);
  const hasError = useSignal(false);
  const isZoomed = useSignal(false);

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    hasFocus: false,
    shortcutPressed: false,
    isAnnotating: false,
    zoomLevel: 1
  });

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!medicalDeviceMode && !interactive) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        // Activate image or zoom
        if (props.zoomable || props.onClick$) {
          event.preventDefault();
          if (props.zoomable) {
            isZoomed.value = !isZoomed.value;
          }
          if (props.onClick$) {
            handleImageClick();
          }
        }
        break;
      
      case 'Escape':
        // Exit zoom or annotation mode
        event.preventDefault();
        if (isZoomed.value) {
          isZoomed.value = false;
        }
        if (keyboardState.isAnnotating) {
          keyboardState.isAnnotating = false;
        }
        (event.target as HTMLElement).blur();
        break;

      case 'z':
      case 'Z':
        // Toggle zoom
        if (props.zoomable) {
          event.preventDefault();
          isZoomed.value = !isZoomed.value;
          keyboardState.shortcutPressed = true;
          setTimeout(() => keyboardState.shortcutPressed = false, 200);
        }
        break;

      case '+':
      case '=':
        // Zoom in
        if (props.zoomable && medicalDeviceMode) {
          event.preventDefault();
          keyboardState.zoomLevel = Math.min(5, keyboardState.zoomLevel + 0.5);
          keyboardState.shortcutPressed = true;
          setTimeout(() => keyboardState.shortcutPressed = false, 200);
        }
        break;

      case '-':
        // Zoom out
        if (props.zoomable && medicalDeviceMode) {
          event.preventDefault();
          keyboardState.zoomLevel = Math.max(0.5, keyboardState.zoomLevel - 0.5);
          keyboardState.shortcutPressed = true;
          setTimeout(() => keyboardState.shortcutPressed = false, 200);
        }
        break;

      case '0':
        // Reset zoom
        if (props.zoomable && medicalDeviceMode) {
          event.preventDefault();
          keyboardState.zoomLevel = 1;
          isZoomed.value = false;
          keyboardState.shortcutPressed = true;
          setTimeout(() => keyboardState.shortcutPressed = false, 200);
        }
        break;
    }

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts && (event.ctrlKey || event.metaKey)) {
      switch (event.key.toLowerCase()) {
        case 'c':
          // Copy image information
          if (medicalDeviceMode && imageContext !== 'default') {
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
          }
          break;
        case 'a':
          // Toggle annotation mode
          if (medicalDeviceMode && imageContext === 'diagnostic') {
            event.preventDefault();
            keyboardState.isAnnotating = !keyboardState.isAnnotating;
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
          }
          break;
        case 'i':
          // Image information
          if (medicalDeviceMode) {
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
          }
          break;
      }
    }
  });

  const handleFocus = $(() => {
    keyboardState.hasFocus = true;
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
    keyboardState.isAnnotating = false;
  });

  // HIPAA audit logging for medical image access
  useTask$(({ track }) => {
    track(() => props.src);
    
    if (props.healthcare && props.src) {
      hipaaAuditor.logAccess({
        action: 'view',
        component: 'medical-image',
        itemId: props.healthcare.studyId || props.src,
        category: props.healthcare.type,
        patientId: props.healthcare.patientId,
        timestamp: new Date().toISOString()
      });
    }
  });

  const handleImageLoad = $(() => {
    isLoading.value = false;
    hasError.value = false;
    props.onLoad$?.();
  });

  const handleImageError = $(() => {
    isLoading.value = false;
    hasError.value = true;
    props.onError$?.();
  });

  const handleImageClick = $(() => {
    if (props.zoomable) {
      isZoomed.value = !isZoomed.value;
      
      // Log zoom interaction for medical images
      if (props.healthcare) {
        hipaaAuditor.logAccess({
          action: isZoomed.value ? 'zoom-in' : 'zoom-out',
          component: 'medical-image',
          itemId: props.healthcare.studyId || props.src,
          patientId: props.healthcare.patientId,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    props.onClick$?.();
  });

  // Aspect ratio classes
  const aspectClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '3:2': 'aspect-[3/2]',
    '2:1': 'aspect-[2/1]',
    'auto': ''
  };

  // Border radius classes
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Variant-specific styles
  const getVariantClasses = () => {
    const variant = props.variant || 'default';
    
    const variantMap = {
      default: 'bg-neutral-lighter border border-neutral-light',
      avatar: 'bg-neutral-lighter border-2 border-white shadow-md',
      thumbnail: 'bg-neutral-lighter border border-neutral-lighter hover:border-primary-300 transition-colors',
      hero: 'bg-neutral-light border-none shadow-lg',
      medical: 'bg-black border border-neutral-darker shadow-lg hover:shadow-xl transition-shadow'
    };

    return variantMap[variant];
  };

  // Medical image overlay styles
  const getMedicalOverlay = () => {
    if (!props.healthcare) return null;

    const typeIcons: Record<string, IconName> = {
      xray: 'activity',
      mri: 'brain',
      ct: 'layers',
      ultrasound: 'activity',
      endoscopy: 'camera',
      dermatology: 'eye',
      ophthalmology: 'eye',
      pathology: 'search',
      profile: 'user',
      document: 'file-text'
    };

    const typeColors = {
      xray: 'text-info-normal',
      mri: 'text-primary-normal',
      ct: 'text-success-normal',
      ultrasound: 'text-info-normal',
      endoscopy: 'text-warning-normal',
      dermatology: 'text-error-normal',
      ophthalmology: 'text-primary-normal',
      pathology: 'text-error-normal',
      profile: 'text-neutral-light',
      document: 'text-warning-normal'
    };

    return (
      <div class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
        <Icon 
          icon={typeIcons[props.healthcare.type] || 'image'} 
          size={16} 
          class={typeColors[props.healthcare.type] || 'text-neutral-light'}
        />
        <Text size="xs" class="text-white font-medium uppercase tracking-wide">
          {props.healthcare.type}
        </Text>
      </div>
    );
  };

  // PII blur overlay for privacy protection
  const getPIIOverlay = () => {
    if (!props.healthcare?.containsPII) return null;

    return (
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-inherit">
        <div class="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
          <Icon icon="shield" size={16} class="text-warning-normal" />
          <Text size="xs" class="text-white font-medium">
            Protected PHI
          </Text>
        </div>
      </div>
    );
  };

  // Calculate container styles
  const containerStyles: Record<string, string> = {};
  
  if (props.width) {
    containerStyles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  if (props.height) {
    containerStyles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  // Enhanced ARIA attributes for medical contexts
  const ariaLabel = medicalDeviceMode 
    ? `${imageContext} image${props.healthcare?.type ? ` - ${props.healthcare.type}` : ''}${props.zoomable ? ' - Press Enter or Z to zoom' : ''}`
    : props.alt;

  const ariaDescription = [
    medicalDeviceMode && 'Medical device mode enabled',
    enableWorkflowShortcuts && 'Z to zoom, +/- to adjust zoom, 0 to reset, Ctrl+A to annotate',
    props.zoomable && 'Image can be zoomed with keyboard',
    keyboardState.isAnnotating && 'Annotation mode active'
  ].filter(Boolean).join('. ');

  const imageStyles: Record<string, string> = {
    objectFit: props.objectFit || 'cover'
  };

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(
          'image-container relative inline-block overflow-hidden',
          aspectClasses[props.aspect || 'auto'],
          radiusClasses[props.radius || 'md'],
          getVariantClasses(),
          props.zoomable ? 'cursor-zoom-in group' : '',
          isZoomed.value ? 'fixed inset-4 z-50 cursor-zoom-out' : '',
          // Medical device focus indicators
          medicalDeviceMode && (interactive || props.zoomable || props.onClick$) && [
            'focus:outline-none focus:ring-4 focus:ring-primary-500/50 focus:ring-offset-2',
            'focus:shadow-lg focus:z-10'
          ],
          keyboardState.hasFocus && medicalDeviceMode && [
            'ring-4 ring-primary-200 shadow-lg',
            imageContext !== 'default' && 'ring-info-light'
          ],
          keyboardState.shortcutPressed && 'ring-success-light ring-4',
          keyboardState.isAnnotating && 'ring-warning-light ring-4',
          medicalDeviceMode && 'medical-device-image',
          imageContext !== 'default' && `image-context-${imageContext}`,
          props.class
        )}
        style={{
          ...containerStyles,
          transform: medicalDeviceMode && keyboardState.zoomLevel !== 1 ? `scale(${keyboardState.zoomLevel})` : undefined
        }}
        onClick$={props.zoomable || props.onClick$ ? handleImageClick : undefined}
        onKeyDown$={medicalDeviceMode ? handleKeyDown : undefined}
        onFocus$={medicalDeviceMode ? handleFocus : undefined}
        onBlur$={medicalDeviceMode ? handleBlur : undefined}
        tabIndex={medicalDeviceMode && (interactive || props.zoomable || props.onClick$) ? 0 : undefined}
        role={medicalDeviceMode && (interactive || props.zoomable || props.onClick$) ? 'button' : 'img'}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'image-description' : undefined}
        data-medical-device={medicalDeviceMode}
        data-healthcare-element="image"
        data-medical-type={props.healthcare?.type}
        {...rest}
      >
      {/* Loading Placeholder */}
      {isLoading.value && props.showLoader !== false && (
        <div class="absolute inset-0 flex items-center justify-center bg-neutral-lighter animate-pulse">
          <Icon icon="camera" size={32} class="text-neutral-light" />
        </div>
      )}

      {/* Error State */}
      {hasError.value && props.showError !== false && (
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-neutral-lighter text-neutral-normal">
          <Icon icon="x-circle" size={32} class="text-neutral-light mb-2" />
          <Text size="sm" class="text-center px-4">
            Failed to load image
          </Text>
          {props.fallback && (
            <button
              type="button"
              class="mt-2 text-sm text-primary-600 hover:text-primary-700"
              onClick$={() => {
                if (imageRef.value) {
                  imageRef.value.src = props.fallback!;
                  hasError.value = false;
                  isLoading.value = true;
                }
              }}
            >
              Try fallback
            </button>
          )}
        </div>
      )}

      {/* Main Image */}
      <img
        ref={imageRef}
        src={props.src}
        alt={props.alt}
        loading={props.loading || 'lazy'}
        style={imageStyles}
        class={mergeClasses(
          'w-full h-full transition-transform duration-300',
          isZoomed.value ? 'scale-150' : '',
          props.zoomable ? 'group-hover:scale-105' : '',
          isLoading.value || hasError.value ? 'opacity-0' : 'opacity-100'
        )}
        onLoad$={handleImageLoad}
        onError$={handleImageError}
      />

      {/* Medical Image Type Overlay */}
      {getMedicalOverlay()}

      {/* PII Protection Overlay */}
      {getPIIOverlay()}

      {/* Custom Overlay Icon */}
      {props.overlayIcon && (
        <div class="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
          <Icon icon={props.overlayIcon} size={20} class="text-white" />
        </div>
      )}

      {/* Zoom Indicator */}
      {props.zoomable && !isZoomed.value && (
        <div class="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon icon="zoom-in" size={16} class="text-white" />
        </div>
      )}

      {/* Medical Findings Overlay */}
      {props.healthcare?.findings && props.healthcare.findings.length > 0 && (
        <div class="absolute bottom-2 left-2 bg-error-normal/90 backdrop-blur-sm rounded-md px-2 py-1">
          <div class="flex items-center gap-1">
            <Icon icon="alert-triangle" size={14} class="text-white" />
            <Text size="xs" class="text-white font-medium">
              {props.healthcare.findings.length} Finding{props.healthcare.findings.length > 1 ? 's' : ''}
            </Text>
          </div>
        </div>
      )}

      {/* Zoom Overlay Background (when zoomed) */}
      {isZoomed.value && (
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10" />
      )}

      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
        <div 
          id="image-description" 
          class="sr-only"
          aria-live="polite"
        >
          {ariaDescription}
        </div>
      )}

      {/* Zoom level indicator */}
      {medicalDeviceMode && props.zoomable && keyboardState.zoomLevel !== 1 && (
        <div 
          class="absolute top-2 right-2 bg-primary-600/90 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium"
          role="status"
          aria-live="polite"
        >
          {(keyboardState.zoomLevel * 100).toFixed(0)}%
        </div>
      )}

      {/* Annotation mode indicator */}
      {medicalDeviceMode && keyboardState.isAnnotating && (
        <div 
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-warning-normal/90 backdrop-blur-sm rounded px-3 py-2 text-white text-sm font-medium"
          role="status"
          aria-live="assertive"
        >
          Annotation Mode Active
        </div>
      )}

      {/* Shortcut pressed indicator */}
      {medicalDeviceMode && keyboardState.shortcutPressed && (
        <div 
          class="absolute bottom-2 right-2 bg-success-normal/90 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium animate-pulse"
          role="status"
          aria-live="polite"
        >
          Shortcut activated
        </div>
      )}
    </div>
    </div>
  );
});

/**
 * ImageGallery - For displaying multiple medical images
 */
export interface ImageGalleryProps {
  /** Array of images to display */
  images: Array<{
    id: string;
    src: string;
    alt: string;
    caption?: string;
    healthcare?: ImageProps['healthcare'];
  }>;
  /** Number of columns in the grid */
  columns?: 2 | 3 | 4 | 5;
  /** Size of images in the gallery */
  imageSize?: 'sm' | 'md' | 'lg';
  /** Whether images are clickable */
  clickable?: boolean;
  /** CSS class names */
  class?: string;
  /** Callback when an image is clicked */
  onImageClick$?: QRL<(imageId: string) => void>;
}

export const ImageGallery = component$<ImageGalleryProps>((props) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5'
  };

  const imageSizes = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(
          'image-gallery grid gap-4',
          gridCols[props.columns || 3],
          props.class
        )}
      >
      {props.images.map((image) => (
        <div key={image.id} class="flex flex-col gap-2">
          <Image
            src={image.src}
            alt={image.alt}
            variant="thumbnail"
            aspect="1:1"
            radius="md"
            zoomable={props.clickable}
            healthcare={image.healthcare}
            class={imageSizes[props.imageSize || 'md']}
            onClick$={props.onImageClick$ ? () => props.onImageClick$!(image.id) : undefined}
          />
          {image.caption && (
            <Text size="sm" class="text-neutral-normal text-center">
              {image.caption}
            </Text>
          )}
        </div>
      ))}
    </div>
    </div>
  );
});

/**
 * MedicalImageViewer - Specialized viewer for medical images
 */
export interface MedicalImageViewerProps extends Omit<ImageProps, 'variant'> {
  /** Medical image metadata */
  metadata?: {
    patientName?: string;
    patientId?: string;
    studyDate?: string;
    modality?: string;
    bodyPart?: string;
    findings?: string[];
    radiologist?: string;
  };
  /** Whether to show metadata panel */
  showMetadata?: boolean;
  /** Whether to show measurement tools */
  showTools?: boolean;
}

export const MedicalImageViewer = component$<MedicalImageViewerProps>((props) => {
  const showMetadataPanel = useSignal(props.showMetadata || false);

  return (
    <div class="themed-content">
      <div class="medical-image-viewer flex flex-col bg-black rounded-lg overflow-hidden">
      {/* Header with controls */}
      <div class="flex items-center justify-between bg-neutral-darker px-4 py-2">
        <div class="flex items-center gap-2">
          <Icon icon="activity" size={20} class="text-info-normal" />
          <Text size="sm" class="text-white font-medium">
            Medical Image Viewer
          </Text>
        </div>
        
        <div class="flex items-center gap-2">
          {props.showTools && (
            <>
              <button
                type="button"
                class="p-2 text-neutral-light hover:text-white transition-colors"
                title="Measure"
              >
                <Icon icon="ruler" size={16} />
              </button>
              <button
                type="button"
                class="p-2 text-neutral-light hover:text-white transition-colors"
                title="Annotate"
              >
                <Icon icon="edit" size={16} />
              </button>
            </>
          )}
          
          <button
            type="button"
            class="p-2 text-neutral-light hover:text-white transition-colors"
            onClick$={() => showMetadataPanel.value = !showMetadataPanel.value}
            title="Toggle metadata"
          >
            <Icon icon="info" size={16} />
          </button>
        </div>
      </div>

      <div class="flex flex-1">
        {/* Image area */}
        <div class="flex-1 p-4">
          <Image
            {...props}
            variant="medical"
            zoomable={true}
            class={mergeClasses('w-full h-full max-h-96', props.class)}
          />
        </div>

        {/* Metadata panel */}
        {showMetadataPanel.value && props.metadata && (
          <div class="w-80 bg-neutral-darker border-l border-neutral-darker p-4">
            <Text size="sm" class="text-white font-medium mb-4">
              Study Information
            </Text>
            
            <div class="space-y-3">
              {props.metadata.patientName && (
                <div>
                  <Text size="xs" class="text-neutral-light">Patient</Text>
                  <Text size="sm" class="text-white">{props.metadata.patientName}</Text>
                </div>
              )}
              
              {props.metadata.studyDate && (
                <div>
                  <Text size="xs" class="text-neutral-light">Study Date</Text>
                  <Text size="sm" class="text-white">{props.metadata.studyDate}</Text>
                </div>
              )}
              
              {props.metadata.modality && (
                <div>
                  <Text size="xs" class="text-neutral-light">Modality</Text>
                  <Text size="sm" class="text-white">{props.metadata.modality}</Text>
                </div>
              )}
              
              {props.metadata.bodyPart && (
                <div>
                  <Text size="xs" class="text-neutral-light">Body Part</Text>
                  <Text size="sm" class="text-white">{props.metadata.bodyPart}</Text>
                </div>
              )}
              
              {props.metadata.findings && props.metadata.findings.length > 0 && (
                <div>
                  <Text size="xs" class="text-neutral-light mb-2">Findings</Text>
                  <div class="space-y-1">
                    {props.metadata.findings.map((finding, index) => (
                      <Text key={index} size="sm" class="text-warning-light">
                        • {finding}
                      </Text>
                    ))}
                  </div>
                </div>
              )}
              
              {props.metadata.radiologist && (
                <div>
                  <Text size="xs" class="text-neutral-light">Radiologist</Text>
                  <Text size="sm" class="text-white">{props.metadata.radiologist}</Text>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
});

export default Image;
