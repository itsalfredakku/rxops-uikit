/**
 * HIPAA Compliance & Security Foundation
 * Healthcare data protection and privacy utilities
 */

// HIPAA compliance requirements
export const HIPAA_REQUIREMENTS = {
  // Administrative Safeguards (§164.308)
  administrative: {
    accessManagement: true,
    workforceTraining: true,
    accessReview: true,
    securityOfficer: true,
  },
  
  // Physical Safeguards (§164.310)
  physical: {
    facilityAccess: true,
    workstationAccess: true,
    deviceControls: true,
    mediaControls: true,
  },
  
  // Technical Safeguards (§164.312)
  technical: {
    accessControl: true,
    auditControls: true,
    integrity: true,
    transmissionSecurity: true,
  },
  
  // PHI Protection Requirements
  phi: {
    minimumNecessary: true,
    deIdentification: true,
    encryption: true,
    auditLogging: true,
    sessionTimeout: 20 * 60 * 1000, // 20 minutes
  },
} as const;

// PHI (Protected Health Information) data types
export type PHIDataType = 
  | 'name'
  | 'ssn'
  | 'dob'
  | 'address'
  | 'phone'
  | 'email'
  | 'mrn' // Medical Record Number
  | 'insurance'
  | 'diagnosis'
  | 'medication'
  | 'vitals'
  | 'image'
  | 'document';

// User roles with different PHI access levels
export type UserRole = 
  | 'patient'
  | 'provider'
  | 'nurse'
  | 'admin'
  | 'technician'
  | 'billing'
  | 'researcher'
  | 'guest';

// PHI access permissions by role
export const PHI_PERMISSIONS: Record<UserRole, PHIDataType[]> = {
  patient: ['name', 'dob', 'address', 'phone', 'email', 'diagnosis', 'medication', 'vitals'],
  provider: ['name', 'ssn', 'dob', 'address', 'phone', 'email', 'mrn', 'insurance', 'diagnosis', 'medication', 'vitals', 'image', 'document'],
  nurse: ['name', 'dob', 'phone', 'email', 'mrn', 'diagnosis', 'medication', 'vitals'],
  admin: ['name', 'dob', 'address', 'phone', 'email', 'mrn', 'insurance'],
  technician: ['name', 'mrn', 'vitals', 'image'],
  billing: ['name', 'dob', 'address', 'phone', 'insurance'],
  researcher: [], // De-identified data only
  guest: [], // No PHI access
};

// PHI masking utilities
export class PHIMasker {
  // Mask different types of PHI data
  static maskData(data: string, type: PHIDataType, userRole: UserRole): string {
    // Check if user has permission to view this data type
    if (!PHI_PERMISSIONS[userRole].includes(type)) {
      return this.getFullMask(type);
    }
    
    // Apply role-appropriate masking
    switch (type) {
      case 'ssn':
        return userRole === 'provider' || userRole === 'admin' ? data : this.maskSSN(data);
      case 'name':
        return userRole === 'researcher' ? this.maskName(data) : data;
      case 'dob':
        return userRole === 'researcher' ? this.maskDate(data) : data;
      case 'phone':
        return this.maskPhone(data);
      case 'email':
        return this.maskEmail(data);
      case 'address':
        return userRole === 'researcher' ? this.maskAddress(data) : data;
      case 'mrn':
        return userRole === 'patient' ? this.maskMRN(data) : data;
      default:
        return data;
    }
  }
  
  private static maskSSN(ssn: string): string {
    return ssn.replace(/\d{3}-\d{2}-(\d{4})/, 'XXX-XX-$1');
  }
  
  private static maskName(name: string): string {
    const parts = name.split(' ');
    return parts.map((part, index) => 
      index === 0 ? part.charAt(0) + '***' : '***'
    ).join(' ');
  }
  
  private static maskDate(date: string): string {
    // Show only year for research purposes
    return date.replace(/(\d{4})-\d{2}-\d{2}/, '$1-XX-XX');
  }
  
  private static maskPhone(phone: string): string {
    return phone.replace(/(\d{3})-(\d{3})-(\d{4})/, '$1-$2-XXXX');
  }
  
  private static maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    const maskedUser = user.charAt(0) + '***' + user.slice(-1);
    return `${maskedUser}@${domain}`;
  }
  
  private static maskAddress(address: string): string {
    // Keep city and state, mask street address
    return address.replace(/^[^,]+/, '*** STREET ADDRESS ***');
  }
  
  private static maskMRN(mrn: string): string {
    return 'MRN-' + '*'.repeat(mrn.length - 4);
  }
  
  private static getFullMask(type: PHIDataType): string {
    const masks = {
      name: '[NAME PROTECTED]',
      ssn: '[SSN PROTECTED]',
      dob: '[DOB PROTECTED]',
      address: '[ADDRESS PROTECTED]',
      phone: '[PHONE PROTECTED]',
      email: '[EMAIL PROTECTED]',
      mrn: '[MRN PROTECTED]',
      insurance: '[INSURANCE PROTECTED]',
      diagnosis: '[DIAGNOSIS PROTECTED]',
      medication: '[MEDICATION PROTECTED]',
      vitals: '[VITALS PROTECTED]',
      image: '[IMAGE PROTECTED]',
      document: '[DOCUMENT PROTECTED]',
    };
    return masks[type] || '[DATA PROTECTED]';
  }
}

// Audit logging for HIPAA compliance
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: 'view' | 'create' | 'update' | 'delete' | 'print' | 'export' | 'login' | 'logout';
  resource: string;
  phiAccessed?: PHIDataType[];
  patientId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: string;
}

export class HIPAAAuditLogger {
  private static instance: HIPAAAuditLogger;
  private logs: AuditLogEntry[] = [];
  
  static getInstance(): HIPAAAuditLogger {
    if (!HIPAAAuditLogger.instance) {
      HIPAAAuditLogger.instance = new HIPAAAuditLogger();
    }
    return HIPAAAuditLogger.instance;
  }
  
  // Log PHI access
  logPHIAccess(
    userId: string,
    userRole: UserRole,
    action: AuditLogEntry['action'],
    resource: string,
    phiTypes: PHIDataType[],
    patientId?: string,
    success: boolean = true,
    details?: string
  ): void {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      resource,
      phiAccessed: phiTypes,
      patientId,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      success,
      details,
    };
    
    this.logs.push(entry);
    
    // Send to secure audit server (in production)
    this.sendToAuditServer(entry);
    
    // Log to console for development
    console.log('[HIPAA Audit]', entry);
  }
  
  // Log security events
  logSecurityEvent(
    userId: string,
    userRole: UserRole,
    event: 'unauthorized-access' | 'failed-login' | 'session-timeout' | 'data-breach',
    details: string
  ): void {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action: 'view', // Default action for security events
      resource: 'security',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      success: false,
      details: `SECURITY EVENT: ${event} - ${details}`,
    };
    
    this.logs.push(entry);
    this.sendToAuditServer(entry);
    
    // Alert security team for critical events
    if (event === 'data-breach' || event === 'unauthorized-access') {
      this.alertSecurityTeam(entry);
    }
  }
  
  // Log component access for accordion and other UI interactions
  logAccess(details: {
    action: string;
    component: string;
    itemId?: string;
    category?: string;
    patientId?: string;
    timestamp: string;
  }): void {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: details.timestamp,
      userId: 'current-user', // Should be injected from auth context
      userRole: 'provider', // Should be injected from auth context
      action: 'view',
      resource: `${details.component}${details.itemId ? `:${details.itemId}` : ''}`,
      patientId: details.patientId,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      success: true,
      details: `Component access: ${details.action} ${details.category || 'general'}`,
    };
    
    this.logs.push(entry);
    this.sendToAuditServer(entry);
    console.log('[HIPAA Audit]', entry);
  }

  // Log progress tracking for healthcare metrics
  logProgress(details: {
    type: string;
    value: number;
    percentage: number;
    patientId?: string;
    critical?: boolean;
    timestamp: string;
  }): void {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: details.timestamp,
      userId: 'current-user', // Should be injected from auth context
      userRole: 'provider', // Should be injected from auth context
      action: 'update',
      resource: `progress:${details.type}`,
      patientId: details.patientId,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      success: true,
      details: `Progress update: ${details.value} (${details.percentage}%)${details.critical ? ' [CRITICAL]' : ''}`,
    };
    
    this.logs.push(entry);
    this.sendToAuditServer(entry);
    console.log('[HIPAA Audit]', entry);
  }

  // Get audit logs for compliance reporting
  getAuditLogs(
    startDate?: string,
    endDate?: string,
    userId?: string,
    patientId?: string
  ): AuditLogEntry[] {
    return this.logs.filter(log => {
      if (startDate && log.timestamp < startDate) return false;
      if (endDate && log.timestamp > endDate) return false;
      if (userId && log.userId !== userId) return false;
      if (patientId && log.patientId !== patientId) return false;
      return true;
    });
  }
  
  // Generate compliance report
  // Generate compliance report
  generateComplianceReport(
    startDate?: string,
    endDate?: string
  ): {
    summary: {
      totalAccess: number;
      uniqueUsers: number;
      patientsAccessed: number;
      securityEvents: number;
    };
    topAccessedResources: Array<{ resource: string; count: number }>;
    securityEvents: AuditLogEntry[];
    recommendations: string[];
  } {
    const logs = this.getAuditLogs(startDate, endDate);
    
    // Top accessed resources
    const resourceCounts = logs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topAccessedResources = Object.entries(resourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));
    
    const securityEvents = logs.filter(l => l.details?.includes('SECURITY EVENT'));
    
    const recommendations = this.generateSecurityRecommendations(logs);
    
    return {
      summary: {
        totalAccess: logs.length,
        uniqueUsers: new Set(logs.map(l => l.userId)).size,
        patientsAccessed: new Set(logs.map(l => l.patientId).filter(Boolean)).size,
        securityEvents: logs.filter(l => l.details?.includes('SECURITY EVENT')).length,
      },
      topAccessedResources,
      securityEvents,
      recommendations,
    };
  }
  
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getClientIP(): string {
    // In production, this would get the real client IP
    return '127.0.0.1';
  }
  
  private sendToAuditServer(entry: AuditLogEntry): void {
    // In production, send to secure audit server
    // For development, just store locally (only in browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`hipaa_audit_${entry.id}`, JSON.stringify(entry));
    }
  }
  
  private alertSecurityTeam(entry: AuditLogEntry): void {
    // In production, send alert to security team
    console.error('[SECURITY ALERT]', entry);
  }
  
  private generateSecurityRecommendations(logs: AuditLogEntry[]): string[] {
    const recommendations: string[] = [];
    
    const failedLogins = logs.filter(l => l.action === 'login' && !l.success).length;
    if (failedLogins > 10) {
      recommendations.push('High number of failed login attempts detected. Consider implementing account lockout policies.');
    }
    
    const afterHoursAccess = logs.filter(l => {
      const hour = new Date(l.timestamp).getHours();
      return hour < 6 || hour > 22;
    }).length;
    
    if (afterHoursAccess > logs.length * 0.1) {
      recommendations.push('Significant after-hours access detected. Review access patterns and consider additional authentication.');
    }
    
    return recommendations;
  }
}

// Session management for HIPAA compliance
export class HIPAASessionManager {
  private static sessionTimeout = HIPAA_REQUIREMENTS.phi.sessionTimeout;
  private static warningTime = 5 * 60 * 1000; // 5 minutes before timeout
  private static timeoutId: number | null = null;
  private static warningId: number | null = null;
  
  // Start session timeout
  static startSession(userId: string, userRole: UserRole): void {
    this.clearTimeouts();
    
    // Set warning timeout
    this.warningId = window.setTimeout(() => {
      this.showTimeoutWarning();
    }, this.sessionTimeout - this.warningTime);
    
    // Set session timeout
    this.timeoutId = window.setTimeout(() => {
      this.endSession(userId, userRole, 'timeout');
    }, this.sessionTimeout);
    
    // Log session start
    HIPAAAuditLogger.getInstance().logPHIAccess(
      userId,
      userRole,
      'login',
      'session',
      [],
      undefined,
      true,
      'Session started'
    );
  }
  
  // Extend session on user activity
  static extendSession(): void {
    if (this.timeoutId) {
      this.clearTimeouts();
      // Restart timeout from current time
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.startSession(currentUser.id, currentUser.role);
      }
    }
  }
  
  // End session
  static endSession(userId: string, userRole: UserRole, reason: 'logout' | 'timeout'): void {
    this.clearTimeouts();
    
    // Log session end
    HIPAAAuditLogger.getInstance().logPHIAccess(
      userId,
      userRole,
      'logout',
      'session',
      [],
      undefined,
      true,
      `Session ended: ${reason}`
    );
    
    // Clear session data
    this.clearSessionData();
    
    // Redirect to login
    window.location.href = '/login';
  }
  
  private static clearTimeouts(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }
  
  private static showTimeoutWarning(): void {
    // Show timeout warning modal
    const warning = confirm(
      'Your session will expire in 5 minutes due to inactivity. Click OK to continue your session.'
    );
    
    if (warning) {
      this.extendSession();
    }
  }
  
  private static getCurrentUser(): { id: string; role: UserRole } | null {
    // In production, get from secure session storage
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }
  
  private static clearSessionData(): void {
    sessionStorage.clear();
    localStorage.removeItem('sessionToken');
  }
}

// Export singleton instances
export const hipaaAuditor = HIPAAAuditLogger.getInstance();
export const sessionManager = HIPAASessionManager;
