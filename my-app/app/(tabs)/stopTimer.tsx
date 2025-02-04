import { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function TestScreen() {
  const router = useRouter();
  const [time, setTime] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState(0);
  const [stoppedTime, setStoppedTime] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 0.2); // ⏳ Increased speed (faster decrement)
      }, 100);
    } else if (time <= 0) {
      setIsRunning(false);
      Alert.alert("❌ Time's up!", "Restarting game...");
      setTime(10);
    }

    return () => clearInterval(timer);
  }, [isRunning, time]);

  const startGame = () => {
    setTime(10);
    setIsRunning(true);
    setStoppedTime(null);
  };

  const stopGame = () => {
    setIsRunning(false);
    const roundedTime = Math.round(time * 10) / 10; // Round to 1 decimal place
    setStoppedTime(roundedTime);

    if (roundedTime === 3.0) {
      setPoints(points + 1);
      Alert.alert("🎉 Perfect!", `You stopped at ${roundedTime}s! Points: ${points + 1}`);
    } else {
      Alert.alert("❌ Try Again!", `You stopped at ${roundedTime}s. Restarting...`);
    }

    setTime(10);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 34, marginBottom: 50 }}> Stop the timer at exactly 3.0s to earn 1 point.</Text>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Time Left: {time.toFixed(1)}s</Text>
      {stoppedTime !== null && (
        <Text style={{ fontSize: 18, color: 'blue', marginBottom: 10 }}>
          You stopped at: {stoppedTime}s
        </Text>
      )}
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Points: {points}</Text>

      {!isRunning ? (
        <Button title="Start Countdown" onPress={startGame} />
      ) : (
        <Button title="Stop" onPress={stopGame} />
      )}


    </View>
  );
}