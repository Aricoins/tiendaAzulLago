'use client'
import { useSession, useUser } from "@clerk/nextjs";
import { checkUserRole, isUserAdmin, getUserInfo } from "@/app/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { 
    Package, 
    Users, 
    Eye, 
    EyeOff, 
    Plus, 
    Search, 
    Filter, 
    AlertCircle, 
    X, 
    RefreshCw, 
    Info, 
    BarChart3, 
    TrendingUp, 
    ExternalLink 
} from "lucide-react";

// Tipos
interface Product {
    id: number;
    model: string;
    category: string;
    specs: any;
    image: string;
    price: string;
    video?: string;
    disable: boolean;
    created_at: string;
    updated_at: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    disable: boolean;
    created_at: string;
}

interface DashboardStats {
    totalProducts: number;
    totalUsers: number;
    activeProducts: number;
    totalRevenue: number;
    categoryStats: { [key: string]: number };
}

// Hook para notificaciones toast
const useToast = () => {
    const [toasts, setToasts] = useState<Array<{
        id: string;
        type: 'success' | 'error' | 'warning';
        message: string;
    }>>([]);

    const addToast = (type: 'success' | 'error' | 'warning', message: string) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return { toasts, addToast, removeToast };
};

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
                
                // Solo cargar productos por ahora
                const productsResponse = await fetch('/api/admin/products');

                if (!productsResponse.ok) {
                    throw new Error('Failed to fetch products');
                }

                const productsData = await productsResponse.json();
                console.log('📦 Products data:', productsData);
                console.log('📦 Products array length:', productsData.products?.length || 0);

                setProductList(productsData.products || []);
                
                // Calcular estadísticas solo con productos
                calculateStats(productsData.products || []);
                
                // Cargar usuarios solo si es necesario (comentado por ahora)
                // try {
                //     const usersResponse = await fetch('/api/admin/users');
                //     if (usersResponse.ok) {
                //         const usersData = await usersResponse.json();
                //         setUsers(usersData.users || []);
                //     }
                // } catch (userError) {
                //     console.warn('Users endpoint not available:', userError);
                // }
                
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los datos de productos');
                addToast('error', 'Error al cargar los datos del dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin, refreshTrigger, addToast]);

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
            {/* Toasts */}
            <div className="fixed top-4 right-4 space-y-2 z-50">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`p-4 rounded-md shadow-lg flex items-center justify-between min-w-96 ${
                            toast.type === 'success' ? 'bg-green-50 border border-green-200' :
                            toast.type === 'error' ? 'bg-red-50 border border-red-200' :
                            'bg-yellow-50 border border-yellow-200'
                        }`}
                    >
                        <span className={`text-sm font-medium ${
                            toast.type === 'success' ? 'text-green-800' :
                            toast.type === 'error' ? 'text-red-800' :
                            'text-yellow-800'
                        }`}>
                            {toast.message}
                        </span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className={`ml-2 ${
                                toast.type === 'success' ? 'text-green-400 hover:text-green-600' :
                                toast.type === 'error' ? 'text-red-400 hover:text-red-600' :
                                'text-yellow-400 hover:text-yellow-600'
                            }`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

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
                                href="/" 
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Tienda
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
                                                        {product.disable ? 'Oculto' : 'Activo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => toggleProductStatus(product.id.toString(), !product.disable)}
                                                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                                            product.disable
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {product.disable ? (
                                                            <>
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                Mostrar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff className="h-3 w-3 mr-1" />
                                                                Ocultar
                                                            </>
                                                        )}
                                                    </button>
                                                    <Link
                                                        href={`/product/${product.id}`}
                                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                                    >
                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                        Ver
                                                    </Link>
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
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Gestión de Usuarios</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    La funcionalidad de gestión de usuarios estará disponible próximamente.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas por Categoría</h3>
                                    <div className="space-y-3">
                                        {Object.entries(stats.categoryStats).map(([category, count]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">{category}</span>
                                                <span className="text-sm font-bold text-gray-900">{count} productos</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen General</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Total de productos</span>
                                            <span className="text-sm font-bold text-gray-900">{stats.totalProducts}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Productos activos</span>
                                            <span className="text-sm font-bold text-green-600">{stats.activeProducts}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Productos ocultos</span>
                                            <span className="text-sm font-bold text-red-600">{stats.totalProducts - stats.activeProducts}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Categorías</span>
                                            <span className="text-sm font-bold text-gray-900">{Object.keys(stats.categoryStats).length}</span>
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
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Autenticación</h3>
                                    {debugInfo && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Email:</span>
                                                <span className="text-sm font-mono text-gray-900">{debugInfo.email || 'No disponible'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">User ID:</span>
                                                <span className="text-sm font-mono text-gray-900">{debugInfo.userId || 'No disponible'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Rol:</span>
                                                <span className="text-sm font-mono text-gray-900">{debugInfo.role || 'Sin rol'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Es Admin:</span>
                                                <span className={`text-sm font-mono ${debugInfo.isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                                                    {debugInfo.isAdmin ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Estado del Sistema</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Productos cargados:</span>
                                            <span className="text-sm font-bold text-gray-900">{productList.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Filtros aplicados:</span>
                                            <span className="text-sm font-bold text-gray-900">{filteredProducts.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Búsqueda:</span>
                                            <span className="text-sm font-mono text-gray-900">{searchTerm || 'Sin búsqueda'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Categoría:</span>
                                            <span className="text-sm font-mono text-gray-900">{selectedCategory}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
