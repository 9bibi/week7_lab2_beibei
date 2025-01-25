const bcrypt = require('bcrypt');

async function testBcrypt() {
  const plainTextPassword = 'lane04';
  
  // Hash the password
  const hash = await bcrypt.hash(plainTextPassword, 10);
  console.log('Generated hash:', hash);

  // Compare the password
  const isMatch = await bcrypt.compare(plainTextPassword, hash);
  console.log('Password matches:', isMatch);
}

testBcrypt().catch(err => console.error('Error during bcrypt test:', err));
