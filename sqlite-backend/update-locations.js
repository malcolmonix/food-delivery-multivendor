import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const updates = [
  {
    id: 1,
    address: 'Calabar Road, Cross River State, Nigeria',
    phone: '+234-801-234-5678'
  },
  {
    id: 2,
    address: 'Murtala Mohammed Way, Calabar, Cross River State, Nigeria',
    phone: '+234-802-345-6789'
  },
  {
    id: 3,
    address: 'Ndidem Usang Iso Road, Calabar, Cross River State, Nigeria',
    phone: '+234-803-456-7890'
  },
  {
    id: 4,
    address: 'Parliamentary Extension, Calabar, Cross River State, Nigeria',
    phone: '+234-804-567-8901'
  },
  {
    id: 5,
    address: 'State Housing Estate, Calabar, Cross River State, Nigeria',
    phone: '+234-805-678-9012'
  },
  {
    id: 6,
    address: 'Ikot Ansa, Calabar, Cross River State, Nigeria',
    phone: '+234-806-789-0123'
  },
  {
    id: 7,
    address: 'Uyo Road, Akwa Ibom State, Nigeria',
    phone: '+234-807-890-1234'
  },
  {
    id: 8,
    address: 'Wellington Bassey Way, Uyo, Akwa Ibom State, Nigeria',
    phone: '+234-808-901-2345'
  },
  {
    id: 9,
    address: 'Oron Road, Uyo, Akwa Ibom State, Nigeria',
    phone: '+234-809-012-3456'
  },
  {
    id: 10,
    address: 'Akpan Andem Market Road, Uyo, Akwa Ibom State, Nigeria',
    phone: '+234-810-123-4567'
  }
];

async function updateLocations() {
  console.log('Updating restaurant locations to Nigeria...');
  
  for (const restaurant of updates) {
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE restaurants SET address = ?, phone = ? WHERE id = ?',
        [restaurant.address, restaurant.phone, restaurant.id],
        function(err) {
          if (err) {
            console.error(`Error updating restaurant ${restaurant.id}:`, err);
            reject(err);
          } else {
            console.log(`Updated restaurant ${restaurant.id}: ${restaurant.address}`);
            resolve();
          }
        }
      );
    });
  }
  
  console.log('✅ All restaurant locations updated to Nigeria!');
  db.close();
}

updateLocations().catch(console.error);