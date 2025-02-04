import React, { useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { Svg, Circle, Rect } from 'react-native-svg';

// Using Collision from Matter instead of SAT:
const { Collision } = Matter;

const { width, height } = Dimensions.get('window');

// Game Constants
const ballRadius = 10;
const paddleWidth = width * 0.2;
const paddleHeight = 15;
const brickWidth = width / 10;
const brickHeight = 20;
const rows = 5;
const cols = Math.floor(width / brickWidth);

// SYSTEM 1: Move Paddle
const MovePaddleSystem = (entities: any, { touches }: any) => {
  const moveTouch = touches.find((t: any) => t.type === 'move');

  if (moveTouch) {
    const { paddle } = entities;
    if (!paddle) return entities;

    // Use pageX for absolute X on screen
    let newX = moveTouch.event.pageX;
    // Constrain paddle to screen
    newX = Math.max(paddleWidth / 2, Math.min(newX, width - paddleWidth / 2));

    // Update the physics body
    Matter.Body.setPosition(paddle, { x: newX, y: height - 40 });
  }

  return entities;
};

// SYSTEM 2: Physics + Collisions
const PhysicsSystem = (entities: any, { time }: any) => {
  const { engine, ball, bricks } = entities;

  // Clamp the update step to 16.667 ms (i.e., 60 FPS) to avoid the Matter.js warning
  const delta = Math.min(time.delta, 16.667);

  Matter.Engine.update(engine, delta);

  // Check ball-brick collisions
  entities.bricks = bricks.filter((brick: Matter.Body) => {
    // Use Matter.Collision.collides instead of Matter.SAT.collides
    const collision = Collision.collides(ball, brick);

    if (collision && collision.collided) {
      // Remove the brick from the world
      Matter.World.remove(engine.world, brick);
      // Reverse the ball's vertical velocity
      Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: -ball.velocity.y });
      return false; // "Filter out" this brick
    }
    return true; // Keep it
  });

  // Reset ball if it falls out of bounds
  if (ball.position.y > height) {
    Matter.Body.setPosition(ball, { x: width / 2, y: height - 100 });
    Matter.Body.setVelocity(ball, { x: 3, y: -5 });
  }

  return entities;
};

const createBricks = (world: Matter.World): Matter.Body[] => {
  let bricks: Matter.Body[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const brick = Matter.Bodies.rectangle(
        col * brickWidth + brickWidth / 2,
        row * brickHeight + 50, // Adjust starting Y
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

const setupWorld = () => {
  let engine = Matter.Engine.create({ enableSleeping: false });
  let world = engine.world;

  let ball = Matter.Bodies.circle(width / 2, height - 100, ballRadius, {
    restitution: 1,
    friction: 0,
    frictionAir: 0,
    label: 'ball',
    isStatic: true, // Initially static
  });

  let paddle = Matter.Bodies.rectangle(width / 2, height - 40, paddleWidth, paddleHeight, {
    isStatic: true,
    label: 'paddle',
  });

  let bricks = createBricks(world);

  Matter.World.add(world, [ball, paddle]);

  return { engine, world, ball, paddle, bricks };
};

const BreakBrick: React.FC = () => {
  const gameEngine = useRef<GameEngine | null>(null);
  const { engine, world, ball, paddle, bricks } = useRef(setupWorld()).current;
  const [running, setRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setRunning(true);
    // Make ball dynamic
    Matter.Body.setStatic(ball, false);
    // Give an initial push
    Matter.Body.setVelocity(ball, { x: 3, y: -5 });
  };

  return (
    <View style={styles.container}>
      {!gameStarted ? (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      ) : (
        <GameEngine
          ref={gameEngine}
          systems={[PhysicsSystem, MovePaddleSystem]}
          entities={{ engine, world, ball, paddle, bricks }}
          running={running}
          style={styles.gameContainer}
          // Instead of pointerEvents prop, use style below if needed
          // style={[styles.gameContainer, { pointerEvents: 'auto' }]}
        >
          <Svg height={height} width={width}>
            {/* Ball */}
            <Circle cx={ball.position.x} cy={ball.position.y} r={ballRadius} fill="white" />
            {/* Paddle */}
            <Rect
              x={paddle.position.x - paddleWidth / 2}
              y={paddle.position.y - paddleHeight / 2}
              width={paddleWidth}
              height={paddleHeight}
              fill="blue"
            />
            {/* Bricks */}
            {bricks.map((brick: Matter.Body, index: number) => (
              <Rect
                key={index}
                x={brick.position.x - brickWidth / 2}
                y={brick.position.y - brickHeight / 2}
                width={brickWidth}
                height={brickHeight}
                fill="red"
              />
            ))}
          </Svg>
        </GameEngine>
      )}
    </View>
  );
};

export default BreakBrick;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  gameContainer: {
    flex: 1,
    // pointerEvents is deprecated as a prop, so if you need to disable touches,
    // do something like:
    // pointerEvents: 'none',
  },
  startButton: {
    position: 'absolute',
    top: height / 2 - 50,
    left: width / 2 - 75,
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 10,
    zIndex: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
