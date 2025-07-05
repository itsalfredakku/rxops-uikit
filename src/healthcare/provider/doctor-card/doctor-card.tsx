import { component$, useSignal, $ } from "@builder.io/qwik";
import { Text } from "../../../core/atoms/text/text";
import { Avatar } from "../../../core/atoms/avatar/avatar";
import { Badge } from "../../../core/atoms/badge/index";
import { Button } from "../../../core/atoms/button/button";
import { Stack } from "../../../layouts";
import { List, ListItem } from "../../../core/organisms/list/list";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviewCount?: number;
  consultationFee: number;
  image?: string;
  isAvailable?: boolean;
  languages?: string[];
  nextAvailableSlot?: string;
  location?: string;
  education?: string[];
  awards?: string[];
  aboutMe?: string;
  consultationModes?: ("in-person" | "video" | "phone")[];
}

export interface DoctorCardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  doctor: Doctor;
  variant?: "compact" | "detailed" | "featured";
  onConsult$?: (doctorId: string) => void;
  onFavorite$?: (doctorId: string, isFavorite: boolean) => void;
  onViewProfile$?: (doctorId: string) => void;
  onCall$?: (doctorId: string) => void;
  onMessage$?: (doctorId: string) => void;
  isFavorite?: boolean;
  showQuickActions?: boolean;
}

export const DoctorCard = component$<DoctorCardProps>((props) => {
  const {
    doctor, 
    variant = "compact",
    onConsult$,
    onFavorite$,
    onViewProfile$,
    onCall$,
    onMessage$,
    isFavorite = false,
    showQuickActions = true,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const isExpanded = useSignal(false);
  const currentFavorite = useSignal(isFavorite);

  const handleFavorite = $(() => {
    currentFavorite.value = !currentFavorite.value;
    onFavorite$?.(doctor.id, currentFavorite.value);
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} class="fas fa-star text-warning-400"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} class="fas fa-star-half-alt text-warning-400"></i>);
      } else {
        stars.push(<i key={i} class="far fa-star text-neutral-light"></i>);
      }
    }
    return stars;
  };

  const getAvailabilityColor = () => {
    if (!doctor.isAvailable) return "text-error-600";
    if (doctor.nextAvailableSlot) {
      const slotTime = new Date(doctor.nextAvailableSlot);
      const now = new Date();
      const diffHours = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours <= 2) return "text-success-600";
      if (diffHours <= 24) return "text-warning-600";
    }
    return "text-primary-600";
  };

  const formatNextSlot = () => {
    if (!doctor.nextAvailableSlot) return null;
    const slotTime = new Date(doctor.nextAvailableSlot);
    const now = new Date();
    const diffHours = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours <= 1) return "Available now";
    if (diffHours <= 24) return `Available in ${Math.round(diffHours)} hours`;
    return `Next: ${slotTime.toLocaleDateString()} ${slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const cardClasses = mergeClasses(
    "ui-doctor-card bg-white rounded-xl border border-neutral-light p-4 hover:shadow-lg transition-all duration-300 relative group",
    qwikClass,
    className
  );

  if (variant === "compact") {
    return (
      <div 
        class={cardClasses}
        style={style}
        {...rest}
      >
        {/* Favorite Button */}
        <button
          onClick$={handleFavorite}
          class={[
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10",
            "opacity-0 group-hover:opacity-100",
            currentFavorite.value 
              ? "bg-error-100 text-error-600 opacity-100" 
              : "bg-neutral-lighter text-neutral-normal hover:bg-error-100 hover:text-error-600"
          ]}
          aria-label={currentFavorite.value ? "Remove from favorites" : "Add to favorites"}
        >
          <i class={currentFavorite.value ? "fas fa-heart" : "far fa-heart"}></i>
        </button>

        <Stack direction="row" alignItems="start" gap="4" wrap="wrap">
          <div class="relative">
            <Avatar
              src={doctor.image}
              alt={doctor.name}
              size="lg"
              name={doctor.name}
            />
            {doctor.isAvailable && (
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <Stack direction="column" class="flex-1 min-w-0">
            <Stack direction="row" alignItems="start" justifyContent="between" class="mb-2">
              <div>
                <Text as="h3" weight="semibold" size="lg" color="gray-900" class="truncate mb-1">
                  Dr. {doctor.name}
                </Text>
                <Text as="p" size="sm" color="gray-600" class="mb-1">
                  {doctor.specialization}
                </Text>
              </div>
            </Stack>
            
            <Stack direction="row" alignItems="center" gap="1" class="mb-2">
              {renderStars(doctor.rating)}
              <span class="text-sm text-neutral-normal ml-1">
                {doctor.rating.toFixed(1)} 
                {doctor.reviewCount && `(${doctor.reviewCount} reviews)`}
              </span>
            </Stack>
            
            <Stack direction="row" alignItems="center" gap="4" class="text-sm text-neutral-light mb-3">
              <Stack direction="row" alignItems="center">
                <i class="fas fa-user-graduate mr-1"></i>
                {doctor.experience} years
              </Stack>
              {doctor.location && (
                <Stack direction="row" alignItems="center">
                  <i class="fas fa-map-marker-alt mr-1"></i>
                  {doctor.location}
                </Stack>
              )}
            </Stack>

            {/* Consultation Modes */}
            {doctor.consultationModes && (
              <Stack direction="row" gap="2" class="mb-3">
                {doctor.consultationModes.map((mode) => (
                  <Badge key={mode} style="secondary" size="sm">
                    <i class={
                      mode === "video" ? "fas fa-video mr-1" :
                      mode === "phone" ? "fas fa-phone mr-1" :
                      "fas fa-user-md mr-1"
                    }></i>
                    {mode === "in-person" ? "In-person" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Badge>
                ))}
              </Stack>
            )}

            {/* Availability Status */}
            <div class={`text-sm mb-3 ${getAvailabilityColor()}`}>
              <i class="fas fa-clock mr-1"></i>
              {doctor.isAvailable ? formatNextSlot() || "Available now" : "Not available"}
            </div>
            
            <Stack direction="row" alignItems="center" justifyContent="between">
              <div class="text-lg font-bold text-success-600">
                ₹{doctor.consultationFee}
                <span class="text-sm font-normal text-neutral-light">/consult</span>
              </div>
              
              {showQuickActions ? (
                <Stack direction="row" gap="2">
                  {onCall$ && (
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick$={() => onCall$(doctor.id)}
                      class="!px-2 !py-1"
                      aria-label="Call doctor"
                    >
                      <i class="fas fa-phone"></i>
                    </Button>
                  )}
                  {onMessage$ && (
                    <Button
                      variant="outlined" 
                      size="sm"
                      onClick$={() => onMessage$(doctor.id)}
                      class="!px-2 !py-1"
                      aria-label="Message doctor"
                    >
                      <i class="fas fa-comment"></i>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick$={() => onConsult$?.(doctor.id)}
                    disabled={!doctor.isAvailable}
                  >
                    {doctor.consultationModes?.includes("video") ? "Video Call" : "Book Now"}
                  </Button>
                </Stack>
              ) : (
                <Button
                  size="sm"
                  onClick$={() => onConsult$?.(doctor.id)}
                  disabled={!doctor.isAvailable}
                >
                  {doctor.consultationModes?.includes("video") ? "Video Call" : "Book Now"}
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </div>
    );
  }

  // Detailed variant with expandable content
  if (variant === "detailed") {
    const detailedClasses = mergeClasses(
      "ui-doctor-card bg-white rounded-xl border border-neutral-light overflow-hidden hover:shadow-lg transition-all duration-300",
      qwikClass,
      className
    );
    
    return (
      <div 
        class={detailedClasses}
        style={style}
        {...rest}
      >
        <div class="p-6">
          {/* Header with favorite button */}
          <Stack direction="row" alignItems="start" justifyContent="between" class="mb-4">
            <Stack direction="row" alignItems="start" gap="4">
              <div class="relative">
                <Avatar
                  src={doctor.image}
                  alt={doctor.name}
                  size="xl"
                  name={doctor.name}
                />
                {doctor.isAvailable && (
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <Text as="h3" weight="bold" size="xl" color="gray-900" class="mb-1">
                  Dr. {doctor.name}
                </Text>
                <Text as="p" color="gray-600" class="mb-2">{doctor.specialization}</Text>
                <Stack direction="row" alignItems="center" gap="1" class="mb-2">
                  {renderStars(doctor.rating)}
                  <span class="text-sm text-neutral-normal ml-2">
                    {doctor.rating.toFixed(1)} ({doctor.reviewCount || 0} reviews)
                  </span>
                </Stack>
              </div>
            </Stack>
            
            <button
              onClick$={handleFavorite}
              class={[
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                currentFavorite.value 
                  ? "bg-error-100 text-error-600" 
                  : "bg-neutral-lighter text-neutral-normal hover:bg-error-100 hover:text-error-600"
              ]}
              aria-label={currentFavorite.value ? "Remove from favorites" : "Add to favorites"}
            >
              <i class={currentFavorite.value ? "fas fa-heart" : "far fa-heart"}></i>
            </button>
          </Stack>

          {/* Quick Info */}
          <Stack direction="row" gap="4">
            <div class="text-center p-3 bg-neutral-lighter rounded-lg">
              <div class="text-2xl font-bold text-primary-600">{doctor.experience}</div>
              <div class="text-sm text-neutral-normal">Years Exp.</div>
            </div>
            <div class="text-center p-3 bg-neutral-lighter rounded-lg">
              <div class="text-2xl font-bold text-success-600">₹{doctor.consultationFee}</div>
              <div class="text-sm text-neutral-normal">Consultation</div>
            </div>
            <div class="text-center p-3 bg-neutral-lighter rounded-lg">
              <div class="text-2xl font-bold text-warning-600">{doctor.rating.toFixed(1)}</div>
              <div class="text-sm text-neutral-normal">Rating</div>
            </div>
            <div class="text-center p-3 bg-neutral-lighter rounded-lg">
              <div class={`text-2xl font-bold ${doctor.isAvailable ? 'text-success-600' : 'text-error-600'}`}>
                {doctor.isAvailable ? '●' : '○'}
              </div>
              <div class="text-sm text-neutral-normal">Status</div>
            </div>
          </Stack>

          {/* Expandable Content */}
          {isExpanded.value && (
            <Stack direction="column" gap="4" class="mb-4">
              {doctor.aboutMe && (
                <div>
                  <Text as="h4" weight="semibold" color="gray-900" class="mb-2">About</Text>
                  <Text as="p" color="gray-600" size="sm">{doctor.aboutMe}</Text>
                </div>
              )}
              
              {doctor.education && doctor.education.length > 0 && (
                <div>
                  <Text as="h4" weight="semibold" color="blue-900" class="mb-2">Education</Text>
                  <List variant="none" size="sm">
                    {doctor.education.map((edu, index) => (
                      <ListItem key={index}>
                        <Stack direction="row" alignItems="center" gap="2" class="text-sm text-neutral-normal">
                          <i class="fas fa-graduation-cap text-primary-600"></i>
                          {edu}
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                </div>
              )}
              
              {doctor.awards && doctor.awards.length > 0 && (
                <div>
                  <Text as="h4" weight="semibold" color="orange-900" class="mb-2">Awards & Recognition</Text>
                  <List variant="none" size="sm">
                    {doctor.awards.map((award, index) => (
                      <ListItem key={index}>
                        <Stack direction="row" alignItems="center" gap="2" class="text-sm text-neutral-normal">
                          <i class="fas fa-trophy text-warning-600"></i>
                          {award}
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                </div>
              )}
            </Stack>
          )}

          {/* Action Buttons */}
          <Stack direction="row" alignItems="center" justifyContent="between" class="pt-4 border-t">
            <button
              onClick$={() => isExpanded.value = !isExpanded.value}
              class="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {isExpanded.value ? 'Show Less' : 'View Details'}
              <i class={`fas fa-chevron-${isExpanded.value ? 'up' : 'down'} ml-1`}></i>
            </button>
            
            <Stack direction="row" gap="2">
              {onViewProfile$ && (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick$={() => onViewProfile$(doctor.id)}
                >
                  View Profile
                </Button>
              )}
              <Button
                onClick$={() => onConsult$?.(doctor.id)}
                disabled={!doctor.isAvailable}
              >
                <i class="fas fa-video mr-2"></i>
                Book Consultation
              </Button>
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }

  // Default compact variant fallback
  return null;
});
