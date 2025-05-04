"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  increment,
  serverTimestamp,
  writeBatch,
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

interface CartItem {
  product: Product;
  quantity: number;
}

const RegisterSale = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData: Product[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Product, "id">;
          if (data.stock_quantity > 0) {
            productsData.push({
              id: doc.id,
              ...data,
            });
          }
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

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      // Verificar si el producto ya está en el carrito
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Si ya existe, incrementar la cantidad si hay stock disponible
        if (existingItem.quantity < product.stock_quantity) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast.error(`No hay más stock disponible de ${product.name}`);
          return prevCart;
        }
      } else {
        // Si no existe, agregarlo con cantidad 1
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  // Actualizar cantidad de un producto en el carrito
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > product.stock_quantity) {
      toast.error(
        `No hay suficiente stock. Máximo disponible: ${product.stock_quantity}`
      );
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Calcular total de la venta
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // Procesar la venta
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    setProcessingPayment(true);

    try {
      const batch = writeBatch(db);
    
      // Crear documento de venta
      const saleRef = await addDoc(collection(db, "sales"), {
        userId: currentUser?.uid,
        userName: currentUser?.email,
        saleTimestamp: serverTimestamp(),
        totalAmount: calculateTotal(),
        createdAt: serverTimestamp(),
      });
    
      // 👉 Referencia a la subcolección saleItems
      const saleDocRef = doc(db, "sales", saleRef.id);
      const saleItemsCollection = collection(saleDocRef, "saleItems");
    
      for (const item of cart) {
        const itemRef = doc(saleItemsCollection); // genera ID automático
        batch.set(itemRef, {
          productId: item.product.id,
          productName: item.product.name,
          quantitySold: item.quantity,
          priceAtSale: item.product.price,
        });
    
        // Actualizar stock
        const productRef = doc(db, "products", item.product.id);
        batch.update(productRef, {
          stock_quantity: increment(-item.quantity),
        });
    
        // Log de stock
        const logRef = doc(collection(db, "stock_log"));
        batch.set(logRef, {
          productId: item.product.id,
          productName: item.product.name,
          changeQuantity: -item.quantity,
          reason: "sale",
          userId: currentUser?.uid,
          timestamp: serverTimestamp(),
        });
      }
    
      await batch.commit();
    
      toast.success("Venta registrada correctamente");
      setCart([]);
    
      // Recargar productos
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Product, "id">;
        productsData.push({ id: doc.id, ...data });
      });
    
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error("Error al procesar la venta:", error);
      toast.error("Error al procesar la venta");
    } finally {
      setProcessingPayment(false);
    }

  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Lista de productos */}
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow ">
        <h2 className="text-xl font-semibold mb-4">Productos Disponibles</h2>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addToCart(product)}
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
                    Stock: {product.stock_quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carrito de compras */}
      <div className="bg-white p-4 rounded-lg shadow ">
        <h2 className="text-xl font-semibold mb-4">Carrito de Venta</h2>

        {cart.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            El carrito está vacío. Haga clic en un producto para agregarlo.
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${item.product.price.toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded-l-md"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 bg-gray-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded-r-md"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-2 text-red-500"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <button
                onClick={processSale}
                disabled={processingPayment}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-green-400"
              >
                {processingPayment ? "Procesando..." : "Completar Venta"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterSale;
