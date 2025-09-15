import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

// “Create a Redis client, log in with user = default and password = REDIS_PASSWORD,
//  then connect to the Redis Cloud server running at host redis-14232.crce206.ap-south-1-1.ec2.redns.redis-cloud.com
//  on port 14232.”
const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-14232.crce206.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 14232,
  },
});

export default client;
