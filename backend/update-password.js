const mysql = require('mysql2/promise');

async function updatePassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dd_computer'
  });

  const passwordHash = '$2b$10$y/ygBPr0qY1oVhnQDYXwbu1PPtEIakp8uWo/fseAPSZ948OGiqIFa';
  
  try {
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [passwordHash, 'ovenkittipat@gmail.com']
    );
    
    const [rows] = await connection.execute(
      'SELECT id, name, email, role, status, LEFT(password, 60) as password_preview FROM users WHERE email = ?',
      ['ovenkittipat@gmail.com']
    );
    
    console.log('Password updated successfully!');
    console.log('User info:', rows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

updatePassword();
