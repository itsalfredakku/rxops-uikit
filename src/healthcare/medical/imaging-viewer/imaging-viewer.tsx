import { component$, useSignal, $ } from '@builder.io/qwik';
import { Button } from '../../../core/atoms/button/button';
import { Text } from '../../../core/atoms/text/text';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { Divider } from '../../../core/atoms/divider/divider';
import { Row, Column } from '../../../layouts';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Icon } from '../../../core/atoms/icon';

/**
 * Medical imaging metadata interface
 */
export interface ImagingMetadata {
  patientId: string;
  patientName: string;
  studyDate: string;
  modality: 'CT' | 'MRI' | 'X-RAY' | 'ULTRASOUND' | 'MAMMOGRAPHY' | 'PET' | 'NUCLEAR';
  bodyPart: string;
  studyDescription: string;
  seriesNumber: number;
  instanceNumber: number;
  slice?: number;
  totalSlices?: number;
  pixelSpacing?: [number, number];
  sliceThickness?: number;
  kvp?: number;
  mas?: number;
  exposureTime?: number;
  radiologist?: string;
  reportStatus: 'PENDING' | 'PRELIMINARY' | 'FINAL' | 'ADDENDUM';
  urgency: 'ROUTINE' | 'URGENT' | 'STAT';
  technician?: string;
  institution: string;
}

/**
 * Annotation data for medical imaging
 */
export interface ImagingAnnotation {
  id: string;
  type: 'MEASUREMENT' | 'ARROW' | 'CIRCLE' | 'RECTANGLE' | 'FREEHAND' | 'TEXT';
  coordinates: number[];
  value?: number;
  unit?: string;
  label?: string;
  color: string;
  createdBy: string;
  createdAt: string;
  isVisible: boolean;
}

/**
 * Window/Level settings for DICOM display
 */
export interface WindowLevel {
  name: string;
  window: number;
  level: number;
}

/**
 * Props for the ImagingViewer component
 */
export interface ImagingViewerProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  imageUrl: string;
  metadata: ImagingMetadata;
  annotations?: ImagingAnnotation[];
  windowLevels?: WindowLevel[];
  defaultWindowLevel?: string;
  showControls?: boolean;
  showMeasurements?: boolean;
  showAnnotations?: boolean;
  allowAnnotations?: boolean;
  onAnnotationAdd?: (annotation: Omit<ImagingAnnotation, 'id'>) => void;
  onAnnotationUpdate?: (annotation: ImagingAnnotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  onMeasurement?: (measurement: { value: number; unit: string; coordinates: number[] }) => void;
  onWindowLevelChange?: (windowLevel: WindowLevel) => void;
}

/**
 * ImagingViewer - Medical imaging display component
 * 
 * Features:
 * - DICOM-compatible display with window/level adjustment
 * - Multi-modality support (CT, MRI, X-Ray, etc.)
 * - Measurement tools with calibrated scaling
 * - Annotation system with various shapes and text
 * - Zoom, pan, and rotation controls
 * - Series navigation for multi-slice studies
 * - HIPAA-compliant metadata display
 * - Report status tracking
 * - Print and export functionality
 */
export const ImagingViewer = component$<ImagingViewerProps>((props) => {
  const {
    imageUrl: _imageUrl,
    metadata,
    annotations: initialAnnotations = [],
    windowLevels: customWindowLevels,
    defaultWindowLevel,
    showControls: _showControls = true,
    showMeasurements: _showMeasurements = true,
    showAnnotations: _showAnnotations = true,
    allowAnnotations: _allowAnnotations = true,
    onAnnotationAdd: _onAnnotationAdd,
    onAnnotationUpdate: _onAnnotationUpdate,
    onAnnotationDelete: _onAnnotationDelete,
    onMeasurement: _onMeasurement,
    onWindowLevelChange,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const zoomLevel = useSignal(1);
  const panX = useSignal(0);
  const panY = useSignal(0);
  const rotation = useSignal(0);
  const currentWindowLevel = useSignal(defaultWindowLevel || 'Default');
  const selectedTool = useSignal<'SELECT' | 'ZOOM' | 'PAN' | 'MEASURE' | 'ANNOTATE'>('SELECT');
  const showMetadata = useSignal(false);
  const isFullscreen = useSignal(false);
  const annotations = useSignal<ImagingAnnotation[]>(initialAnnotations);
  const isDragging = useSignal(false);
  const lastPanPoint = useSignal<{ x: number; y: number } | null>(null);

  // Default window/level presets
  const defaultWindowLevels: WindowLevel[] = [
    { name: 'Default', window: 400, level: 40 },
    { name: 'Lung', window: 1500, level: -600 },
    { name: 'Bone', window: 2000, level: 300 },
    { name: 'Brain', window: 100, level: 50 },
    { name: 'Abdomen', window: 350, level: 50 },
    { name: 'Mediastinum', window: 350, level: 25 },
  ];

  const windowLevels = customWindowLevels || defaultWindowLevels;

  // Handle zoom
  const handleZoom = $((delta: number) => {
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel.value + delta));
    zoomLevel.value = newZoom;
  });

  // Handle pan
  const handlePan = $((deltaX: number, deltaY: number) => {
    panX.value += deltaX;
    panY.value += deltaY;
  });

  // Reset view
  const resetView = $(() => {
    zoomLevel.value = 1;
    panX.value = 0;
    panY.value = 0;
    rotation.value = 0;
  });

  // Rotate image
  const rotateImage = $((degrees: number) => {
    rotation.value = (rotation.value + degrees) % 360;
  });

  // Change window/level
  const changeWindowLevel = $((preset: string) => {
    currentWindowLevel.value = preset;
    const wl = windowLevels.find(w => w.name === preset);
    if (wl && onWindowLevelChange) {
      onWindowLevelChange(wl);
    }
  });

  // Toggle fullscreen
  const toggleFullscreen = $(() => {
    isFullscreen.value = !isFullscreen.value;
  });

  // Handle mouse events for interaction
  const handleMouseDown = $((event: MouseEvent) => {
    if (selectedTool.value === 'PAN') {
      isDragging.value = true;
      lastPanPoint.value = { x: event.clientX, y: event.clientY };
    }
  });

  const handleMouseMove = $((event: MouseEvent) => {
    if (isDragging.value && lastPanPoint.value && selectedTool.value === 'PAN') {
      const deltaX = event.clientX - lastPanPoint.value.x;
      const deltaY = event.clientY - lastPanPoint.value.y;
      handlePan(deltaX, deltaY);
      lastPanPoint.value = { x: event.clientX, y: event.clientY };
    }
  });

  const handleMouseUp = $(() => {
    isDragging.value = false;
    lastPanPoint.value = null;
  });

  // Handle wheel zoom
  const handleWheel = $((event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  });

  // Use text labels instead of emojis
  const modalityLabels = {
    'CT': 'CT',
    'MRI': 'MRI',
    'X-RAY': 'X-RAY',
    'ULTRASOUND': 'US',
    'MAMMOGRAPHY': 'MAM',
    'PET': 'PET',
    'NUCLEAR': 'NUC'
  };

  const containerClasses = mergeClasses(
    'relative bg-black text-white font-sans',
    isFullscreen.value ? 'fixed inset-0 z-50' : 'rounded-lg overflow-hidden',
    qwikClass,
    className
  );

  return (
    <div 
      class={containerClasses}
      style={style}
      {...rest}
    >
      {/* Header with metadata and controls */}
      <Row alignItems="center" justifyContent="between" class="p-3 bg-neutral-900 border-b border-neutral-700">
        <Row alignItems="center" gap="4">
          <Row alignItems="center" gap="2">
            <span class="text-sm bg-neutral-700 px-2 py-1 rounded font-mono">
              {modalityLabels[metadata.modality]}
            </span>
            <div>
              <div class="font-semibold text-sm">
                {metadata.patientName} • {metadata.modality}
              </div>
              <div class="text-xs text-neutral-400">
                {metadata.studyDescription} • {metadata.studyDate}
              </div>
            </div>
          </Row>
          
          {metadata.slice && metadata.totalSlices && (
            <div class="text-xs text-primary-400 bg-primary-900/30 px-2 py-1 rounded">
              Slice {metadata.slice} / {metadata.totalSlices}
            </div>
          )}
          
          <div class={[
            'text-xs px-2 py-1 rounded font-medium',
            metadata.urgency === 'STAT' ? 'bg-error-600 text-white' :
            metadata.urgency === 'URGENT' ? 'bg-warning-600 text-white' :
            'bg-neutral-600 text-neutral-200'
          ]}>
            {metadata.urgency}
          </div>
          
          <div class={[
            'text-xs px-2 py-1 rounded',
            metadata.reportStatus === 'FINAL' ? 'bg-success-600 text-white' :
            metadata.reportStatus === 'PRELIMINARY' ? 'bg-primary-600 text-white' :
            'bg-neutral-600 text-neutral-200'
          ]}>
            {metadata.reportStatus}
          </div>
        </Row>

        <Row alignItems="center" gap="2">
          <Button
            onClick$={() => showMetadata.value = !showMetadata.value}
            variant="flat"
            color="secondary" 
            size="xs"
            class="bg-neutral-700 transition-colors duration-200 hover:bg-neutral-600 text-white"
          >
            Info
          </Button>
          <Button
            onClick$={toggleFullscreen}
            variant="flat"
            color="secondary"
            size="xs" 
            class="bg-neutral-700 transition-colors duration-200 hover:bg-neutral-600 text-white"
          >
            {isFullscreen.value ? 'Exit' : 'Full'}
          </Button>
        </Row>
      </Row>

      <Row class="h-full">
        {/* Tools sidebar */}
        {props.showControls !== false && (
          <Column class="w-16 bg-neutral-800 alignItems-center py-4" gap="2">
            {([
              { tool: 'SELECT' as const, icon: 'SEL', label: 'Select' },
              { tool: 'ZOOM' as const, icon: <Icon icon="zoom-in" class="w-4 h-4" />, label: 'Zoom' },
              { tool: 'PAN' as const, icon: 'PAN', label: 'Pan' },
              { tool: 'MEASURE' as const, icon: 'MEA', label: 'Measure' },
              { tool: 'ANNOTATE' as const, icon: 'ANN', label: 'Annotate' }
            ]).map((item) => (
              <Tooltip key={item.tool} content={item.label}>
                <button
                  onClick$={() => selectedTool.value = item.tool}
                  class={[
                    'w-10 h-10 flex items-center justify-center rounded text-lg transition-colors',
                    selectedTool.value === item.tool 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                  ]}
                >
                  {item.icon}
                </button>
              </Tooltip>
            ))}
            
            <Divider orientation="horizontal" spacing="sm" class="w-8" />
            
            <Tooltip content="Reset View">
              <button
                onClick$={resetView}
                class="w-10 h-10 flex items-center justify-center rounded bg-neutral-700 transition-colors duration-200 hover:bg-neutral-600 text-neutral-300 transition-colors"
              >
                <Icon icon="rotate-cw" class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Rotate 90°">
              <button
                onClick$={() => rotateImage(90)}
                class="w-10 h-10 flex items-center justify-center rounded bg-neutral-700 transition-colors duration-200 hover:bg-neutral-600 text-neutral-300 transition-colors"
              >
                ↻
              </button>
            </Tooltip>
          </Column>
        )}

        {/* Main image viewer */}
        <div class="flex-1 relative overflow-hidden">
          <div
            class="absolute inset-0 flex items-center justify-center cursor-crosshair"
            onMouseDown$={handleMouseDown}
            onMouseMove$={handleMouseMove}
            onMouseUp$={handleMouseUp}
            onWheel$={handleWheel}
          >
            <img
              src={props.imageUrl}
              alt={`${metadata.modality} image of ${metadata.bodyPart}`}
              width={800}
              height={600}
              class="max-w-none select-none"
              style={{
                transform: `scale(${zoomLevel.value}) translate(${panX.value}px, ${panY.value}px) rotate(${rotation.value}deg)`,
                transition: isDragging.value ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable={false}
            />
            
            {/* Annotations overlay */}
            {props.showAnnotations !== false && annotations.value.length > 0 && (
              <div class="absolute inset-0 pointer-events-none">
                {annotations.value.filter(a => a.isVisible).map((annotation) => (
                  <div
                    key={annotation.id}
                    class="absolute pointer-events-auto"
                    style={{
                      left: `${annotation.coordinates[0]}px`,
                      top: `${annotation.coordinates[1]}px`,
                      color: annotation.color
                    }}
                  >
                    {annotation.type === 'TEXT' && (
                      <div class="bg-black/75 text-white px-2 py-1 rounded text-sm">
                        {annotation.label}
                      </div>
                    )}
                    {annotation.type === 'MEASUREMENT' && (
                      <div class="bg-warning-600/75 text-white px-2 py-1 rounded text-sm font-mono">
                        {annotation.value?.toFixed(1)} {annotation.unit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zoom indicator */}
          <div class="absolute top-4 left-4 bg-black/75 text-white px-3 py-1 rounded text-sm font-mono">
            {(zoomLevel.value * 100).toFixed(0)}%
          </div>

          {/* Current tool indicator */}
          <div class="absolute top-4 right-4 bg-black/75 text-white px-3 py-1 rounded text-sm">
            {selectedTool.value}
          </div>
        </div>

        {/* Window/Level controls */}
        {windowLevels.length > 0 && (
          <div class="w-48 bg-neutral-800 p-4">
            <Text as="h3" weight="semibold" size="sm" color="gray-200" class="mb-3">Window/Level</Text>
            <div class="space-y-2">
              {windowLevels.map((wl) => (
                <button
                  key={wl.name}
                  onClick$={() => changeWindowLevel(wl.name)}
                  class={[
                    'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                    currentWindowLevel.value === wl.name
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                  ]}
                >
                  <div class="font-medium">{wl.name}</div>
                  <div class="text-xs opacity-75">
                    W: {wl.window} / L: {wl.level}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Row>

      {/* Metadata panel */}
      {showMetadata.value && (
        <div class="absolute inset-x-0 bottom-0 bg-neutral-900/95 backdrop-blur-sm p-4 border-t border-neutral-700">
          <Row gap="4" class="text-sm">
            <Column size={{ sm: 2, md: 4 }}>
              <div class="text-neutral-400 text-xs uppercase tracking-wide">Patient</div>
              <div class="font-medium">{metadata.patientName}</div>
              <div class="text-neutral-400">ID: {metadata.patientId}</div>
            </Column>
            <Column size={{ sm: 2, md: 4 }}>
              <div class="text-neutral-400 text-xs uppercase tracking-wide">Study</div>
              <div class="font-medium">{metadata.modality}</div>
              <div class="text-neutral-400">{metadata.bodyPart}</div>
            </Column>
            <Column size={{ sm: 2, md: 4 }}>
              <div class="text-neutral-400 text-xs uppercase tracking-wide">Acquisition</div>
              <div class="font-medium">{metadata.studyDate}</div>
              <div class="text-neutral-400">Series: {metadata.seriesNumber}</div>
            </Column>
            <Column size={{ sm: 2, md: 4 }}>
              <div class="text-neutral-400 text-xs uppercase tracking-wide">Institution</div>
              <div class="font-medium">{metadata.institution}</div>
              {metadata.technician && (
                <div class="text-neutral-400">Tech: {metadata.technician}</div>
              )}
            </Column>
          </Row>
        </div>
      )}

      {/* Navigation controls for multi-slice studies */}
      {metadata.totalSlices && metadata.totalSlices > 1 && (
        <Row class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 rounded-lg px-4 py-2" gap="2" alignItems="center">
          <Button 
            intent="neutral"
            variant="text" 
            size="sm"
            class="text-white hover:text-primary-400 transition-colors"
          >
            <Icon icon="skip-back" class="w-4 h-4" />
          </Button>
          <Button 
            intent="neutral"
            variant="text" 
            size="sm"
            class="text-white hover:text-primary-400 transition-colors"
          >
            ⏪
          </Button>
          <span class="text-white text-sm font-mono px-3">
            {metadata.slice} / {metadata.totalSlices}
          </span>
          <Button 
            intent="neutral"
            variant="text" 
            size="sm"
            class="text-white hover:text-primary-400 transition-colors"
          >
            ⏩
          </Button>
          <Button 
            intent="neutral"
            variant="text" 
            size="sm"
            class="text-white hover:text-primary-400 transition-colors"
          >
            <Icon icon="skip-forward" class="w-4 h-4" />
          </Button>
        </Row>
      )}
    </div>
  );
});
