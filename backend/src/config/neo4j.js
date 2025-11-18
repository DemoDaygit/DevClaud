import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'swarm_ai_2025'
  ),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    disableLosslessIntegers: true
  }
);

/**
 * Test Neo4j database connection
 */
export async function testConnection() {
  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS test');
    return result.records[0].get('test') === 1;
  } finally {
    await session.close();
  }
}

/**
 * Get a Neo4j session
 */
export function getSession(database = 'neo4j') {
  return driver.session({ database });
}

/**
 * Close the driver connection
 */
export async function closeDriver() {
  await driver.close();
}

export default driver;
