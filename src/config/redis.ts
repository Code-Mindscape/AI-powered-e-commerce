import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://localhost:6379', // Replace with your Redis server URL if different
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

await redisClient.connect();

export default redisClient;
