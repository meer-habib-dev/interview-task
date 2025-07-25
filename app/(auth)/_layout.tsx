import { Stack } from 'expo-router/stack';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login',
          animation: 'fade'
        }} 
      />
    </Stack>
  );
}