import { existsSync } from 'node:fs';

// Optional local overrides, see .env.example (requires Node 20.12+).
if (existsSync('.env')) process.loadEnvFile('.env');

export const BASE_URL = process.env.BASE_URL ?? 'https://demo.realworld.show';
// Trailing slash matters: request paths are resolved relative to it.
export const API_URL = process.env.API_URL ?? 'https://api.realworld.show/api/';
