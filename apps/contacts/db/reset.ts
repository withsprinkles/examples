import { EnvSchema } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";
import { rmSync } from "node:fs";

const { DATABASE_URL } = parseEnv(EnvSchema);
rmSync(DATABASE_URL, { force: true });
