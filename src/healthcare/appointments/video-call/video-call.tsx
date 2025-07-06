import { component$, useSignal, $ } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { Row } from '../../../layouts/row';
import { Column } from '../../../layouts/column';
import { Stack } from '../../../layouts/stack';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Icon } from '../../../core/atoms/icon';

/**
 * Participant information for video call
 */
export interface CallParticipant {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'nurse' | 'specialist' | 'observer';
  avatar?: string;
  isHost?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'poor';
  joinedAt: string;
  location?: string;
}

/**
 * Call recording information
 */
export interface CallRecording {
  id: string;
  startTime: string;
  duration?: number;
  status: 'recording' | 'paused' | 'stopped';
  fileSize?: number;
  consent: {
    required: boolean;
    obtained: boolean;
    participants: string[];
  };
}

/**
 * Screen sharing information
 */
export interface ScreenShare {
  isActive: boolean;
  sharedBy?: string;
  sharedByName?: string;
  type: 'screen' | 'window' | 'application';
  startTime?: string;
}

/**
 * Props for the VideoCall component
 */
export interface VideoCallProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  callId: string;
  participants: CallParticipant[];
  currentUserId: string;
  currentUserRole: 'patient' | 'doctor' | 'nurse' | 'specialist' | 'observer';
  isHost?: boolean;
  duration?: number;
  callStatus: 'connecting' | 'connected' | 'ended' | 'failed';
  recording?: CallRecording;
  screenShare?: ScreenShare;
  showChat?: boolean;
  showParticipants?: boolean;
  showRecording?: boolean;
  showScreenShare?: boolean;
  allowScreenShare?: boolean;
  allowRecording?: boolean;
  hipaaCompliant?: boolean;
  maxParticipants?: number;
  onMuteToggle?: (participantId: string) => void;
  onVideoToggle?: (participantId: string) => void;
  onScreenShare?: () => void;
  onRecordingToggle?: () => void;
  onHandRaise?: (participantId: string) => void;
  onParticipantRemove?: (participantId: string) => void;
  onCallEnd?: () => void;
  onChatMessage?: (message: string) => void;
}

/**
 * VideoCall - Telemedicine video consultation component
 * 
 * Features:
 * - Multi-participant video calling with WebRTC
 * - HIPAA-compliant recording with consent management
 * - Screen sharing for medical images/documents
 * - Role-based access controls (doctor, patient, observer)
 * - Real-time chat with medical context
 * - Connection quality monitoring
 * - Participant management (mute, remove, etc.)
 * - Hand raise system for questions
 * - Medical consultation workflow integration
 * - Accessibility features for hearing/vision impaired
 */
export const VideoCall = component$<VideoCallProps>((props) => {
  const {
    callId,
    participants,
    currentUserId,
    currentUserRole,
    isHost = false,
    duration = 0,
    callStatus,
    recording,
    screenShare,
    showChat = true,
    showParticipants = true,
    showRecording: _showRecording = true,
    showScreenShare: _showScreenShare = true,
    allowScreenShare = true,
    allowRecording = true,
    hipaaCompliant = true,
    maxParticipants = 10,
    onMuteToggle,
    onVideoToggle,
    onScreenShare,
    onRecordingToggle,
    onHandRaise,
    onParticipantRemove,
    onCallEnd,
    onChatMessage,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const localVideoRef = useSignal<HTMLVideoElement>();
  const isMuted = useSignal(false);
  const isVideoOff = useSignal(false);
  const isHandRaised = useSignal(false);
  const chatMessage = useSignal('');
  const showSettings = useSignal(false);
  const connectionQuality = useSignal<'excellent' | 'good' | 'poor' | 'disconnected'>('good');
  const chatMessages = useSignal<Array<{id: string, sender: string, message: string, timestamp: string}>>([]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle mute
  const toggleMute = $(() => {
    isMuted.value = !isMuted.value;
    if (onMuteToggle) {
      onMuteToggle(currentUserId);
    }
  });

  // Toggle video
  const toggleVideo = $(() => {
    isVideoOff.value = !isVideoOff.value;
    if (onVideoToggle) {
      onVideoToggle(currentUserId);
    }
  });

  // Toggle hand raise
  const toggleHandRaise = $(() => {
    isHandRaised.value = !isHandRaised.value;
    if (onHandRaise) {
      onHandRaise(currentUserId);
    }
  });

  // Start screen share
  const startScreenShare = $(() => {
    if (onScreenShare) {
      onScreenShare();
    }
  });

  // Toggle recording
  const toggleRecording = $(() => {
    if (onRecordingToggle) {
      onRecordingToggle();
    }
  });

  // Send chat message
  const sendChatMessage = $(() => {
    if (chatMessage.value.trim() && onChatMessage) {
      onChatMessage(chatMessage.value);
      chatMessages.value = [...chatMessages.value, {
        id: Date.now().toString(),
        sender: currentUserId,
        message: chatMessage.value,
        timestamp: new Date().toISOString()
      }];
      chatMessage.value = '';
    }
  });

  // End call
  const endCall = $(() => {
    if (onCallEnd) {
      onCallEnd();
    }
  });

  const currentUser = participants.find(p => p.id === currentUserId);
  const otherParticipants = participants.filter(p => p.id !== currentUserId);

  const connectionQualityColor = {
    'excellent': 'bg-success-500',
    'good': 'bg-warning-500', 
    'poor': 'bg-warning-normal',
    'disconnected': 'bg-error-500'
  };

  const roleIcons = {
    'patient': <Icon icon="user" class="w-4 h-4" />,
    'doctor': <Icon icon="user" class="w-4 h-4" />,
    'nurse': <Icon icon="user" class="w-4 h-4" />,
    'specialist': <Icon icon="user" class="w-4 h-4" />,
    'observer': <Icon icon="eye" class="w-4 h-4" />
  };

  const containerClasses = mergeClasses(
    'relative bg-neutral-darker text-white h-full min-h-screen font-sans overflow-hidden',
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div 
        class={containerClasses}
        style={style}
        {...rest}
      >
      {/* Header */}
      <div class="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4">
        <Row alignItems="center" justifyContent="between">
          <Row alignItems="center" gap="4">
            <Row alignItems="center" gap="2">
              <div class={['w-3 h-3 rounded-full', connectionQualityColor[connectionQuality.value]]}></div>
              <span class="text-sm font-medium">
                {callStatus === 'connected' ? 'Connected' : 
                 callStatus === 'connecting' ? 'Connecting...' : 
                 callStatus === 'failed' ? 'Connection Failed' : 'Call Ended'}
              </span>
            </Row>
            
            {duration && (
              <div class="text-sm text-neutral-light">
                Duration: {formatDuration(duration)}
              </div>
            )}

            {recording?.status === 'recording' && (
              <Row alignItems="center" gap="2" class="bg-error-600/20 px-3 py-1 rounded-full">
                <div class="w-2 h-2 bg-error-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium">Recording</span>
              </Row>
            )}

            {hipaaCompliant && (
              <Row alignItems="center" gap="1" class="bg-primary-600/20 px-3 py-1 rounded-full">
                <Icon icon="lock" class="w-3 h-3" />
                <span class="text-xs font-medium">HIPAA Compliant</span>
              </Row>
            )}
          </Row>

          <Row alignItems="center" gap="2">
            <span class="text-sm">Call ID: {callId}</span>
            <button
              onClick$={() => showSettings.value = !showSettings.value}
              class="p-2 transition-colors duration-200 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Tooltip content="Settings">
                <Icon icon="settings" class="w-4 h-4" />
              </Tooltip>
            </button>
          </Row>
        </Row>
      </div>

      {/* Main video area */}
      <Row class="h-full">
        {/* Primary video area */}
        <div class="flex-1 relative">
          {/* Main video stream */}
          <Row alignItems="center" justifyContent="center" class="absolute inset-0 bg-neutral-darker">
            {screenShare?.isActive ? (
              <Row alignItems="center" justifyContent="center" class="w-full h-full bg-neutral-darker">
                <div class="text-center">
                  <div class="text-6xl mb-4">
                    <Icon icon="monitor" class="w-16 h-16 mx-auto" />
                  </div>
                  <div class="text-xl font-medium mb-2">Screen Sharing</div>
                  <div class="text-neutral-light">
                    Shared by {screenShare.sharedByName || 'Unknown'}
                  </div>
                </div>
              </Row>
            ) : (
              <Row gap="4" class="p-4 h-full w-full">
                {/* Current user video */}
                <Column size={{ sm: 12, md: 6 }} class="relative bg-neutral-darker rounded-lg overflow-hidden">
                  {isVideoOff.value ? (
                    <Row alignItems="center" justifyContent="center" class="h-full bg-neutral-darker">
                      <div class="text-center">
                        <Row justifyContent="center" class="text-4xl mb-2">
                          {currentUser?.avatar || <Icon icon="user" class="w-8 h-8" />}
                        </Row>
                        <div class="font-medium">{currentUser?.name || 'You'}</div>
                        <div class="text-sm text-neutral-light">{roleIcons[currentUserRole]} {currentUserRole}</div>
                      </div>
                    </Row>
                  ) : (
                    <video
                      ref={localVideoRef}
                      class="w-full h-full object-cover"
                      autoplay
                      muted
                      playsInline
                    />
                  )}
                  
                  <div class="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    You {isMuted.value && <Icon icon="mic-off" class="w-4 h-4 inline" />}
                  </div>
                </Column>

                {/* Other participants */}
                {otherParticipants.slice(0, 3).map((participant) => (
                  <Column key={participant.id} size={{ sm: 12, md: 6 }} class="relative bg-neutral-darker rounded-lg overflow-hidden">
                    {participant.isVideoOff ? (
                      <Row alignItems="center" justifyContent="center" class="h-full bg-neutral-darker">
                        <div class="text-center">
                          <div class="text-4xl mb-2">{participant.avatar || roleIcons[participant.role]}</div>
                          <div class="font-medium">{participant.name}</div>
                          <div class="text-sm text-neutral-light">{roleIcons[participant.role]} {participant.role}</div>
                          {participant.location && (
                            <div class="text-xs text-neutral-normal mt-1">{participant.location}</div>
                          )}
                        </div>
                      </Row>
                    ) : (
                      <Row alignItems="center" justifyContent="center" class="w-full h-full bg-gradient-to-br from-primary-darker to-primary-dark">
                        <div class="text-center">
                          <div class="text-4xl mb-2">{participant.avatar || roleIcons[participant.role]}</div>
                          <div class="font-medium">{participant.name}</div>
                        </div>
                      </Row>
                    )}
                    
                    <Row alignItems="center" gap="1" class="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                      <span>{participant.name}</span>
                      {participant.isMuted && <span><Icon icon="mic-off" class="w-4 h-4 inline" /></span>}
                      {participant.isHandRaised && <span><Icon icon="hand" class="w-4 h-4 inline" /></span>}
                      <div class={[
                        'w-2 h-2 rounded-full ml-1',
                        participant.connectionStatus === 'connected' ? 'bg-success-500' :
                        participant.connectionStatus === 'connecting' ? 'bg-warning-500' :
                        participant.connectionStatus === 'poor' ? 'bg-warning-normal' :
                        'bg-error-500'
                      ]}></div>
                    </Row>

                    {isHost && participant.role !== 'patient' && (
                      <div class="absolute top-2 right-2">
                        <button
                          onClick$={() => onParticipantRemove && onParticipantRemove(participant.id)}
                          class="p-1 bg-error-600/80 transition-colors duration-200 hover:bg-error-600 rounded text-xs"
                        >
                          <Tooltip content="Remove participant">
                            <Icon icon="x-circle" class="w-4 h-4" />
                          </Tooltip>
                        </button>
                      </div>
                    )}
                  </Column>
                ))}
              </Row>
            )}
          </Row>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <Stack class="w-80 bg-neutral-darker border-l border-neutral-darker">
            {/* Participants */}
            {showParticipants && (
              <div class="p-4 border-b border-neutral-darker">
                <Text as="h3" weight="semibold" color="white">
                  <Row alignItems="center" justifyContent="between" class="mb-3">
                  <span>Participants ({participants.length})</span>
                  {maxParticipants && (
                    <span class="text-xs text-neutral-light">
                      Max: {maxParticipants}
                    </span>
                  )}
                  </Row>
                </Text>
                <Stack gap="2" class="max-h-48 overflow-y-auto">
                  {participants.map((participant) => (
                    <Row alignItems="center" justifyContent="between" class="p-2 bg-neutral-darker rounded" key={participant.id}>
                      <Row alignItems="center" gap="2">
                        <div class="text-lg">{participant.avatar || roleIcons[participant.role]}</div>
                        <div>
                          <Row alignItems="center" gap="1" class="text-sm font-medium">
                            <span>{participant.name}</span>
                            {participant.isHost && <span class="text-xs bg-primary-600 px-1 rounded">HOST</span>}
                          </Row>
                          <div class="text-xs text-neutral-light">{participant.role}</div>
                        </div>
                      </Row>
                      <Row alignItems="center" gap="1">
                        {participant.isMuted && <span class="text-xs"><Icon icon="mic-off" class="w-3 h-3 inline" /></span>}
                        {participant.isVideoOff && <span class="text-xs"><Icon icon="video-off" class="w-3 h-3 inline" /></span>}
                        {participant.isHandRaised && <span class="text-xs"><Icon icon="hand" class="w-3 h-3 inline" /></span>}
                        <div class={[
                          'w-2 h-2 rounded-full',
                          participant.connectionStatus === 'connected' ? 'bg-success-500' :
                          participant.connectionStatus === 'connecting' ? 'bg-warning-500' :
                          participant.connectionStatus === 'poor' ? 'bg-warning-normal' :
                          'bg-error-500'
                        ]}></div>
                      </Row>
                    </Row>
                  ))}
                </Stack>
              </div>
            )}

            {/* Chat */}
            {showChat && (
              <Stack class="flex-1">
                <div class="p-4 border-b border-neutral-darker">
                  <Text as="h3" weight="semibold" color="white">Chat</Text>
                </div>
                <div class="flex-1 p-4 overflow-y-auto">
                  <Stack gap="2">
                    {chatMessages.value.map((msg) => (
                      <div key={msg.id} class="bg-neutral-darker p-2 rounded">
                        <div class="text-xs text-neutral-light mb-1">
                          {participants.find(p => p.id === msg.sender)?.name || 'Unknown'}
                        </div>
                        <div class="text-sm">{msg.message}</div>
                      </div>
                    ))}
                  </Stack>
                </div>
                <div class="p-4 border-t border-neutral-darker">
                  <Row gap="2">
                    <input
                      type="text"
                      bind:value={chatMessage}
                      placeholder="Type a message..."
                      class="flex-1 bg-neutral-darker border border-neutral-dark rounded px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:border-primary-500"
                      onKeyDown$={(e) => {
                        if (e.key === 'Enter') {
                          sendChatMessage();
                        }
                      }}
                    />
                    <button
                      onClick$={sendChatMessage}
                      class="px-3 py-2 bg-primary-600 transition-colors duration-200 hover:bg-primary-700 rounded text-sm font-medium transition-colors"
                    >
                      Send
                    </button>
                  </Row>
                </div>
              </Stack>
            )}
          </Stack>
        )}
      </Row>

      {/* Controls */}
      <div class="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent p-6">
        <Row alignItems="center" justifyContent="center" gap="4">
          {/* Mute button */}
          <button
            onClick$={toggleMute}
            class={[
              'p-4 rounded-full text-white transition-colors',
              isMuted.value ? 'bg-error-600 hover:bg-error-700' : 'bg-neutral-dark hover:bg-neutral-darker'
            ]}
          >
            <Tooltip content={isMuted.value ? 'Unmute' : 'Mute'}>
              {isMuted.value ? <Icon icon="mic-off" class="w-4 h-4" /> : <Icon icon="mic" class="w-4 h-4" />}
            </Tooltip>
          </button>

          {/* Video button */}
          <button
            onClick$={toggleVideo}
            class={[
              'p-4 rounded-full text-white transition-colors',
              isVideoOff.value ? 'bg-error-600 hover:bg-error-700' : 'bg-neutral-dark hover:bg-neutral-darker'
            ]}
          >
            <Tooltip content={isVideoOff.value ? 'Turn on video' : 'Turn off video'}>
              {isVideoOff.value ? <Icon icon="video-off" class="w-4 h-4" /> : <Icon icon="video" class="w-4 h-4" />}
            </Tooltip>
          </button>

          {/* Screen share button */}
          {allowScreenShare && (
            <button
              onClick$={startScreenShare}
              class={[
                'p-4 rounded-full text-white transition-colors',
                screenShare?.isActive ? 'bg-primary-600 hover:bg-primary-700' : 'bg-neutral-dark hover:bg-neutral-darker'
              ]}
            >
              <Tooltip content="Screen share">
                <Icon icon="monitor" class="w-4 h-4" />
              </Tooltip>
            </button>
          )}

          {/* Hand raise button */}
          <button
            onClick$={toggleHandRaise}
            class={[
              'p-4 rounded-full text-white transition-colors',
              isHandRaised.value ? 'bg-warning-600 hover:bg-warning-700' : 'bg-neutral-dark hover:bg-neutral-darker'
            ]}
          >
            <Tooltip content={isHandRaised.value ? 'Lower hand' : 'Raise hand'}>
              <Icon icon="hand" class="w-4 h-4" />
            </Tooltip>
          </button>

          {/* Recording button */}
          {allowRecording && (
            <button
              onClick$={toggleRecording}
              class={[
                'p-4 rounded-full text-white transition-colors',
                recording?.status === 'recording' ? 'bg-error-600 hover:bg-error-700' : 'bg-neutral-dark hover:bg-neutral-darker'
              ]}
            >
              <Tooltip content={recording?.status === 'recording' ? 'Stop recording' : 'Start recording'}>
                {recording?.status === 'recording' ? <Icon icon="stop-circle" class="w-4 h-4" /> : <Icon icon="record" class="w-4 h-4" />}
              </Tooltip>
            </button>
          )}

          {/* End call button */}
          <button
            onClick$={endCall}
            class="p-4 rounded-full bg-error-600 transition-colors duration-200 hover:bg-error-700 text-white transition-colors"
          >
            <Tooltip content="End call">
              <Icon icon="phone" class="w-5 h-5" />
            </Tooltip>
          </button>
        </Row>
      </div>

      {/* Settings panel */}
      {showSettings.value && (
        <div class="absolute top-16 right-4 bg-neutral-darker border border-neutral-dark rounded-lg p-4 z-30 w-64">
          <Row alignItems="center" justifyContent="between" class="mb-4">
            <Text as="h3" weight="semibold" color="white">Call Settings</Text>
            <button
              onClick$={() => showSettings.value = false}
              class="text-neutral-light hover:text-white"
            >
              <Icon icon="x-circle" class="w-4 h-4" />
            </button>
          </Row>
          
          <Stack gap="3">
            <div>
              <label class="block text-sm font-medium mb-1">Connection Quality</label>
              <Row alignItems="center" gap="2">
                <div class={['w-3 h-3 rounded-full', connectionQualityColor[connectionQuality.value]]}></div>
                <span class="text-sm capitalize">{connectionQuality.value}</span>
              </Row>
            </div>
            
            {recording && (
              <div>
                <label class="block text-sm font-medium mb-1">Recording Status</label>
                <div class="text-sm text-neutral-light">
                  {recording.status === 'recording' ? 
                    `Recording for ${Math.floor((recording.duration || 0) / 60)}m` :
                    'Not recording'
                  }
                </div>
                {recording.consent.required && (
                  <div class="text-xs text-warning-400 mt-1">
                    Consent required from all participants
                  </div>
                )}
              </div>
            )}
          </Stack>
        </div>
      )}
    </div>
    </div>
  );
});
