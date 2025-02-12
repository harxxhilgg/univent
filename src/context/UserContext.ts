import { createContext } from "react";

interface UserContextType {
  user: any | null;
  setUser: (user: any | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});
