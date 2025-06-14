import 'react-native-gesture-handler';
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import Firebase - must be imported somewhere in the app before using it
import "./config/firebase";
import { RootNavigator } from "./navigation/RootNavigator";
import { AuthenticatedUserProvider } from "./providers";

const App = () => {
  return (
    <AuthenticatedUserProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
  );
};

export default App;
