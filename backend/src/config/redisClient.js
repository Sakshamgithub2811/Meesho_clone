import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
})

redisClient.on("connect",()=>{
    console.log("🟢 Connected to Local Redis (127.0.0.1:6379) successfully!");
});

redisClient.on("error",(err)=>{
    console.error("❌ Local Redis Connection Error:", err.message);
    console.log("👉 Tip: Make sure your local Redis server / Docker container is running on port 6379.");
});

try{
    await redisClient.connect();
}catch(error){
    console.warn("⚠️ Could not connect to local Redis. Server will continue running.");
}


export default redisClient;