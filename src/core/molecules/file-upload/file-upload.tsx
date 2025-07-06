import { component$, useSignal, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Spinner } from "../../atoms/spinner/spinner";
import { Button } from "../../atoms/button/button";
import { Icon } from "../../atoms/icon";
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";
import { Stack } from "../../../layouts/stack";

export interface FileUploadProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFileSelect$?: (files: File[]) => void;
  onFileRemove$?: (index: number) => void;
  onUpload$?: (files: File[]) => Promise<void>;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: "dropzone" | "button" | "inline";
  testId?: string;
}

interface FileWithDemo {
  file: File;
  demo?: string;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
}

export const FileUpload = component$<FileUploadProps>(({
  accept = "*/*",
  multiple = false,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  onFileSelect$,
  onFileRemove$,
  onUpload$,
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  variant = "dropzone",
  testId,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  const files = useSignal<FileWithDemo[]>([]);
  const isDragOver = useSignal(false);
  const isUploading = useSignal(false);

  const validateFile = $((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept !== "*/*" && !accept.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  });

  const handleFileSelect = $(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithDemo[] = [];
    const existingCount = files.value.length;

    for (let i = 0; i < selectedFiles.length; i++) {
      if (existingCount + newFiles.length >= maxFiles) {
        break;
      }

      const file = selectedFiles[i];
      const validationError = await validateFile(file);

      if (validationError) {
        newFiles.push({
          file,
          status: "error",
          error: validationError
        });
      } else {
        // Create demo for images
        let demo: string | undefined;
        if (file.type.startsWith('image/')) {
          demo = URL.createObjectURL(file);
        }

        newFiles.push({
          file,
          demo,
          status: "pending"
        });
      }
    }

    files.value = [...files.value, ...newFiles];
    onFileSelect$?.(newFiles.map(f => f.file));
  });

  const handleRemoveFile = $((index: number) => {
    const fileToRemove = files.value[index];
    if (fileToRemove.demo) {
      URL.revokeObjectURL(fileToRemove.demo);
    }
    
    files.value = files.value.filter((_, i) => i !== index);
    onFileRemove$?.(index);
  });

  const handleUpload = $(async () => {
    if (!onUpload$ || files.value.length === 0) return;

    isUploading.value = true;
    const filesToUpload = files.value.filter(f => f.status === "pending").map(f => f.file);

    try {
      // Update status to uploading
      files.value = files.value.map(f => 
        f.status === "pending" ? { ...f, status: "uploading" as const, progress: 0 } : f
      );

      await onUpload$(filesToUpload);

      // Update status to success
      files.value = files.value.map(f => 
        f.status === "uploading" ? { ...f, status: "success" as const, progress: 100 } : f
      );
    } catch {
      // Update status to error
      files.value = files.value.map(f => 
        f.status === "uploading" ? { 
          ...f, 
          status: "error" as const, 
          error: "Upload failed" 
        } : f
      );
    } finally {
      isUploading.value = false;
    }
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return "eye" as const;
    if (file.type.includes('pdf')) return "file-text" as const;
    if (file.type.includes('word')) return "file-text" as const;
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return "file-text" as const;
    return "file-text" as const;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (variant === "dropzone") {
    return (
      <Stack 
        class={mergeClasses("space-y-4", qwikClass, className)}
        style={style}
        gap="4"
        {...rest}
      >
        {label && (
          <Column>
            <label class="block text-sm font-medium text-neutral-darker">
              {label}
              {required && <span class="text-error ml-1">*</span>}
            </label>
          </Column>
        )}

        <Column
          class={mergeClasses(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragOver.value 
              ? "border-primary bg-primary-lighter" 
              : error 
              ? "border-error bg-error-lighter"
              : "border-neutral-light hover:border-neutral",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver$={(e) => {
            e.preventDefault();
            if (!disabled) isDragOver.value = true;
          }}
          onDragLeave$={() => isDragOver.value = false}
          onDrop$={(e) => {
            e.preventDefault();
            isDragOver.value = false;
            if (!disabled) {
              const dragEvent = e as DragEvent;
              handleFileSelect(dragEvent.dataTransfer?.files || null);
            }
          }}
          data-testid={testId}
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange$={(e) => handleFileSelect((e.target as HTMLInputElement).files)}
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <Stack gap="4" alignItems="center">
            <Column alignItems="center" justifyContent="center" class="mx-auto w-16 h-16 bg-neutral-lighter rounded-full">
              <Icon icon="upload" class="text-2xl text-neutral" />
            </Column>
            
            <Stack alignItems="center" gap="2">
              <p class="text-lg font-medium text-neutral-darker">
                Drop files here or <span class="text-primary">browse</span>
              </p>
              <p class="text-sm text-neutral">
                {accept === "*/*" ? "Any file type" : `Accepted: ${accept}`}
                {maxSize && ` • Max size: ${maxSize}MB`}
                {multiple && ` • Max files: ${maxFiles}`}
              </p>
            </Stack>
          </Stack>
        </Column>

        {files.value.length > 0 && (
          <Stack gap="3">
            <h4 class="font-medium text-neutral-darker">Selected Files</h4>
            <Stack gap="2">
              {files.value.map((fileItem, index) => (
                <Row key={index} alignItems="center" justifyContent="between" class="p-3 bg-neutral-lighter rounded-lg">
                  <Row alignItems="center" gap="3">
                    {fileItem.demo ? (
                      <img src={fileItem.demo} alt="Demo" class="w-10 h-10 object-cover rounded" width="40" height="40" />
                    ) : (
                      <Column alignItems="center" justifyContent="center" class="w-10 h-10 bg-white rounded">
                        <Icon icon={getFileIcon(fileItem.file)} class="text-neutral" />
                      </Column>
                    )}
                    
                    <Column class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-neutral-darker truncate">
                        {fileItem.file.name}
                      </p>
                      <p class="text-xs text-neutral">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      {fileItem.error && (
                        <p class="text-xs text-error">{fileItem.error}</p>
                      )}
                    </Column>
                  </Row>

                  <Row alignItems="center" gap="2">
                    {fileItem.status === "uploading" && (
                      <Spinner size="sm" variant="circular" color="primary" />
                    )}
                    {fileItem.status === "success" && (
                      <Icon icon="check-circle" class="text-success" />
                    )}
                    {fileItem.status === "error" && (
                      <Icon icon="x-circle" class="text-error" />
                    )}
                    
                    <Button
                      type="button"
                      onClick$={() => handleRemoveFile(index)}
                      disabled={fileItem.status === "uploading"}
                      variant="text"
                      size="sm"
                      class="p-1 text-neutral hover:text-error disabled:opacity-50"
                      aria-label="Remove file"
                    >
                      <Icon icon="x-circle" />
                    </Button>
                  </Row>
                </Row>
              ))}
            </Stack>

            {onUpload$ && files.value.some(f => f.status === "pending") && (
              <Button
                type="button"
                onClick$={handleUpload}
                disabled={isUploading.value}
                variant="elevated"
                fullWidth
                class="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading.value ? (
                  <Row alignItems="center" justifyContent="center" gap="2">
                    <Spinner size="sm" variant="circular" color="white" />
                    <span>Uploading...</span>
                  </Row>
                ) : (
                  <Row alignItems="center" gap="2">
                    <Icon icon="upload" />
                    Upload Files
                  </Row>
                )}
              </Button>
            )}
          </Stack>
        )}

        {(error || helperText) && (
          <Column gap="2">
            {error && (
              <Row alignItems="center" class="text-sm text-error">
                <Icon icon="alert-triangle" class="mr-1" />
                {error}
              </Row>
            )}
            {helperText && !error && (
              <Column class="text-sm text-neutral">{helperText}</Column>
            )}
          </Column>
        )}
      </Stack>
    );
  }

  // Button variant (simplified for brevity)
  return (
    <div class="themed-content">
      <Stack 
        class={mergeClasses("space-y-4", qwikClass, className)}
        style={style}
        gap="4"
        {...rest}
      >
      {label && (
        <Column>
          <label class="block text-sm font-medium text-neutral-darker">
            {label}
            {required && <span class="text-error ml-1">*</span>}
          </label>
        </Column>
      )}
      
      <Column class="relative">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange$={(e) => handleFileSelect((e.target as HTMLInputElement).files)}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          data-testid={testId}
        />
        <Button
          type="button"
          disabled={disabled}
          variant="outlined"
          class="inline-flex items-center px-4 py-2 disabled:opacity-50"
        >
          <Row alignItems="center" gap="2">
            <Icon icon="upload" />
            Choose Files
          </Row>
        </Button>
      </Column>
      </Stack>
    </div>
  );
});

// Medical Document Upload - Healthcare specific preset
export const MedicalDocumentUpload = component$<Omit<FileUploadProps, 'accept' | 'variant'> & {
  documentType?: "prescription" | "lab-result" | "imaging" | "insurance" | "general";
}>(({ documentType = "general", ...props }) => {
  const acceptTypes = {
    prescription: ".pdf,.jpg,.jpeg,.png",
    "lab-result": ".pdf,.jpg,.jpeg,.png",
    imaging: ".dcm,.jpg,.jpeg,.png,.pdf",
    insurance: ".pdf,.jpg,.jpeg,.png",
    general: ".pdf,.doc,.docx,.jpg,.jpeg,.png"
  };

  const documentLabels = {
    prescription: "Upload Prescription",
    "lab-result": "Upload Lab Results", 
    imaging: "Upload Medical Images",
    insurance: "Upload Insurance Documents",
    general: "Upload Medical Documents"
  };

  return (
    <div class="themed-content">
      <FileUpload
        {...props}
        accept={acceptTypes[documentType]}
        label={props.label || documentLabels[documentType]}
        variant="dropzone"
        helperText={props.helperText || `Upload ${documentType.replace('-', ' ')} files (PDF, Images)`}
      />
    </div>
  );
});
