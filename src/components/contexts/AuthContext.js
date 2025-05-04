import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, } from "react";
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, } from "firebase/auth";
import { auth } from "../../firebase/config";
const AuthContext = createContext(null);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const login = async (email, password) => {
        console.group('Login de usuario');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Forzar actualización de claims con múltiples intentos
            let tokenResult;
            for (let i = 0; i < 3; i++) {
                try {
                    tokenResult = await user.getIdTokenResult(true);
                    break;
                }
                catch (retryErr) {
                    console.warn(`Intento ${i + 1} de obtener claims fallido: ${retryErr}`);
                    // Pequeño retraso entre intentos
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            if (!tokenResult) {
                console.error('No se pudieron obtener los claims después de múltiples intentos');
            }
            console.groupEnd();
            return user;
        }
        catch (err) {
            console.error(`Error durante el login: ${err}`);
            console.groupEnd();
            throw err;
        }
    };
    const signOut = () => firebaseSignOut(auth);
    const loadUserClaims = async (user) => {
      
        try {
            const token = await user.getIdTokenResult(true);
           
            const role = token.claims.role;
            console.log("✅ ¿Es admin?", claims.role === "admin" || claims.admin === true);
            console.log("🔑 Claims luego de login:", claims);
            setUserRole(role || "seller");
        }
        catch (err) {
            console.error(`❌ Error al cargar claims del usuario: ${err}`);
            setUserRole("seller");
        }
    };
    useEffect(() => {
        console.group('onAuthStateChanged');
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    // Intentar obtener token múltiples veces
                    let token;
                    for (let i = 0; i < 3; i++) {
                        try {
                            token = await user.getIdTokenResult(true);
                            const claims = token.claims;
                            console.log("✅ ¿Es admin?", claims.role === "admin" || claims.admin === true);

                            console.log("🔑 Claims luego de login:", claims); 
                            break;
                        }
                        catch (retryErr) {
                            console.warn(`Intento ${i + 1} de obtener claims fallido: ${retryErr}`);
                            await new Promise(resolve => setTimeout(resolve, 500)); // Pequeño retraso entre intentos
                        }
                    }
                    if (!token) {
                        throw new Error('No se pudieron obtener los claims después de múltiples intentos');
                    }
                    const claims = token.claims;
                    let role = claims.role;
                    if (!role) {
                        role = claims.admin ? "admin" : "seller";
                    }
                    // Validación adicional de rol
                    if (!role) {
                        console.warn('No se pudo determinar un rol válido');
                        role = "seller";
                    }
                    setUserRole(role);
                }
                catch (err) {
                    console.error(`❌ Error al obtener claims: ${err}`);
                    setUserRole("seller");
                }
            }
            else {
                setUserRole(null);
            }
            setLoading(false);
            console.groupEnd();
        });
        return unsubscribe;
    }, []);
    const value = {
        currentUser,
        userRole,
        // Método asíncrono para verificar si es admin
        isAdmin: async () => {
            console.group('Verificación de Admin');
            if (userRole === "admin") {
                console.groupEnd();
                return true;
            }
            if (!currentUser) {
                console.groupEnd();
                return false;
            }
            try {
                const token = await currentUser.getIdTokenResult(true);
                const isAdminByToken = token.claims.admin === true || token.claims.role === 'admin';
                console.groupEnd();
                return isAdminByToken;
            }
            catch (err) {
                console.error('Error al verificar rol de admin: ${err}');
                console.groupEnd();
                return false;
            }
        },
        loading,
        login,
        signOut,
    };
    return (_jsx(AuthContext.Provider, { value: value, children: !loading && children }));
};
