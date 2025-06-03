import pool from '../db';
import { RowDataPacket } from 'mysql2';

describe('Database Connection', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should connect to the database successfully', async () => {
    try {
      const connection = await pool.getConnection();
      expect(connection).toBeDefined();
      connection.release();
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  it('should execute a simple query', async () => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 as test');
      expect(rows).toBeDefined();
      expect(Array.isArray(rows)).toBe(true);
      expect(rows[0]).toHaveProperty('test', 1);
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });
}); 