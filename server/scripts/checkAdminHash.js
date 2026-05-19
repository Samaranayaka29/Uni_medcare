import 'dotenv/config'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? ''

const usage = () => {
  console.log('Usage: node checkAdminHash.js <email> <password>')
  process.exit(1)
}

const [emailArg, passwordArg] = process.argv.slice(2)

if (!emailArg || !passwordArg) {
  usage()
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.error('ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set in environment (.env)')
  process.exit(2)
}

const run = async () => {
  console.log(`Checking admin email: ${emailArg}`)

  if (emailArg !== ADMIN_EMAIL) {
    console.log('✖ Email does not match ADMIN_EMAIL in .env')
  } else {
    console.log('✓ Email matches ADMIN_EMAIL in .env')
  }

  try {
    const match = await bcrypt.compare(passwordArg, ADMIN_PASSWORD_HASH)
    if (match) {
      console.log('✓ Password matches the stored ADMIN_PASSWORD_HASH')
    } else {
      console.log('✖ Password does NOT match the stored ADMIN_PASSWORD_HASH')
    }
  } catch (err) {
    console.error('Error comparing password:', err)
    process.exit(3)
  }
}

void run()
