"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../firebase/config";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
const UserManagement = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUserData, setNewUserData] = useState({
        email: "",
        password: "",
        name: "",
        role: "seller",
    });
    const [submitting, setSubmitting] = useState(false);
    // Cargar usuarios al montar el componente
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersData = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    usersData.push({
                        id: doc.id,
                        ...data,
                    });
                });
                setUsers(usersData);
            }
            catch (error) {
                console.error("Error al cargar usuarios:", error);
                toast.error("Error al cargar usuarios");
            }
            finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);
    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    // Crear nuevo usuario
    const createUser = async (e) => {
        e.preventDefault();
        if (!newUserData.email || !newUserData.password) {
            toast.error("Email y contraseña son obligatorios");
            return;
        }
        setSubmitting(true);
        try {
            // Llamar a la función de Firebase para crear usuario
            const token = await currentUser?.getIdToken();
            const createUserFunction = httpsCallable(functions, "createUser");
            const result = await createUserFunction({
                email: newUserData.email,
                password: newUserData.password,
                role: newUserData.role,
                token: token,
            });
            const { uid } = result.data;
            // Crear documento del usuario en Firestore
            await setDoc(doc(db, "users", uid), {
                email: newUserData.email,
                name: newUserData.name || "",
                role: newUserData.role,
                createdAt: serverTimestamp(),
            });
            toast.success("Usuario creado correctamente");
            // Actualizar lista de usuarios
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const newUser = {
                    id: uid,
                    ...userDoc.data(),
                };
                setUsers((prev) => [...prev, newUser]);
            }
            // Limpiar formulario
            setNewUserData({
                email: "",
                password: "",
                name: "",
                role: "seller",
            });
            setShowCreateForm(false);
        }
        catch (error) {
            console.error("Error al crear usuario:", error);
            toast.error(error.message || "Error al crear usuario");
        }
        finally {
            setSubmitting(false);
        }
    };
    // Cambiar estado de usuario (habilitar/deshabilitar)
    const toggleUserStatus = async (userId, currentStatus = false) => {
        try {
            // Llamar a la función de Firebase para actualizar estado
            const updateUserStatusFunction = httpsCallable(functions, "updateUserStatus");
            await updateUserStatusFunction({
                uid: userId,
                disabled: !currentStatus,
            });
            // Actualizar en Firestore
            await updateDoc(doc(db, "users", userId), {
                disabled: !currentStatus,
            });
            // Actualizar lista de usuarios
            setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, disabled: !currentStatus } : user)));
            toast.success(`Usuario ${!currentStatus ? "deshabilitado" : "habilitado"} correctamente`);
        }
        catch (error) {
            console.error("Error al actualizar estado del usuario:", error);
            toast.error("Error al actualizar estado del usuario");
        }
    };
    return (_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Gesti\u00F3n de Usuarios" }), _jsx("button", { onClick: () => setShowCreateForm(!showCreateForm), className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700", children: showCreateForm ? "Cancelar" : "Crear Usuario" })] }), showCreateForm && (_jsxs("div", { className: "mb-6 p-4 border rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: "Crear Nuevo Usuario" }), _jsxs("form", { onSubmit: createUser, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-gray-700 mb-1", children: "Email *" }), _jsx("input", { id: "email", name: "email", type: "email", value: newUserData.email, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-gray-700 mb-1", children: "Contrase\u00F1a *" }), _jsx("input", { id: "password", name: "password", type: "password", value: newUserData.password, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-gray-700 mb-1", children: "Nombre" }), _jsx("input", { id: "name", name: "name", type: "text", value: newUserData.name, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "role", className: "block text-gray-700 mb-1", children: "Rol" }), _jsxs("select", { id: "role", name: "role", value: newUserData.role, onChange: handleChange, className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "seller", children: "Vendedor" }), _jsx("option", { value: "admin", children: "Administrador" })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: submitting, className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400", children: submitting ? "Creando..." : "Crear Usuario" }) })] })] })), loading ? (_jsx("div", { className: "text-center py-8", children: "Cargando usuarios..." })) : users.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No hay usuarios registrados" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Nombre" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Rol" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Estado" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Acciones" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: users.map((user) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: user.email }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: user.name || "-" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`, children: user.role === "admin" ? "Administrador" : "Vendedor" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.disabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`, children: user.disabled ? "Deshabilitado" : "Activo" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: _jsx("button", { onClick: () => toggleUserStatus(user.id, user.disabled), className: `text-sm ${user.disabled ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}`, children: user.disabled ? "Habilitar" : "Deshabilitar" }) })] }, user.id))) })] }) }))] }));
};
export default UserManagement;
