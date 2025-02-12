import { useState } from "react";
import { UserContext } from "./UserContext";

interface ProviderProps {
  children?: React.ReactNode;
};

export const UserProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
