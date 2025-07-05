import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Row } from "../../../layouts";

export interface DateTimePickerProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  value?: string;
  onChange$?: (date: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  showTime?: boolean;
  timeFormat?: "12h" | "24h";
  testId?: string;
}

const datePickerVariants = {
  base: [
    "w-full border font-normal bg-white relative",
    "transition-all duration-200 ease-in-out",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0",
    "disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
  ].join(" "),
  
  variants: {
    default: [
      "border-neutral-300 text-neutral-900 rounded-lg",
      "hover:border-neutral-400",
      "focus-within:border-primary-500 focus-within:ring-primary-100"
    ].join(" "),
    
    filled: [
      "border-transparent bg-neutral-100 rounded-lg",
      "hover:bg-neutral-200",
      "focus-within:bg-white focus-within:border-primary-500 focus-within:ring-primary-100"
    ].join(" "),
    
    outlined: [
      "border-2 border-neutral-300 rounded-lg",
      "hover:border-neutral-400",
      "focus-within:border-primary-500 focus-within:ring-primary-100"
    ].join(" ")
  },
  
  sizes: {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
  }
};

export const DateTimePicker = component$<DateTimePickerProps>(({ 
  value = "",
  onChange$,
  label,
  placeholder = "Select date",
  error,
  helperText,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  variant = "default",
  size = "md",
  showTime = false,
  timeFormat = "12h",
  testId,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  const isOpen = useSignal(false);
  const inputRef = useSignal<HTMLInputElement>();
  const selectedDate = useSignal(value);
  const currentMonth = useSignal(new Date());
  const selectedTime = useSignal("12:00");

  // Update selected date when value prop changes
  useTask$(({ track }) => {
    track(() => value);
    selectedDate.value = value;
  });

  const handleDateSelect = $((date: string) => {
    const finalValue = showTime ? `${date} ${selectedTime.value}` : date;
    selectedDate.value = finalValue;
    onChange$?.(finalValue);
    if (!showTime) {
      isOpen.value = false;
    }
  });

  const handleTimeChange = $((time: string) => {
    selectedTime.value = time;
    if (selectedDate.value) {
      const dateOnly = selectedDate.value.split(' ')[0];
      const finalValue = `${dateOnly} ${time}`;
      selectedDate.value = finalValue;
      onChange$?.(finalValue);
    }
  });

  const formatDisplayValue = (dateValue: string) => {
    if (!dateValue) return "";
    
    try {
      const date = new Date(dateValue);
      if (showTime) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: timeFormat === '12h' ? 'numeric' : '2-digit',
          minute: '2-digit',
          hour12: timeFormat === '12h'
        });
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateValue;
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate.value) return false;
    const selectedDateOnly = new Date(selectedDate.value).toDateString();
    return date.toDateString() === selectedDateOnly;
  };

  const calendarDays = generateCalendar();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div 
      class={mergeClasses("relative", qwikClass, className)}
      style={style}
      {...rest}
    >
      {label && (
        <label class="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span class="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div class={[datePickerVariants.base, datePickerVariants.variants[variant], datePickerVariants.sizes[size]]}>
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayValue(selectedDate.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly
          onClick$={() => !disabled && (isOpen.value = !isOpen.value)}
          data-testid={testId}
          class="w-full bg-transparent outline-none cursor-pointer"
          aria-haspopup="dialog"
          aria-expanded={isOpen.value}
          aria-label={label || "Date picker"}
        />
        
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <i class="fas fa-calendar-alt text-neutral-400"></i>
        </div>
      </div>

      {isOpen.value && (
        <div class="absolute z-50 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 min-w-80">
          {/* Calendar Header */}
          <div class="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick$={() => {
                const newMonth = new Date(currentMonth.value);
                newMonth.setMonth(newMonth.getMonth() - 1);
                currentMonth.value = newMonth;
              }}
              class="p-2 transition-colors duration-200 hover:bg-neutral-100 rounded-lg"
              aria-label="Previous month"
            >
              <i class="fas fa-chevron-left text-neutral-600"></i>
            </button>
            
            <h3 class="text-lg font-semibold text-neutral-900">
              {monthNames[currentMonth.value.getMonth()]} {currentMonth.value.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick$={() => {
                const newMonth = new Date(currentMonth.value);
                newMonth.setMonth(newMonth.getMonth() + 1);
                currentMonth.value = newMonth;
              }}
              class="p-2 transition-colors duration-200 hover:bg-neutral-100 rounded-lg"
              aria-label="Next month"
            >
              <i class="fas fa-chevron-right text-neutral-600"></i>
            </button>
          </div>

          {/* Calendar Grid */}
          <Row gap="1" class="mb-4">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <div key={day} class="p-2 text-center text-sm font-medium text-neutral-500">
                {day}
              </div>
            ))}
            
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.value.getMonth();
              const isDisabled = isDateDisabled(date);
              const todayClass = isToday(date) ? "bg-primary-100 border-primary-300" : "";
              const selectedClass = isSelected(date) ? "bg-primary-500 text-white" : "";
              const currentMonthClass = isCurrentMonth ? "text-neutral-900" : "text-neutral-400";
              
              return (
                <button
                  key={index}
                  type="button"
                  disabled={isDisabled}
                  onClick$={() => !isDisabled && handleDateSelect(date.toISOString().split('T')[0])}
                  class={[
                    "p-2 text-sm border border-transparent rounded-lg hover:bg-neutral-100 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                    selectedClass || todayClass,
                    selectedClass ? "" : currentMonthClass
                  ]}
                  aria-label={date.toLocaleDateString()}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </Row>

          {/* Time Picker */}
          {showTime && (
            <div class="border-t pt-4">
              <div class="flex items-center space-x-3">
                <i class="fas fa-clock text-neutral-500"></i>
                <input
                  type="time"
                  value={selectedTime.value}
                  onChange$={(e) => handleTimeChange((e.target as HTMLInputElement).value)}
                  class="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
            <button
              type="button"
              onClick$={() => isOpen.value = false}
              class="px-4 py-2 text-neutral-600 hover:text-neutral-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick$={() => {
                const today = new Date().toISOString().split('T')[0];
                handleDateSelect(today);
                isOpen.value = false;
              }}
              class="px-4 py-2 bg-primary-600 text-white rounded-lg transition-colors duration-200 hover:bg-primary-700 font-medium"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {(error || helperText) && (
        <div class="mt-2">
          {error && (
            <div class="flex items-center text-sm text-error-600">
              <i class="fas fa-exclamation-circle mr-1"></i>
              {error}
            </div>
          )}
          {helperText && !error && (
            <div class="text-sm text-neutral-500">{helperText}</div>
          )}
        </div>
      )}
    </div>
  );
});

// Quick Date Presets for Healthcare
export const AppointmentDatePicker = component$<Omit<DateTimePickerProps, 'minDate' | 'showTime'> & {
  showQuickOptions?: boolean;
}>(({ showQuickOptions = true, ...props }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return (
    <div>
      <DateTimePicker
        {...props}
        minDate={tomorrow.toISOString().split('T')[0]}
        showTime={true}
        timeFormat="12h"
      />
      
      {showQuickOptions && (
        <div class="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick$={() => props.onChange$?.(tomorrow.toISOString().split('T')[0] + ' 09:00')}
            class="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full transition-colors duration-200 hover:bg-primary-200 transition-colors"
          >
            Tomorrow 9 AM
          </button>
          <button
            type="button"
            onClick$={() => props.onChange$?.(nextWeek.toISOString().split('T')[0] + ' 10:00')}
            class="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full transition-colors duration-200 hover:bg-primary-200 transition-colors"
          >
            Next Week
          </button>
          <button
            type="button"
            onClick$={() => props.onChange$?.(nextMonth.toISOString().split('T')[0] + ' 14:00')}
            class="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full transition-colors duration-200 hover:bg-primary-200 transition-colors"
          >
            Next Month
          </button>
        </div>
      )}
    </div>
  );
});
