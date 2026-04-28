import express from 'express';
console.log('[Server] Initializing...');
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { addHours, addDays, format, parse, isAfter, isBefore, areIntervalsOverlapping } from 'date-fns';
import { FedaPay, Transaction } from 'fedapay';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function syncToSupabase(key: string, value: any) {
  // Supabase sync disabled due to missing 'site_config' table in schema cache
  return;
}

const db = new Database('reservations.db');

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
});

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    table_count INTEGER,
    status TEXT DEFAULT 'pending',
    payment_id TEXT,
    ticket_code TEXT UNIQUE,
    total_amount REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    avatar_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Migration: Add columns to reservations if they don't exist
const resTableInfo = db.prepare("PRAGMA table_info(reservations)").all() as any[];
const hasResStatus = resTableInfo.some(col => col.name === 'status');
const hasResPaymentId = resTableInfo.some(col => col.name === 'payment_id');

if (!hasResStatus) {
  console.log('Migrating reservations: adding status column');
  db.exec("ALTER TABLE reservations ADD COLUMN status TEXT DEFAULT 'pending'");
}
if (!hasResPaymentId) {
  console.log('Migrating reservations: adding payment_id column');
  db.exec("ALTER TABLE reservations ADD COLUMN payment_id TEXT");
}

// Migration: Add status column to reviews if it doesn't exist
const tableInfo = db.prepare("PRAGMA table_info(reviews)").all() as any[];
const hasStatus = tableInfo.some(col => col.name === 'status');
if (!hasStatus) {
  console.log('Migrating reviews: adding status column');
  db.exec("ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending'");
  // For existing reviews, we set them to approved so they don't disappear
  db.exec("UPDATE reviews SET status = 'approved'");
}

// Initialize default rates
const existingRates = db.prepare("SELECT count(*) as count FROM site_config WHERE key = 'rates'").get() as any;
if (existingRates.count === 0) {
  const defaultRates = {
    salle: 15000,
    studio: 10000,
    restaut: 2000
  };
  db.prepare('INSERT INTO site_config (key, value) VALUES (?, ?)').run('rates', JSON.stringify(defaultRates));
}

// Initialize default opening hours
const existingHours = db.prepare("SELECT count(*) as count FROM site_config WHERE key = 'openingHours'").get() as any;
if (existingHours.count === 0) {
  const defaultHours = {
    monday: { open: '08:00', close: '20:00', isClosed: false },
    tuesday: { open: '08:00', close: '20:00', isClosed: false },
    wednesday: { open: '08:00', close: '20:00', isClosed: false },
    thursday: { open: '08:00', close: '20:00', isClosed: false },
    friday: { open: '08:00', close: '20:00', isClosed: false },
    saturday: { open: '08:00', close: '20:00', isClosed: false },
    sunday: { open: '10:00', close: '20:00', isClosed: false },
  };
  db.prepare('INSERT INTO site_config (key, value) VALUES (?, ?)').run('openingHours', JSON.stringify(defaultHours));
}

// Seed default reviews if empty
const existingReviews = db.prepare('SELECT count(*) as count FROM reviews').get() as any;
if (existingReviews.count === 0) {
  const seed = [
    { id: uuidv4(), name: "Didier A.", role: "Artiste", content: "L'acoustique du studio est incroyable ! Un vrai plaisir de travailler ici.", rating: 5 },
    { id: uuidv4(), name: "Sonia K.", role: "Organisatrice d'événements", content: "La salle est parfaite pour les mariages. Service client au top.", rating: 5 },
    { id: uuidv4(), name: "Marc T.", role: "Client Restaurant", content: "La cuisine locale est succulente et l'ambiance jazz est magique.", rating: 4 }
  ];
  for (const r of seed) {
    db.prepare("INSERT INTO reviews (id, name, role, content, rating, status) VALUES (?, ?, ?, ?, ?, 'approved')").run(r.id, r.name, r.role, r.content, r.rating);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', node_env: process.env.NODE_ENV, port: PORT });
  });

  // Admin Middleware
  const adminAuth = (req: any, res: any, next: any) => {
    const pwd = req.headers['x-admin-password'];
    if (pwd === 'asc-admin-2026') {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // FedaPay Configuration
  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY?.trim();
  let FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';
  
  if (FEDAPAY_SECRET_KEY) {
    // Auto-detect environment if key starts with sk_live_ or sk_sandbox_
    if (FEDAPAY_SECRET_KEY.startsWith('sk_live_')) {
      FEDAPAY_ENVIRONMENT = 'live';
    } else if (FEDAPAY_SECRET_KEY.startsWith('sk_sandbox_')) {
      FEDAPAY_ENVIRONMENT = 'sandbox';
    }
    
    try {
      FedaPay.setApiKey(FEDAPAY_SECRET_KEY);
      FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);
      console.log(`[FedaPay] Initialisé en mode ${FEDAPAY_ENVIRONMENT.toUpperCase()}`);
    } catch (e) {
      console.error('[FedaPay] Erreur d\'initialisation:', e);
    }
  } else {
    console.warn('[FedaPay] Clé API (FEDAPAY_SECRET_KEY) manquante. Mode simulation actif en développement.');
  }

  // --- API ROUTES ---

  // 1. Check Availability
  app.post('/api/check-availability', (req, res) => {
    const { type, date, start_time, end_time, table_count } = req.body;

    // Check against Opening Hours
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[new Date(date).getDay()];
    const hoursRow = db.prepare("SELECT value FROM site_config WHERE key = 'openingHours'").get() as any;
    const openingHours = hoursRow ? JSON.parse(hoursRow.value) : null;

    if (openingHours && openingHours[dayOfWeek]) {
       const dayConfig = openingHours[dayOfWeek];
       if (dayConfig.isClosed) {
         return res.json({ available: false, message: 'Nous sommes fermés ce jour-là.' });
       }
       if (type !== 'restaut') {
         if (start_time < dayConfig.open || end_time > dayConfig.close) {
           return res.json({ available: false, message: `Hors horaires d'ouverture (${dayConfig.open} - ${dayConfig.close}).` });
         }
       } else {
         // For restaurant, we just check if it's within range (general check)
         if (start_time < dayConfig.open || start_time > dayConfig.close) {
           return res.json({ available: false, message: `Le restaurant est fermé à cette heure-là.` });
         }
       }
    }

    if (type === 'restaut') {
      const totalReserved = db.prepare("SELECT SUM(table_count) as total FROM reservations WHERE type = 'restaut' AND date = ? AND status != 'cancelled'").get(date) as any;
      const count = totalReserved?.total || 0;
      if (count + Number(table_count) > 10) {
         return res.json({ available: false, message: 'Complet pour ce jour.', suggestions: [{ date: format(addHours(new Date(date), 24), 'yyyy-MM-dd') }] });
      }
      return res.json({ available: true });
    } else {
      const existing = db.prepare("SELECT start_time, end_time FROM reservations WHERE type = ? AND date = ? AND status != 'cancelled'").all(type, date) as any[];
      
      const requestedInterval = {
        start: parse(`${date} ${start_time}`, 'yyyy-MM-dd HH:mm', new Date()),
        end: parse(`${date} ${end_time}`, 'yyyy-MM-dd HH:mm', new Date())
      };

      const conflict = existing.some(res => {
        const interval = {
          start: parse(`${date} ${res.start_time}`, 'yyyy-MM-dd HH:mm', new Date()),
          end: parse(`${date} ${res.end_time}`, 'yyyy-MM-dd HH:mm', new Date())
        };
        return areIntervalsOverlapping(requestedInterval, interval);
      });

      if (conflict) {
        return res.json({ 
          available: false, 
          message: 'Ce créneau est déjà réservé.', 
          suggestions: [
            { date: date, start_time: format(addHours(requestedInterval.end, 1), 'HH:mm'), end_time: format(addHours(requestedInterval.end, 3), 'HH:mm') }
          ] 
        });
      }
      return res.json({ available: true });
    }
  });

  // 2. Create Reservation (Initiate Payment)
  app.post('/api/reservations', async (req, res) => {
    const { type, client_name, client_email, client_phone, date, start_time, end_time, table_count } = req.body;
    const ratesRow = db.prepare("SELECT value FROM site_config WHERE key = 'rates'").get() as any;
    const rates = ratesRow ? JSON.parse(ratesRow.value) : { salle: 50000, studio: 15000, restaut: 5000 };

    let amount = 0;
    if (type === 'restaut') {
      amount = Math.round((table_count || 1) * (rates.restaut || 5000));
    } else {
      const start = parse(`${date} ${start_time}`, 'yyyy-MM-dd HH:mm', new Date());
      const end = parse(`${date} ${end_time}`, 'yyyy-MM-dd HH:mm', new Date());
      const hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
      amount = Math.round(hours * (rates[type] || 10000));
    }

    const id = uuidv4();
    const ticket_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      db.prepare(`
        INSERT INTO reservations (id, type, client_name, client_email, client_phone, date, start_time, end_time, table_count, ticket_code, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(id, type, client_name, client_email, client_phone, date, start_time, end_time || null, table_count || null, ticket_code, amount);

      // FedaPay Integration
      let payment_url = '';
      
      if (FEDAPAY_SECRET_KEY) {
        try {
          const names = client_name.split(' ');
          const firstname = names[0] || 'Client';
          const lastname = names.slice(1).join(' ') || 'Acoustic';
          
          // Construct base URL safely for callback
          const protocol = req.headers['x-forwarded-proto'] || req.protocol;
          const host = req.headers['x-forwarded-host'] || req.get('host');
          const baseUrl = `${protocol}://${host}`;

          const transaction = await Transaction.create({
            description: `Réservation ${type} - ${date}`,
            amount: amount,
            currency: { iso: 'XOF' },
            callback_url: `${baseUrl}/success?id=${id}`,
            customer: {
              firstname,
              lastname,
              email: client_email,
              phone_number: {
                number: (client_phone || '').replace(/\s/g, '') || '00000000',
                country: 'BJ'
              }
            }
          });

          const token = await transaction.generateToken();
          payment_url = token.url;
          
          db.prepare('UPDATE reservations SET payment_id = ? WHERE id = ?').run(transaction.id, id);
        } catch (fedaError: any) {
          console.error('[FedaPay] Erreur lors de la création de la transaction:', fedaError);
          const isLive = FEDAPAY_ENVIRONMENT === 'live';
          const modeInfo = isLive ? 'LIVE' : 'SANDBOX';
          
          let friendlyMessage = 'L\'initiation du paiement a échoué.';
          if (fedaError.message?.includes('401')) {
            friendlyMessage = `Clé API FedaPay invalide ou non autorisée pour le mode ${modeInfo}.`;
          } else if (fedaError.message?.includes('403')) {
            friendlyMessage = `Accès refusé par FedaPay. Vérifiez que votre clé correspond au mode ${modeInfo}.`;
          }
          
          return res.status(500).json({ 
            error: `Erreur FedaPay (${modeInfo}): ` + friendlyMessage,
            details: process.env.NODE_ENV !== 'production' ? {
              message: fedaError.message,
              data: fedaError.data
            } : undefined
          });
        }
      } else {
        // If no keys, we provide the simulation as a fallback ONLY if not in production
        if (process.env.NODE_ENV !== 'production') {
          payment_url = `/payment-sim?id=${id}`;
        } else {
          return res.status(500).json({ error: 'Configuration de paiement manquante (FEDAPAY_SECRET_KEY).' });
        }
      }

      res.json({ success: true, id, ticket_code, payment_url });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create reservation' });
    }
  });

  // 3. Confirm Payment (Manual/Simulation)
  app.post('/api/confirm-payment', (req, res) => {
    const { id } = req.body;
    db.prepare("UPDATE reservations SET status = 'paid' WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // 3b. Verify FedaPay Payment
  app.get('/api/reservations/:id/verify-payment', async (req, res) => {
    const { id } = req.params;
    const reservation = db.prepare('SELECT id, payment_id, status FROM reservations WHERE id = ?').get(id) as any;
    
    if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });
    
    // If already paid or validated, just return success
    if (reservation.status === 'paid' || reservation.status === 'validated') {
      return res.json({ success: true, status: reservation.status });
    }

    if (FEDAPAY_SECRET_KEY && reservation.payment_id) {
      try {
        const transaction = await Transaction.retrieve(reservation.payment_id);
        if (transaction.status === 'approved' || transaction.status === 'transferred') {
          db.prepare("UPDATE reservations SET status = 'paid' WHERE id = ?").run(id);
          return res.json({ success: true, status: 'paid' });
        }
        return res.json({ success: false, status: transaction.status, message: 'Le paiement n\'a pas encore été approuvé.' });
      } catch (e: any) {
        console.error('[FedaPay] Erreur de vérification:', e);
        const modeInfo = FEDAPAY_ENVIRONMENT === 'live' ? 'LIVE' : 'SANDBOX';
        return res.status(500).json({ 
          error: `Erreur de vérification FedaPay (${modeInfo})`,
          message: e.message || 'Impossible de vérifier le statut du paiement.'
        });
      }
    }

    // Default to success for simulation if no FedaPay keys
    res.json({ success: false, message: 'Paiement non vérifié.' });
  });

  // 4. Public API: Get Reservation Detail (for success page)
  app.get('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const reservation = db.prepare('SELECT id, type, client_name, date, start_time, end_time, table_count, status, ticket_code, total_amount FROM reservations WHERE id = ?').get(id) as any;
    if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });
    res.json(reservation);
  });

  // 5. Admin API: History
  app.get('/api/admin/reservations', adminAuth, (req, res) => {
    const rows = db.prepare('SELECT * FROM reservations ORDER BY created_at DESC').all();
    res.json(rows);
  });

  // 6. Admin API: Validate Ticket
  app.post('/api/admin/validate-ticket', adminAuth, (req, res) => {
    const { code } = req.body;
    const reservation = db.prepare('SELECT * FROM reservations WHERE ticket_code = ?').get(code) as any;
    if (!reservation) return res.status(404).json({ error: 'Ticket introuvable' });
    if (reservation.status === 'validated') return res.json({ success: false, message: 'Ticket déjà validé' });
    if (reservation.status !== 'paid') return res.json({ success: false, message: 'Ticket non payé' });
    db.prepare("UPDATE reservations SET status = 'validated' WHERE ticket_code = ?").run(code);
    res.json({ success: true, reservation });
  });

  // 6. Site Config API
  app.get('/api/config', (req, res) => {
    const rows = db.prepare('SELECT * FROM site_config').all() as any[];
    const config: Record<string, any> = {};
    rows.forEach(row => { config[row.key] = JSON.parse(row.value); });
    res.json(config);
  });

  app.post('/api/admin/config', adminAuth, (req, res) => {
    const { logo, images, dynamicSections, rates, openingHours } = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)');
    
    console.log(`[Admin] Updating config: ${Object.keys(req.body).filter(k => req.body[k] !== undefined).join(', ')}`);
    
    if (logo !== undefined) {
      console.log('[Admin] Saving logo...');
      stmt.run('logo', JSON.stringify(logo));
      syncToSupabase('logo', logo);
    }
    if (images !== undefined) {
      console.log('[Admin] Saving images...');
      stmt.run('images', JSON.stringify(images));
      syncToSupabase('images', images);
    }
    if (dynamicSections !== undefined) {
      console.log('[Admin] Saving dynamicSections...');
      stmt.run('dynamicSections', JSON.stringify(dynamicSections));
      syncToSupabase('dynamicSections', dynamicSections);
    }
    if (rates !== undefined) {
      console.log('[Admin] Saving rates...');
      stmt.run('rates', JSON.stringify(rates));
      syncToSupabase('rates', rates);
    }
    if (openingHours !== undefined) {
      console.log('[Admin] Saving openingHours...');
      stmt.run('openingHours', JSON.stringify(openingHours));
      syncToSupabase('openingHours', openingHours);
    }
    res.json({ success: true });
  });

  // 7. Reviews API
  app.get('/api/reviews', (req, res) => {
    const rows = db.prepare("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.get('/api/admin/reviews', adminAuth, (req, res) => {
    const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
    res.json(rows);
  });

  app.post('/api/admin/reviews/status', adminAuth, (req, res) => {
    const { id, status } = req.body;
    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  });

  app.post('/api/reviews', (req, res) => {
    const { name, role, content, rating } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO reviews (id, name, role, content, rating, status) VALUES (?, ?, ?, ?, ?, 'pending')").run(id, name, role, content, rating);
    res.json({ success: true, id });
  });

  // API 404 Handler - MUST be after all API routes but before Vite/Static
  app.all('/api/*', (req, res) => {
    console.warn(`[Server] API 404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'API route not found', path: req.url });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const fs = await import('fs');
    if (fs.existsSync(distPath)) {
      console.log(`[Server] Serving static files from: ${distPath}`);
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error(`[Server] index.html missing at ${indexPath}`);
          res.status(404).send('Index file not found. Please run build.');
        }
      });
    } else {
      console.error(`[Server] dist folder missing at ${distPath}`);
      app.get('*', (req, res) => {
        res.status(404).send('Dist folder not found. Please run build.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Listening on 0.0.0.0:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  });
}

startServer();
