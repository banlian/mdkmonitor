import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'mysql2.sqlpub.com',//mysql2.sqlpub.com,:,3307
  port: 3307,
  user: 'mdksys',
  password: 'hzVjXrk4YoIDlyGS',
  database: 'mdksys',
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
 
});

export default pool; 