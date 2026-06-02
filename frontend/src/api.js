// Central API base URL — set VITE_API_URL in your .env file
// Falls back to localhost for local development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
