import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import EventCard from "../EventCard";
import { getMonthAndDay, calculateTimeUntil, formatTime } from "../EventCard";

jest.mock('react-native-shimmer-placeholder', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, style }: any) => (
      <View testID="shimmer-placeholder" style={style}>
        {children}
      </View>
    ),
  };
});

interface MockEvent {
  id: number,
  title: string,
  organizer: string,
  event_date: string,
  event_time: string,
  location: string,
  image_url: string,
  is_paid: boolean,
  created_by_email: string,
  created_at: string
};

const mockEvent: MockEvent = {
  id: 1,
  title: 'Testing Makes Production Perfect',
  organizer: 'Valve',
  event_date: '2025-11-17',
  event_time: '04:33:00',
  location: 'Nurburgring, Germany',
  image_url: 'https://i.pinimg.com/736x/5a/f8/42/5af8422bec9048a0eeef3fcc6015813f.jpg',
  is_paid: true,
  created_by_email: 'host@example.com',
  created_at: '2025-06-07 22:10:00'
};

const mockEventFree = {
  ...mockEvent,
  is_paid: false
};

describe('Utility Function', () => {
  describe('getMonthAndDay', () => {
    it('returns correct month and day', () => {
      const result = getMonthAndDay('2025-11-17');
      expect(result.month).toBe('Nov');
      expect(result.day).toBe('17');
    });
  });

  describe('calculateTimeUntil', () => {
    beforeAll(() => {
      // Mock current date to be 2025-06-07 for consistant testing
      jest.useFakeTimers().setSystemTime(new Date('2025-06-08'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns "Today" when event is today', () => {
      expect(calculateTimeUntil('2025-06-08', '14:30:00')).toBe('Today');
    });

    it('returns "Tomorrow" when event is tomorrow', () => {
      expect(calculateTimeUntil('2025-06-09', '14:30:00')).toBe('Tomorrow');
    });

    it('returns days left when event is in future', () => {
      expect(calculateTimeUntil('2025-06-13', '14:30:00')).toBe('5 days left');
    });

    it('returns "Yesterday" when event was yesterday', () => {
      expect(calculateTimeUntil('2025-06-07', '14:30:00')).toBe('Yesterday');
    });

    it('returns "Event Ended" when event was more than 1 day ago', () => {
      expect(calculateTimeUntil('2025-06-06', '14:30:00')).toBe('Event Ended');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly in 24-hour format', () => {
      expect(formatTime('14:30:00')).toBe('14:30');
      expect(formatTime('04:33:00')).toBe('04:33');
    });
  });
});

describe('EventCard Component', () => {
  it('renders correctly with all elements', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('Testing Makes Production Perfect')).toBeTruthy();
    expect(screen.getByText('Valve')).toBeTruthy();
    expect(screen.getByText('04:33  •  Nurburgring, Germany')).toBeTruthy();
    expect(screen.getByText('Nov')).toBeTruthy();
    expect(screen.getByText('17')).toBeTruthy();
    expect(screen.getByText('$ Paid')).toBeTruthy();
  });

  it('shows "Free" tag when event is free', () => {
    render(<EventCard event={mockEventFree} />);
    expect(screen.getByText('$ Free')).toBeTruthy();
  });

  it('displays the correct time until text for Nov 17 event from June 8', () => {
    render(<EventCard event={mockEvent} />);
    // 2025-11-17 is 162 days after 2025-06-08
    expect(screen.getByText('160 days left')).toBeTruthy();
  });

  it('shows shimmer placeholder while image is loading', () => {
    const { getByTestId } = render(<EventCard event={mockEvent} />);
    // The shimmer placeholder should be visible initially
    expect(getByTestId('shimmer-placeholder')).toBeTruthy();
  });

  it('hides shimmer when image loads', async () => {
    const { getByTestId, queryByTestId } = render(<EventCard event={mockEvent} />);
    // simulate image load
    fireEvent(getByTestId('event-image'), 'load');

    await waitFor(() => {
      expect(queryByTestId('shimmer-placeholder')).toBeNull();
    });
  });

  it('handles image load error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    const { getByTestId, queryByTestId } = render(<EventCard event={mockEvent} />);

    fireEvent(getByTestId('event-image'), 'error', {
      nativeEvent: { error: 'Failed to load' }
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Image load error for event ',
        1,
        ' : ',
        'Failed to load'
      );
      expect(queryByTestId('shimmer-placeholder')).toBeNull();
    });

    consoleSpy.mockRestore();
  });
});