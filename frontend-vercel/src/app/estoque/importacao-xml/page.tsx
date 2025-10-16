'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { getAuthToken } from '@/lib/auth';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Save,
  Edit,
  Trash2,
  Plus,
  Search,
  Calendar,
  MapPin,
  Building,
  User,
  ArrowLeft
} from 'lucide-react';

interface XMLData {
  accessKey: string;
  companyName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  zipCode: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  series: string;
  issueDate: string;
  exitDate: string;
  postingDate: string;
}

interface XMLItem {
  id: string;
  code: string;
  description: string;
  ncm: string;
  cest: string;
  unit: string;
  conversionFactor: number;
  quantity: number;
  unitValue: number;
  totalValue: number;
  stockPoint: string;
  action: 'new' | 'update' | 'existing';
}

export default function ImportacaoXMLPage() {
  const [xmlData, setXmlData] = useState<XMLData>({
    accessKey: '',
    companyName: '',
    tradeName: '',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    zipCode: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    series: '',
    issueDate: '',
    exitDate: '',
    postingDate: ''
  });

  const [xmlItems, setXmlItems] = useState<XMLItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'file' | 'items' | 'financial' | 'save'>('file');
  const [searchItems, setSearchItems] = useState('');
  const [editingItem, setEditingItem] = useState<XMLItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/xml') {
      setSelectedFile(file);
      processXMLFile(file);
    } else {
      alert('Por favor, selecione um arquivo XML válido.');
    }
  };

  const processXMLFile = async (file: File) => {
    setProcessing(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      // Extrair dados da nota fiscal
      const extractedData = extractXMLData(xmlDoc);
      setXmlData(extractedData);
      
      // Extrair itens
      const extractedItems = extractXMLItems(xmlDoc);
      setXmlItems(extractedItems);
      
      setCurrentStep('items');
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      alert('Erro ao processar o arquivo XML. Verifique se o arquivo está no formato correto.');
    } finally {
      setProcessing(false);
    }
  };

  const extractXMLData = (xmlDoc: Document): XMLData => {
    // Implementar extração dos dados da nota fiscal
    // Esta é uma implementação básica - pode ser expandida conforme necessário
    return {
      accessKey: xmlDoc.querySelector('chNFe')?.textContent || '',
      companyName: xmlDoc.querySelector('xNome')?.textContent || '',
      tradeName: xmlDoc.querySelector('xFant')?.textContent || '',
      cnpj: xmlDoc.querySelector('CNPJ')?.textContent || '',
      stateRegistration: xmlDoc.querySelector('IE')?.textContent || '',
      municipalRegistration: xmlDoc.querySelector('IM')?.textContent || '',
      zipCode: xmlDoc.querySelector('CEP')?.textContent || '',
      address: xmlDoc.querySelector('xLgr')?.textContent || '',
      number: xmlDoc.querySelector('nro')?.textContent || '',
      neighborhood: xmlDoc.querySelector('xBairro')?.textContent || '',
      city: xmlDoc.querySelector('xMun')?.textContent || '',
      series: xmlDoc.querySelector('serie')?.textContent || '',
      issueDate: xmlDoc.querySelector('dhEmi')?.textContent || '',
      exitDate: xmlDoc.querySelector('dhSaiEnt')?.textContent || '',
      postingDate: new Date().toLocaleDateString('pt-BR')
    };
  };

  const extractXMLItems = (xmlDoc: Document): XMLItem[] => {
    const items: XMLItem[] = [];
    const detElements = xmlDoc.querySelectorAll('det');
    
    detElements.forEach((det, index) => {
      const prod = det.querySelector('prod');
      if (prod) {
        items.push({
          id: `item-${index}`,
          code: prod.querySelector('cProd')?.textContent || '',
          description: prod.querySelector('xProd')?.textContent || '',
          ncm: prod.querySelector('NCM')?.textContent || '',
          cest: prod.querySelector('CEST')?.textContent || '',
          unit: prod.querySelector('uCom')?.textContent || 'UN',
          conversionFactor: parseFloat(prod.querySelector('qCom')?.textContent || '1'),
          quantity: parseFloat(prod.querySelector('qCom')?.textContent || '0'),
          unitValue: parseFloat(prod.querySelector('vUnCom')?.textContent || '0'),
          totalValue: parseFloat(prod.querySelector('vProd')?.textContent || '0'),
          stockPoint: 'PRINCIPAL',
          action: 'new'
        });
      }
    });
    
    return items;
  };

  const handleEditItem = (item: XMLItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveItem = (updatedItem: XMLItem) => {
    setXmlItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setXmlItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSaveImport = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      
      const response = await fetch('/api/stock/import-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          xmlData,
          items: xmlItems
        })
      });

      if (response.ok) {
        alert('Importação realizada com sucesso!');
        // Reset form
        setXmlData({
          accessKey: '',
          companyName: '',
          tradeName: '',
          cnpj: '',
          stateRegistration: '',
          municipalRegistration: '',
          zipCode: '',
          address: '',
          number: '',
          neighborhood: '',
          city: '',
          series: '',
          issueDate: '',
          exitDate: '',
          postingDate: ''
        });
        setXmlItems([]);
        setSelectedFile(null);
        setCurrentStep('file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Erro ao salvar importação');
      }
    } catch (error) {
      console.error('Erro ao salvar importação:', error);
      alert('Erro ao salvar importação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = xmlItems.filter(item =>
    item.description.toLowerCase().includes(searchItems.toLowerCase()) ||
    item.code.toLowerCase().includes(searchItems.toLowerCase())
  );

  const totalValue = xmlItems.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <Layout>
      <div className="min-h-screen gradient-bg p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => window.location.href = '/estoque'}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Estoque / Importar XML</h1>
            <p className="text-white/70">Importação de produtos via XML de nota fiscal</p>
          </div>

          {/* Steps Navigation */}
          <div className="glass p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between">
              {[
                { key: 'file', label: 'Incluir cliente', icon: Upload },
                { key: 'items', label: 'Itens', icon: FileText },
                { key: 'financial', label: 'Financeiro', icon: Building },
                { key: 'save', label: 'Salvar', icon: Save }
              ].map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.key;
                const isCompleted = ['file', 'items', 'financial', 'save'].indexOf(currentStep) > index;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-500/20 text-blue-400' : 
                      isCompleted ? 'bg-green-500/20 text-green-400' : 
                      'text-white/50'
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{step.label}</span>
                    </div>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-400' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Selection */}
          {currentStep === 'file' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-6">Selecionar Arquivo XML</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Escolher Arquivo</span>
                </button>
                <span className="text-white/70">
                  {selectedFile ? selectedFile.name : 'nenhum arquivo selecionado'}
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileSelect}
                className="hidden"
              />

              {processing && (
                <div className="flex items-center space-x-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processando XML...</span>
                </div>
              )}
            </motion.div>
          )}

          {/* XML Data Form */}
          {currentStep === 'file' && selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-6">Dados da Nota Fiscal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Chave de acesso</label>
                  <input
                    type="text"
                    value={xmlData.accessKey}
                    onChange={(e) => setXmlData(prev => ({ ...prev, accessKey: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Chave de acesso"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Pessoa/Nome Fantasia</label>
                  <input
                    type="text"
                    value={xmlData.tradeName}
                    onChange={(e) => setXmlData(prev => ({ ...prev, tradeName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Nome fantasia"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">CEP</label>
                  <input
                    type="text"
                    value={xmlData.zipCode}
                    onChange={(e) => setXmlData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="CEP"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Cidade</label>
                  <input
                    type="text"
                    value={xmlData.city}
                    onChange={(e) => setXmlData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Cidade"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Número</label>
                  <input
                    type="text"
                    value={xmlData.number}
                    onChange={(e) => setXmlData(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Número"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Razão Social</label>
                  <input
                    type="text"
                    value={xmlData.companyName}
                    onChange={(e) => setXmlData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Razão social"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Série</label>
                  <input
                    type="text"
                    value={xmlData.series}
                    onChange={(e) => setXmlData(prev => ({ ...prev, series: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Série"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Lançamento</label>
                  <input
                    type="text"
                    value={xmlData.postingDate}
                    onChange={(e) => setXmlData(prev => ({ ...prev, postingDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Data de lançamento"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Endereço</label>
                  <input
                    type="text"
                    value={xmlData.address}
                    onChange={(e) => setXmlData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Endereço"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Emissão</label>
                  <input
                    type="text"
                    value={xmlData.issueDate}
                    onChange={(e) => setXmlData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Data de emissão"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Saída</label>
                  <input
                    type="text"
                    value={xmlData.exitDate}
                    onChange={(e) => setXmlData(prev => ({ ...prev, exitDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Data de saída"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={xmlData.cnpj}
                    onChange={(e) => setXmlData(prev => ({ ...prev, cnpj: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="CNPJ"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Isc.Estadual</label>
                  <input
                    type="text"
                    value={xmlData.stateRegistration}
                    onChange={(e) => setXmlData(prev => ({ ...prev, stateRegistration: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Inscrição estadual"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Isc.Municipal</label>
                  <input
                    type="text"
                    value={xmlData.municipalRegistration}
                    onChange={(e) => setXmlData(prev => ({ ...prev, municipalRegistration: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Inscrição municipal"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Bairro</label>
                  <input
                    type="text"
                    value={xmlData.neighborhood}
                    onChange={(e) => setXmlData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Bairro"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setCurrentStep('items')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Continuar para Itens
                </button>
              </div>
            </motion.div>
          )}

          {/* Items Table */}
          {currentStep === 'items' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Itens da Nota Fiscal</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar itens..."
                      value={searchItems}
                      onChange={(e) => setSearchItems(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white/70 py-3 px-2">Código</th>
                      <th className="text-left text-white/70 py-3 px-2">Descrição da Nota</th>
                      <th className="text-left text-white/70 py-3 px-2">Código</th>
                      <th className="text-left text-white/70 py-3 px-2">Ponto de estoque</th>
                      <th className="text-left text-white/70 py-3 px-2">Unidade</th>
                      <th className="text-left text-white/70 py-3 px-2">F- Conversão</th>
                      <th className="text-left text-white/70 py-3 px-2">Qtde</th>
                      <th className="text-left text-white/70 py-3 px-2">V.Unit</th>
                      <th className="text-left text-white/70 py-3 px-2">Valor NCM</th>
                      <th className="text-left text-white/70 py-3 px-2">CEST</th>
                      <th className="text-left text-white/70 py-3 px-2">C.E</th>
                      <th className="text-left text-white/70 py-3 px-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-2 text-white">{item.code}</td>
                        <td className="py-3 px-2 text-white max-w-xs truncate">{item.description}</td>
                        <td className="py-3 px-2 text-white">{item.code}</td>
                        <td className="py-3 px-2 text-white">{item.stockPoint}</td>
                        <td className="py-3 px-2 text-white">{item.unit}</td>
                        <td className="py-3 px-2 text-white">{item.conversionFactor}</td>
                        <td className="py-3 px-2 text-white">{item.quantity}</td>
                        <td className="py-3 px-2 text-white">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.unitValue)}
                        </td>
                        <td className="py-3 px-2 text-white">{item.ncm}</td>
                        <td className="py-3 px-2 text-white">{item.cest}</td>
                        <td className="py-3 px-2 text-white">-</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
                <div className="text-white">
                  <span className="text-white/70">Total: </span>
                  <span className="text-xl font-bold text-green-400">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(totalValue)}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep('file')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setCurrentStep('financial')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Continuar para Financeiro
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Financial Step */}
          {currentStep === 'financial' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-6">Informações Financeiras</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Resumo da Importação</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white/70">
                      <span>Total de itens:</span>
                      <span className="text-white">{xmlItems.length}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Valor total:</span>
                      <span className="text-white font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(totalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Fornecedor:</span>
                      <span className="text-white">{xmlData.companyName}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>CNPJ:</span>
                      <span className="text-white">{xmlData.cnpj}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Configurações</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-white/70">Atualizar estoque existente</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-white/70">Criar produtos não existentes</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-white/70">Gerar movimentação de estoque</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep('items')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setCurrentStep('save')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Continuar para Salvar
                </button>
              </div>
            </motion.div>
          )}

          {/* Save Step */}
          {currentStep === 'save' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-6">Confirmar Importação</h2>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">Pronto para importar!</h3>
                </div>
                <p className="text-white/70">
                  A importação será processada e os produtos serão adicionados ao estoque. 
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{xmlItems.length}</div>
                  <div className="text-white/70">Itens</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(totalValue)}
                  </div>
                  <div className="text-white/70">Valor Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{xmlData.companyName}</div>
                  <div className="text-white/70">Fornecedor</div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('financial')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSaveImport}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-8 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Confirmar Importação</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Edit Item Modal */}
          {showEditModal && editingItem && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Editar Item</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
                      <input
                        type="text"
                        value={editingItem.code}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, code: e.target.value } : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                      <input
                        type="text"
                        value={editingItem.description}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor Unitário</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.unitValue}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, unitValue: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NCM</label>
                      <input
                        type="text"
                        value={editingItem.ncm}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, ncm: e.target.value } : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CEST</label>
                      <input
                        type="text"
                        value={editingItem.cest}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, cest: e.target.value } : null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(editingItem.quantity * editingItem.unitValue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveItem(editingItem)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

