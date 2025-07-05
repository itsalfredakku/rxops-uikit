import { useSignal, useTask$, $ } from "@builder.io/qwik";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface UseValidationProps {
  rules?: ValidationRule;
  value: string;
}

export const useValidation = (props: UseValidationProps) => {
  const error = useSignal<string>("");
  const isValid = useSignal<boolean>(true);

  const validate = $((value: string) => {
    if (!props.rules) return true;
    
    const { required, minLength, maxLength, pattern, custom } = props.rules;
    
    // Required validation
    if (required && !value.trim()) {
      error.value = "This field is required";
      isValid.value = false;
      return false;
    }
    
    // Length validations
    if (minLength && value.length < minLength) {
      error.value = `Minimum ${minLength} characters required`;
      isValid.value = false;
      return false;
    }
    
    if (maxLength && value.length > maxLength) {
      error.value = `Maximum ${maxLength} characters allowed`;
      isValid.value = false;
      return false;
    }
    
    // Pattern validation
    if (pattern && !pattern.test(value)) {
      error.value = "Invalid format";
      isValid.value = false;
      return false;
    }
    
    // Custom validation
    if (custom) {
      const customError = custom(value);
      if (customError) {
        error.value = customError;
        isValid.value = false;
        return false;
      }
    }
    
    error.value = "";
    isValid.value = true;
    return true;
  });

  useTask$(({ track }) => {
    track(() => props.value);
    validate(props.value);
  });

  return { error, isValid, validate };
};

// Healthcare-specific validation rules
export const healthcareValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!value.includes('@')) return "Please enter a valid email address";
      return null;
    }
  },
  phone: {
    pattern: /^\+?[\d\s\-()]+$/,
    minLength: 10,
    custom: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length < 10) return "Phone number must be at least 10 digits";
      return null;
    }
  },
  medicalId: {
    pattern: /^[A-Z0-9]{6,12}$/,
    custom: (value: string) => {
      if (!/^[A-Z0-9]+$/.test(value)) return "Medical ID must contain only letters and numbers";
      return null;
    }
  }
};
