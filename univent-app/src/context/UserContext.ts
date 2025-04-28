import { createContext } from "react";

export type User = {
  id: number;
  username: string;
  email: string;
};

interface UserContextType {
  user: any | null;
  setUser: (user: any | null) => void;
  isLoading: boolean;
  initialRoute: any;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: (user: any) => {},
  isLoading: true,
  initialRoute: "Auth",
});
