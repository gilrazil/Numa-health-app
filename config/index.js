// For development simplicity, just export Firebase components
export { auth, db, storage } from "./firebase";
export { default as firebase } from "./firebase";

// Theme and images exports
export const Colors = {
  orange: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
  mediumGray: '#666666',
  lightGray: '#F5F5F5'
};

export const Images = {
  logo: require("../assets/numa-logo.png"),
};
