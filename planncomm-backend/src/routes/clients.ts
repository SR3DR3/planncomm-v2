import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';

const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await dbAll(`
      SELECT * FROM clients
      WHERE status = 'active'
      ORDER BY company_name
    `);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await dbGet(`
      SELECT * FROM clients WHERE id = ?
    `, [req.params.id]);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create new client
router.post('/', async (req, res) => {
  try {
    const { client_id, company_name, contact_person, phone, email, address, industry } = req.body;

    if (!client_id || !company_name) {
      return res.status(400).json({ error: 'Client ID and company name are required' });
    }

    const result = await dbRun(`
      INSERT INTO clients (client_id, company_name, contact_person, phone, email, address, industry)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [client_id, company_name, contact_person, phone, email, address, industry]);

    const newClient = await dbGet('SELECT * FROM clients WHERE id = ?', [result.lastID]);

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { client_id, company_name, contact_person, phone, email, address, industry } = req.body;

    await dbRun(`
      UPDATE clients
      SET client_id = ?, company_name = ?, contact_person = ?, phone = ?,
          email = ?, address = ?, industry = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [client_id, company_name, contact_person, phone, email, address, industry, req.params.id]);

    const updatedClient = await dbGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await dbRun(`
      UPDATE clients
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.params.id]);

    res.json({ message: 'Client deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating client:', error);
    res.status(500).json({ error: 'Failed to deactivate client' });
  }
});

export default router;
