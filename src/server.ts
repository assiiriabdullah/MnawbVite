import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import employeesRoutes from './routes/employees';
import leavesRoutes from './routes/leaves';
import coursesRoutes from './routes/courses';
import mandatesRoutes from './routes/mandates';
import statsRoutes from './routes/stats';
import attendanceRoutes from './routes/attendance';
import supportAttendanceRoutes from './routes/support-attendance';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'antmnawb-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
    }
}));

// Serve static files from React build (except index.html)
app.use(express.static(path.join(__dirname, '..', 'client', 'dist'), { index: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/mandates', mandatesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/support-attendance', supportAttendanceRoutes);

// Fallback to index.html for React Router
app.get('/{*path}', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
    console.log(`📁 قاعدة البيانات: data/database.sqlite`);
});
