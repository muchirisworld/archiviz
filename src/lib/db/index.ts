import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/archiviz';

// Create postgres client
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export the client for direct access if needed
export { client };

// Close connection on app shutdown
process.on('SIGINT', () => {
  client.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  client.end();
  process.exit(0);
});
