import postgres from "postgres";
import { z } from "zod";
import { bannedLinksNames } from "./banned-links-names";
import { app } from "./lib/app";
import { sql } from "./lib/postgres";
import { redis } from "./lib/redis";
import { logRequest } from "./utils/log";

app.get("/:code", async (request, reply) => {
	const getLinkSchema = z.object({
		code: z.string().min(2),
	});

	logRequest({ method: "GET", path: request.url });
	const body = getLinkSchema.safeParse(request.params);

	if (!body.success) {
		return reply.status(400).send({ error: "Invalid request body" });
	}

	const { code } = body.data;

	const result = await sql`
	SELECT id, original_url
	FROM short_links
	WHERE short_links.code = ${code}`;

	if (result.length === 0) {
		return reply.status(400).send({ message: "Link not found." });
	}

	const link = result[0];

	await redis.zIncrBy("metrics", 1, String(link.id));

	return reply.redirect(301, link.original_url);
});

app.get("/links", async (request, reply) => {
	logRequest({ method: "GET", path: request.url });

	const result = await sql`
    SELECT *
    FROM short_links
    ORDER BY created_at DESC
  `;

	return reply.status(200).send(result);
});

app.post("/create-link", async (request, reply) => {
	const CreateShortLinkSchema = z.object({
		code: z.string().min(2),
		url: z.string().url(),
	});

	logRequest({ method: "POST", path: request.url });

	const body = CreateShortLinkSchema.safeParse(request.body);

	if (!body.success) {
		return reply.status(400).send({ error: "Invalid request body" });
	}

	const { code, url } = body.data;

	if (bannedLinksNames.includes(code)) {
		return reply.status(400).send({ message: "Invalid link code." });
	}

	try {
		const result =
			await sql`INSERT INTO short_links (code, original_url) VALUES (${code}, ${url}) RETURNING id`;

		const link = result[0];

		return reply.status(201).send({ shortLinkId: link.id });
	} catch (err) {
		if (err instanceof postgres.PostgresError) {
			if (err.code === "23505") {
				return reply.status(400).send({ message: "Duplicated code!" });
			}
		}

		console.error(err);

		return reply.status(500).send({ message: "Internal error." });
	}
});

app.get("/analytics", async (request, reply) => {
	logRequest({ method: "GET", path: request.url });

	const result = await redis.zRangeByScoreWithScores("metrics", 0, 10);

	const metrics = result
		.sort((a, b) => b.score - a.score)
		.map((item) => {
			return {
				shortLinkId: Number(item.value),
				clicks: item.score,
			};
		});

	return reply.status(200).send(metrics);
});

app
	.listen({
		port: 3333,
	})
	.then(() => {
		console.log("🔥 HTTP server running!");
	});
