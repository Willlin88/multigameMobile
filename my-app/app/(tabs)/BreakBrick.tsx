import React, { useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { Svg, Circle, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Game Constants
const ballRadius = 10;
const paddleWidth = width * 0.2;
const paddleHeight = 15;
const brickWidth = width / 10;
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
        row * brickHeight + 50, // Adjust brick position
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

// Game Initialization
const setupWorld = (): {
  engine: Matter.Engine;
  world: Matter.World;
  ball: Matter.Body;
  paddle: Matter.Body;
  bricks: Matter.Body[];
} => {
  let engine = Matter.Engine.create({ enableSleeping: false });
  let world = engine.world;

  let ball = Matter.Bodies.circle(width / 2, height - 100, ballRadius, {
    restitution: 1,
    friction: 0,
    frictionAir: 0,
    label: 'ball',
    isStatic: true, // Initially static (doesn't move until game starts)
  });

  let paddle = Matter.Bodies.rectangle(width / 2, height - 40, paddleWidth, paddleHeight, {
    isStatic: true,
    label: 'paddle',
  });

  let bricks = createBricks(world);

  Matter.World.add(world, [ball, paddle]);

  return { engine, world, ball, paddle, bricks };
};

// Game Logic
const Physics = (
  entities: { engine: Matter.Engine; ball: Matter.Body; paddle: Matter.Body; bricks: Matter.Body[] },
  { time }: { time: { delta: number } }
): { engine: Matter.Engine; ball: Matter.Body; paddle: Matter.Body; bricks: Matter.Body[] } => {
  let { engine, ball, paddle, bricks } = entities;

  Matter.Engine.update(engine, time.delta);

  if (!ball || !bricks.length) return entities;

  // Collision detection
  entities.bricks = bricks.filter((brick) => {
    const collision = Matter.SAT.collides(ball, brick);

    if (collision?.collided) {
      Matter.World.remove(engine.world, brick);
      Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: -ball.velocity.y });
      return false;
    }

    return true;
  });

  // Reset ball if it falls out of bounds
  if (ball.position.y > height) {
    Matter.Body.setPosition(ball, { x: width / 2, y: height - 100 });
    Matter.Body.setVelocity(ball, { x: 3, y: -5 });
  }

  return entities;
};


const BreakBrick: React.FC = () => {
  const gameEngine = useRef<GameEngine | null>(null);
  const { engine, world, ball, paddle, bricks } = useRef(setupWorld()).current;
  const [running, setRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    console.log('Starting game...'); // Debugging log
    setGameStarted(true);
    setRunning(true);
  
    Matter.Body.setStatic(ball, false); // Ball becomes dynamic
    Matter.Body.setVelocity(ball, { x: 3, y: -5 }); // Apply initial velocity
  
    console.log('Ball launched:', ball.position, ball.velocity); // Debugging log
  };
  

  const movePaddle = (event: { nativeEvent: { locationX: number } }) => {
    const x = event.nativeEvent.locationX;
    let newX = x;
    newX = Math.max(paddleWidth / 2, Math.min(newX, width - paddleWidth / 2));
    Matter.Body.setPosition(paddle, { x: newX, y: height - 40 });
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onResponderMove={movePaddle} // Handles both touch and mouse events
    >
      {!gameStarted ? (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      ) : (
        <GameEngine
          ref={gameEngine}
          systems={[Physics]}
          entities={{ engine, world, ball, paddle, bricks }}
          running={running}
        >
          <Svg height={height} width={width}>
            <Circle cx={ball.position.x} cy={ball.position.y} r={ballRadius} fill="white" />
            <Rect
              x={paddle.position.x - paddleWidth / 2}
              y={paddle.position.y - paddleHeight / 2}
              width={paddleWidth}
              height={paddleHeight}
              fill="blue"
            />
            {bricks.map((brick, index) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  startButton: {
    position: 'absolute',
    top: height / 2 - 50,
    left: width / 2 - 75,
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BreakBrick;
