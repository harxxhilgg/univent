import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import CurrentEvents from "../CurrentEvents";
import { formatTime } from "../EventCard";

jest.mock('react-native-shimmer-placeholder', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, style }: any) => (
      <View testID="shimmer-placeholder" style={style}>
        {children}
      </View>
    ),
  }
});

interface MockEvent {
  id: number,
  title: string,
  organizer: string,
  event_date: string,
  event_time: string,
  location: string,
  image_url: string,
  is_paid: boolean
};

const mockEvent: MockEvent = {
  id: 1,
  title: 'Testing Makes Production Perfect',
  organizer: 'Valve',
  event_date: '2025-11-17',
  event_time: '04:33:00',
  location: 'Nurburgring, Germany',
  image_url: 'https://i.pinimg.com/736x/5a/f8/42/5af8422bec9048a0eeef3fcc6015813f.jpg',
  is_paid: true
};

const mockEventFree = {
  ...mockEvent,
  is_paid: false
};

describe('Utility Function', () => {
  describe('formatTime', () => {
    it('formats time correctly in 24-hour format', () => {
      expect(formatTime('14:30:00')).toBe('14:30');
      expect(formatTime('04:33:00')).toBe('04:33');
    });
  });
});

describe('CurrentEvents Component', () => {
  it('renders correctly with all elements', () => {
    render(<CurrentEvents event={mockEvent} />);

    expect(screen.getByText('Testing Makes Production Perfect')).toBeTruthy();
    expect(screen.getByText('Valve')).toBeTruthy();
    expect(screen.getByText('04:33 • Nurburgring, Germany')).toBeTruthy();
    expect(screen.getByText('Paid'));
    expect(screen.getByText('Going on'));
  });

  it('shows "Free" tag when is free', () => {
    render(<CurrentEvents event={mockEventFree} />);
    expect(screen.getByText('Free'));
  });

  it('shows shimmer placeholder while image is loading', () => {
    const { getByTestId } = render(<CurrentEvents event={mockEvent} />);
    expect(getByTestId('shimmer-placeholder')).toBeTruthy();
  });

  it('hides shimmer when image loads', async () => {
    const { getByTestId, queryByTestId } = render(<CurrentEvents event={mockEvent} />);
    fireEvent(getByTestId('event-image'), 'load');

    await waitFor(() => {
      expect(queryByTestId('shimmer-placeholder')).toBeNull();
    });
  });

  it('handles image load error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    const { getByTestId, queryByTestId } = render(<CurrentEvents event={mockEvent} />);

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
  });
});