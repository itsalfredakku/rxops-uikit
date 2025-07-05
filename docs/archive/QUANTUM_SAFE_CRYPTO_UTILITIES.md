# Quantum-Safe Crypto Utilities - UI Kit

## 🎯 Overview

Client-side quantum-safe cryptographic utilities for the RxOps UI Kit. This provides secure encryption capabilities for frontend applications including user, provider, and team portals.

## 📋 Implementation Scope

### Core Utilities
- **Form Data Encryption**: Encrypt sensitive form inputs before API transmission
- **Local Storage Security**: Protect cached patient data and session tokens
- **File Upload Encryption**: Secure medical document uploads
- **Session Management**: Quantum-safe client session handling

## 🛠️ Technical Implementation

### Dependencies to Add

```json
// Add to package.json
{
  "dependencies": {
    "pqcrypto.js": "^1.0.0",
    "libsodium-wrappers": "^0.7.11",
    "buffer": "^6.0.3"
  },
  "devDependencies": {
    "@types/libsodium-wrappers": "^0.7.11"
  }
}
```

### 1. Crypto Utilities Module

Create `src/utils/crypto/index.ts`:

```typescript
export { QuantumSafeCrypto } from './quantum-safe';
export { FormEncryption } from './form-encryption';
export { SecureStorage } from './secure-storage';
export { FileEncryption } from './file-encryption';
export type { 
  EncryptedData, 
  KeyPair, 
  EncryptionOptions 
} from './types';
```

### 2. Core Quantum-Safe Implementation

Create `src/utils/crypto/quantum-safe.ts`:

```typescript
import { Buffer } from 'buffer';

export interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface EncryptedData {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  algorithm: 'kyber1024' | 'dilithium5';
}

export class QuantumSafeCrypto {
  private static instance: QuantumSafeCrypto;
  private initialized = false;

  static getInstance(): QuantumSafeCrypto {
    if (!QuantumSafeCrypto.instance) {
      QuantumSafeCrypto.instance = new QuantumSafeCrypto();
    }
    return QuantumSafeCrypto.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize quantum-safe crypto libraries
    // Implementation with pqcrypto.js
    this.initialized = true;
  }

  async generateKeyPair(): Promise<KeyPair> {
    await this.initialize();
    
    // Generate Kyber-1024 keypair for encryption
    // Implementation details...
    
    return {
      publicKey: new Uint8Array(), // Replace with actual key
      secretKey: new Uint8Array()  // Replace with actual key
    };
  }

  async encrypt(
    data: string | Uint8Array, 
    publicKey: Uint8Array
  ): Promise<EncryptedData> {
    await this.initialize();
    
    const dataBytes = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : data;
    
    // Implement Kyber-1024 encryption
    // Implementation details...
    
    return {
      ciphertext: new Uint8Array(), // Replace with actual ciphertext
      nonce: new Uint8Array(),      // Replace with actual nonce
      algorithm: 'kyber1024'
    };
  }

  async decrypt(
    encryptedData: EncryptedData, 
    secretKey: Uint8Array
  ): Promise<Uint8Array> {
    await this.initialize();
    
    // Implement Kyber-1024 decryption
    // Implementation details...
    
    return new Uint8Array(); // Replace with actual decrypted data
  }
}
```

### 3. Form Data Encryption

Create `src/utils/crypto/form-encryption.ts`:

```typescript
import { QuantumSafeCrypto, type EncryptedData } from './quantum-safe';

export interface EncryptedFormData {
  [fieldName: string]: {
    encrypted: EncryptedData;
    isEncrypted: true;
  } | any;
}

export class FormEncryption {
  private crypto = QuantumSafeCrypto.getInstance();
  private serverPublicKey?: Uint8Array;

  async setServerPublicKey(publicKey: Uint8Array): Promise<void> {
    this.serverPublicKey = publicKey;
  }

  async encryptSensitiveFields(
    formData: Record<string, any>,
    sensitiveFields: string[]
  ): Promise<EncryptedFormData> {
    if (!this.serverPublicKey) {
      throw new Error('Server public key not set');
    }

    const result: EncryptedFormData = { ...formData };

    for (const fieldName of sensitiveFields) {
      if (formData[fieldName] !== undefined) {
        const encrypted = await this.crypto.encrypt(
          String(formData[fieldName]),
          this.serverPublicKey
        );
        
        result[fieldName] = {
          encrypted,
          isEncrypted: true as const
        };
      }
    }

    return result;
  }

  // Healthcare-specific field encryption
  async encryptPatientData(patientData: {
    firstName?: string;
    lastName?: string;
    ssn?: string;
    dateOfBirth?: string;
    medicalHistory?: string;
    [key: string]: any;
  }): Promise<EncryptedFormData> {
    const sensitiveFields = [
      'ssn',
      'dateOfBirth', 
      'medicalHistory',
      'insurance',
      'emergencyContact'
    ];

    return this.encryptSensitiveFields(patientData, sensitiveFields);
  }
}
```

### 4. Secure Local Storage

Create `src/utils/crypto/secure-storage.ts`:

```typescript
import { QuantumSafeCrypto, type KeyPair } from './quantum-safe';

export class SecureStorage {
  private crypto = QuantumSafeCrypto.getInstance();
  private userKeyPair?: KeyPair;

  async initializeUserSession(): Promise<void> {
    // Generate or retrieve user-specific keypair
    this.userKeyPair = await this.crypto.generateKeyPair();
  }

  async setSecureItem(key: string, value: any): Promise<void> {
    if (!this.userKeyPair) {
      throw new Error('User session not initialized');
    }

    const encrypted = await this.crypto.encrypt(
      JSON.stringify(value),
      this.userKeyPair.publicKey
    );

    localStorage.setItem(key, JSON.stringify({
      encrypted: Array.from(encrypted.ciphertext),
      nonce: Array.from(encrypted.nonce),
      algorithm: encrypted.algorithm
    }));
  }

  async getSecureItem<T>(key: string): Promise<T | null> {
    if (!this.userKeyPair) {
      throw new Error('User session not initialized');
    }

    const stored = localStorage.getItem(key);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      const encryptedData = {
        ciphertext: new Uint8Array(parsed.encrypted),
        nonce: new Uint8Array(parsed.nonce),
        algorithm: parsed.algorithm
      };

      const decrypted = await this.crypto.decrypt(
        encryptedData,
        this.userKeyPair.secretKey
      );

      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (error) {
      console.error('Failed to decrypt stored data:', error);
      return null;
    }
  }

  // Healthcare-specific secure storage
  async storePatientSession(sessionData: {
    patientId: string;
    accessToken: string;
    permissions: string[];
  }): Promise<void> {
    await this.setSecureItem('patient_session', sessionData);
  }

  async getPatientSession(): Promise<{
    patientId: string;
    accessToken: string;
    permissions: string[];
  } | null> {
    return this.getSecureItem('patient_session');
  }
}
```

### 5. File Upload Encryption

Create `src/utils/crypto/file-encryption.ts`:

```typescript
import { QuantumSafeCrypto } from './quantum-safe';

export interface EncryptedFile {
  encryptedContent: Uint8Array;
  fileName: string;
  fileType: string;
  size: number;
  checksum: string;
}

export class FileEncryption {
  private crypto = QuantumSafeCrypto.getInstance();

  async encryptFile(
    file: File, 
    serverPublicKey: Uint8Array
  ): Promise<EncryptedFile> {
    const fileContent = new Uint8Array(await file.arrayBuffer());
    
    const encrypted = await this.crypto.encrypt(fileContent, serverPublicKey);
    
    // Generate checksum for integrity verification
    const checksum = await this.generateChecksum(fileContent);
    
    return {
      encryptedContent: encrypted.ciphertext,
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      checksum
    };
  }

  private async generateChecksum(data: Uint8Array): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Healthcare-specific file encryption
  async encryptMedicalDocument(
    file: File,
    patientId: string,
    serverPublicKey: Uint8Array
  ): Promise<EncryptedFile & { patientId: string }> {
    const encrypted = await this.encryptFile(file, serverPublicKey);
    
    return {
      ...encrypted,
      patientId
    };
  }
}
```

## 🔗 UI Kit Integration

### 1. Hook for Form Encryption

Create `src/hooks/useFormEncryption.ts`:

```typescript
import { useState, useCallback } from 'react';
import { FormEncryption } from '../utils/crypto/form-encryption';

export const useFormEncryption = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [formEncryption] = useState(() => new FormEncryption());

  const encryptForm = useCallback(async (
    formData: Record<string, any>,
    sensitiveFields: string[]
  ) => {
    setIsEncrypting(true);
    try {
      return await formEncryption.encryptSensitiveFields(formData, sensitiveFields);
    } finally {
      setIsEncrypting(false);
    }
  }, [formEncryption]);

  return {
    encryptForm,
    isEncrypting
  };
};
```

### 2. Secure Input Component

Create `src/core/atoms/secure-input/secure-input.tsx`:

```typescript
import { component$, useSignal, $ } from '@builder.io/qwik';
import { Input } from '../input/input';
import { FormEncryption } from '../../../utils/crypto/form-encryption';

export interface SecureInputProps {
  name: string;
  label: string;
  type?: 'text' | 'password' | 'email';
  autoEncrypt?: boolean;
  onEncryptedChange$?: (encryptedValue: any) => void;
}

export const SecureInput = component$<SecureInputProps>((props) => {
  const { name, label, type = 'text', autoEncrypt = false, onEncryptedChange$ } = props;
  const value = useSignal('');
  const isEncrypting = useSignal(false);

  const handleChange = $(async (newValue: string) => {
    value.value = newValue;
    
    if (autoEncrypt && onEncryptedChange$) {
      isEncrypting.value = true;
      try {
        const formEncryption = new FormEncryption();
        // Get server public key from context or API
        const encrypted = await formEncryption.encryptSensitiveFields(
          { [name]: newValue },
          [name]
        );
        onEncryptedChange$(encrypted[name]);
      } finally {
        isEncrypting.value = false;
      }
    }
  });

  return (
    <div class="secure-input-wrapper">
      <Input
        name={name}
        label={label}
        type={type}
        value={value.value}
        onInput$={(_, target) => handleChange(target.value)}
        disabled={isEncrypting.value}
      />
      {isEncrypting.value && (
        <div class="text-xs text-gray-500 mt-1">
          🔒 Encrypting...
        </div>
      )}
    </div>
  );
});
```

## 📋 Implementation Checklist

### Phase 1: Core Utilities (Week 1)
- [ ] Add quantum-safe dependencies to package.json
- [ ] Create crypto utility modules
- [ ] Implement basic encryption/decryption
- [ ] Add TypeScript types and interfaces

### Phase 2: Form Integration (Week 2)
- [ ] Create form encryption utilities
- [ ] Implement secure input components
- [ ] Add React/Qwik hooks for encryption
- [ ] Test form data encryption flow

### Phase 3: Storage & Files (Week 3)
- [ ] Implement secure local storage
- [ ] Create file encryption utilities
- [ ] Add session management
- [ ] Performance optimization

## 🧪 Testing Strategy

```typescript
// src/utils/crypto/__tests__/quantum-safe.test.ts
import { QuantumSafeCrypto } from '../quantum-safe';

describe('QuantumSafeCrypto', () => {
  let crypto: QuantumSafeCrypto;

  beforeAll(async () => {
    crypto = QuantumSafeCrypto.getInstance();
    await crypto.initialize();
  });

  test('generates valid keypair', async () => {
    const keypair = await crypto.generateKeyPair();
    expect(keypair.publicKey.length).toBeGreaterThan(0);
    expect(keypair.secretKey.length).toBeGreaterThan(0);
  });

  test('encrypts and decrypts data correctly', async () => {
    const keypair = await crypto.generateKeyPair();
    const originalData = 'sensitive patient data';
    
    const encrypted = await crypto.encrypt(originalData, keypair.publicKey);
    const decrypted = await crypto.decrypt(encrypted, keypair.secretKey);
    
    expect(new TextDecoder().decode(decrypted)).toBe(originalData);
  });
});
```

## 📚 Usage Examples

### Patient Form Encryption
```typescript
// In a patient registration form
const { encryptForm } = useFormEncryption();

const handleSubmit = async (formData) => {
  const encrypted = await encryptForm(formData, [
    'ssn', 'dateOfBirth', 'medicalHistory'
  ]);
  
  // Send encrypted data to API
  await api.post('/patients', encrypted);
};
```

### Secure Session Storage
```typescript
// Store sensitive session data
const secureStorage = new SecureStorage();
await secureStorage.initializeUserSession();
await secureStorage.storePatientSession({
  patientId: '12345',
  accessToken: 'jwt-token',
  permissions: ['read:medical-records']
});
```

---

📎 **Reference**: [Main Quantum-Safe Documentation](../docs/quantum_safe_encryption_plan.md)
