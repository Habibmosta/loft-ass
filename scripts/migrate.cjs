const fs = require('fs');
const { sql } = require('../lib/database.cjs');

const runMigrations = async () => {
  console.log('Database configuration loaded');
  console.log('Database connection established');

  try {
    // Run 07-create-currencies-table.sql to ensure currencies table exists
    const createCurrenciesTableQuery = fs.readFileSync('./scripts/07-create-currencies-table.sql', 'utf-8');
    // Split the query into individual statements and execute them, excluding policy creation for now
    const currencyStatements = createCurrenciesTableQuery.split(';').filter(s => s.trim().length > 0 && !s.includes('CREATE POLICY'));
    for (const statement of currencyStatements) {
      await sql.query(statement);
    }
    console.log('Executed basic currencies table creation and index.');

    // Add ratio to currencies table if it doesn't exist
    const addRatioColumnQuery = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='currencies' AND column_name='ratio') THEN
              ALTER TABLE currencies ADD COLUMN ratio DECIMAL(18, 8) NOT NULL DEFAULT 1.0;
              RAISE NOTICE 'Column ratio added to currencies table.';
          ELSE
              RAISE NOTICE 'Column ratio already exists in currencies table.';
          END IF;
      END$$;
    `;
    await sql.query(addRatioColumnQuery);
    console.log('Ensured ratio column in currencies table.');

    // Add currency_id to transactions table if it doesn't exist
    const addCurrencyColumnQuery = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='currency_id') THEN
              ALTER TABLE transactions ADD COLUMN currency_id UUID REFERENCES currencies(id);
              RAISE NOTICE 'Column currency_id added to transactions table.';
          ELSE
              RAISE NOTICE 'Column currency_id already exists in transactions table.';
          END IF;
      END$$;
    `;
    await sql.query(addCurrencyColumnQuery);
    console.log('Ensured currency_id column in transactions table.');

    // Add loft_id to transactions table if it doesn't exist
    const addLoftColumnQuery = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='loft_id') THEN
              ALTER TABLE transactions ADD COLUMN loft_id UUID REFERENCES lofts(id);
              RAISE NOTICE 'Column loft_id added to transactions table.';
          ELSE
              RAISE NOTICE 'Column loft_id already exists in transactions table.';
          END IF;
      END$$;
    `;
    await sql.query(addLoftColumnQuery);
    console.log('Ensured loft_id column in transactions table.');

    // Policy creation statements with checks
    const policies = [
      `CREATE POLICY admin_all_currencies ON currencies FOR ALL TO admin USING (true);`,
      `CREATE POLICY manager_view_currencies ON currencies FOR SELECT TO manager USING (true);`,
      `CREATE POLICY member_view_currencies ON currencies FOR SELECT TO member USING (true);`
    ];

    for (const policySql of policies) {
      try {
        await sql.query(policySql);
        console.log(`Executed policy: ${policySql.substring(0, 50)}...`);
      } catch (policyError) {
        if (policyError.code === '42710') { // 42710 is "duplicate object" error code
          console.warn(`Policy already exists, skipping: ${policySql.substring(0, 50)}...`);
        } else {
          throw policyError; // Re-throw other errors
        }
      }
    }


    console.log('Migration complete!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

runMigrations();
