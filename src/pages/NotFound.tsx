import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">La página que estás buscando no existe o ha sido movida.</p>
        <Link to="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound
