import { Image, StyleSheet, TextInput, View, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (username.trim().length > 0) {
      setIsSubmitted(true);
    }
  };

  const handleLogout = () => {
    setUsername('');
    setIsSubmitted(false);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E1BEDC', dark: '#1B3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          {isSubmitted ? `Hello, ${username}!` : 'Welcome to the Game Hub!'}
        </ThemedText>
        <HelloWave />
      </ThemedView>

      {!isSubmitted ? (
        <View style={styles.content}>
          <ThemedText type="subtitle">Enter your username:</ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername} // Updates state on user input
          />
          <Button title="Submit" onPress={handleSubmit} disabled={username.trim() === ''} />
        </View>
      ) : (
        <View style={styles.content}>
          <Button title="Logout" onPress={handleLogout} color="red" />
        </View>
      )}

      {isSubmitted && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Choose a Game:</ThemedText>

          <View style={styles.buttonContainer}>
            <Button title="🎯 Stop Timer Game" onPress={() => router.push('/stopTimer')} />
            <Button title="📈 Game Derivative" onPress={() => router.push('/gameDerivative')} />
          </View>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '80%',
    gap: 10,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginVertical: 8,
    width: '100%',
    textAlign: 'center',
  },
});
