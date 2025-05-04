"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../firebase/config"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  barcode: string
}

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Enfocar el input al cargar el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Buscar producto por código de barras
  const searchProductByBarcode = async (code: string) => {
    if (!code) return

    setLoading(true)
    try {
      const q = query(collection(db, "products"), where("barcode", "==", code))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setProduct(null)
        toast.error(`No se encontró producto con código: ${code}`)
      } else {
        const doc = querySnapshot.docs[0]
        setProduct({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        } as Product)
        toast.success(`Producto encontrado: ${doc.data().name}`)
      }
    } catch (error) {
      console.error("Error al buscar producto:", error)
      toast.error("Error al buscar producto")
    } finally {
      setLoading(false)
      setBarcode("")
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  // Manejar cambio en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value)
  }

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchProductByBarcode(barcode)
  }

  // Manejar tecla Enter (para lectores de código de barras)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchProductByBarcode(barcode)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Escáner de código de barras */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Lector de Código de Barras</h2>

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label htmlFor="barcode" className="block text-gray-700 mb-2">
              Código de Barras
            </label>
            <input
              ref={inputRef}
              id="barcode"
              type="text"
              value={barcode}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escanee o ingrese el código de barras"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !barcode}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
          >
            {loading ? "Buscando..." : "Buscar Producto"}
          </button>
        </form>

        <div className="text-sm text-gray-600">
          <p className="mb-2">Instrucciones:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Conecte su lector de código de barras al dispositivo</li>
            <li>Asegúrese de que el cursor esté en el campo de entrada</li>
            <li>Escanee el código de barras del producto</li>
            <li>El sistema buscará automáticamente el producto</li>
          </ul>
        </div>
      </div>

      {/* Información del producto */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Información del Producto</h2>

        {loading ? (
          <div className="text-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-gray-600">Buscando producto...</p>
          </div>
        ) : product ? (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg">{product.name}</h3>
            <p className="text-gray-600 mb-3">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Precio</p>
                <p className="font-bold text-blue-600">${product.price.toFixed(2)}</p>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Stock</p>
                <p className={`font-bold ${product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                  {product.stock_quantity}
                </p>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded-lg mb-3">
              <p className="text-sm text-gray-600">Código de Barras</p>
              <p className="font-mono">{product.barcode}</p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setProduct(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Limpiar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Escanee un código de barras para ver la información del producto
          </div>
        )}
      </div>
    </div>
  )
}

export default BarcodeScanner
