import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running migration to add location fields to events table...')

  // Add location_latitude column
  const { error: error1 } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE events ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8)'
  }).maybeSingle()

  if (error1) {
    // Try direct approach with raw SQL
    const { error: directError1 } = await supabase.from('events').select('location_latitude').limit(1)
    if (directError1 && directError1.message.includes('does not exist')) {
      console.log('Column location_latitude does not exist, needs to be added via Supabase dashboard')
    } else {
      console.log('Column location_latitude already exists or check passed')
    }
  }

  // Add location_longitude column
  const { error: error2 } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE events ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8)'
  }).maybeSingle()

  if (error2) {
    const { error: directError2 } = await supabase.from('events').select('location_longitude').limit(1)
    if (directError2 && directError2.message.includes('does not exist')) {
      console.log('Column location_longitude does not exist, needs to be added via Supabase dashboard')
    } else {
      console.log('Column location_longitude already exists or check passed')
    }
  }

  // Add google_place_id column
  const { error: error3 } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE events ADD COLUMN IF NOT EXISTS google_place_id TEXT'
  }).maybeSingle()

  if (error3) {
    const { error: directError3 } = await supabase.from('events').select('google_place_id').limit(1)
    if (directError3 && directError3.message.includes('does not exist')) {
      console.log('Column google_place_id does not exist, needs to be added via Supabase dashboard')
    } else {
      console.log('Column google_place_id already exists or check passed')
    }
  }

  // Test if columns exist by trying to select them
  const { data, error: testError } = await supabase
    .from('events')
    .select('id, location, location_latitude, location_longitude, google_place_id')
    .limit(1)

  if (testError) {
    console.error('Error testing columns:', testError.message)
    console.log('\nPlease run this SQL in your Supabase dashboard SQL editor:')
    console.log(`
ALTER TABLE events
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS google_place_id TEXT;
    `)
  } else {
    console.log('Migration successful! Columns exist:', Object.keys(data?.[0] || {}))
  }
}

runMigration().catch(console.error)
