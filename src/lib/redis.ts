import { createClient } from "redis";

export const redis = createClient({
	url: Bun.env.REDIS_URL!,
});

redis.connect();
