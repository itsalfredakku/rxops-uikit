import { component$, useSignal, useStore, $, type QRL } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Button } from '../../../core/atoms/button/button';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { Textarea } from '../../../core/atoms/textarea/textarea';
import { Input } from '../../../core/atoms/input/input';
import { FormField } from '../../../core/molecules/form-field/form-field';
import { List, ListItem } from '../../../core/organisms/list/list';
import { Modal } from '../../../core/organisms/modal/modal';
import { Row, Column } from '../../../layouts';
// import { Stack } from '../../../layouts';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Icon } from '../../../core/atoms/icon/index';
// Removed hardcoded icon imports: StethoscopeIcon, TrendingUpIcon, PillIcon, PenToolIcon, AlertTriangleIcon, BellIcon, CheckCircleIcon, EditIcon, TrashIcon

export interface MedicalNote {
  id: string;
  timestamp: Date;
  author: {
    id: string;
    name: string;
    title: string;
    license: string;
  };
  type: 'consultation' | 'progress' | 'discharge' | 'referral' | 'prescription';
  priority: 'routine' | 'urgent' | 'critical';
  content: string;
  tags: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  linkedPatientId: string;
  visitId?: string;
  diagnosis?: string[];
  recommendations?: string[];
  followUp?: {
    required: boolean;
    timeframe: string;
    instructions: string;
  };
  signatures?: Array<{
    authorId: string;
    timestamp: Date;
    digital: boolean;
  }>;
  version: number;
  isLocked: boolean;
  confidentialityLevel: 'standard' | 'sensitive' | 'restricted';
}

export interface ConsultationNotesProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$` | 'autoSave'> {
  patientId: string;
  patientName: string;
  visitId?: string;
  existingNotes?: MedicalNote[];
  currentUser: {
    id: string;
    name: string;
    title: string;
    license: string;
    canEdit: boolean;
    canSign: boolean;
  };
  onSaveNote?: QRL<(note: Partial<MedicalNote>) => Promise<void>>;
  onUpdateNote?: QRL<(noteId: string, updates: Partial<MedicalNote>) => Promise<void>>;
  onDeleteNote?: QRL<(noteId: string) => Promise<void>>;
  onSignNote?: QRL<(noteId: string) => Promise<void>>;
  templates?: Array<{
    id: string;
    name: string;
    content: string;
    type: MedicalNote['type'];
  }>;
  mode?: 'view' | 'edit' | 'review';
  showHistory?: boolean;
  maxNoteLength?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export const ConsultationNotes = component$<ConsultationNotesProps>((props) => {
  const {
    patientId,
    patientName,
    visitId,
    existingNotes = [],
    currentUser,
    onSaveNote,
    onUpdateNote,
    onDeleteNote,
    onSignNote,
    templates = [],
    mode = 'edit',
    maxNoteLength = 5000,
    autoSave: _autoSave,
    autoSaveInterval: _autoSaveInterval,
    // BaseComponentProps
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const notesStore = useStore({
    notes: existingNotes,
    isLoading: false,
    error: '',
    filterType: 'all' as MedicalNote['type'] | 'all',
    searchQuery: '',
    sortBy: 'timestamp' as 'timestamp' | 'type' | 'author',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const editorStore = useStore({
    isEditing: false,
    editingNoteId: '',
    currentNote: {
      type: 'consultation' as MedicalNote['type'],
      priority: 'routine' as MedicalNote['priority'],
      content: '',
      tags: [] as string[],
      diagnosis: [] as string[],
      recommendations: [] as string[],
      followUp: {
        required: false,
        timeframe: '',
        instructions: ''
      },
      confidentialityLevel: 'standard' as MedicalNote['confidentialityLevel']
    },
    isDirty: false,
    lastSaved: null as Date | null,
    wordCount: 0,
    tagInput: '',
    diagnosisInput: '',
    recommendationInput: ''
  });

  const showTemplateModal = useSignal(false);
  const showDeleteConfirm = useSignal(false);
  const noteToDelete = useSignal('');

  // Filter and sort notes
  const filteredNotes = notesStore.notes
    .filter(note => {
      if (notesStore.filterType !== 'all' && note.type !== notesStore.filterType) {
        return false;
      }
      if (notesStore.searchQuery) {
        const query = notesStore.searchQuery.toLowerCase();
        return (
          note.content.toLowerCase().includes(query) ||
          note.author.name.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (notesStore.sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'author':
          comparison = a.author.name.localeCompare(b.author.name);
          break;
      }
      return notesStore.sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleStartNewNote = $(() => {
    editorStore.isEditing = true;
    editorStore.editingNoteId = '';
    editorStore.currentNote = {
      type: 'consultation',
      priority: 'routine',
      content: '',
      tags: [],
      diagnosis: [],
      recommendations: [],
      followUp: {
        required: false,
        timeframe: '',
        instructions: ''
      },
      confidentialityLevel: 'standard'
    };
    editorStore.isDirty = false;
    editorStore.wordCount = 0;
  });

  const handleEditNote = $((note: MedicalNote) => {
    if (!currentUser.canEdit || note.isLocked) return;
    
    editorStore.isEditing = true;
    editorStore.editingNoteId = note.id;
    editorStore.currentNote = {
      type: note.type,
      priority: note.priority,
      content: note.content,
      tags: [...note.tags],
      diagnosis: [...(note.diagnosis || [])],
      recommendations: [...(note.recommendations || [])],
      followUp: note.followUp ? { ...note.followUp } : {
        required: false,
        timeframe: '',
        instructions: ''
      },
      confidentialityLevel: note.confidentialityLevel
    };
    editorStore.isDirty = false;
    editorStore.wordCount = note.content.split(/\s+/).length;
  });

  const handleSaveNote = $(async () => {
    if (!editorStore.isDirty) return;

    try {
      notesStore.isLoading = true;
      notesStore.error = '';

      const noteData: Partial<MedicalNote> = {
        ...editorStore.currentNote,
        linkedPatientId: patientId,
        visitId,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          title: currentUser.title,
          license: currentUser.license
        },
        timestamp: new Date(),
        version: 1,
        isLocked: false
      };

      if (editorStore.editingNoteId) {
        // Update existing note
        if (onUpdateNote) {
          await onUpdateNote(editorStore.editingNoteId, noteData);
        }
        const noteIndex = notesStore.notes.findIndex(n => n.id === editorStore.editingNoteId);
        if (noteIndex >= 0) {
          notesStore.notes[noteIndex] = { 
            ...notesStore.notes[noteIndex], 
            ...noteData,
            version: notesStore.notes[noteIndex].version + 1
          };
        }
      } else {
        // Create new note
        if (onSaveNote) {
          await onSaveNote(noteData);
        }
        const newNote: MedicalNote = {
          ...noteData as MedicalNote,
          id: `note-${Date.now()}`
        };
        notesStore.notes.unshift(newNote);
      }

      editorStore.isEditing = false;
      editorStore.isDirty = false;
      editorStore.lastSaved = new Date();
    } catch (error) {
      notesStore.error = 'Failed to save note. Please try again.';
      console.error('Save note error:', error);
    } finally {
      notesStore.isLoading = false;
    }
  });

  const handleDeleteNote = $(async (noteId: string) => {
    try {
      notesStore.isLoading = true;
      if (onDeleteNote) {
        await onDeleteNote(noteId);
      }
      notesStore.notes = notesStore.notes.filter(note => note.id !== noteId);
      showDeleteConfirm.value = false;
      noteToDelete.value = '';
    } catch (error) {
      notesStore.error = 'Failed to delete note. Please try again.';
      console.error('Delete note error:', error);
    } finally {
      notesStore.isLoading = false;
    }
  });

  const handleContentChange = $((content: string) => {
    editorStore.currentNote.content = content;
    editorStore.isDirty = true;
    editorStore.wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  });

  const addTag = $(() => {
    const tag = editorStore.tagInput.trim();
    if (tag && !editorStore.currentNote.tags.includes(tag)) {
      editorStore.currentNote.tags.push(tag);
      editorStore.tagInput = '';
      editorStore.isDirty = true;
    }
  });

  const removeTag = $((tagToRemove: string) => {
    editorStore.currentNote.tags = editorStore.currentNote.tags.filter(tag => tag !== tagToRemove);
    editorStore.isDirty = true;
  });

  const addDiagnosis = $(() => {
    const diagnosis = editorStore.diagnosisInput.trim();
    if (diagnosis && !editorStore.currentNote.diagnosis.includes(diagnosis)) {
      editorStore.currentNote.diagnosis.push(diagnosis);
      editorStore.diagnosisInput = '';
      editorStore.isDirty = true;
    }
  });

  const addRecommendation = $(() => {
    const recommendation = editorStore.recommendationInput.trim();
    if (recommendation && !editorStore.currentNote.recommendations.includes(recommendation)) {
      editorStore.currentNote.recommendations.push(recommendation);
      editorStore.recommendationInput = '';
      editorStore.isDirty = true;
    }
  });

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getPriorityColor = (priority: MedicalNote['priority']) => {
    switch (priority) {
      case 'critical': return 'text-error-600 bg-error-50 border-error-light';
      case 'urgent': return 'text-warning-normal bg-warning-lighter border-warning-light';
      case 'routine': return 'text-success-normal bg-success-50 border-success-light';
      default: return 'text-neutral-normal bg-neutral-lighter border-neutral-light';
    }
  };

  const getTypeIcon = (type: MedicalNote['type']) => {
    switch (type) {
      case 'consultation': return <Icon icon="stethoscope" class="w-4 h-4" />;
      case 'progress': return <Icon icon="trending-up" class="w-4 h-4" />;
      case 'discharge': return <Icon icon="pen-tool" class="w-4 h-4" />;
      case 'referral': return <Icon icon="pen-tool" class="w-4 h-4" />;
      case 'prescription': return <Icon icon="pill" class="w-4 h-4" />;
      default: return <Icon icon="pen-tool" class="w-4 h-4" />;
    }
  };

  // Merge classes for consultation notes container
  const notesClasses = mergeClasses(
    "w-full max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-neutral-light",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div 
        class={notesClasses}
        style={style}
        {...rest}
      >
        {/* Header */}
        <div class="p-6 border-b border-neutral-light">
          <Row alignItems="center" justifyContent="between" class="mb-4">
            <div>
              <Text as="h2" weight="semibold" size="xl" color="gray-900">
                Consultation Notes
              </Text>
              <Text as="p" color="gray-600" class="mt-1">
                Patient: <span class="font-medium">{patientName}</span>
                {visitId && <span class="ml-2 text-sm">Visit ID: {visitId}</span>}
              </Text>
            </div>
            {mode !== 'view' && currentUser.canEdit && (
              <Row gap="2">
                {templates.length > 0 && (
                  <button
                    type="button"
                    onClick$={() => showTemplateModal.value = true}
                    class="px-4 py-2 text-sm font-medium text-neutral-dark bg-white border border-neutral-light rounded-lg transition-colors duration-200 hover:bg-neutral-lighter focus:ring-2 focus:ring-primary-normal focus:border-primary-500"
                  >
                    Use Template
                  </button>
                )}
                <button
                  type="button"
                  onClick$={handleStartNewNote}
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg transition-colors duration-200 hover:bg-primary-700 focus:ring-2 focus:ring-primary-normal focus:ring-offset-2"
                >
                  + New Note
                </button>
              </Row>
            )}
          </Row>

          {/* Filters and Search */}
          <Row wrap gap="4" alignItems="center">
            <Row alignItems="center" gap="2">
              <label class="text-sm font-medium text-neutral-dark">Filter:</label>
              <select
                value={notesStore.filterType}
                onChange$={(e) => notesStore.filterType = (e.target as HTMLSelectElement).value as MedicalNote['type'] | 'all'}
                class="px-3 py-1 text-sm border border-neutral-light rounded focus:ring-2 focus:ring-primary-normal focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="consultation">Consultation</option>
                <option value="progress">Progress</option>
                <option value="discharge">Discharge</option>
                <option value="referral">Referral</option>
                <option value="prescription">Prescription</option>
              </select>
            </Row>
            
            <Row alignItems="center" gap="2">
              <label class="text-sm font-medium text-neutral-dark">Sort:</label>
              <select
                value={notesStore.sortBy}
                onChange$={(e) => notesStore.sortBy = (e.target as HTMLSelectElement).value as 'timestamp' | 'type' | 'author'}
                class="px-3 py-1 text-sm border border-neutral-light rounded focus:ring-2 focus:ring-primary-normal focus:border-primary-500"
              >
                <option value="timestamp">Date</option>
                <option value="type">Type</option>
                <option value="author">Author</option>
              </select>
            </Row>

            <div class="flex-1 max-w-sm">
              <FormField 
                label="Search Notes"
                hint="Search by content, type, or author"
              >
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={notesStore.searchQuery}
                  size="sm"
                  onInput$={(e) => notesStore.searchQuery = (e.target as HTMLInputElement).value}
                />
              </FormField>
            </div>
          </Row>
        </div>

        {/* Error Display */}
        {notesStore.error && (
          <div class="p-4 border-b border-neutral-light bg-error-50">
            <Row alignItems="center" gap="2" class="text-error-800">
              <Icon icon="alert-triangle" class="w-5 h-5" />
              <span class="font-medium">{notesStore.error}</span>
            </Row>
          </div>
        )}

        {/* Note Editor */}
        {editorStore.isEditing && (
          <div class="p-6 border-b border-neutral-light bg-neutral-lighter">
            <div class="space-y-4">
              <Row gap="4">
                <Column size={{ sm: 12, md: 4 }}>
                  <label class="block text-sm font-medium text-neutral-dark mb-1">
                    Note Type *
                  </label>
                  <select
                    value={editorStore.currentNote.type}
                    onChange$={(e) => {
                      editorStore.currentNote.type = (e.target as HTMLSelectElement).value as MedicalNote['type'];
                      editorStore.isDirty = true;
                    }}
                    class="w-full px-3 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-primary-500"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="progress">Progress Note</option>
                    <option value="discharge">Discharge Summary</option>
                    <option value="referral">Referral</option>
                    <option value="prescription">Prescription</option>
                  </select>
                </Column>

                <Column size={{ sm: 12, md: 4 }}>
                  <label class="block text-sm font-medium text-neutral-dark mb-1">
                    Priority *
                  </label>
                  <select
                    value={editorStore.currentNote.priority}
                    onChange$={(e) => {
                      editorStore.currentNote.priority = (e.target as HTMLSelectElement).value as MedicalNote['priority'];
                      editorStore.isDirty = true;
                    }}
                    class="w-full px-3 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-primary-500"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </Column>

                <Column size={{ sm: 12, md: 4 }}>
                  <label class="block text-sm font-medium text-neutral-dark mb-1">
                    Confidentiality
                  </label>
                  <select
                    value={editorStore.currentNote.confidentialityLevel}
                    onChange$={(e) => {
                      editorStore.currentNote.confidentialityLevel = (e.target as HTMLSelectElement).value as MedicalNote['confidentialityLevel'];
                      editorStore.isDirty = true;
                    }}
                    class="w-full px-3 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-primary-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="sensitive">Sensitive</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </Column>
              </Row>

              <div>
                <Row alignItems="center" justifyContent="between" class="mb-2">
                  <label class="block text-sm font-medium text-neutral-dark">
                    Content *
                  </label>
                  <div class="text-xs text-neutral-normal">
                    {editorStore.wordCount} words / {maxNoteLength} chars max
                  </div>
                </Row>
                <Textarea
                  purpose="consultation"
                  value={editorStore.currentNote.content}
                  onChange$={(value) => handleContentChange(value)}
                  placeholder="Enter consultation notes, observations, and clinical details..."
                  maxLength={maxNoteLength}
                  rows={8}
                />
              </div>

              {/* Tags */}
              <div>
                <label class="block text-sm font-medium text-neutral-dark mb-2">
                  Tags
                </label>
                <Row wrap gap="2" class="mb-2">
                  {editorStore.currentNote.tags.map((tag) => (
                    <span
                      key={tag}
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-800 bg-primary-100 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick$={() => removeTag(tag)}
                        class="text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </Row>
                <Row gap="2">
                  <FormField 
                    label="Add Tag"
                    hint="Press Enter to add tags"
                    class="flex-1"
                  >
                    <Input
                      type="text"
                      value={editorStore.tagInput}
                      placeholder="Add tag..."
                      size="sm"
                      onInput$={(e) => editorStore.tagInput = (e.target as HTMLInputElement).value}
                      onKeyPress$={(e) => (e as KeyboardEvent).key === 'Enter' && addTag()}
                    />
                  </FormField>
                  <button
                    type="button"
                    onClick$={addTag}
                    class="px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded transition-colors duration-200 hover:bg-primary-700"
                  >
                    Add
                  </button>
                </Row>
              </div>

              {/* Clinical Information */}
              <Row gap="4">
                <Column size={{ sm: 12, md: 6 }}>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">
                    Diagnosis
                  </label>
                  <div class="space-y-2 mb-2">
                    {editorStore.currentNote.diagnosis.map((diagnosis) => (
                      <Row key={diagnosis} alignItems="center" justifyContent="between" class="p-2 bg-warning-50 border border-warning-light rounded">
                        <span class="text-sm">{diagnosis}</span>
                        <button
                          type="button"
                          onClick$={() => {
                            editorStore.currentNote.diagnosis = editorStore.currentNote.diagnosis.filter(d => d !== diagnosis);
                            editorStore.isDirty = true;
                          }}
                          class="text-warning-600 hover:text-warning-800"
                        >
                          ×
                        </button>
                      </Row>
                    ))}
                  </div>
                  <Row gap="2">
                    <FormField 
                      label="Add Diagnosis"
                      hint="Press Enter to add diagnosis"
                      class="flex-1"
                    >
                      <Input
                        type="text"
                        value={editorStore.diagnosisInput}
                        placeholder="Add diagnosis..."
                        size="sm"
                        onInput$={(e) => editorStore.diagnosisInput = (e.target as HTMLInputElement).value}
                        onKeyPress$={(e) => (e as KeyboardEvent).key === 'Enter' && addDiagnosis()}
                      />
                    </FormField>
                    <button
                      type="button"
                      onClick$={addDiagnosis}
                      class="px-3 py-1 text-sm font-medium text-white bg-warning-600 rounded transition-colors duration-200 hover:bg-warning-700"
                    >
                      Add
                    </button>
                  </Row>
                </Column>

                <Column size={{ sm: 12, md: 6 }}>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">
                    Recommendations
                  </label>
                  <div class="space-y-2 mb-2">
                    {editorStore.currentNote.recommendations.map((rec, index) => (
                      <Row key={index} alignItems="center" justifyContent="between" class="p-2 bg-success-50 border border-success-light rounded">
                        <span class="text-sm">{rec}</span>
                        <button
                          type="button"
                          onClick$={() => {
                            editorStore.currentNote.recommendations = editorStore.currentNote.recommendations.filter(r => r !== rec);
                            editorStore.isDirty = true;
                          }}
                          class="text-success-normal hover:text-success-800"
                        >
                          ×
                        </button>
                      </Row>
                    ))}
                  </div>
                  <Row gap="2">
                    <FormField 
                      label="Add Recommendation"
                      hint="Press Enter to add recommendation"
                      class="flex-1"
                    >
                      <Input
                        type="text"
                        value={editorStore.recommendationInput}
                        placeholder="Add recommendation..."
                        size="sm"
                        onInput$={(e) => editorStore.recommendationInput = (e.target as HTMLInputElement).value}
                        onKeyPress$={(e) => (e as KeyboardEvent).key === 'Enter' && addRecommendation()}
                      />
                    </FormField>
                    <button
                      type="button"
                      onClick$={addRecommendation}
                      class="px-3 py-1 text-sm font-medium text-white bg-success-600 rounded transition-colors duration-200 hover:bg-success-700"
                    >
                      Add
                    </button>
                  </Row>
                </Column>
              </Row>

              {/* Follow-up */}
              <div class="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <Row alignItems="center" gap="2" class="mb-3">
                  <input
                    type="checkbox"
                    id="followup-required"
                    checked={editorStore.currentNote.followUp.required}
                    onChange$={(e) => {
                      editorStore.currentNote.followUp.required = (e.target as HTMLInputElement).checked;
                      editorStore.isDirty = true;
                    }}
                    class="rounded border-neutral-light text-primary-600 focus:ring-primary-normal"
                  />
                  <label for="followup-required" class="text-sm font-medium text-neutral-dark">
                    Follow-up Required
                  </label>
                </Row>
                
                {editorStore.currentNote.followUp.required && (
                  <Row gap="4">
                    <Column size={{ sm: 12, md: 6 }}>
                      <label class="block text-sm font-medium text-neutral-dark mb-1">
                        Timeframe
                      </label>
                      <select
                        value={editorStore.currentNote.followUp.timeframe}
                        onChange$={(e) => {
                          editorStore.currentNote.followUp.timeframe = (e.target as HTMLSelectElement).value;
                          editorStore.isDirty = true;
                        }}
                        class="w-full px-3 py-2 border border-neutral-light rounded focus:ring-2 focus:ring-primary-normal focus:border-primary-500"
                      >
                        <option value="">Select timeframe</option>
                        <option value="1-week">1 week</option>
                        <option value="2-weeks">2 weeks</option>
                        <option value="1-month">1 month</option>
                        <option value="3-months">3 months</option>
                        <option value="6-months">6 months</option>
                        <option value="custom">Custom</option>
                      </select>
                    </Column>
                    <Column size={{ sm: 12, md: 6 }}>
                      <FormField 
                        label="Instructions"
                        hint="Follow-up care instructions for the patient"
                      >
                        <Input
                          type="text"
                          value={editorStore.currentNote.followUp.instructions}
                          placeholder="Follow-up instructions"
                          size="sm"
                          onInput$={(e) => {
                            editorStore.currentNote.followUp.instructions = (e.target as HTMLInputElement).value;
                            editorStore.isDirty = true;
                          }}
                        />
                      </FormField>
                    </Column>
                  </Row>
                )}
              </div>

              {/* Save Actions */}
              <Row alignItems="center" justifyContent="between" class="pt-4 border-t border-neutral-light">
                <Row alignItems="center" gap="4">
                  {editorStore.lastSaved && (
                    <span class="text-sm text-neutral-normal">
                      Last saved: {formatTimestamp(editorStore.lastSaved)}
                    </span>
                  )}
                  {editorStore.isDirty && (
                    <span class="text-sm text-warning-normal font-medium">
                      Unsaved changes
                    </span>
                  )}
                </Row>
                
                <Row gap="2">
                  <button
                    type="button"
                    onClick$={() => {
                      editorStore.isEditing = false;
                      editorStore.isDirty = false;
                    }}
                    class="px-4 py-2 text-sm font-medium text-neutral-dark bg-white border border-neutral-light rounded-lg transition-colors duration-200 hover:bg-neutral-lighter"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick$={handleSaveNote}
                    disabled={!editorStore.isDirty || notesStore.isLoading}
                    class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg transition-colors duration-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {notesStore.isLoading ? 'Saving...' : 'Save Note'}
                  </button>
                </Row>
              </Row>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div class="p-6">
          {filteredNotes.length === 0 ? (
            <div class="text-center py-12">
              <div class="text-neutral-light text-6xl mb-4">
                <Row justifyContent="center">
                  <Icon icon="pen-tool" class="w-16 h-16" />
                </Row>
              </div>
              <Text as="h3" weight="medium" size="lg" color="gray-900" class="mb-2">No Notes Yet</Text>
              <Text as="p" color="gray-600" class="mb-4">
                {notesStore.searchQuery || notesStore.filterType !== 'all'
                  ? 'No notes match your current filters.'
                  : 'Start documenting patient consultations by creating your first note.'}
              </Text>
              {mode !== 'view' && currentUser.canEdit && !notesStore.searchQuery && notesStore.filterType === 'all' && (
                <button
                  type="button"
                  onClick$={handleStartNewNote}
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg transition-colors duration-200 hover:bg-primary-700"
                >
                  Create First Note
                </button>
              )}
            </div>
          ) : (
            <div class="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  class="p-6 border border-neutral-light rounded-lg hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">{getTypeIcon(note.type)}</span>
                      <div>
                        <div class="flex items-center gap-2">
                          <Text as="h3" weight="semibold" color="blue-900" class="capitalize">
                            {note.type} Note
                          </Text>
                          <span class={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(note.priority)}`}>
                            {note.priority}
                          </span>
                          {note.confidentialityLevel !== 'standard' && (
                            <span class="px-2 py-1 text-xs font-medium text-primary-darker bg-primary-lighter rounded-full border border-primary-light">
                              {note.confidentialityLevel}
                            </span>
                          )}
                        </div>
                        <div class="text-sm text-neutral-normal mt-1">
                          {note.author.name} ({note.author.title}) • {formatTimestamp(note.timestamp)}
                          {note.version > 1 && (
                            <span class="ml-2 text-xs text-neutral-normal">v{note.version}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {mode !== 'view' && (
                      <div class="flex items-center gap-2">
                        {currentUser.canEdit && !note.isLocked && (
                          <Tooltip content="Edit note" position="top">
                            <button
                              type="button"
                              onClick$={() => handleEditNote(note)}
                              class="p-2 text-neutral-light hover:text-primary-600 transition-colors duration-200 hover:bg-primary-50 rounded"
                            >
                              <Icon icon="edit" class="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {currentUser.canSign && !note.signatures?.length && (
                          <Tooltip content="Sign note" position="top">
                            <button
                              type="button"
                              onClick$={() => onSignNote && onSignNote(note.id)}
                              class="p-2 text-neutral-light hover:text-success-normal transition-colors duration-200 hover:bg-success-lighter rounded"
                            >
                              <Icon icon="pen-tool" class="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {currentUser.canEdit && !note.isLocked && (
                          <Tooltip content="Delete note" position="top">
                            <button
                              type="button"
                              onClick$={() => {
                                noteToDelete.value = note.id;
                                showDeleteConfirm.value = true;
                              }}
                              class="p-2 text-neutral-light hover:text-error-600 transition-colors duration-200 hover:bg-error-50 rounded"
                            >
                              <Icon icon="trash" class="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>

                  <div class="prose prose-sm max-w-none mb-4">
                    <Text as="p" color="gray-700" class="whitespace-pre-wrap">{note.content}</Text>
                  </div>

                  {(note.tags.length > 0 || note.diagnosis?.length || note.recommendations?.length) && (
                    <div class="space-y-3 mb-4">
                      {note.tags.length > 0 && (
                        <div>
                          <span class="text-sm font-medium text-neutral-dark">Tags: </span>
                          <div class="inline-flex flex-wrap gap-1 mt-1">
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                class="px-2 py-1 text-xs font-medium text-primary-800 bg-primary-100 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.diagnosis && note.diagnosis.length > 0 && (
                        <div>
                          <span class="text-sm font-medium text-neutral-dark">Diagnosis: </span>
                          <List variant="none" size="sm" class="mt-1">
                            {note.diagnosis.map((diag) => (
                              <ListItem key={diag}>
                                <div class="text-sm text-neutral-normal flex items-center gap-2">
                                  <span class="w-1.5 h-1.5 bg-warning-400 rounded-full"></span>
                                  {diag}
                                </div>
                              </ListItem>
                            ))}
                          </List>
                        </div>
                      )}

                      {note.recommendations && note.recommendations.length > 0 && (
                        <div>
                          <span class="text-sm font-medium text-neutral-dark">Recommendations: </span>
                          <List variant="none" size="sm" class="mt-1">
                            {note.recommendations.map((rec) => (
                              <ListItem key={rec}>
                                <div class="text-sm text-neutral-normal flex items-center gap-2">
                                  <span class="w-1.5 h-1.5 bg-success-400 rounded-full"></span>
                                  {rec}
                                </div>
                              </ListItem>
                            ))}
                          </List>
                        </div>
                      )}
                    </div>
                  )}

                  {note.followUp?.required && (
                    <div class="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <div class="flex items-center gap-2 text-primary-800">
                        <Icon icon="bell" class="w-4 h-4" />
                        <span class="text-sm font-medium">Follow-up Required</span>
                      </div>
                      <div class="text-sm text-primary-700 mt-1">
                        {note.followUp.timeframe && (
                          <span>Timeframe: {note.followUp.timeframe}</span>
                        )}
                        {note.followUp.instructions && (
                          <span class="block mt-1">Instructions: {note.followUp.instructions}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {note.signatures && note.signatures.length > 0 && (
                    <div class="pt-3 border-t border-neutral-light">
                      <div class="flex items-center gap-2 text-success-800">
                        <Icon icon="check-circle" class="w-4 h-4" />
                        <span class="text-sm font-medium">Digitally Signed</span>
                        <span class="text-xs text-neutral-normal">
                          {formatTimestamp(note.signatures[0].timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteConfirm.value}
          title="Confirm Deletion"
          size="sm"
          closable={true}
          closeOnBackdrop={true}
          showFooter={true}
          onClose$={() => {
            showDeleteConfirm.value = false;
            noteToDelete.value = '';
          }}
        >
          <Text as="p" color="gray-600" class="mb-2">
            Are you sure you want to delete this note? This action cannot be undone.
          </Text>
          
          <div slot="footer" class="flex gap-3 justify-end">
            <Button
              intent="neutral"
              size="sm"
              onClick$={() => {
                showDeleteConfirm.value = false;
                noteToDelete.value = '';
              }}
            >
              Cancel
            </Button>
            <Button
              intent="error"
              size="sm"
              onClick$={() => handleDeleteNote(noteToDelete.value)}
            >
              Delete Note
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
});
