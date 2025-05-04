import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Función para crear un nuevo usuario
type CreateUserData = {
  email: string;
  password: string;
  role?: string;
};

export const createUser = onCall({ region: 'us-central1' }, async (request: CallableRequest<CreateUserData>) => {
  const data = request.data;

  if (!request.auth) {
    console.error('No hay autenticación');
    throw new HttpsError('unauthenticated', 'Debe estar autenticado');
  }

  if (!data.email || !data.password) {
    throw new HttpsError('invalid-argument', 'Email y contraseña son obligatorios');
  }

  const callerUid = request.auth.uid;
  const callerUser = await admin.auth().getUser(callerUid);

  const isAdmin = request.auth.token.role === 'admin' || callerUser.customClaims?.admin === true;

  if (!isAdmin) {
    const userDoc = await admin.firestore().doc(`users/${callerUid}`).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Solo administradores pueden crear usuarios');
    }
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
    });

 

    const claims = data.role === 'admin' ? { admin: true, role: 'admin' } : { role: data.role || 'seller' };
    await admin.auth().setCustomUserClaims(userRecord.uid, claims);

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: data.email,
      role: data.role || 'seller',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { uid: userRecord.uid };
  } catch (error: any) {
    console.error('❌ Error al crear usuario:', error);
    throw new HttpsError('internal', error.message);
  }
});
