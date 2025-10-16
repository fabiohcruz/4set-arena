'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Plus, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Calendar,
  ArrowRightLeft,
  FolderOpen,
  DollarSign,
  Star,
  Trash2,
  Edit,
  Barcode
} from 'lucide-react';

interface Sale {
  id: number;
  accountNumber: string;
  clientName: string;
  cardNumber?: string;
  total: string; // Corrigido: API retorna como string
  status: 'open' | 'partial' | 'closed' | 'transferred';
  createdAt: string;
  items?: SaleItem[];
}

interface SaleItem {
  id: number;
  productCode: string;
  productDescription: string;
  quantity: string; // Corrigido: API retorna como string
  unitValue: string; // Corrigido: API retorna como string
  totalValue: string; // Corrigido: API retorna como string
  type: 'product' | 'service' | 'tariff';
  createdAt: string;
}

interface Product {
  id: number;
  code: string;
  description: string;
  unitValue: string; // Corrigido: API retorna como string
  costValue?: string;
  taxSituation?: string;
  ncm?: string;
  active: boolean;
  category?: string;
  barcode?: string | null;
  stock?: number;
  minStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Client {
  id: number;
  member_code: string;
  full_name: string;
  email: string;
  phone: string;
  membership_type: string;
  status: string;
  loyalty_tier?: string;
}

export default function PDVPage() {
  const router = useRouter();
  
  // Estados principais
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  
  const [currentSaleItems, setCurrentSaleItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [clients, setClients] = useState<Client[]>([]);
  
  // Estados de interface
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [searchSales, setSearchSales] = useState('');
  const [searchProducts, setSearchProducts] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showOtherPDV, setShowOtherPDV] = useState(false);
  
  // Estados do modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [searchClients, setSearchClients] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [editingItem, setEditingItem] = useState<SaleItem | null>(null);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editCustomValue, setEditCustomValue] = useState(0);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [searchTransferClients, setSearchTransferClients] = useState('');
  const [filteredTransferClients, setFilteredTransferClients] = useState<Client[]>([]);
  
  // Estados do formulário
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customValue, setCustomValue] = useState(0);
  const [cardNumber, setCardNumber] = useState('');

  const { isAuthenticated, loading: authLoading, getToken } = useAuth();

  // Verificar autenticação (apenas uma vez)
  useEffect(() => {
    if (authLoading) return; // Aguardar carregamento da autenticação
    
    if (!isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando para login');
      router.push('/login');
      return;
    }
    
    setAuthChecking(false);
    // Se autenticado, carregar dados
    fetchSales();
    fetchProducts();
    fetchClients();
  }, [isAuthenticated, authLoading, router]);

  // Recarregar dados quando searchSales ou showOtherPDV mudarem
  useEffect(() => {
    if (!authChecking) {
      fetchSales();
    }
  }, [searchSales, showOtherPDV]);

  useEffect(() => {
    if (searchClients) {
      const filtered = clients.filter(client =>
        client.full_name.toLowerCase().includes(searchClients.toLowerCase()) ||
        client.member_code.toLowerCase().includes(searchClients.toLowerCase()) ||
        client.id.toString().includes(searchClients)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchClients, clients]);

  useEffect(() => {
    if (searchTransferClients) {
      const filtered = clients.filter(client =>
        client.full_name.toLowerCase().includes(searchTransferClients.toLowerCase()) ||
        client.member_code.toLowerCase().includes(searchTransferClients.toLowerCase()) ||
        client.id.toString().includes(searchTransferClients)
      );
      setFilteredTransferClients(filtered);
    } else {
      setFilteredTransferClients(clients);
    }
  }, [searchTransferClients, clients]);

  useEffect(() => {
    if (currentSale) {
      fetchSaleItems(currentSale.id);
    }
  }, [currentSale]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        console.warn('Token não encontrado, redirecionando para login');
        setSales([]);
        return;
      }
      
      const params = new URLSearchParams();
      if (searchSales) params.append('search', searchSales);
      if (!showOtherPDV) params.append('userId', '1'); // ID do usuário atual
      
      const response = await fetch(`/api/sales?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status, response.statusText);
        setSales([]);
        return;
      }
      
      const data = await response.json();
      console.log('Dados recebidos da API sales:', data);
      // Garantir que sales seja sempre um array
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (searchProducts) params.append('search', searchProducts);
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      // Garantir que products seja sempre um array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        console.warn('Token não encontrado para buscar clientes');
        setClients([]);
        return;
      }
      
      const response = await fetch('/api/members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Erro na resposta da API members:', response.status, response.statusText);
        setClients([]);
        return;
      }
      
      const data = await response.json();
      console.log('Dados recebidos da API members:', data);
      // A API retorna { success: true, data: [...] }
      const clientsData = data.success ? data.data : [];
      // Garantir que clients seja sempre um array
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setClients([]);
    }
  };

  const fetchSaleItems = async (saleId: number) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/sales/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCurrentSaleItems(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar itens da venda:', error);
    }
  };

  const createNewSale = async (client?: Client) => {
    try {
      const clientToUse = client || selectedClient;
      const clientName = clientToUse ? clientToUse.full_name : 'CONSUMIDOR FINAL';
      const clientId = clientToUse ? clientToUse.id : 1;
      
      const token = getToken();
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName,
          clientId,
          cardNumber,
          items: [],
          userId: 1
        }),
      });
      
      const newSale = await response.json();
      setCurrentSale(newSale);
      setCurrentSaleItems([]);
      setSelectedClient(clientToUse);
      setShowClientModal(false);
      setSearchClients('');
      fetchSales();
    } catch (error) {
      console.error('Erro ao criar venda:', error);
    }
  };

  const addItemToSale = async () => {
    if (!currentSale || !selectedProduct) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/sales/${currentSale.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productCode: selectedProduct.code,
          quantity,
          type: 'product'
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        fetchSaleItems(currentSale.id);
        fetchSales(); // Atualizar lista de vendas
        
        // Atualizar a venda atual com os novos dados
        const updatedSaleResponse = await fetch(`/api/sales/${currentSale.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (updatedSaleResponse.ok) {
          const updatedSale = await updatedSaleResponse.json();
          setCurrentSale(updatedSale);
        }
        
        setSelectedProduct(null);
        setQuantity(1);
        setCustomValue(0);
      } else {
        const errorData = await response.json();
        console.error('Erro ao adicionar item:', response.status, errorData);
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const removeItemFromSale = async (itemId: number) => {
    if (!currentSale) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/sales/${currentSale.id}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSaleItems(currentSale.id);
        fetchSales();
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const handleEditItem = (item: SaleItem) => {
    setEditingItem(item);
    setEditQuantity(parseInt(item.quantity));
    setEditCustomValue(parseFloat(item.unitValue));
    setShowEditItemModal(true);
  };

  const handleCloseEditItemModal = () => {
    setEditingItem(null);
    setEditQuantity(1);
    setEditCustomValue(0);
    setShowEditItemModal(false);
  };

  const updateItemInSale = async () => {
    if (!currentSale || !editingItem) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/sales/${currentSale.id}/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: editQuantity,
          unitValue: editCustomValue
        }),
      });

      if (response.ok) {
        fetchSaleItems(currentSale.id);
        fetchSales();
        
        // Atualizar a venda atual com os novos dados
        const updatedSaleResponse = await fetch(`/api/sales/${currentSale.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (updatedSaleResponse.ok) {
          const updatedSale = await updatedSaleResponse.json();
          setCurrentSale(updatedSale);
        }
        
        handleCloseEditItemModal();
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const handleTransferSale = () => {
    if (!currentSale) return;
    setShowTransferModal(true);
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setSearchTransferClients('');
  };

  const transferSaleToClient = async (client: Client) => {
    if (!currentSale) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/sales/${currentSale.id}/transfer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newClientId: client.id,
          newClientName: client.full_name
        }),
      });

      if (response.ok) {
        const updatedSale = await response.json();
        setCurrentSale(updatedSale);
        setSelectedClient(client);
        fetchSales();
        handleCloseTransferModal();
        alert(`Comanda transferida para ${client.full_name} com sucesso!`);
      } else {
        const errorData = await response.json();
        alert(`Erro ao transferir comanda: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao transferir comanda:', error);
      alert('Erro ao transferir comanda. Tente novamente.');
    }
  };

  const closeSale = async () => {
    if (!currentSale) return;

    try {
      const response = await fetch(`/api/sales/${currentSale.id}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'dinheiro',
          loyaltyPoints: 1
        }),
      });

      if (response.ok) {
        setCurrentSale(null);
        setCurrentSaleItems([]);
        fetchSales();
      }
    } catch (error) {
      console.error('Erro ao fechar venda:', error);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLoyaltyTierColor = (tier?: string) => {
    switch (tier) {
      case 'Black': return 'text-gray-800 bg-gray-200';
      case 'Gold': return 'text-yellow-800 bg-yellow-200';
      case 'Prime': return 'text-purple-800 bg-purple-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (authChecking || authLoading) {
    return (
      <Layout>
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <div className="glass p-8 rounded-3xl text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Verificando autenticação...</p>
            <p className="text-white/60 text-sm mt-2">
              Auth Loading: {authLoading ? 'true' : 'false'} | 
              Auth Checking: {authChecking ? 'true' : 'false'} | 
              Is Authenticated: {isAuthenticated ? 'true' : 'false'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8 text-yellow-400" />
              <span>PDV / Lançamentos</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Painel Esquerdo - Vendas Abertas */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4">PDV / Lançamentos</h2>
                
                {/* Controles de Busca */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Pesquisar"
                      value={searchSales}
                      onChange={(e) => setSearchSales(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowClientModal(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Incluir</span>
                  </button>
                  
                  <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50">
                    <option value="">Lojinhas</option>
                  </select>
                </div>

                {/* Lista de Vendas */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {!currentSale && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm text-center">
                        👆 Clique em uma venda para selecioná-la
                      </p>
                    </div>
                  )}
                  {Array.isArray(sales) && sales.map((sale) => (
                    <motion.div
                      key={sale.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        currentSale?.id === sale.id
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10'
                      }`}
                      onClick={() => setCurrentSale(sale)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-medium">
                              Conta: {sale.accountNumber}
                            </span>
                          </div>
                          <p className="text-white/80 text-sm mb-1">{sale.clientName}</p>
                          <p className="text-white/60 text-xs">{formatDate(sale.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold">{formatCurrency(sale.total)}</p>
                          <div className="w-2 h-2 bg-white/40 rounded-full mt-1"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {Array.isArray(sales) && sales.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-white/60 text-sm">Nenhuma venda encontrada</p>
                      <p className="text-white/40 text-xs mt-1">Clique em "Incluir" para criar uma nova comanda</p>
                    </div>
                  )}
                </div>

                {/* Informações de Clientes */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-white/70 text-sm mb-2">Clientes:</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-800">Black</span>
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs px-2 py-1 rounded bg-yellow-200 text-yellow-800">Gold</span>
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs px-2 py-1 rounded bg-purple-200 text-purple-800">Prime</span>
                  </div>
                  
                  <label className="flex items-center space-x-2 mt-3 text-white/70 text-sm">
                    <input
                      type="checkbox"
                      checked={showOtherPDV}
                      onChange={(e) => setShowOtherPDV(e.target.checked)}
                      className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 rounded focus:ring-yellow-400/50"
                    />
                    <span>Exibir comanda de outros PDV?</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Painel Direito - Interface de Venda */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                {/* Header da Venda Atual */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white text-lg">
                      Nome: {currentSale ? currentSale.clientName : 'Nenhuma venda selecionada'}
                    </h3>
                    {currentSale && (
                      <p className="text-yellow-400 text-sm">
                        Nº Cartão: {currentSale.cardNumber || '0'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Formulário de Adição de Itens */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cód barras"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    />
                  </div>
                  
                  <div>
                    <select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === parseInt(e.target.value));
                        setSelectedProduct(product || null);
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    >
                      <option value="">Selecione um item...</option>
                      {Array.isArray(products) && products.length > 0 ? (
                        products.map((product) => (
                          <option key={product.id} value={product.id} className="bg-slate-800">
                            {product.description}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled className="bg-slate-800">
                          {products.length === 0 ? 'Nenhum produto encontrado' : 'Carregando produtos...'}
                        </option>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      placeholder="$ Valor"
                      value={customValue || parseFloat(selectedProduct?.unitValue || '0') || 0}
                      onChange={(e) => setCustomValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    />
                  </div>
                </div>

                <button
                  onClick={addItemToSale}
                  disabled={!currentSale || !selectedProduct}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors mb-6"
                >
                  <Plus className="w-5 h-5" />
                  <span>
                    {!currentSale ? 'Selecione uma venda primeiro' : 
                     !selectedProduct ? 'Selecione um produto' : 
                     'Inserir'}
                  </span>
                </button>

                {/* Lista de Itens da Venda */}
                <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-white/70 font-medium">Data</th>
                          <th className="px-4 py-3 text-left text-white/70 font-medium">Produto/Serviço</th>
                          <th className="px-4 py-3 text-left text-white/70 font-medium">Valor</th>
                          <th className="px-4 py-3 text-left text-white/70 font-medium">Qtd</th>
                          <th className="px-4 py-3 text-left text-white/70 font-medium">Total</th>
                          <th className="px-4 py-3 text-left text-white/70 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSaleItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-white/60">
                              Nenhum item adicionado
                            </td>
                          </tr>
                        ) : (
                          currentSaleItems.map((item) => (
                            <tr key={item.id} className="border-b border-white/10">
                              <td className="px-4 py-3 text-white/70 text-sm">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-white">{item.productDescription}</td>
                              <td className="px-4 py-3 text-white font-mono">{formatCurrency(item.unitValue)}</td>
                              <td className="px-4 py-3 text-white">{item.quantity}</td>
                              <td className="px-4 py-3 text-white font-mono">{formatCurrency(item.totalValue)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleEditItem(item)}
                                    className="p-1 text-blue-400 hover:text-blue-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => removeItemFromSale(item.id)}
                                    className="p-1 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resumo da Venda */}
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70">Fidelidade:</span>
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70">Total da conta R$:</span>
                    <span className="text-white font-bold text-xl">
                      {formatCurrency(currentSale?.total || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Itens da seleção R$:</span>
                    <span className="text-white font-bold">0.00</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>Mensalista</span>
                  </button>
                  
                  <button 
                    onClick={handleTransferSale}
                    disabled={!currentSale}
                    className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Transferir</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <FolderOpen className="w-4 h-4" />
                    <span>Aberto</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <DollarSign className="w-4 h-4" />
                    <span>Parcial</span>
                  </button>
                  
                  <button 
                    onClick={closeSale}
                    disabled={!currentSale || currentSaleItems.length === 0}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Total</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de Seleção de Cliente */}
          {showClientModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
              >
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Incluir Comanda</h2>
                    <button
                      onClick={() => {
                        setShowClientModal(false);
                        setSearchClients('');
                      }}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6">
                  {/* Campo de Busca */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Cliente
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Digite o nome, código ou ID do membro..."
                        value={searchClients}
                        onChange={(e) => setSearchClients(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Lista de Clientes */}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredClients.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {searchClients ? 'Nenhum cliente encontrado' : 'Carregando clientes...'}
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => createNewSale(client)}
                          className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{client.full_name}</p>
                              <p className="text-sm text-gray-500">{client.member_code} • {client.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {client.membership_type || 'Cliente'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {client.status}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => createNewSale()}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
                    >
                      Nova Conta
                    </button>
                    <button
                      onClick={() => {
                        setShowClientModal(false);
                        setSearchClients('');
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de Edição de Item */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Editar Item</h2>
                <button
                  onClick={handleCloseEditItemModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produto
                  </label>
                  <input
                    type="text"
                    value={editingItem.productDescription}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Unitário
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCustomValue}
                    onChange={(e) => setEditCustomValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(editQuantity * editCustomValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCloseEditItemModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateItemInSale}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Transferência */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Transferir Comanda</h2>
                <button
                  onClick={handleCloseTransferModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Informações da Comanda Atual */}
              {currentSale && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Comanda Atual</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Conta:</span>
                      <span className="ml-2 font-medium">{currentSale.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cliente:</span>
                      <span className="ml-2 font-medium">{currentSale.clientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-medium text-green-600">{formatCurrency(currentSale.total)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Itens:</span>
                      <span className="ml-2 font-medium">{currentSaleItems.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Campo de Busca */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesquisar Cliente
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Digite o nome, código ou ID do cliente..."
                    value={searchTransferClients}
                    onChange={(e) => setSearchTransferClients(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista de Clientes */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredTransferClients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTransferClients ? 'Nenhum cliente encontrado' : 'Carregando clientes...'}
                  </div>
                ) : (
                  filteredTransferClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{client.full_name}</p>
                              <p className="text-sm text-gray-500">
                                {client.member_code} • {client.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {client.membership_type || 'Cliente'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {client.status}
                          </p>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => transferSaleToClient(client)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                          >
                            Transferir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botão de Cancelar */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCloseTransferModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
