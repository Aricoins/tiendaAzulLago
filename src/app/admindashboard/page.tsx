'use client'
import { useSession, useUser } from "@clerk/nextjs";
import { checkUserRole, isUserAdmin, getUserInfo } from "@/app/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Eye,
  EyeOff,
  Search,
  Filter,
  Edit,
  Trash2,
  BarChart3,
  AlertCircle,
  Check,
  X,
  Download,
  Info,
  RefreshCw
} from "lucide-react";

// Simple toast hook without external dependencies
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: string, type: 'success' | 'error' | 'info', message: string}>>([]);
  
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  return { toasts, addToast, removeToast };
};

interface Product {
    id: string;
    model: string;
    category: string;
    price: string;
    image: string;
    disable: boolean;
    created_at?: string;
}

interface User {
    id: string;
    email: string;
    disable: boolean;
    created_at?: string;
}

interface DashboardStats {
    totalProducts: number;
    totalUsers: number;
    activeProducts: number;
    totalRevenue: number;
    categoryStats: { [key: string]: number };
}

export default function AdminDashboard() {
    const { session } = useSession();
    const { user } = useUser();
    const { toasts, addToast, removeToast } = useToast();
    
    // Estados principales
    const [productList, setProductList] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    
    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalUsers: 0,
        activeProducts: 0,
        totalRevenue: 0,
        categoryStats: {}
    });
    
    // Estados de UI
    const [activeTab, setActiveTab] = useState<'products' | 'users' | 'stats' | 'debug'>('products');

    // Verificar si el usuario es administrador usando la nueva función
    const isAdmin = isUserAdmin(session, user);
    
    // Obtener información de debug
    useEffect(() => {
        if (user || session) {
            const info = getUserInfo(session, user);
            setDebugInfo(info);
            console.log('🔍 User Info Debug:', info);
        }
    }, [session, user]);

    useEffect(() => {
        console.log('🔍 Dashboard useEffect triggered');
        console.log('🔍 isAdmin:', isAdmin);
        console.log('🔍 user:', user);
        console.log('🔍 session:', session);
        
        if (!isAdmin) {
            console.log('❌ User is not admin, skipping data fetch');
            return;
        }

        console.log('✅ User is admin, starting data fetch');
        
        const calculateStats = (products: Product[]) => {
            const activeProducts = products.filter(p => !p.disable);
            const categoryStats = products.reduce((acc, product) => {
                acc[product.category] = (acc[product.category] || 0) + 1;
                return acc;
            }, {} as { [key: string]: number });

            const totalRevenue = activeProducts.reduce((sum, product) => {
                return sum + parseInt(product.price || '0');
            }, 0);

            setStats({
                totalProducts: products.length,
                totalUsers: users.length,
                activeProducts: activeProducts.length,
                totalRevenue,
                categoryStats
            });
        };
        
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                const [productsResponse, usersResponse] = await Promise.all([
                    fetch('/api/admin/products'),
                    fetch('/api/admin/users')
                ]);

                if (!productsResponse.ok || !usersResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const productsData = await productsResponse.json();
                const usersData = await usersResponse.json();

                console.log('🔍 Products data:', productsData);
                console.log('🔍 Users data:', usersData);
                console.log('🔍 Products array length:', productsData.products?.length || 0);

                setProductList(productsData.products || []);
                setUsers(usersData.users || []);
                
                // Calcular estadísticas
                calculateStats(productsData.products || []);
                
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los datos');
                addToast('error', 'Error al cargar los datos del dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin, refreshTrigger, users.length]);

    const toggleProductStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch("/api/admin/products", {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, disable: !currentStatus }),
            });

            if (!response.ok) throw new Error('Failed to update product');
            
            addToast('success', `Producto ${!currentStatus ? 'ocultado' : 'activado'} correctamente`);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error updating product:', error);
            addToast('error', 'Error al actualizar el producto');
        }
    };

    const toggleUserStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch("/api/signup", {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, disable: !currentStatus }),
            });

            if (!response.ok) throw new Error('Failed to update user');
            
            addToast('success', `Usuario ${!currentStatus ? 'deshabilitado' : 'habilitado'} correctamente`);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error updating user:', error);
            addToast('error', 'Error al actualizar el usuario');
        }
    };

    // Filtrar productos
    const filteredProducts = productList.filter(product => {
        const matchesSearch = product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesStatus = !showActiveOnly || !product.disable;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Obtener categorías únicas
    const categories = [...new Set(productList.map(p => p.category))];

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                        <p className="text-gray-600 mb-6">
                            No tienes permisos para acceder al panel de administración.
                        </p>
                    </div>
                    
                    {/* Información de debug para usuarios no admin */}
                    {debugInfo && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                Información de Usuario (Debug)
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-mono">{debugInfo.email || 'No disponible'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">User ID:</span>
                                    <span className="font-mono">{debugInfo.userId || 'No disponible'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rol:</span>
                                    <span className="font-mono">{debugInfo.role || 'Sin rol'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Es Admin:</span>
                                    <span className={`font-mono ${debugInfo.isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                                        {debugInfo.isAdmin ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Public Metadata:</span>
                                    <span className="font-mono">{JSON.stringify(debugInfo.publicMetadata) || 'Vacío'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">🔑 Para obtener acceso de administrador:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Contacta al administrador del sistema</li>
                            <li>• Tu email debe estar en la lista de administradores</li>
                            <li>• O tu rol debe configurarse como &apos;admin&apos; en Clerk</li>
                        </ul>
                    </div>
                    
                    <div className="flex space-x-3 justify-center">
                        <Link 
                            href="/" 
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Volver al inicio
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Recargar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                            <p className="text-gray-600">Gestiona productos y usuarios</p>
                        </div>
                        <div className="flex space-x-3">
                            <Link 
                                href="/form" 
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Producto
                            </Link>
                            <Link 
                                href="/quick-admin" 
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Rápido
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                        <span className="text-red-800">{error}</span>
                        <button 
                            onClick={() => setError('')}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Eye className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Categorías</p>
                                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.categoryStats).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'products'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Package className="h-4 w-4 inline mr-2" />
                                Productos ({stats.totalProducts})
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'users'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Users className="h-4 w-4 inline mr-2" />
                                Usuarios ({stats.totalUsers})
                            </button>
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'stats'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <BarChart3 className="h-4 w-4 inline mr-2" />
                                Estadísticas
                            </button>
                            <button
                                onClick={() => setActiveTab('debug')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'debug'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Info className="h-4 w-4 inline mr-2" />
                                Debug
                            </button>
                        </nav>
                    </div> 
                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar productos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todas las categorías</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        showActiveOnly 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <Filter className="h-4 w-4 inline mr-2" />
                                    Solo activos
                                </button>
                            </div>

                            {/* Products Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Producto
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Categoría
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Precio
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
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-12 w-12">
                                                            <Image
                                                                src={product.image}
                                                                alt={product.model}
                                                                width={48}
                                                                height={48}
                                                                className="h-12 w-12 rounded-md object-cover"
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.model}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {product.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${parseInt(product.price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        product.disable 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {product.disable ? (
                                                            <>
                                                                <EyeOff className="h-3 w-3 mr-1" />
                                                                Oculto
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                Visible
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={`/product/${product.id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleProductStatus(product.id, product.disable)}
                                                            className={`${
                                                                product.disable 
                                                                    ? 'text-green-600 hover:text-green-900' 
                                                                    : 'text-red-600 hover:text-red-900'
                                                            }`}
                                                        >
                                                            {product.disable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm || selectedCategory !== 'all' 
                                            ? 'No se encontraron productos con los filtros aplicados.'
                                            : 'Comienza agregando algunos productos.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Usuario
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
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <Users className="h-5 w-5 text-gray-600" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.email}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {user.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.disable 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.disable ? 'Deshabilitado' : 'Activo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id, user.disable)}
                                                        className={`${
                                                            user.disable 
                                                                ? 'text-green-600 hover:text-green-900' 
                                                                : 'text-red-600 hover:text-red-900'
                                                        }`}
                                                    >
                                                        {user.disable ? 'Habilitar' : 'Deshabilitar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Productos por Categoría</h3>
                                    <div className="space-y-3">
                                        {Object.entries(stats.categoryStats).map(([category, count]) => (
                                            <div key={category} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">{category}</span>
                                                <div className="flex items-center">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full" 
                                                            style={{width: `${(count / stats.totalProducts) * 100}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen General</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total de productos:</span>
                                            <span className="text-sm font-medium text-gray-900">{stats.totalProducts}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Productos activos:</span>
                                            <span className="text-sm font-medium text-green-600">{stats.activeProducts}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Productos ocultos:</span>
                                            <span className="text-sm font-medium text-red-600">{stats.totalProducts - stats.activeProducts}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total de usuarios:</span>
                                            <span className="text-sm font-medium text-gray-900">{stats.totalUsers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Categorías:</span>
                                            <span className="text-sm font-medium text-gray-900">{Object.keys(stats.categoryStats).length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Debug Tab */}
                    {activeTab === 'debug' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Info className="h-5 w-5 mr-2" />
                                        Información de Usuario Actual
                                    </h3>
                                    {debugInfo ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Email:</span>
                                                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                    {debugInfo.email || 'No disponible'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">User ID:</span>
                                                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                    {debugInfo.userId || 'No disponible'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Rol:</span>
                                                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                    {debugInfo.role || 'Sin rol'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Es Admin:</span>
                                                <span className={`text-sm font-mono px-2 py-1 rounded ${
                                                    debugInfo.isAdmin 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {debugInfo.isAdmin ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t">
                                                <span className="text-sm text-gray-600 block mb-2">Public Metadata:</span>
                                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(debugInfo.publicMetadata, null, 2) || 'Vacío'}
                                                </pre>
                                            </div>
                                            <div className="pt-2 border-t">
                                                <span className="text-sm text-gray-600 block mb-2">Organization Memberships:</span>
                                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(debugInfo.organizationMemberships, null, 2) || 'Vacío'}
                                                </pre>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-gray-500">No hay información de usuario disponible</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <AlertCircle className="h-5 w-5 mr-2" />
                                        Configuración de Administradores
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="border-b pb-2">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Métodos de Verificación:</h4>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                <li>• Rol en organizationMemberships</li>
                                                <li>• Rol en publicMetadata</li>
                                                <li>• Email en lista de administradores</li>
                                                <li>• ID de usuario específico (fallback)</li>
                                            </ul>
                                        </div>
                                        <div className="border-b pb-2">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Emails Admin Configurados:</h4>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                <li>• admin@azullago.com</li>
                                                <li>• ariel@azullago.com</li>
                                                <li>• administrador@azullago.com</li>
                                            </ul>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded">
                                            <h4 className="text-sm font-medium text-blue-800 mb-1">💡 Para obtener acceso admin:</h4>
                                            <ul className="text-xs text-blue-700 space-y-1">
                                                <li>• Configura tu rol como &apos;admin&apos; en Clerk</li>
                                                <li>• Añade tu email a la lista de administradores</li>
                                                <li>• Configura publicMetadata: {`{"role": "admin"}`}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Toast notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`transform transition-all duration-300 translate-x-0 opacity-100 max-w-sm w-full border rounded-lg shadow-lg p-4 ${
                            toast.type === 'success' ? 'bg-green-50 border-green-200' :
                            toast.type === 'error' ? 'bg-red-50 border-red-200' :
                            'bg-blue-50 border-blue-200'
                        }`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                {toast.type === 'success' && <Check className="h-5 w-5 text-green-500" />}
                                {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                {toast.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500" />}
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {toast.message}
                                </p>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex">
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}