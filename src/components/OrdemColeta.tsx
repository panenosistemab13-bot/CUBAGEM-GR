import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Boxes, 
  Calendar, 
  Weight, 
  Plus, 
  Trash2, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Calculator, 
  RefreshCw, 
  Eye, 
  FileCheck, 
  Link2, 
  Edit3, 
  X, 
  Save,
  Layers,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { rtdb } from '../firebase';
import { OrdemColetaItem, CarretaSubItem } from '../types';
import { 
  parseExcelOrder, 
  parseLocalTextOrder,
  createEmptyOrder, 
  normalizePlate, 
  normalizeOrdemColetaItem,
  isValidPlate,
  parsePalletDistribution,
  formatDateInput
} from '../utils/orderParser';
import { LicensePlate } from './LicensePlate';
import { cn } from '../lib/utils';

interface OrdemColetaProps {
  currentUser?: string;
  isReadOnly?: boolean;
  onNavigateToCubagem?: () => void;
}

// Slotted Vintage Flat-head Screw Component for authentic industrial look
function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-2.5 h-2.5 bg-gradient-to-br from-[#d9c0a6] to-[#6e4e31] rounded-full shadow-[inset_0.5px_0.5px_1px_rgba(255,255,255,0.4),1px_1px_2px_rgba(0,0,0,0.5)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-[60%] h-[1px] bg-[#311b09]/90 rotate-[45deg] rounded-sm shadow-inner" />
    </div>
  );
}

export default function OrdemColeta({ currentUser, isReadOnly = false, onNavigateToCubagem }: OrdemColetaProps) {
  // Vehicle Mode: Carreta Única (SINGLE) vs Bitrem / Rodotrem (BITREM)
  const [vehicleMode, setVehicleMode] = useState<'SINGLE' | 'BITREM'>('SINGLE');

  // Shared Vehicle Data (Bloco 1)
  const [sharedData, setSharedData] = useState({
    placa_cavalo: '',
    data: new Date().toLocaleDateString('pt-BR'),
    transportador: ''
  });

  // Carreta 1 (C1) State (Bloco 2)
  const [c1, setC1] = useState<{
    placa: string;
    modelo: string;
    volume: string | number;
    pallets: string | number;
    pbt: string | number;
  }>({
    placa: '',
    modelo: 'SIDER',
    volume: '',
    pallets: '',
    pbt: ''
  });

  // Carreta 2 (C2) State (Bloco 3)
  const [c2, setC2] = useState<{
    placa: string;
    modelo: string;
    volume: string | number;
    pallets: string | number;
    pbt: string | number;
  }>({
    placa: '',
    modelo: 'SIDER',
    volume: '',
    pallets: '',
    pbt: ''
  });

  // UI / Status State
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [extractSuccessMsg, setExtractSuccessMsg] = useState<string | null>(null);
  const [extractDetails, setExtractDetails] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Realtime Database Items List
  const [ordersList, setOrdersList] = useState<OrdemColetaItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculated Totals for C1 + C2 in Form
  const totalVolumeForm = vehicleMode === 'BITREM'
    ? (Number(c1.volume) || 0) + (Number(c2.volume) || 0)
    : (Number(c1.volume) || 0);

  const totalPalletsForm = vehicleMode === 'BITREM'
    ? (Number(c1.pallets) || 0) + (Number(c2.pallets) || 0)
    : (Number(c1.pallets) || 0);

  const totalPbtForm = vehicleMode === 'BITREM'
    ? Number(((Number(c1.pbt) || 0) + (Number(c2.pbt) || 0)).toFixed(1))
    : (Number(c1.pbt) || 0);

  // Subscribe to Firebase Realtime Database /ordens_coleta
  useEffect(() => {
    const ordersRef = ref(rtdb, 'ordens_coleta');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded: OrdemColetaItem[] = Object.entries(data).map(([key, val]: [string, any]) => 
          normalizeOrdemColetaItem(val, key)
        ).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        setOrdersList(loaded);
      } else {
        setOrdersList([]);
      }
    }, (error) => {
      console.error("Erro ao ler ordens de coleta do Firebase:", error);
    });

    return () => unsubscribe();
  }, []);

  // Handle Toggle Mode
  const handleToggleMode = (newMode: 'SINGLE' | 'BITREM') => {
    if (newMode === vehicleMode) return;
    setVehicleMode(newMode);

    if (newMode === 'BITREM') {
      // If C1 has volume and C2 is empty, split evenly
      const vol = Number(c1.volume) || 0;
      const pal = Number(c1.pallets) || 0;
      const pbtVal = Number(c1.pbt) || 0;

      if (vol > 0 && !c2.volume) {
        const v1 = Math.round(vol / 2);
        const v2 = Math.round(vol - v1);
        const pl1 = pal > 0 ? Math.round(pal / 2) : '';
        const pl2 = pal > 0 ? Math.round(pal - (Number(pl1) || 0)) : '';
        const pb1 = pbtVal > 0 ? Number((pbtVal / 2).toFixed(1)) : '';
        const pb2 = pbtVal > 0 ? Number((pbtVal - (Number(pb1) || 0)).toFixed(1)) : '';

        setC1(prev => ({ ...prev, volume: v1, pallets: pl1, pbt: pb1 }));
        setC2(prev => ({
          placa: prev.placa || '',
          modelo: prev.modelo || c1.modelo || 'SIDER',
          volume: v2,
          pallets: pl2,
          pbt: pb2
        }));
      }
    } else {
      // When switching back to Single, sum up volumes to C1
      const totalV = (Number(c1.volume) || 0) + (Number(c2.volume) || 0);
      const totalP = (Number(c1.pallets) || 0) + (Number(c2.pallets) || 0);
      const totalPb = Number(((Number(c1.pbt) || 0) + (Number(c2.pbt) || 0)).toFixed(1));

      if (totalV > 0) {
        setC1(prev => ({
          ...prev,
          volume: totalV,
          pallets: totalP || prev.pallets,
          pbt: totalPb || prev.pbt
        }));
      }
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Process File (Excel or PDF/Image)
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setExtractSuccessMsg(null);
    setExtractDetails(null);
    setSelectedFileName(file.name);

    // 2. LIMPEZA DE ESTADO ANTES DA IMPORTAÇÃO
    setSharedData({ placa_cavalo: '', data: '', transportador: '' });
    setC1({ placa: '', modelo: 'SIDER', volume: '', pallets: '', pbt: '' });
    setC2({ placa: '', modelo: 'SIDER', volume: '', pallets: '', pbt: '' });
    setVehicleMode('SINGLE');

    const fileNameLower = file.name.toLowerCase();
    const isExcel = fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv');
    const isPdf = fileNameLower.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    try {
      if (isExcel) {
        setProcessingMsg('Lendo planilha Excel e calculando dimensões...');
        const buffer = await file.arrayBuffer();
        const extracted = parseExcelOrder(buffer);

        const isBitremDetected = extracted.tipo_veiculo === 'BITREM' || 
                                extracted.tipo_veiculo === 'bitrem' || 
                                Boolean(extracted.c2 && extracted.c2.placa) || 
                                Boolean(extracted.c2_placa && extracted.c2_placa.length > 0) || 
                                (extracted.placa_carreta && extracted.placa_carreta.includes('/'));

        setSharedData({
          placa_cavalo: extracted.placa_cavalo || '',
          data: extracted.data || new Date().toLocaleDateString('pt-BR'),
          transportador: extracted.transportador || ''
        });

        if (isBitremDetected) {
          setVehicleMode('BITREM');

          // Determine C1 and C2 pallets according to strict distribution rule
          let extractedC1Pal = extracted.c1?.pallets ?? extracted.c1_pallets;
          let extractedC2Pal = extracted.c2?.pallets ?? extracted.c2_pallets;

          if (extractedC1Pal === undefined || extractedC1Pal === '' || extractedC1Pal === null) {
            const pDist = parsePalletDistribution(extracted.numero_pallets, true);
            extractedC1Pal = pDist.c1Pallets;
            extractedC2Pal = pDist.c2Pallets;
          }

          setC1({
            placa: extracted.c1?.placa || extracted.c1_placa || extracted.placa_carreta.split('/')[0]?.trim() || '',
            modelo: extracted.c1?.modelo || extracted.c1_modelo || extracted.modelo_carreta || 'SIDER',
            volume: extracted.c1?.volume ?? extracted.c1_volume ?? Math.round((extracted.volume_cubado || 0) / 2) ?? '',
            pallets: extractedC1Pal ?? '',
            pbt: extracted.c1?.pbt ?? extracted.c1_pbt ?? Number(((extracted.pbt || 0) / 2).toFixed(1)) ?? ''
          });
          setC2({
            placa: extracted.c2?.placa || extracted.c2_placa || extracted.placa_carreta.split('/')[1]?.trim() || '',
            modelo: extracted.c2?.modelo || extracted.c2_modelo || extracted.modelo_carreta || 'SIDER',
            volume: extracted.c2?.volume ?? extracted.c2_volume ?? Math.round((extracted.volume_cubado || 0) - (Number(extracted.c1?.volume) || 0)) ?? '',
            pallets: extractedC2Pal ?? '',
            pbt: extracted.c2?.pbt ?? extracted.c2_pbt ?? Number(((extracted.pbt || 0) - (Number(extracted.c1?.pbt) || 0)).toFixed(1)) ?? ''
          });
        } else {
          setVehicleMode('SINGLE');
          const pDist = parsePalletDistribution(extracted.c1?.pallets ?? extracted.numero_pallets, false);
          setC1({
            placa: extracted.c1?.placa || extracted.placa_carreta || '',
            modelo: extracted.c1?.modelo || extracted.modelo_carreta || 'SIDER',
            volume: extracted.c1?.volume ?? extracted.volume_cubado ?? '',
            pallets: pDist.c1Pallets || extracted.numero_pallets || '',
            pbt: extracted.c1?.pbt ?? extracted.pbt ?? ''
          });
          setC2({ placa: '', modelo: 'SIDER', volume: '', pallets: '', pbt: '' });
        }

        setExtractSuccessMsg(`Arquivo Excel "${file.name}" processado com sucesso!`);
        if (extracted.detalhes_calculo) {
          setExtractDetails(`Cálculo de Volume: ${extracted.detalhes_calculo}`);
        }
      } else if (isPdf || isImage) {
        setProcessingMsg('Processando documento 100% localmente no navegador...');
        
        // Read file as text or ArrayBuffer / DataURL to extract text locally
        const textContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const res = e.target?.result;
            if (typeof res === 'string') {
              resolve(res);
            } else if (res instanceof ArrayBuffer) {
              // Convert buffer to string or extract readable chars
              const decoder = new TextDecoder('utf-8');
              resolve(decoder.decode(res));
            } else {
              resolve('');
            }
          };
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });

        const d = parseLocalTextOrder(file.name + ' ' + textContent);

        const isBitremDetected = d.tipo_veiculo === 'BITREM' || 
                                Boolean(d.c2 && d.c2.placa) || 
                                Boolean(d.placa_carreta && d.placa_carreta.includes('/'));

        setSharedData({
          placa_cavalo: d.placa_cavalo || '',
          data: d.data || new Date().toLocaleDateString('pt-BR'),
          transportador: d.transportador || ''
        });

        if (isBitremDetected) {
          setVehicleMode('BITREM');

          let dC1Pal = d.c1?.pallets;
          let dC2Pal = d.c2?.pallets;

          if (dC1Pal === undefined || dC1Pal === '' || dC1Pal === null) {
            const pDist = parsePalletDistribution(d.numero_pallets, true);
            dC1Pal = pDist.c1Pallets;
            dC2Pal = pDist.c2Pallets;
          }

          setC1({
            placa: d.c1?.placa || d.placa_carreta.split('/')[0]?.trim() || '',
            modelo: d.c1?.modelo || 'SIDER',
            volume: d.c1?.volume ?? Math.round((d.volume_cubado || 0) / 2),
            pallets: dC1Pal ?? '',
            pbt: d.c1?.pbt ?? Number(((d.pbt || 0) / 2).toFixed(1))
          });
          setC2({
            placa: d.c2?.placa || d.placa_carreta.split('/')[1]?.trim() || '',
            modelo: d.c2?.modelo || 'SIDER',
            volume: d.c2?.volume ?? Math.round((d.volume_cubado || 0) - (Number(d.c1?.volume) || 0)),
            pallets: dC2Pal ?? '',
            pbt: d.c2?.pbt ?? Number(((d.pbt || 0) - (Number(d.c1?.pbt) || 0)).toFixed(1))
          });
        } else {
          setVehicleMode('SINGLE');
          const pDist = parsePalletDistribution(d.numero_pallets, false);
          setC1({
            placa: d.c1?.placa || d.placa_carreta || '',
            modelo: d.c1?.modelo || 'SIDER',
            volume: (d.c1?.volume ?? d.volume_cubado) || '',
            pallets: pDist.c1Pallets || d.numero_pallets || '',
            pbt: (d.c1?.pbt ?? d.pbt) || ''
          });
          setC2({ placa: '', modelo: 'SIDER', volume: '', pallets: '', pbt: '' });
        }

        setExtractSuccessMsg(`Documento "${file.name}" processado localmente com sucesso!`);
      } else {
        throw new Error('Formato não suportado. Por favor envie arquivos Excel (.xlsx, .xls, .csv), PDF (.pdf) ou Imagens.');
      }
    } catch (err: any) {
      console.error("Erro na extração:", err);
      setErrorMessage(err.message || 'Erro inesperado ao processar arquivo.');
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Submit to Firebase Realtime Database
  const handleAddCubagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      alert('Seu perfil possui apenas permissão de visualização.');
      return;
    }

    const isBitrem = vehicleMode === 'BITREM';
    const finalCavalo = sharedData.placa_cavalo.trim().toUpperCase();
    const finalData = sharedData.data.trim() || new Date().toLocaleDateString('pt-BR');
    const finalTransp = sharedData.transportador.trim().toUpperCase();

    const c1Placa = c1.placa.trim().toUpperCase();
    const c1Modelo = c1.modelo.trim().toUpperCase() || 'SIDER';
    const c1Vol = Number(c1.volume) || 0;
    const c1Pbt = Number(c1.pbt) || 0;

    const rawC1Pal = String(c1.pallets ?? '').trim();
    const rawC2Pal = String(c2.pallets ?? '').trim();
    let c1Pal = 0;
    let c2Pal = 0;

    if (rawC1Pal.includes('/') || rawC1Pal.includes('\\') || rawC1Pal.includes('+')) {
      const pDist = parsePalletDistribution(rawC1Pal, isBitrem);
      c1Pal = pDist.c1Pallets;
      c2Pal = pDist.c2Pallets;
    } else {
      c1Pal = Number(rawC1Pal) || 0;
      c2Pal = Number(rawC2Pal) || 0;
    }

    const c2Placa = c2.placa.trim().toUpperCase();
    const c2Modelo = c2.modelo.trim().toUpperCase() || 'SIDER';
    const c2Vol = Number(c2.volume) || 0;
    const c2Pbt = Number(c2.pbt) || 0;

    // Validation
    if (!finalCavalo) {
      setErrorMessage('Por favor informe a Placa do Cavalo.');
      return;
    }
    if (!isValidPlate(finalCavalo)) {
      setErrorMessage(`A Placa do Cavalo "${finalCavalo}" não corresponde a um padrão de placa válido (Mercosul ou padrão Brasil, ex: JAT4G68 ou POD0566). Perfis como "TRUCADO" ou "TOCO" não são placas válidas.`);
      return;
    }
    if (!c1Placa) {
      setErrorMessage('Por favor informe a Placa da Carreta 1 (C1).');
      return;
    }
    if (!isValidPlate(c1Placa)) {
      setErrorMessage(`A Placa da Carreta 1 "${c1Placa}" não corresponde a um padrão de placa válido.`);
      return;
    }
    if (isBitrem && !c2Placa) {
      setErrorMessage('Por favor informe a Placa da Carreta 2 (C2) no modo Bitrem.');
      return;
    }
    if (isBitrem && !isValidPlate(c2Placa)) {
      setErrorMessage(`A Placa da Carreta 2 "${c2Placa}" não corresponde a um padrão de placa válido.`);
      return;
    }

    const finalVolumeTotal = isBitrem ? (c1Vol + c2Vol) : c1Vol;
    const finalPalletsTotal = isBitrem ? (c1Pal + c2Pal) : c1Pal;
    const finalPbtTotal = isBitrem ? Number((c1Pbt + c2Pbt).toFixed(1)) : c1Pbt;
    const finalPlacaCarreta = isBitrem ? `${c1Placa} / ${c2Placa}` : c1Placa;
    const finalModeloCarreta = isBitrem ? (c1Modelo === c2Modelo ? c1Modelo : `${c1Modelo} / ${c2Modelo}`) : c1Modelo;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const ordersRef = ref(rtdb, 'ordens_coleta');
      const newOrderRef = push(ordersRef);

      const recordToSave = {
        tipo_veiculo: isBitrem ? "BITREM" : "SINGLE",
        placa_cavalo: finalCavalo,
        data: finalData,
        transportador: finalTransp,
        c1: {
          placa: c1Placa,
          modelo: c1Modelo,
          pallets: c1Pal,
          pbt: `${c1Pbt} T`,
          volume: c1Vol
        },
        c2: isBitrem ? {
          placa: c2Placa,
          modelo: c2Modelo,
          pallets: c2Pal,
          pbt: `${c2Pbt} T`,
          volume: c2Vol
        } : null,
        volume_total: finalVolumeTotal,
        created_at: Date.now(),
        created_by: currentUser || 'Operador',
        origem_arquivo: selectedFileName || 'Inserção Manual',

        // Legacy / fallback fields for backwards compatibility
        placa_carreta: finalPlacaCarreta,
        volume_cubado: finalVolumeTotal,
        modelo_carreta: finalModeloCarreta,
        numero_pallets: finalPalletsTotal,
        pbt: finalPbtTotal,
        c1_placa: c1Placa,
        c1_modelo: c1Modelo,
        c1_volume: c1Vol,
        c1_pallets: c1Pal,
        c1_pbt: c1Pbt,
        c2_placa: isBitrem ? c2Placa : undefined,
        c2_modelo: isBitrem ? c2Modelo : undefined,
        c2_volume: isBitrem ? c2Vol : undefined,
        c2_pallets: isBitrem ? c2Pal : undefined,
        c2_pbt: isBitrem ? c2Pbt : undefined
      };

      await set(newOrderRef, recordToSave);

      // Sync to patio/cubagem node
      try {
        const patioCubagemRef = ref(rtdb, 'patio/cubagem');
        const nowIso = new Date().toISOString();
        const dataParts = (finalData || '').split('/');
        const diaStr = dataParts[0] || '';
        const mesNum = dataParts[1] || '';
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const mesStr = mesNum ? (meses[parseInt(mesNum, 10) - 1] || '') : '';

        if (isBitrem) {
          // Save C1
          const refC1 = push(patioCubagemRef);
          await set(refC1, {
            cavalo: finalCavalo,
            carreta: c1Placa,
            m3: String(c1Vol),
            mes: mesStr,
            dia: diaStr,
            data: finalData,
            transportador: finalTransp,
            pallets: String(c1Pal),
            pbt: String(c1Pbt),
            modeloCarreta: c1Modelo,
            tipoVeiculo: 'bitrem',
            tag: 'C1',
            inseridoEm: nowIso
          });

          // Save C2
          const refC2 = push(patioCubagemRef);
          await set(refC2, {
            cavalo: finalCavalo,
            carreta: c2Placa,
            m3: String(c2Vol),
            mes: mesStr,
            dia: diaStr,
            data: finalData,
            transportador: finalTransp,
            pallets: String(c2Pal),
            pbt: String(c2Pbt),
            modeloCarreta: c2Modelo,
            tipoVeiculo: 'bitrem',
            tag: 'C2',
            inseridoEm: nowIso
          });
        } else {
          // Single
          const refSingle = push(patioCubagemRef);
          await set(refSingle, {
            cavalo: finalCavalo,
            carreta: c1Placa,
            m3: String(c1Vol),
            mes: mesStr,
            dia: diaStr,
            data: finalData,
            transportador: finalTransp,
            pallets: String(c1Pal),
            pbt: String(c1Pbt),
            modeloCarreta: c1Modelo,
            tipoVeiculo: 'simples',
            inseridoEm: nowIso
          });
        }
      } catch (err) {
        console.warn("Sync com patio/cubagem:", err);
      }

      setExtractSuccessMsg(`Cubagem da placa ${finalCavalo} (${isBitrem ? 'Bitrem Total: ' + finalVolumeTotal + ' m³' : finalVolumeTotal + ' m³'}) salva no Firebase com sucesso!`);
      
      // Reset form
      setSharedData({
        placa_cavalo: '',
        data: new Date().toLocaleDateString('pt-BR'),
        transportador: ''
      });
      setC1({ placa: '', modelo: 'SIDER', volume: '', pallets: '', pbt: '' });
      setC2({ placa: '', modelo: 'SIDER', volume: '', pallets: '', pbt: '' });
      setSelectedFileName(null);
      setExtractDetails(null);

      // Redireciona imediatamente para a aba de Cubagem
      if (onNavigateToCubagem) {
        onNavigateToCubagem();
      }

      setTimeout(() => {
        setExtractSuccessMsg(null);
      }, 5000);

    } catch (err: any) {
      console.error("Erro ao salvar no Firebase:", err);
      setErrorMessage('Falha ao salvar no banco de dados: ' + (err.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick fill sample data with Bitrem example
  const handleFillSample = () => {
    setVehicleMode('BITREM');
    setSharedData({
      placa_cavalo: 'JAT4G68',
      data: new Date().toLocaleDateString('pt-BR'),
      transportador: 'MOEDENSE'
    });
    setC1({
      placa: 'FQC2B85',
      modelo: 'SIDER',
      volume: 88,
      pallets: 24,
      pbt: 22
    });
    setC2({
      placa: 'FQG1D53',
      modelo: 'SIDER',
      volume: 87,
      pallets: 24,
      pbt: 22
    });
    setExtractSuccessMsg('Dados de exemplo Bitrem (Cavalo: JAT4G68 | C1: FQC2B85 - 88 m³ / 24 plt | C2: FQG1D53 - 87 m³ / 24 plt | Total: 175 m³) preenchidos com sucesso!');
  };

  // Calculate Aggregates
  const totalVolume = ordersList.reduce((acc, curr) => acc + (Number(curr.volume_total) || Number(curr.volume_cubado) || 0), 0);
  const totalPallets = ordersList.reduce((acc, curr) => acc + (Number(curr.numero_pallets) || (Number(curr.c1?.pallets) || 0) + (Number(curr.c2?.pallets) || 0)), 0);
  const avgVolume = ordersList.length > 0 ? Math.round(totalVolume / ordersList.length) : 0;

  return (
    <div className="w-full min-h-full text-[#2b180d] flex flex-col gap-6 p-4 sm:p-6 md:p-8 font-sans select-none max-w-7xl mx-auto">
      
      {/* ================= HERO METRIC BANNER ================= */}
      <div className="w-full rounded-2xl bg-[#eedec7] border-2 border-[#a68a6d] shadow-[4px_6px_16px_rgba(0,0,0,0.25)] p-5 relative overflow-hidden">
        <Screw className="absolute top-2.5 left-2.5" />
        <Screw className="absolute top-2.5 right-2.5" />
        <Screw className="absolute bottom-2.5 left-2.5" />
        <Screw className="absolute bottom-2.5 right-2.5" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 px-2">
          
          {/* Header Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8c060a] to-[#4e0205] text-[#fdefd1] flex items-center justify-center shadow-lg border border-[#ffd880]/30 shrink-0">
              <FileSpreadsheet size={28} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#8c060a] text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                  CUBAGEM & PGR
                </span>
                <span className="text-[10px] font-mono text-[#5c3c24] font-bold uppercase">
                  Suporte Oficial a Bitrem / Rodotrem (C1 e C2)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight text-[#2b180d] mt-0.5">
                Ordem de Coleta & Cubagem
              </h1>
              <p className="text-xs text-[#5c3c24] font-medium">
                Gestão com soma automática de carretas (C1 + C2), leitura inteligente de arquivos e persistência no Firebase.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f5e9d9] border border-[#a68a6d]/50 rounded-xl p-3 text-center shadow-inner">
              <span className="text-[9px] font-black text-[#5c3c24]/80 uppercase block">Ordens Salvas</span>
              <span className="text-xl font-black text-[#8c060a] font-mono">{ordersList.length}</span>
            </div>
            <div className="bg-[#f5e9d9] border border-[#a68a6d]/50 rounded-xl p-3 text-center shadow-inner">
              <span className="text-[9px] font-black text-[#5c3c24]/80 uppercase block">Volume Total</span>
              <span className="text-xl font-black text-[#2b180d] font-mono">{totalVolume.toLocaleString('pt-BR')} m³</span>
            </div>
            <div className="bg-[#f5e9d9] border border-[#a68a6d]/50 rounded-xl p-3 text-center shadow-inner">
              <span className="text-[9px] font-black text-[#5c3c24]/80 uppercase block">Total Pallets</span>
              <span className="text-xl font-black text-[#2b180d] font-mono">{totalPallets.toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-[#f5e9d9] border border-[#a68a6d]/50 rounded-xl p-3 text-center shadow-inner">
              <span className="text-[9px] font-black text-[#5c3c24]/80 uppercase block">Média Cubagem</span>
              <span className="text-xl font-black text-[#5c3c24] font-mono">{avgVolume} m³</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= UPLOAD ZONE & FORM SPLIT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Upload Drag and Drop Area + Helpers (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Drag and Drop Box */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 relative overflow-hidden shadow-md flex flex-col items-center justify-center min-h-[230px]",
              isDragging 
                ? "bg-[#edd7bd] border-[#8c060a] scale-[1.01] shadow-xl ring-4 ring-[#8c060a]/20" 
                : "bg-[#eedec7]/80 hover:bg-[#eedec7] border-[#8c6039]/60 hover:border-[#8c060a]"
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx,.xls,.csv,.pdf,image/*"
              className="hidden"
            />
            
            <div className="w-14 h-14 rounded-full bg-[#fdfaf5] border-2 border-[#a68a6d] flex items-center justify-center text-[#8c060a] shadow-inner mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud size={28} className="stroke-[2.5]" />
            </div>

            <h3 className="text-sm font-black uppercase text-[#2b180d] font-serif">
              Arraste a Ordem de Coleta ou Planilha
            </h3>
            
            <p className="text-xs text-[#5c3c24] mt-1 max-w-xs leading-relaxed">
              Importação automática com detecção de <strong className="text-[#8c060a]">Bitrem (C1/C2)</strong> ou <strong className="text-[#8c060a]">Carreta Única</strong>.
            </p>

            <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
              <span className="px-2.5 py-1 rounded bg-[#d9c0a6] text-[#3a200a] text-[10px] font-mono font-bold border border-[#a68a6d]/50">
                .XLSX / .XLS
              </span>
              <span className="px-2.5 py-1 rounded bg-[#d9c0a6] text-[#3a200a] text-[10px] font-mono font-bold border border-[#a68a6d]/50">
                .PDF
              </span>
              <span className="px-2.5 py-1 rounded bg-[#d9c0a6] text-[#3a200a] text-[10px] font-mono font-bold border border-[#a68a6d]/50">
                FOTOS / OCR
              </span>
            </div>
          </div>

          {/* Quick Action & Helpers */}
          <div className="bg-[#eedec7] border-2 border-[#a68a6d] rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5c3c24]">
              <Sparkles size={16} className="text-[#8c060a]" />
              <span>Preenchimento rápido de teste:</span>
            </div>
            <button
              type="button"
              onClick={handleFillSample}
              className="px-3.5 py-1.5 bg-[#8c060a] hover:bg-[#6e0407] text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <Link2 size={13} />
              <span>Exemplo Bitrem</span>
            </button>
          </div>

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-3 animate-pulse shadow-sm">
              <Loader2 size={20} className="animate-spin shrink-0 text-amber-700" />
              <div className="text-xs font-medium">
                <strong className="block font-bold">Processando Documento...</strong>
                {processingMsg || 'Lendo células e campos da ordem de serviço...'}
              </div>
            </div>
          )}

          {/* Extraction Success Banner */}
          {extractSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex flex-col gap-1">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{extractSuccessMsg}</span>
              </div>
              {extractDetails && (
                <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/60 p-2 rounded border border-emerald-200 mt-1">
                  <Calculator size={12} className="inline mr-1 text-emerald-700" />
                  {extractDetails}
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 shadow-sm flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <div className="text-xs font-medium">{errorMessage}</div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Visual Form with Requested Structure (7 Cols) */}
        <div className="lg:col-span-7">
          <form 
            onSubmit={handleAddCubagem}
            className="rounded-2xl bg-[#eedec7] border-2 border-[#a68a6d] shadow-[4px_6px_16px_rgba(0,0,0,0.25)] p-5 sm:p-6 relative"
          >
            <Screw className="absolute top-2.5 left-2.5" />
            <Screw className="absolute top-2.5 right-2.5" />
            <Screw className="absolute bottom-2.5 left-2.5" />
            <Screw className="absolute bottom-2.5 right-2.5" />

            {/* Header & Toggle Selector */}
            <div className="flex flex-col gap-3 border-b border-[#a68a6d]/40 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black uppercase text-[#2b180d] font-serif tracking-tight">
                    Cadastro de Ordem de Coleta
                  </h2>
                  <span className="text-[11px] text-[#5c3c24] font-medium">
                    Preencha os blocos compartilhados e de carretas (C1 e C2).
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded bg-[#d9c0a6] text-[#3a200a] border border-[#a68a6d]">
                  PGR / Cubagem
                </span>
              </div>

              {/* CHAVE DE SELEÇÃO NO TOPO (TABS/BUTTONS) */}
              <div className="bg-[#dfcbaf] p-1 rounded-xl border border-[#a68a6d] flex items-center gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleToggleMode('SINGLE')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                    vehicleMode === 'SINGLE'
                      ? "bg-[#8B0000] text-white shadow-md border border-[#ffd880]/30"
                      : "text-[#3a200a] hover:bg-[#d5bf9f]/60"
                  )}
                >
                  <Truck size={15} className="shrink-0" />
                  <span>Carreta Única</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMode('BITREM')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                    vehicleMode === 'BITREM'
                      ? "bg-[#8B0000] text-white shadow-md border border-[#ffd880]/30"
                      : "text-[#3a200a] hover:bg-[#d5bf9f]/60"
                  )}
                >
                  <Link2 size={15} className="shrink-0" />
                  <span>BITREM / RODOTREM (C1 E C2)</span>
                </button>
              </div>
            </div>

            {/* BLOCO 1: "DADOS COMPARTILHADOS DO VEÍCULO" */}
            <div className="bg-[#f7efe4] border border-[#a68a6d]/60 rounded-xl p-4 mb-4 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#5c3c24] mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Truck size={13} className="text-[#8c060a]" />
                  <span>Bloco 1: Dados Compartilhados do Veículo</span>
                </span>
                {sharedData.placa_cavalo && (
                  <LicensePlate plate={sharedData.placa_cavalo} type="cavalo" size="sm" />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Placa Cavalo */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#3a200a]">
                    Placa Cavalo *
                  </label>
                  <input
                    type="text"
                    required
                    value={sharedData.placa_cavalo}
                    onChange={e => setSharedData({ ...sharedData, placa_cavalo: normalizePlate(e.target.value) })}
                    placeholder="Ex: POD0566"
                    maxLength={8}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8c060a] focus:ring-2 focus:ring-[#8c060a]/20 outline-none font-mono font-bold text-xs text-[#2b180d] uppercase transition-all shadow-inner"
                  />
                </div>

                {/* Data */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#3a200a]">
                    Data (DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={sharedData.data}
                    onChange={e => setSharedData({ ...sharedData, data: formatDateInput(e.target.value) })}
                    placeholder="Ex: 09/08/2026"
                    maxLength={10}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8c060a] focus:ring-2 focus:ring-[#8c060a]/20 outline-none font-mono font-bold text-xs text-[#2b180d] transition-all shadow-inner"
                  />
                </div>

                {/* Transportador */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#3a200a]">
                    Transportador
                  </label>
                  <input
                    type="text"
                    value={sharedData.transportador}
                    onChange={e => setSharedData({ ...sharedData, transportador: e.target.value.toUpperCase() })}
                    placeholder="Ex: FROTA / MOEDENSE"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8c060a] focus:ring-2 focus:ring-[#8c060a]/20 outline-none font-sans font-bold text-xs text-[#2b180d] uppercase transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* BLOCO 2: "CARRETA 1 (C1)" */}
            <div className="bg-[#fcf7ee] border-2 border-[#a52a2a]/40 rounded-xl p-4 mb-4 relative shadow-sm">
              <div className="flex items-center justify-between border-b border-[#a52a2a]/20 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#8B0000] text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                    C1
                  </span>
                  <h4 className="text-xs font-black uppercase text-[#8B0000] font-serif tracking-wider">
                    Bloco 2: Carreta 1 (C1)
                  </h4>
                </div>
                {c1.placa && <LicensePlate plate={c1.placa} type="carreta" size="sm" />}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* Placa C1 */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                    Placa C1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={c1.placa}
                    onChange={e => setC1({ ...c1, placa: normalizePlate(e.target.value) })}
                    placeholder="Ex: P0G7766"
                    maxLength={8}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-bold text-xs text-[#2b180d] uppercase transition-all shadow-inner"
                  />
                </div>

                {/* Modelo C1 */}
                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                    Modelo C1
                  </label>
                  <input
                    type="text"
                    value={c1.modelo}
                    onChange={e => setC1({ ...c1, modelo: e.target.value.toUpperCase() })}
                    placeholder="Ex: SIDER, BAÚ, GRADE BAIXA"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-sans font-bold text-xs text-[#2b180d] uppercase transition-all shadow-inner"
                  />
                </div>

                {/* Volume C1 (m³) */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#8B0000] flex items-center justify-between">
                    <span>Volume C1 (m³) *</span>
                    <span className="text-[8px] font-mono font-bold">m³</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={c1.volume}
                    onChange={e => setC1({ ...c1, volume: e.target.value })}
                    placeholder="Ex: 88"
                    className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[#8B0000]/30 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-black text-xs text-[#8B0000] transition-all shadow-inner"
                  />
                </div>

                {/* Pallets C1 */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                    Pallets C1
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={c1.pallets}
                    onChange={e => setC1({ ...c1, pallets: e.target.value })}
                    placeholder="Ex: 24"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-bold text-xs text-[#2b180d] transition-all shadow-inner"
                  />
                </div>

                {/* PBT C1 */}
                <div className="sm:col-span-1 flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                    PBT C1 (Ton)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={c1.pbt}
                    onChange={e => setC1({ ...c1, pbt: e.target.value })}
                    placeholder="Ex: 24"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-bold text-xs text-[#2b180d] transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* BLOCO 3: "CARRETA 2 (C2)" (Visível apenas se BITREM / RODOTREM ativo) */}
            {vehicleMode === 'BITREM' && (
              <div className="bg-[#fcf7ee] border-2 border-[#a52a2a]/40 rounded-xl p-4 mb-4 relative shadow-sm animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#a52a2a]/20 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B0000] text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                      C2
                    </span>
                    <h4 className="text-xs font-black uppercase text-[#8B0000] font-serif tracking-wider">
                      Bloco 3: Carreta 2 (C2)
                    </h4>
                  </div>
                  {c2.placa && <LicensePlate plate={c2.placa} type="carreta" size="sm" />}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {/* Placa C2 */}
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                      Placa C2 *
                    </label>
                    <input
                      type="text"
                      required
                      value={c2.placa}
                      onChange={e => setC2({ ...c2, placa: normalizePlate(e.target.value) })}
                      placeholder="Ex: P0Z2134"
                      maxLength={8}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-bold text-xs text-[#2b180d] uppercase transition-all shadow-inner"
                    />
                  </div>

                  {/* Modelo C2 */}
                  <div className="sm:col-span-3 flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                      Modelo C2
                    </label>
                    <input
                      type="text"
                      value={c2.modelo}
                      onChange={e => setC2({ ...c2, modelo: e.target.value.toUpperCase() })}
                      placeholder="Ex: SIDER"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-sans font-bold text-xs text-[#2b180d] uppercase transition-all shadow-inner"
                    />
                  </div>

                  {/* Volume C2 (m³) */}
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#8B0000] flex items-center justify-between">
                      <span>Volume C2 (m³) *</span>
                      <span className="text-[8px] font-mono font-bold">m³</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={c2.volume}
                      onChange={e => setC2({ ...c2, volume: e.target.value })}
                      placeholder="Ex: 87"
                      className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[#8B0000]/30 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-black text-xs text-[#8B0000] transition-all shadow-inner"
                    />
                  </div>

                  {/* Pallets C2 */}
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                      Pallets C2
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={c2.pallets}
                      onChange={e => setC2({ ...c2, pallets: e.target.value })}
                      placeholder="Ex: 24"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-bold text-xs text-[#2b180d] transition-all shadow-inner"
                    />
                  </div>

                  {/* PBT C2 */}
                  <div className="sm:col-span-1 flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#3a200a]">
                      PBT C2 (Ton)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={c2.pbt}
                      onChange={e => setC2({ ...c2, pbt: e.target.value })}
                      placeholder="Ex: 24"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#8c6039]/40 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20 outline-none font-mono font-bold text-xs text-[#2b180d] transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RODAPÉ DO FORMULÁRIO: SOMA C1 + C2 & BOTÃO ADICIONAR */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#2b180d] via-[#4a2412] to-[#2b180d] border border-[#a68a6d] text-[#fdefd1] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8B0000] text-white flex items-center justify-center font-bold text-sm shadow">
                  Σ
                </div>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-[#ffd880] block">
                    {vehicleMode === 'BITREM' ? 'Soma C1 + C2 (Automática)' : 'Volume Total do Veículo'}
                  </span>
                  <span className="text-xs font-serif text-white/90">
                    {vehicleMode === 'BITREM' 
                      ? `C1 (${c1.volume || 0} m³) + C2 (${c2.volume || 0} m³)`
                      : 'Carreta Única'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 divide-x divide-white/20">
                <div className="text-right">
                  <span className="text-[8.5px] uppercase font-bold text-[#ffd880] block">Total M³</span>
                  <span className="text-xl font-black font-mono text-white leading-none">
                    {totalVolumeForm} <span className="text-xs font-normal">m³</span>
                  </span>
                </div>
                <div className="pl-4 text-right">
                  <span className="text-[8.5px] uppercase font-bold text-[#ffd880] block">Pallets</span>
                  <span className="text-base font-black font-mono text-white leading-none">
                    {totalPalletsForm}
                  </span>
                </div>
                <div className="pl-4 text-right">
                  <span className="text-[8.5px] uppercase font-bold text-[#ffd880] block">PBT Total</span>
                  <span className="text-base font-black font-mono text-white leading-none">
                    {totalPbtForm} <span className="text-[10px] font-normal">Ton</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Action Button: + ADICIONAR CUBAGEM */}
            <div className="mt-4 pt-3 flex items-center justify-end">
              <button
                type="submit"
                disabled={isProcessing || isReadOnly}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-b from-[#b32025] to-[#800609] hover:from-[#cb1a21] hover:to-[#9c050a] border-2 border-[#ffd880]/40 text-white font-serif font-black text-sm uppercase tracking-widest shadow-[0_4px_12px_rgba(128,6,9,0.35)] hover:shadow-[0_6px_16px_rgba(128,6,9,0.45)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="stroke-[3]" />
                    <span>+ ADICIONAR CUBAGEM</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
