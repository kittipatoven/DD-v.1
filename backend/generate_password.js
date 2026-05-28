const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL:');
  console.log(`INSERT INTO users (name, email, password, role, status) VALUES ('Admin', 'admin@ddcomputer.com', '${hash}', 'admin', 'active');`);
});
