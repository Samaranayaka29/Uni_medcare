import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: node generateAdminHash.js <password>')
  process.exit(1)
}

const rounds = 12
bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err)
    process.exit(1)
  }

  console.log('\n✓ Password hash generated successfully!\n')
  console.log('Add this to your .env file:')
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
  console.log('\nAlso set:')
  console.log('JWT_SECRET=your-random-secret-string-here (make it at least 32 characters)')
  console.log('ADMIN_EMAIL=admin@unimedcare.com (or change as needed)\n')
})
