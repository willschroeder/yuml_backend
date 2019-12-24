CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE recipes (
    uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    recipe JSONB NOT NULL
);
