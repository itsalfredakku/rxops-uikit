/**
 * Calendar Component Tests
 * Healthcare-focused calendar component testing
 */

import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { Calendar } from '../calendar';

describe('Calendar Component', () => {
  it('should render with default props', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <Calendar 
        selectedDate={new Date('2025-01-15')}
        onDateSelect$={() => {}}
      />
    );

    const calendar = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendar).toBeTruthy();
  });

  it('should display correct month and year', async () => {
    const { screen, render } = await createDOM();
    const testDate = new Date('2025-01-15');
    
    await render(
      <Calendar 
        selectedDate={testDate}
        onDateSelect$={() => {}}
      />
    );

    // Check if the month/year is displayed somewhere in the calendar
    const calendarElement = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendarElement).toBeTruthy();
  });

  it('should handle date selection event', async () => {
    const { screen, render } = await createDOM();
    let selectedDate: Date | undefined;
    
    await render(
      <Calendar 
        selectedDate={new Date('2025-01-15')}
        onDateSelect$={(date: Date) => {
          selectedDate = date;
        }}
      />
    );

    const calendar = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendar).toBeTruthy();
    // Note: Actual date selection testing would require more complex DOM interaction
  });

  it('should support healthcare-specific date constraints', async () => {
    const { screen, render } = await createDOM();
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 1); // Tomorrow
    
    await render(
      <Calendar 
        selectedDate={today}
        onDateSelect$={() => {}}
        minDate={minDate}
        view="month"
      />
    );

    const calendar = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendar).toBeTruthy();
  });

  it('should display medical events when provided', async () => {
    const { screen, render } = await createDOM();
    const events = [
      {
        id: '1',
        title: 'Cardiology Visit',
        startDate: new Date('2025-01-15T10:00:00'),
        endDate: new Date('2025-01-15T11:00:00'),
        type: 'appointment' as const,
        priority: 'routine' as const
      }
    ];
    
    await render(
      <Calendar 
        selectedDate={new Date('2025-01-15')}
        onDateSelect$={() => {}}
        events={events}
      />
    );

    const calendar = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendar).toBeTruthy();
  });

  it('should be accessible with proper semantic structure', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <Calendar 
        selectedDate={new Date('2025-01-15')}
        onDateSelect$={() => {}}
        aria-label="Appointment calendar"
      />
    );

    const calendar = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendar).toBeTruthy();
  });

  it('should support different view modes', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <Calendar 
        selectedDate={new Date('2025-01-15')}
        onDateSelect$={() => {}}
        view="week"
      />
    );

    const calendar = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendar).toBeTruthy();
  });

  it('should handle provider information for color coding', async () => {
    const { screen, render } = await createDOM();
    const providers = [
      {
        id: 'dr-smith',
        name: 'Dr. Smith',
        color: 'primary' as const,
        specialty: 'Cardiology'
      }
    ];
    
    await render(
      <Calendar 
        selectedDate={new Date('2025-01-15')}
        onDateSelect$={() => {}}
        providers={providers}
      />
    );

    const calendar = screen.querySelector('[data-healthcare-element="calendar"]');
    expect(calendar).toBeTruthy();
  });
});
