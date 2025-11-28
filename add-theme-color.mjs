import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Manually load .env.local
const envFile = readFileSync('.env.local', 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

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

async function addThemeColorColumn() {
  try {
    console.log('Adding theme_color column to businesses table...')

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1)

    if (testError) {
      throw new Error(`Cannot access businesses table: ${testError.message}`)
    }

    console.log('✓ Successfully connected to Supabase')
    console.log('\nPlease run the following SQL in your Supabase Dashboard SQL Editor:')
    console.log('(Dashboard → SQL Editor → New Query)\n')
    console.log('-----------------------------------')
    console.log('ALTER TABLE businesses')
    console.log("ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3b82f6';")
    console.log('-----------------------------------\n')

  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

addThemeColorColumn()
