import express from 'express';
import cors from 'cors';
import { printTicket } from './printer.js'; // 👈 IMPORT CORRECTO

const app = express();

app.use(cors());
app.use(express.json());

app.post('/print', (req, res) => {
  printTicket(req.body);
  res.json({ ok: true });
});

app.listen(3001, () => {
  console.log('Servidor corriendo en 3001');
});