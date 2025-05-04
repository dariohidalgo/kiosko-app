"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  barcode?: string;
}

const ManageStock = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData: Product[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Product, "id">;
          productsData.push({
            id: doc.id,
            ...data,
          });
        });

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        toast.error("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrar productos según término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.barcode && product.barcode.includes(searchTerm))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Seleccionar producto
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error("Seleccione un producto");
      return;
    }

    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    setSubmitting(true);

    try {
      // Actualizar stock del producto
      const productRef = doc(db, "products", selectedProduct.id);
      await updateDoc(productRef, {
        stock_quantity: increment(quantity),
      });

      // Registrar en el log de stock
      await addDoc(collection(db, "stock_log"), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        changeQuantity: quantity,
        reason: "entry",
        userId: currentUser?.uid,
        timestamp: serverTimestamp(),
      });

      toast.success(
        `Stock actualizado: ${selectedProduct.name} (+${quantity})`
      );

      // Actualizar la lista de productos
      const updatedProductDoc = await getDoc(productRef);
      if (updatedProductDoc.exists()) {
        const updatedProduct = {
          id: updatedProductDoc.id,
          ...updatedProductDoc.data(),
        } as Product;

        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          )
        );
      }

      // Limpiar formulario
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      toast.error("Error al actualizar stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Lista de productos */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Seleccionar Producto</h2>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto por nombre, descripción o código de barras"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-4">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-4">No se encontraron productos</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedProduct?.id === product.id
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => selectProduct(product)}
              >
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock actual: {product.stock_quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario para cargar stock */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Cargar Stock</h2>

        {selectedProduct ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h3 className="font-medium text-lg">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedProduct.description}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Stock actual:{" "}
                <span className="font-semibold">
                  {selectedProduct.stock_quantity}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="block text-gray-700 mb-2">
                Cantidad a agregar
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number.parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {submitting ? "Guardando..." : "Guardar Entrada"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Seleccione un producto de la lista para cargar stock
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStock;
