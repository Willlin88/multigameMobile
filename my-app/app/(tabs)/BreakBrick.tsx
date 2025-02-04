import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';

const { width, height } = Dimensions.get('window');

const ballRadius = 10;
const paddleWidth = 100;
const paddleHeight = 15;
const brickWidth = 60;
const brickHeight = 20;
const rows = 5;
const cols = Math.floor(width / brickWidth);

const createBricks = () => {
  let bricks = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      bricks.push(
        Matter.Bodies.rectangle(
          col * brickWidth + brickWidth / 2,
          row * brickHeight + 50,
          brickWidth - 5,
          brickHeight - 5,
          { isStatic: true, label: 'brick' }
        )
      );
    }
  }
  return bricks;
};

const BreakBrick = () => {
  const router = useRouter();
  const engine = useRef(Matter.Engine.create());
  const world = engine.current.world;
  const [running, setRunning] = useState(true);

  const ball = Matter.Bodies.circle(width / 2, height - 50, ballRadius, { restitution: 1, label: 'ball' });
  const paddle = Matter.Bodies.rectangle(width / 2, height - 30, paddleWidth, paddleHeight, { isStatic: true, label: 'paddle' });
  const bricks = createBricks();

  Matter.World.add(world, [ball, paddle, ...bricks]);

  useEffect(() => {
    const interval = setInterval(() => {
      Matter.Engine.update(engine.current, 16);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const movePaddle = (evt) => {
    Matter.Body.setPosition(paddle, { x: evt.nativeEvent.locationX, y: height - 30 });
  };

  return (
    <TouchableWithoutFeedback onPress={movePaddle}>
      <View style={styles.container}>
        <GameEngine
          systems={[]}
          entities={{ ball, paddle, bricks }}
          running={running}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default BreakBrick;