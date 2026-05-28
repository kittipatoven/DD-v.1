const bcrypt = require('bcrypt');

// Generate bcrypt hash for admin123
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nSQL Update Command:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@ddcomputer.com';`);
});
