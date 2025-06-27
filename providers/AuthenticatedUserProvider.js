import React, { useState, createContext } from 'react';

export const AuthenticatedUserContext = createContext({
  user: null,
  setUser: () => {},
});

export const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Ensure setUser is always a function
  const safeSetUser = (newUser) => {
    try {
      setUser(newUser);
    } catch (error) {
      console.error('Error setting user:', error);
    }
  };

  const contextValue = {
    user,
    setUser: safeSetUser,
  };

  return (
    <AuthenticatedUserContext.Provider value={contextValue}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
