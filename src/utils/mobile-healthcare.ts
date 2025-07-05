/**
 * Mobile Optimization for Healthcare Workers
 * Touch-friendly interfaces, glove compatibility, and clinical workflow optimization
 */

// Mobile healthcare requirements
export const MOBILE_HEALTHCARE_TARGETS = {
  // Touch targets for gloved hands
  touch: {
    minimumSize: 44, // 44px minimum touch target
    recommendedSize: 48, // 48px recommended for gloves
    spacing: 8, // 8px minimum spacing between targets
    pressArea: 44, // Minimum press area
  },
  
  // Performance for clinical environments
  performance: {
    loadTime3G: 3000, // 3 seconds maximum on 3G
    loadTime4G: 1500, // 1.5 seconds maximum on 4G
    loadTimeWifi: 1000, // 1 second maximum on WiFi
    batterySaver: true, // Battery optimization required
  },
  
  // Clinical workflow optimization
  workflow: {
    oneHandOperation: true, // Must work with one hand
    quickActions: true, // Critical actions easily accessible
    gestureAlternatives: true, // Alternatives to complex gestures
    offlineCapability: 80, // 80% functionality offline
  },
  
  // Environmental considerations
  environment: {
    brightLighting: true, // Readable in bright OR lighting
    dimLighting: true, // Readable in dim patient rooms
    wetHands: true, // Usable with wet/sanitized hands
    gloveFriendly: true, // Works with medical gloves
  },
} as const;

// Mobile healthcare device detection
export class MobileHealthcareDetector {
  // Detect if device is likely used by healthcare workers
  static isHealthcareDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Common healthcare device indicators
    const healthcareIndicators = [
      'medicaltablet',
      'clinicalworkstation',
      'hospitaldevice',
      'medicaldevice',
    ];
    
    return healthcareIndicators.some(indicator => 
      userAgent.includes(indicator) || platform.includes(indicator)
    );
  }
  
  // Detect if user is likely wearing gloves
  static detectGloveUsage(): 'likely' | 'possible' | 'unlikely' {
    // Check for touch patterns that suggest glove usage
    const touchEvents = this.getTouchEventHistory();
    
    // Gloves typically result in:
    // - Larger touch areas
    // - Less precise touches
    // - Different pressure patterns
    
    if (touchEvents.averageTouchSize > 50) return 'likely';
    if (touchEvents.averageTouchSize > 35) return 'possible';
    return 'unlikely';
  }
  
  // Get device capabilities for healthcare
  static getHealthcareCapabilities(): {
    touchScreen: boolean;
    multiTouch: boolean;
    orientationLock: boolean;
    hapticFeedback: boolean;
    ambientLightSensor: boolean;
    proximityNensor: boolean;
    batteryStatus: boolean;
  } {
    return {
      touchScreen: 'ontouchstart' in window,
      multiTouch: 'TouchEvent' in window && navigator.maxTouchPoints > 1,
      orientationLock: 'orientation' in screen,
      hapticFeedback: 'vibrate' in navigator,
      ambientLightSensor: 'AmbientLightSensor' in window,
      proximityNensor: 'ProximitySensor' in window,
      batteryStatus: 'getBattery' in navigator,
    };
  }
  
  private static getTouchEventHistory(): { averageTouchSize: number; totalTouches: number } {
    // In a real implementation, this would track touch events
    // For now, return mock data
    return {
      averageTouchSize: 40,
      totalTouches: 100,
    };
  }
}

// Touch optimization utilities
export class TouchOptimizer {
  // Ensure minimum touch target size
  static ensureTouchTarget(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const minSize = MOBILE_HEALTHCARE_TARGETS.touch.minimumSize;
    
    if (rect.width < minSize || rect.height < minSize) {
      element.style.minWidth = `${minSize}px`;
      element.style.minHeight = `${minSize}px`;
      element.style.padding = `${Math.max(0, (minSize - rect.height) / 2)}px ${Math.max(0, (minSize - rect.width) / 2)}px`;
    }
  }
  
  // Add touch feedback for healthcare interactions
  static addTouchFeedback(element: HTMLElement, type: 'success' | 'error' | 'warning' = 'success'): void {
    // Visual feedback
    element.classList.add('touch-feedback');
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      const pattern = {
        success: [50],
        error: [100, 50, 100],
        warning: [75, 25, 75],
      };
      navigator.vibrate(pattern[type]);
    }
    
    // Audio feedback (optional, for accessibility)
    this.playAudioFeedback(type);
    
    // Remove visual feedback after animation
    setTimeout(() => {
      element.classList.remove('touch-feedback');
    }, 200);
  }
  
  // Optimize for one-handed operation
  static optimizeForOneHand(container: HTMLElement): void {
    // Move important actions to thumb-reachable areas
    const thumbZone = this.getThumbReachableArea();
    const criticalElements = container.querySelectorAll('[data-critical="true"]');
    
    criticalElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      this.moveToThumbZone(htmlElement, thumbZone);
    });
  }
  
  // Get thumb-reachable area for current device
  private static getThumbReachableArea(): { top: number; bottom: number; left: number; right: number } {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    
    // Typical thumb reach on mobile devices
    return {
      top: screenHeight * 0.3,
      bottom: screenHeight * 0.9,
      left: 0,
      right: screenWidth * 0.75, // Right-handed assumption
    };
  }
  
  private static moveToThumbZone(element: HTMLElement, thumbZone: any): void {
    // This would implement actual repositioning logic
    // For now, just add a class to indicate thumb-friendly positioning
    element.classList.add('thumb-friendly');
  }
  
  private static playAudioFeedback(type: 'success' | 'error' | 'warning'): void {
    // In a real implementation, play appropriate audio feedback
    // This is especially important in noisy healthcare environments
    if ('speechSynthesis' in window && type === 'error') {
      // For critical errors, use speech synthesis
      const utterance = new SpeechSynthesisUtterance('Error');
      utterance.volume = 0.3;
      utterance.rate = 1.5;
      speechSynthesis.speak(utterance);
    }
  }
}

// Gesture alternatives for healthcare workflows
export class GestureAlternatives {
  // Replace complex gestures with simple alternatives
  static simplifyGestures(element: HTMLElement): void {
    // Replace pinch-to-zoom with buttons
    this.addZoomButtons(element);
    
    // Replace swipe gestures with buttons
    this.addNavigationButtons(element);
    
    // Replace long press with double tap
    this.replaceComplexGestures(element);
  }
  
  private static addZoomButtons(element: HTMLElement): void {
    if (element.classList.contains('zoomable')) {
      const zoomControls = document.createElement('div');
      zoomControls.className = 'zoom-controls healthcare-touch';
      zoomControls.innerHTML = `
        <button class="zoom-in" data-action="zoom-in" aria-label="Zoom In">+</button>
        <button class="zoom-out" data-action="zoom-out" aria-label="Zoom Out">-</button>
      `;
      element.appendChild(zoomControls);
    }
  }
  
  private static addNavigationButtons(element: HTMLElement): void {
    if (element.classList.contains('swipeable')) {
      const navControls = document.createElement('div');
      navControls.className = 'nav-controls healthcare-touch';
      navControls.innerHTML = `
        <button class="nav-prev" data-action="previous" aria-label="Previous">‹</button>
        <button class="nav-next" data-action="next" aria-label="Next">›</button>
      `;
      element.appendChild(navControls);
    }
  }
  
  private static replaceComplexGestures(element: HTMLElement): void {
    // Replace long press with double tap or button
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(element);
    });
  }
  
  private static showContextMenu(element: HTMLElement): void {
    // Show accessible context menu instead of relying on long press
    const menu = document.createElement('div');
    menu.className = 'context-menu healthcare-accessible';
    menu.innerHTML = `
      <button data-action="edit">Edit</button>
      <button data-action="delete">Delete</button>
      <button data-action="share">Share</button>
    `;
    element.appendChild(menu);
    
    // Auto-remove after 5 seconds or on outside click
    setTimeout(() => menu.remove(), 5000);
  }
}

// Offline capability for healthcare workflows
export class HealthcareOfflineManager {
  private static offlineActions: Array<{ id: string; action: string; data: any; timestamp: string }> = [];
  
  // Cache critical healthcare data for offline use
  static cacheEssentialData(data: { 
    patientList: any[];
    medications: any[];
    protocols: any[];
    contacts: any[];
  }): void {
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.open('healthcare-essential').then(cache => {
        cache.put('/data/patients', new Response(JSON.stringify(data.patientList)));
        cache.put('/data/medications', new Response(JSON.stringify(data.medications)));
        cache.put('/data/protocols', new Response(JSON.stringify(data.protocols)));
        cache.put('/data/contacts', new Response(JSON.stringify(data.contacts)));
      });
    }
    
    // Also store in localStorage as fallback
    localStorage.setItem('healthcare-essential', JSON.stringify(data));
  }
  
  // Queue actions when offline
  static queueOfflineAction(action: string, data: any): string {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedAction = {
      id: actionId,
      action,
      data,
      timestamp: new Date().toISOString(),
    };
    
    this.offlineActions.push(queuedAction);
    localStorage.setItem('offline-actions', JSON.stringify(this.offlineActions));
    
    return actionId;
  }
  
  // Sync queued actions when back online
  static async syncOfflineActions(): Promise<void> {
    if (!navigator.onLine || this.offlineActions.length === 0) {
      return;
    }
    
    for (const action of this.offlineActions) {
      try {
        await this.executeAction(action);
        this.removeQueuedAction(action.id);
      } catch (error) {
        console.error('Failed to sync offline action:', action, error);
      }
    }
    
    localStorage.setItem('offline-actions', JSON.stringify(this.offlineActions));
  }
  
  // Get offline status and capabilities
  static getOfflineStatus(): {
    isOnline: boolean;
    queuedActions: number;
    cachedDataAvailable: boolean;
    essentialFunctionsAvailable: string[];
  } {
    const cachedData = localStorage.getItem('healthcare-essential');
    
    return {
      isOnline: navigator.onLine,
      queuedActions: this.offlineActions.length,
      cachedDataAvailable: !!cachedData,
      essentialFunctionsAvailable: [
        'view-patient-list',
        'view-medications',
        'view-protocols',
        'emergency-contacts',
        'basic-calculations',
      ],
    };
  }
  
  private static async executeAction(action: any): Promise<void> {
    // Execute the queued action
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync action: ${response.statusText}`);
    }
  }
  
  private static removeQueuedAction(actionId: string): void {
    this.offlineActions = this.offlineActions.filter(action => action.id !== actionId);
  }
}

// Environmental adaptation for healthcare settings
export class EnvironmentalAdapter {
  // Adapt display for different lighting conditions
  static adaptForLighting(): void {
    if ('AmbientLightSensor' in window) {
      // Use ambient light sensor if available
      this.useAmbientLightSensor();
    } else {
      // Provide manual brightness controls
      this.addBrightnessControls();
    }
  }
  
  // Optimize for different healthcare environments
  static optimizeForEnvironment(environment: 'or' | 'icu' | 'er' | 'clinic' | 'ambulance'): void {
    const optimizations = {
      or: {
        brightness: 'high',
        contrast: 'high',
        colors: 'muted',
        alerts: 'visual-only',
      },
      icu: {
        brightness: 'medium',
        contrast: 'high',
        colors: 'standard',
        alerts: 'low-volume',
      },
      er: {
        brightness: 'high',
        contrast: 'maximum',
        colors: 'high-contrast',
        alerts: 'all-channels',
      },
      clinic: {
        brightness: 'auto',
        contrast: 'standard',
        colors: 'standard',
        alerts: 'standard',
      },
      ambulance: {
        brightness: 'maximum',
        contrast: 'maximum',
        colors: 'emergency',
        alerts: 'tactile-priority',
      },
    };
    
    const config = optimizations[environment];
    this.applyEnvironmentConfig(config);
  }
  
  private static useAmbientLightSensor(): void {
    // Implementation would use the Ambient Light Sensor API
    // For now, simulate adaptive behavior
    const checkLighting = () => {
      const hour = new Date().getHours();
      const isDarkTime = hour < 7 || hour > 19;
      
      document.body.classList.toggle('low-light-mode', isDarkTime);
    };
    
    checkLighting();
    setInterval(checkLighting, 60000); // Check every minute
  }
  
  private static addBrightnessControls(): void {
    const controls = document.createElement('div');
    controls.className = 'brightness-controls healthcare-controls';
    controls.innerHTML = `
      <label for="brightness-slider">Display Brightness</label>
      <input type="range" id="brightness-slider" min="0.3" max="1" step="0.1" value="1">
    `;
    
    const slider = controls.querySelector('input') as HTMLInputElement;
    slider.addEventListener('input', (e) => {
      const brightness = (e.target as HTMLInputElement).value;
      document.body.style.filter = `brightness(${brightness})`;
      localStorage.setItem('healthcare-brightness', brightness);
    });
    
    // Restore saved brightness
    const savedBrightness = localStorage.getItem('healthcare-brightness');
    if (savedBrightness) {
      slider.value = savedBrightness;
      document.body.style.filter = `brightness(${savedBrightness})`;
    }
    
    document.body.appendChild(controls);
  }
  
  private static applyEnvironmentConfig(config: any): void {
    // Apply environment-specific optimizations
    document.body.className = `healthcare-environment-${config.colors}`;
    
    // Set appropriate CSS custom properties
    document.documentElement.style.setProperty('--healthcare-brightness', config.brightness);
    document.documentElement.style.setProperty('--healthcare-contrast', config.contrast);
  }
}

// Initialize mobile healthcare optimizations
export function initializeMobileHealthcare(): void {
  // Detect healthcare device
  if (MobileHealthcareDetector.isHealthcareDevice()) {
    document.body.classList.add('healthcare-device');
  }
  
  // Optimize all touch targets
  document.querySelectorAll('button, input, select, a').forEach(element => {
    TouchOptimizer.ensureTouchTarget(element as HTMLElement);
  });
  
  // Set up offline capability
  window.addEventListener('online', () => {
    HealthcareOfflineManager.syncOfflineActions();
  });
  
  // Adapt for environment
  EnvironmentalAdapter.adaptForLighting();
  
  // Add CSS for healthcare mobile optimization
  const style = document.createElement('style');
  style.textContent = `
    .healthcare-touch {
      min-height: 48px;
      min-width: 48px;
      margin: 4px;
    }
    
    .touch-feedback {
      background-color: rgba(59, 130, 246, 0.1);
      transform: scale(0.95);
      transition: all 0.1s ease;
    }
    
    .thumb-friendly {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .healthcare-device .small-touch-target {
      min-height: 48px !important;
      min-width: 48px !important;
    }
    
    .low-light-mode {
      filter: contrast(1.2) brightness(0.9);
    }
    
    @media (max-width: 768px) {
      .healthcare-controls {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.9);
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  `;
  document.head.appendChild(style);
}
