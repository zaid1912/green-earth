// Oracle Database Connection Pool
import oracledb from 'oracledb';

/**
 * Convert Oracle uppercase column names to lowercase for TypeScript types
 */
function convertKeysToLowerCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToLowerCase(item)) as any;
  }
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key.toLowerCase()] = obj[key];
      }
    }
    return converted;
  }
  return obj;
}

// Oracle connection configuration
const dbConfig = {
  user: process.env.ORACLE_USER || 'ADMIN',
  password: process.env.ORACLE_PASSWORD || '',
  connectionString: process.env.ORACLE_CONNECTION_STRING || '',
  walletLocation: process.env.ORACLE_WALLET_PATH || '',
};

// Pool configuration with wallet support for Oracle Cloud (Thin mode)
const poolConfig: any = {
  user: dbConfig.user,
  password: dbConfig.password,
  connectionString: dbConfig.connectionString,
  poolMin: 1,
  poolMax: 5,
  poolIncrement: 1,
  queueTimeout: 120000, // 2 minutes
  connectTimeout: 90000, // 90 seconds
};

// Add wallet configuration for Oracle Autonomous Database (Thin mode)
// IMPORTANT: Both configDir AND walletLocation are required for mTLS
if (dbConfig.walletLocation) {
  poolConfig.configDir = dbConfig.walletLocation;
  poolConfig.walletLocation = dbConfig.walletLocation;
  poolConfig.walletPassword = 'noAccess@123'; // Wallet password
}

// Enable auto-commit by default
oracledb.autoCommit = true;

// Return rows as objects instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool: oracledb.Pool | null = null;

/**
 * Initialize the connection pool
 */
export async function initializePool(): Promise<oracledb.Pool> {
  try {
    if (!pool) {
      pool = await oracledb.createPool(poolConfig);
      console.log('✅ Oracle connection pool created successfully');
    }
    return pool;
  } catch (error) {
    console.error('❌ Error creating Oracle connection pool:', error);
    throw error;
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection(): Promise<oracledb.Connection> {
  try {
    if (!pool) {
      await initializePool();
    }
    const connection = await pool!.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Error getting connection from pool:', error);
    throw error;
  }
}

/**
 * Execute a query and return results
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] | Record<string, any> = [],
  options: oracledb.ExecuteOptions = {}
): Promise<T[]> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    const result = await connection.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    });

    // Convert Oracle uppercase column names to lowercase
    const rows = (result.rows || []) as any[];
    return rows.map((row) => convertKeysToLowerCase<T>(row));
  } catch (error) {
    console.error('❌ Query execution error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

/**
 * Execute a query and return a single result
 */
export async function executeQuerySingle<T = any>(
  query: string,
  params: any[] | Record<string, any> = []
): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export async function executeUpdate(
  query: string,
  params: any[] | Record<string, any> = []
): Promise<number> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    const result = await connection.execute(query, params, {
      autoCommit: true,
    });

    return result.rowsAffected || 0;
  } catch (error) {
    console.error('❌ Update execution error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

/**
 * Execute an INSERT query with RETURNING clause
 */
export async function executeInsertReturning(
  query: string,
  params: Record<string, any>,
  outBindName: string
): Promise<any> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    const result = await connection.execute(query, params, {
      autoCommit: true,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    // Get the returned value from outBinds
    return result.outBinds?.[outBindName]?.[0];
  } catch (error) {
    console.error('❌ Insert with RETURNING execution error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

/**
 * Execute a transaction (multiple queries)
 */
export async function executeTransaction(
  queries: { query: string; params?: any[] }[]
): Promise<boolean> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    // Start transaction (disable auto-commit)
    for (const { query, params = [] } of queries) {
      await connection.execute(query, params, { autoCommit: false });
    }

    // Commit all changes
    await connection.commit();
    return true;
  } catch (error) {
    // Rollback on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError);
      }
    }
    console.error('❌ Transaction error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

/**
 * Close the connection pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  try {
    if (pool) {
      await pool.close(10); // Wait 10 seconds for connections to close
      pool = null;
      console.log('✅ Oracle connection pool closed');
    }
  } catch (error) {
    console.error('❌ Error closing pool:', error);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

// Initialize pool on module load (in production)
if (process.env.NODE_ENV === 'production') {
  initializePool().catch((error) => {
    console.error('❌ Failed to initialize pool on startup:', error);
  });
}
