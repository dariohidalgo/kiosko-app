"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/config"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  barcode?: string
  createdAt: any
  updatedAt: any
  isActive?: boolean
}

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    barcode: "",
    isActive: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const querySnapshot = await getDocs(collection(db, "products"))
        const productsData: Product[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Product, "id">
          productsData.push({
            id: doc.id,
            ...data,
          })
        })

        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        toast.error("Error al cargar productos")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filtrar productos según término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.barcode && product.barcode.includes(searchTerm)),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setProductData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  // Manejar cambio en checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    setProductData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  // Editar producto
  const editProduct = (product: Product) => {
    setEditingProduct(product)
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      barcode: product.barcode || "",
      isActive: product.isActive !== false, // Si no está definido, asumimos que está activo
    })
    setShowCreateForm(true)
  }

  // Cancelar edición/creación
  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingProduct(null)
    setProductData({
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      barcode: "",
      isActive: true,
    })
  }

  // Guardar producto (crear o actualizar)
  const saveProduct = async (e: FormEvent) => {
    e.preventDefault()

    if (!productData.name) {
      toast.error("El nombre del producto es obligatorio")
      return
    }

    setSubmitting(true)

    try {
      if (editingProduct) {
        // Actualizar producto existente
        await updateDoc(doc(db, "products", editingProduct.id), {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          barcode: productData.barcode || null,
          isActive: productData.isActive,
          updatedAt: serverTimestamp(),
        })

        toast.success("Producto actualizado correctamente")

        // Actualizar lista de productos
        const updatedProductDoc = await getDoc(doc(db, "products", editingProduct.id))
        if (updatedProductDoc.exists()) {
          const updatedProduct = {
            id: updatedProductDoc.id,
            ...updatedProductDoc.data(),
          } as Product

          setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
        }
      } else {
        // Crear nuevo producto
        const newProductRef = doc(collection(db, "products"))
        await setDoc(newProductRef, {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          barcode: productData.barcode || null,
          isActive: productData.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        toast.success("Producto creado correctamente")

        // Actualizar lista de productos
        const newProductDoc = await getDoc(newProductRef)
        if (newProductDoc.exists()) {
          const newProduct = {
            id: newProductDoc.id,
            ...newProductDoc.data(),
          } as Product

          setProducts((prev) => [...prev, newProduct])
        }
      }

      // Limpiar formulario
      cancelForm()
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast.error("Error al guardar producto")
    } finally {
      setSubmitting(false)
    }
  }

  // Cambiar estado de producto (activo/inactivo)
  const toggleProductStatus = async (productId: string, currentStatus = true) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      })

      // Actualizar lista de productos
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, isActive: !currentStatus } : p)))

      toast.success(`Producto ${!currentStatus ? "activado" : "desactivado"} correctamente`)
    } catch (error) {
      console.error("Error al actualizar estado del producto:", error)
      toast.error("Error al actualizar estado del producto")
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Inventario</h2>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {showCreateForm ? "Cancelar" : "Crear Producto"}
        </button>
      </div>

      {/* Formulario para crear/editar producto */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-3">{editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}</h3>

          <form onSubmit={saveProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={productData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-gray-700 mb-1">
                  Precio *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="stock_quantity" className="block text-gray-700 mb-1">
                  Cantidad en Stock
                </label>
                <input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={productData.stock_quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="barcode" className="block text-gray-700 mb-1">
                  Código de Barras
                </label>
                <input
                  id="barcode"
                  name="barcode"
                  type="text"
                  value={productData.barcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={productData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Producto Activo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
              >
                {submitting ? "Guardando..." : "Guardar Producto"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar producto por nombre, descripción o código de barras"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="text-center py-8">Cargando productos...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No se encontraron productos</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className={!product.isActive ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.barcode || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onClick={() => editProduct(product)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Editar
                    </button>
                    <button
                      onClick={() => toggleProductStatus(product.id, product.isActive !== false)}
                      className={
                        product.isActive !== false
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }
                    >
                      {product.isActive !== false ? "Desactivar" : "Activar"}
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

export default InventoryManagement
