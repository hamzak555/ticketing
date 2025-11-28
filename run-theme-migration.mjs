import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('Running theme_color migration...')

    // Read the SQL file
    const sqlPath = join(__dirname, 'migration-add-theme-color.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If exec_sql doesn't exist, try direct query
      const { error: queryError } = await supabase
        .from('businesses')
        .select('id')
        .limit(1)

      if (queryError) {
        throw queryError
      }

      // Use direct SQL execution
      const lines = sql.split(';').filter(line => line.trim())
      for (const line of lines) {
        if (line.trim().startsWith('COMMENT')) continue // Skip comments
        if (line.trim()) {
          console.log('Executing:', line.trim().substring(0, 50) + '...')
          // We'll need to use the REST API directly
        }
      }

      console.log('Migration requires manual execution via Supabase Dashboard SQL Editor')
      console.log('Please copy and paste the following SQL:')
      console.log('\n' + sql + '\n')
    } else {
      console.log('Migration completed successfully!')
    }
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

runMigration()
