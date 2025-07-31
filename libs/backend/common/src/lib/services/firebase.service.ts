import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name);
    private readonly app: admin.app.App;

    constructor(private configService: ConfigService) {
        const firebaseConfig = {
            type: this.configService.get<string>('firebase.type'),
            project_id: this.configService.get<string>('firebase.project_id'),
            private_key_id: this.configService.get<string>('firebase.private_key_id'),
            private_key: this.configService.get<string>('firebase.private_key'),
            client_email: this.configService.get<string>('firebase.client_email'),
            client_id: this.configService.get<string>('firebase.client_id'),
            auth_uri: this.configService.get<string>('firebase.auth_uri'),
            token_uri: this.configService.get<string>('firebase.token_uri'),
            auth_provider_x509_cert_url: this.configService.get<string>('firebase.auth_provider_x509_cert_url'),
            client_x509_cert_url: this.configService.get<string>('firebase.client_x509_cert_url'),
            universe_domain: this.configService.get<string>('firebase.universe_domain'),
        };

        try {
            // Initialize Firebase Admin SDK
            this.app = admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
                databaseURL: this.configService.get<string>('firebase.databaseURL'),
            });
            this.logger.log('Firebase Admin SDK initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK', error);
            throw error;
        }
    }

    /**
     * Verify Firebase ID token
     */
    async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
            return await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            this.logger.error('Failed to verify Firebase ID token', error);
            throw error;
        }
    }

    /**
     * Get user by UID
     */
    async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
        try {
            return await admin.auth().getUser(uid);
        } catch (error) {
            this.logger.error(`Failed to get user by UID: ${uid}`, error);
            throw error;
        }
    }

    /**
     * Get user by phone number
     */
    async getUserByPhoneNumber(phoneNumber: string): Promise<admin.auth.UserRecord> {
        try {
            return await admin.auth().getUserByPhoneNumber(phoneNumber);
        } catch (error) {
            this.logger.error(`Failed to get user by phone: ${phoneNumber}`, error);
            throw error;
        }
    }

    /**
     * Create a custom token for a user
     */
    async createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
        try {
            return await admin.auth().createCustomToken(uid, additionalClaims);
        } catch (error) {
            this.logger.error(`Failed to create custom token for UID: ${uid}`, error);
            throw error;
        }
    }

    /**
     * Update user data
     */
    async updateUser(uid: string, properties: admin.auth.UpdateRequest): Promise<admin.auth.UserRecord> {
        try {
            return await admin.auth().updateUser(uid, properties);
        } catch (error) {
            this.logger.error(`Failed to update user: ${uid}`, error);
            throw error;
        }
    }

    /**
     * Delete a user
     */
    async deleteUser(uid: string): Promise<void> {
        try {
            await admin.auth().deleteUser(uid);
            this.logger.log(`User deleted successfully: ${uid}`);
        } catch (error) {
            this.logger.error(`Failed to delete user: ${uid}`, error);
            throw error;
        }
    }

    /**
     * List users with pagination
     */
    async listUsers(maxResults?: number, pageToken?: string): Promise<admin.auth.ListUsersResult> {
        try {
            return await admin.auth().listUsers(maxResults, pageToken);
        } catch (error) {
            this.logger.error('Failed to list users', error);
            throw error;
        }
    }

    /**
     * Set custom user claims
     */
    async setCustomUserClaims(uid: string, customClaims: object): Promise<void> {
        try {
            await admin.auth().setCustomUserClaims(uid, customClaims);
            this.logger.log(`Custom claims set for user: ${uid}`);
        } catch (error) {
            this.logger.error(`Failed to set custom claims for user: ${uid}`, error);
            throw error;
        }
    }

    /**
     * Get Firebase App instance
     */
    getApp(): admin.app.App {
        return this.app;
    }

    /**
     * Get Firebase Auth instance
     */
    getAuth(): admin.auth.Auth {
        return admin.auth(this.app);
    }
}