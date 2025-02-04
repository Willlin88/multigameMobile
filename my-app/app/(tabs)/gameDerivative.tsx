import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface Building {
  name: string;
  baseCost: number;
  cost: number;
  owned: number;
  production: number;
  factor: number;
}

export default function GameDerivative() {
  const router = useRouter();

  const [money, setMoney] = useState(0.1);
  const [moneyPerClick, setMoneyPerClick] = useState(1);
  const [moneyPerSecond, setMoneyPerSecond] = useState(0);
  const [buildings, setBuildings] = useState<Building[]>([
    { name: "First Derivative", baseCost: 10, cost: 10, owned: 0, production: 0.1, factor: 1.1 },
    { name: "Second Derivative", baseCost: 100, cost: 100, owned: 0, production: 0, factor: 1.15 },
    { name: "Third Derivative", baseCost: 1000, cost: 1000, owned: 0, production: 0, factor: 1.2 },
  ]);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMoney((prev) => prev + moneyPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [moneyPerSecond]);

  const handleClick = () => {
    setMoney(money + moneyPerClick);
  };

  const buyBuilding = (index: number) => {
    if (money >= buildings[index].cost) {
      setMoney(money - buildings[index].cost);
      const updatedBuildings = [...buildings];

      updatedBuildings[index].owned += 1;
      updatedBuildings[index].cost = Math.floor(updatedBuildings[index].cost * updatedBuildings[index].factor);

      setBuildings(updatedBuildings);

      // Recalculate production chain
      recalculateProduction(updatedBuildings);

      checkAchievements(updatedBuildings[index].name, updatedBuildings[index].owned);
    }
  };

  const recalculateProduction = (updatedBuildings: Building[]) => {
    let newMoneyPerSecond = 0;

    for (let i = 0; i < updatedBuildings.length; i++) {
      if (i === 0) {
        // First derivative produces money directly
        updatedBuildings[i].production = 0.1 * updatedBuildings[i].owned;
      } else {
        // Higher derivatives boost the lower ones
        updatedBuildings[i].production = updatedBuildings[i - 1].owned;
      }
    }

    updatedBuildings.forEach((b) => {
      newMoneyPerSecond += b.production;
    });

    setBuildings(updatedBuildings);
    setMoneyPerSecond(newMoneyPerSecond);
  };

  const checkAchievements = (name: string, count: number) => {
    const achievementText = `${name} Level ${count}`;
    if (!achievements.includes(achievementText)) {
      setAchievements([...achievements, achievementText]);
      Alert.alert("Achievement Unlocked!", achievementText);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Derivative Clicker</Text>
      <Text style={styles.score}>Money: ${money.toFixed(2)}</Text>
      <Text style={styles.info}>Click Power: {moneyPerClick} / Auto: {moneyPerSecond.toFixed(2)} per sec</Text>

      <Button title="Click Me!" onPress={handleClick} />

      <Text style={styles.sectionTitle}>Buy Buildings</Text>
      <FlatList
        data={buildings}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text>{item.name} (Owned: {item.owned})</Text>
            <Text>Cost: ${item.cost}</Text>
            <Text>Production: {item.production.toFixed(2)} per sec</Text>
            <Button title="Buy" onPress={() => buyBuilding(index)} disabled={money < item.cost} />
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Achievements</Text>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text style={styles.achievement}>{item}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  score: {
    fontSize: 20,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  item: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  achievement: {
    fontSize: 16,
    color: "green",
  },
});