"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/config"

interface AuthContextType {
  currentUser: User | null
  userRole: string | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  }

  // Función para cerrar sesión
  const signOut = () => {
    return firebaseSignOut(auth)
  }

  // Verificar si el usuario es administrador
  const checkAdminRole = async (user: User) => {
    try {
      // Método 1: Verificar Custom Claims
      const idTokenResult = await user.getIdTokenResult()
      if (idTokenResult.claims.admin === admin) {
        setUserRole("admin")
        return
      }

      // Método 2: Verificar en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setUserRole("admin")
        return
      }

      // Si no es admin, asumimos que es vendedor
      setUserRole("seller")
    } catch (error) {
      console.error("Error al verificar rol:", error)
      setUserRole("seller") // Por defecto, asumimos rol de vendedor
    }
  }

  // Efecto para observar cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        await checkAdminRole(user)
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === "admin",
    loading,
    login,
    signOut,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
