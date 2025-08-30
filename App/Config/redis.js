import { createClient } from "redis";

const client = createClient({
  username: "default",
  password: "*******",
  socket: {
    host: "redis-14232.crce206.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 14232,
  },
});

export default client;
