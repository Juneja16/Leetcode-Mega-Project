import { createClient } from "redis";
import dotenv from "dotenv";
dotenv

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-14232.crce206.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 14232,
  },
});

export default client;
