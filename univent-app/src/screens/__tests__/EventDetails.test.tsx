import { fireEvent, render, screen } from "@testing-library/react-native";
import { UserContext } from "../../context/UserContext";
import EventDetails from "../EventDetails";
import * as useToastModule from "../../components/useToast";

jest.mock('@expo/vector-icons/FontAwesome6', () => 'FontAwesome6');
jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));
jest.mock('../../components/useToast.ts', () => ({
  __esModule: true,
  useToast: () => ({
    showInfo: jest.fn(),
    showError: jest.fn(),
    showSuccess: jest.fn()
  })
}));

interface MockEvent {
  id: number,
  title: string,
  organizer: string,
  event_date: string,
  event_time: string,
  location: string,
  image_url: string,
  is_paid: boolean,
  created_by_email: string
};

const mockRoute: { params: { event: MockEvent } } = {
  params: {
    event: {
      id: 1,
      title: 'Testing Makes Production Perfect',
      organizer: 'Valve',
      event_date: '2025-11-17',
      event_time: '14:30:00',
      location: 'Nurburgring, Germany',
      image_url: 'https://i.pinimg.com/736x/5a/f8/42/5af8422bec9048a0eeef3fcc6015813f.jpg',
      is_paid: true,
      created_by_email: 'host@example.com'
    }
  },
};

const mockRouteFreeEvent = {
  params: {
    ...mockRoute.params,
    event: {
      ...mockRoute.params.event,
      is_paid: false
    }
  }
};

describe('EventDetails Component', () => {
  it('renders all main elements correctly', () => {
    render(
      // @ts-ignore
      <UserContext.Provider value={{ user: { email: 'test@example.com' } }}>
        <EventDetails route={mockRoute} />
      </UserContext.Provider>
    );

    expect(screen.getByText('Testing Makes Production Perfect')).toBeTruthy();
    expect(screen.getByText('Valve')).toBeTruthy();
    expect(screen.getByText('Nurburgring, Germany')).toBeTruthy();
    expect(screen.getByText('Register')).toBeTruthy();
  });

  it('displays correct event date information', () => {
    render(
      // @ts-ignore
      <UserContext.Provider value={{ user: { email: 'test@example.com' } }}>
        <EventDetails route={mockRoute} />
      </UserContext.Provider>
    );

    expect(screen.getByText('Nov')).toBeTruthy();
    expect(screen.getByText('17')).toBeTruthy();
    expect(screen.getByText('Monday, November 17')).toBeTruthy();
    expect(screen.getByText('14:30')).toBeTruthy();
  });

  it('displays "Free" if event is free', () => {
    render(
      // @ts-ignore
      <UserContext.Provider value={{ user: { email: 'test@example.com' } }}>
        <EventDetails route={mockRouteFreeEvent} />
      </UserContext.Provider>
    );

    expect(screen.getByText('Free')).toBeTruthy();
  });

  it('displays static text', () => {
    render(
      // @ts-ignore
      <UserContext.Provider value={{ user: { email: 'test@example.com' } }}>
        <EventDetails route={mockRoute} />
      </UserContext.Provider>
    );

    expect(screen.getByText('Event Fee')).toBeTruthy();
  });

  it('calls register handler when Register button is pressed', () => {
    const mockShowInfo = jest.fn();
    // @ts-ignore
    jest.spyOn(useToastModule, 'useToast').mockReturnValue({
      showInfo: mockShowInfo
    });

    render(
      // @ts-ignore 
      <UserContext.Provider value={{ user: { email: 'test@example.com' } }}>
        <EventDetails route={mockRoute} />
      </UserContext.Provider>
    );

    fireEvent.press(screen.getByTestId('register-button'));
    expect(mockShowInfo).toHaveBeenCalledWith(3000, 'Feature yet to be implemented');
  });

  it('show guest message when guest user tries to register', () => {
    const mockShowInfo = jest.fn();
    // @ts-ignore
    jest.spyOn(useToastModule, 'useToast').mockReturnValue({
      showInfo: mockShowInfo
    });

    render(
      // @ts-ignore
      <UserContext.Provider value={{ user: { email: 'user.guest@univent.com' } }}>
        <EventDetails route={mockRoute} />
      </UserContext.Provider>
    );

    fireEvent.press(screen.getByTestId('register-button'));
    expect(mockShowInfo).toHaveBeenCalledWith(3000, 'Guest users cannot register for events', 'Please Login or Signup to register');
  });

  it('show error message when host tries to register to own event', () => {
    const mockShowError = jest.fn();
    // @ts-ignore
    jest.spyOn(useToastModule, 'useToast').mockReturnValue({
      showError: mockShowError
    });

    const hostEvent = { ...mockRoute.params.event, created_by_email: 'host@example.com' };

    render(
      // @ts-ignore
      <UserContext.Provider value={{ user: { email: 'host@example.com' } }}>
        <EventDetails route={{ params: { event: hostEvent } }} />
      </UserContext.Provider>
    );

    fireEvent.press(screen.getByTestId('register-button'));
    expect(mockShowError).toHaveBeenCalledWith(3000, 'You cannot register for this event', 'You are the host of this event');
  });
});