import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jovbrnjczxnppzqvjkji.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdmJybmpjenhucHB6cXZqa2ppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1NzQ2OCwiZXhwIjoyMDc4NjMzNDY4fQ.V8ZL_FVodJZh7y2v4M1NCcerUF6POwoizpe-SHYIqqA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running migration to add max_per_customer column...')

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE ticket_types
      ADD COLUMN IF NOT EXISTS max_per_customer INTEGER;

      COMMENT ON COLUMN ticket_types.max_per_customer IS 'Maximum number of tickets of this type that a single customer can purchase. NULL means unlimited.';
    `
  })

  if (error) {
    // Try direct query approach if RPC doesn't exist
    console.log('RPC not available, checking if column already exists...')

    // Check if column exists by querying the table
    const { data: testData, error: testError } = await supabase
      .from('ticket_types')
      .select('max_per_customer')
      .limit(1)

    if (testError && testError.message.includes('max_per_customer')) {
      console.error('Column does not exist and cannot be added via client.')
      console.log('\nPlease run this SQL in the Supabase Dashboard SQL Editor:')
      console.log('----------------------------------------')
      console.log(`ALTER TABLE ticket_types
ADD COLUMN IF NOT EXISTS max_per_customer INTEGER;

COMMENT ON COLUMN ticket_types.max_per_customer IS 'Maximum number of tickets of this type that a single customer can purchase. NULL means unlimited.';`)
      console.log('----------------------------------------')
      return
    }

    if (!testError) {
      console.log('Column max_per_customer already exists!')
      return
    }

    console.error('Error:', testError)
    return
  }

  console.log('Migration completed successfully!')
}

runMigration()
