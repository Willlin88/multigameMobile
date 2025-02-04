import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { Svg, Circle, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Game Constants
const ballRadius = 10;
const paddleWidth = 100;
const paddleHeight = 15;
const brickWidth = 60;
const brickHeight = 20;
const rows = 5;
const cols = Math.floor(width / brickWidth);

// Function to create bricks
const createBricks = (world: Matter.World): Matter.Body[] => {
  let bricks: Matter.Body[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const brick = Matter.Bodies.rectangle(
        col * brickWidth + brickWidth / 2,
        row * brickHeight + 50,
        brickWidth - 5,
        brickHeight - 5,
        { isStatic: true, label: 'brick' }
      );
      bricks.push(brick);
      Matter.World.add(world, brick);
    }
  }
  return bricks;
};

// Game Entities & Physics
const setupWorld = (): {
  engine: Matter.Engine;
  world: Matter.World;
  ball: Matter.Body;
  paddle: Matter.Body;
  bricks: Matter.Body[];
} => {
  let engine = Matter.Engine.create({ enableSleeping: false });
  let world = engine.world;

  let ball = Matter.Bodies.circle(width / 2, height - 50, ballRadius, {
    restitution: 1,
    friction: 0,
    frictionAir: 0,
    label: 'ball',
  });

  let paddle = Matter.Bodies.rectangle(width / 2, height - 30, paddleWidth, paddleHeight, {
    isStatic: true,
    label: 'paddle',
  });

  let bricks = createBricks(world);

  Matter.World.add(world, [ball, paddle]);

  // Initial Ball Velocity
  Matter.Body.setVelocity(ball, { x: 3, y: -5 });

  return { engine, world, ball, paddle, bricks };
};

// Game Logic & Systems
const Physics = (
  entities: { engine: Matter.Engine; ball: Matter.Body; paddle: Matter.Body; bricks: Matter.Body[] },
  { time }: { time: { delta: number } }
): { engine: Matter.Engine; ball: Matter.Body; paddle: Matter.Body; bricks: Matter.Body[] } => {
  let { engine, ball, paddle, bricks } = entities;
  Matter.Engine.update(engine, time.delta);

  // Ensure ball and bricks exist before checking collisions
  if (!ball || !bricks.length) return entities;

  // Ball collision detection with bricks
  entities.bricks = bricks.filter((brick) => {
    const collision = Matter.SAT.collides(ball, brick);
    
    if (collision?.collided) {
      Matter.World.remove(engine.world, brick);
      Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: -ball.velocity.y });
      return false; // Remove brick from array
    }
    
    return true; // Keep brick in array
  });

  // Ball out of bounds - Reset
  if (ball.position.y > height) {
    Matter.Body.setPosition(ball, { x: width / 2, y: height - 50 });
    Matter.Body.setVelocity(ball, { x: 3, y: -5 });
  }

  return entities;
};


const BreakBrick: React.FC = () => {
  const gameEngine = useRef<GameEngine | null>(null);
  const { engine, world, ball, paddle, bricks } = useRef(setupWorld()).current;
  const [running, setRunning] = useState(true);

  const movePaddle = (event: { nativeEvent?: { locationX?: number } }) => {
    if (!event?.nativeEvent?.locationX) return; // Prevent crash
  
    let newX = event.nativeEvent.locationX;
    newX = Math.max(paddleWidth / 2, Math.min(newX, width - paddleWidth / 2));
  
    // Move paddle slightly upward for a better feel
    let newY = height - 40;
  
    Matter.Body.setPosition(paddle, { x: newX, y: newY });
  };
  

  return (
    <TouchableWithoutFeedback onPress={movePaddle}>
      <View style={styles.container}>
        <GameEngine
          ref={gameEngine}
          systems={[Physics]}
          entities={{ engine, world, ball, paddle, bricks }}
          running={running}
        >
          <Svg height={height} width={width}>
            <Circle cx={ball.position.x} cy={ball.position.y} r={ballRadius} fill="white" />
            <Rect x={paddle.position.x - paddleWidth / 2} y={paddle.position.y - paddleHeight / 2} width={paddleWidth} height={paddleHeight} fill="blue" />
            {bricks.map((brick, index) => (
              <Rect key={index} x={brick.position.x - brickWidth / 2} y={brick.position.y - brickHeight / 2} width={brickWidth} height={brickHeight} fill="red" />
            ))}
          </Svg>
        </GameEngine>
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
