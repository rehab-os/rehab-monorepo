import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

export default registerAs('firebase', () => {
    // Try to load from JSON file first, fall back to env vars
    const jsonPath = path.join(process.cwd(), 'apps/backend/core-api/healui-firebase-adminsdk.json');
    
    if (fs.existsSync(jsonPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        return {
            ...serviceAccount,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        };
    }
    
    // Fallback to environment variables
    return {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'healui',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com',
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    };
});