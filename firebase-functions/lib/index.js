"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
exports.createUser = (0, https_1.onCall)({ region: 'us-central1' }, async (request) => {
    const data = request.data;
    if (!request.auth) {
        console.error('No hay autenticación');
        throw new https_1.HttpsError('unauthenticated', 'Debe estar autenticado');
    }
    if (!data.email || !data.password) {
        throw new https_1.HttpsError('invalid-argument', 'Email y contraseña son obligatorios');
    }
    const callerUid = request.auth.uid;
    const callerUser = await admin.auth().getUser(callerUid);
    const isAdmin = request.auth.token.role === 'admin' || callerUser.customClaims?.admin === true;
    if (!isAdmin) {
        const userDoc = await admin.firestore().doc(`users/${callerUid}`).get();
        if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
            throw new https_1.HttpsError('permission-denied', 'Solo administradores pueden crear usuarios');
        }
    }
    try {
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
        });
        ('Creando usuario con datos:', {
            email: data.email,
            role: data.role,
            callerRole: request.auth?.token?.role
        });
        const claims = data.role === 'admin' ? { admin: true, role: 'admin' } : { role: data.role || 'seller' };
        await admin.auth().setCustomUserClaims(userRecord.uid, claims);
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            email: data.email,
            role: data.role || 'seller',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { uid: userRecord.uid };
    }
    catch (error) {
        console.error('❌ Error al crear usuario:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
