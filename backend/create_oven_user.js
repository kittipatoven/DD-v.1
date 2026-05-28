const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpassword',
  database: 'dd_computer'
});

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('Generated hash:', hashedPassword);
    
    // Delete existing user
    await new Promise((resolve, reject) => {
      connection.query('DELETE FROM users WHERE email = ?', ['ovenkittipat@gmail.com'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    // Insert new user
    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        ['Oven Kittipat', 'ovenkittipat@gmail.com', hashedPassword, 'user', 'active'],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
    
    console.log('User created successfully!');
    
    // Test login
    const [rows] = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM users WHERE email = ?', ['ovenkittipat@gmail.com'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (rows.length > 0) {
      const isValid = await bcrypt.compare('123456', rows[0].password);
      console.log('Password validation test:', isValid);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.end();
  }
}

createUser();
