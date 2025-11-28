const { createClient } = require('@supabase/supabase-js')
require('dotenv/config')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function runMigration() {
  try {
    console.log('Adding fee configuration columns to businesses table...')

    // Add the columns one by one
    const alterStatements = [
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS use_custom_fee_settings BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS platform_fee_type VARCHAR(20) CHECK (platform_fee_type IN ('flat', 'percentage', 'higher_of_both'))`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS flat_fee_amount DECIMAL(10, 2)`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS percentage_fee DECIMAL(5, 2)`
    ]

    for (const sql of alterStatements) {
      console.log('Executing:', sql)
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

      if (error) {
        console.error('Error:', error)
        // Continue anyway in case columns already exist
      } else {
        console.log('Success!')
      }
    }

    console.log('\nMigration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
