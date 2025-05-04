"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"

import { db, functions } from "../../firebase/config"
import toast from "react-hot-toast"
import { useAuth } from "../contexts/AuthContext"

interface User {
  id: string
  email: string
  name?: string
  role: string
  createdAt: any
  disabled?: boolean
}

const UserManagement: React.FC = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    name: "",
    role: "seller",
  })
  const [submitting, setSubmitting] = useState(false)

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        const usersData: User[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<User, "id">
          usersData.push({
            id: doc.id,
            ...data,
          })
        })

        setUsers(usersData)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast.error("Error al cargar usuarios")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Crear nuevo usuario
  const createUser = async (e: FormEvent) => {
    e.preventDefault()

    if (!newUserData.email || !newUserData.password) {
      toast.error("Email y contraseña son obligatorios")
      return
    }

    setSubmitting(true)

    try {
      // Llamar a la función de Firebase para crear usuario
      const token = await currentUser?.getIdToken()
      const createUserFunction = httpsCallable(functions, "createUser")
      const result = await createUserFunction({
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role,
        token: token,
      })

      const { uid } = result.data as any

      // Crear documento del usuario en Firestore
      await setDoc(doc(db, "users", uid), {
        email: newUserData.email,
        name: newUserData.name || "",
        role: newUserData.role,
        createdAt: serverTimestamp(),
      })

      toast.success("Usuario creado correctamente")

      // Actualizar lista de usuarios
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const newUser = {
          id: uid,
          ...userDoc.data(),
        } as User

        setUsers((prev) => [...prev, newUser])
      }

      // Limpiar formulario
      setNewUserData({
        email: "",
        password: "",
        name: "",
        role: "seller",
      })
      setShowCreateForm(false)
    } catch (error: any) {
      console.error("Error al crear usuario:", error)
      toast.error(error.message || "Error al crear usuario")
    } finally {
      setSubmitting(false)
    }
  }

  // Cambiar estado de usuario (habilitar/deshabilitar)
  const toggleUserStatus = async (userId: string, currentStatus = false) => {
    try {
      // Llamar a la función de Firebase para actualizar estado
      const updateUserStatusFunction = httpsCallable(functions, "updateUserStatus")
      await updateUserStatusFunction({
        uid: userId,
        disabled: !currentStatus,
      })

      // Actualizar en Firestore
      await updateDoc(doc(db, "users", userId), {
        disabled: !currentStatus,
      })

      // Actualizar lista de usuarios
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, disabled: !currentStatus } : user)))

      toast.success(`Usuario ${!currentStatus ? "deshabilitado" : "habilitado"} correctamente`)
    } catch (error) {
      console.error("Error al actualizar estado del usuario:", error)
      toast.error("Error al actualizar estado del usuario")
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {showCreateForm ? "Cancelar" : "Crear Usuario"}
        </button>
      </div>

      {/* Formulario para crear usuario */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-3">Crear Nuevo Usuario</h3>

          <form onSubmit={createUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={newUserData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={newUserData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={newUserData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUserData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="seller">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
              >
                {submitting ? "Creando..." : "Crear Usuario"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      {loading ? (
        <div className="text-center py-8">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay usuarios registrados</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.name || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "Administrador" : "Vendedor"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.disabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.disabled ? "Deshabilitado" : "Activo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.disabled)}
                      className={`text-sm ${
                        user.disabled ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"
                      }`}
                    >
                      {user.disabled ? "Habilitar" : "Deshabilitar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserManagement
