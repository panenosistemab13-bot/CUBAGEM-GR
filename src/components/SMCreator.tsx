import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clipboard, 
  Trash2, 
  Calculator, 
  Mail, 
  Plus, 
  Check, 
  ChevronRight,
  TrendingUp,
  Download,
  Info,
  Copy,
  RefreshCw,
  Calendar as CalendarIcon,
  X,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';

const invertRoute = (trecho: string) => {
  if (!trecho) return '';
  const parts = trecho.trim().split(/\s+/);
  const xIndex = parts.findIndex(p => p.toUpperCase() === 'X');
  if (xIndex > 0 && xIndex < parts.length - 1) {
    const newParts = [...parts];
    const startCity = newParts[xIndex - 1];
    const endCity = newParts[xIndex + 1];
    newParts[xIndex - 1] = endCity;
    newParts[xIndex + 1] = startCity;
    return newParts.join(' ').toUpperCase();
  }
  return trecho.toUpperCase();
};

const formatNfValue = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '0,00';
  const amount = parseFloat(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

interface SMRow {
  dataSaida: string;
  motorista: string;
  placa: string;
  bau1: string;
  bau2: string;
  trecho: string;
  valorNf: string;
  ok?: boolean;
}

interface SMCreatorProps {
  view?: 'generator' | 'codes';
  onBack?: () => void;
}

const generateStyledTableHtml = (rows: SMRow[], isIda: boolean) => {
  if (rows.length === 0) return '';
  const color = isIda ? '#14325c' : '#7f1d1d';
  const gradientStart = isIda ? '#14325c' : '#7f1d1d';
  const gradientEnd = isIda ? '#0f2a4a' : '#991b1b';
  const textColor = isIda ? '#e2e8f0' : '#fdfaf5';
  
  let rowsHtml = '';
  rows.forEach(r => {
    rowsHtml += `
      <tr style="height: 42px;">
        <td style="width: 11%; padding: 4px 2px; text-align: center; vertical-align: middle; border-bottom: 1px solid rgba(192, 168, 146, 0.25);">
          <div style="background-color: #d2c2b2; border: 1px solid #c0a892; border-radius: 6px; padding: 6px 2px; color: #4a3623; font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 11px; display: block; text-transform: uppercase; text-align: center; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); margin: 0 1px;">${r.dataSaida || '-'}</div>
        </td>
        <td style="width: 25%; padding: 4px 2px; text-align: left; vertical-align: middle; border-bottom: 1px solid rgba(192, 168, 146, 0.25);">
          <div style="background-color: #d2c2b2; border: 1px solid #c0a892; border-radius: 6px; padding: 6px 8px; color: #4a3623; font-weight: bold; font-family: Arial, sans-serif; font-size: 11px; display: block; text-transform: uppercase; text-align: left; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); margin: 0 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.motorista || '-'}</div>
        </td>
        <td style="width: 12%; padding: 4px 2px; text-align: center; vertical-align: middle; border-bottom: 1px solid rgba(192, 168, 146, 0.25);">
          <div style="background-color: #d2c2b2; border: 1px solid #c0a892; border-radius: 6px; padding: 6px 2px; color: #4a3623; font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 11px; display: block; text-transform: uppercase; text-align: center; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); margin: 0 1px;">${r.placa || '-'}</div>
        </td>
        <td style="width: 11%; padding: 4px 2px; text-align: center; vertical-align: middle; border-bottom: 1px solid rgba(192, 168, 146, 0.25);">
          <div style="background-color: #d2c2b2; border: 1px solid #c0a892; border-radius: 6px; padding: 6px 2px; color: #4a3623; font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 11px; display: block; text-transform: uppercase; text-align: center; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); margin: 0 1px;">${r.bau1 || '-'}</div>
        </td>
        <td style="width: 11%; padding: 4px 2px; text-align: center; vertical-align: middle; border-bottom: 1px solid rgba(192, 168, 146, 0.25);">
          <div style="background-color: #d2c2b2; border: 1px solid #c0a892; border-radius: 6px; padding: 6px 2px; color: #4a3623; font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 11px; display: block; text-transform: uppercase; text-align: center; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); margin: 0 1px;">${r.bau2 || '-'}</div>
        </td>
        <td style="width: 18%; padding: 4px 2px; text-align: center; vertical-align: middle; border-bottom: 1px solid rgba(192, 168, 146, 0.25);">
          <div style="background-color: #d2c2b2; border: 1px solid #c0a892; border-radius: 6px; padding: 6px 4px; color: #4a3623; font-weight: bold; font-family: Arial, sans-serif; font-size: 11px; display: block; text-transform: uppercase; text-align: center; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); margin: 0 1px;">${r.trecho || '-'}</div>
        </td>
        <td style="width: 12%; padding: 4px 2px; text-align: right; vertical-align: middle; border-bottom: 1px solid rgba(192, 168, 146, 0.25);">
          <div style="background-color: #d2c2b2; border: 1px solid #c0a892; border-radius: 6px; padding: 6px 8px; color: #4a3623; font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 11px; display: block; text-align: right; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); margin: 0 1px;">${r.valorNf || '0,00'}</div>
        </td>
      </tr>`;
  });

  return `
    <div style="width: 100%; max-width: 1000px; box-sizing: border-box; background-color: #e6d5c3;  border: 6px solid #c79165; border-radius: 12px; padding: 4px; display: block; text-align: left; margin: 10px 0;">
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; background-color: rgba(253, 250, 245, 0.95); border-radius: 6px; overflow: hidden; font-family: 'Georgia', serif; font-size: 12px;">
        <thead>
          <tr style="background-color: ${color}; background-image: linear-gradient(180deg, ${gradientStart} 0%, ${gradientEnd} 100%); color: ${textColor}; height: 42px;">
            <th style="width: 11%; text-align: center; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; padding: 8px 4px; border-bottom: 2px solid #c0a892;">DATA</th>
            <th style="width: 25%; text-align: left; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; padding: 8px 12px; border-bottom: 2px solid #c0a892;">MOTORISTA</th>
            <th style="width: 12%; text-align: center; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; padding: 8px 4px; border-bottom: 2px solid #c0a892;">PLACA</th>
            <th style="width: 11%; text-align: center; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; padding: 8px 4px; border-bottom: 2px solid #c0a892;">BAÚ 1</th>
            <th style="width: 11%; text-align: center; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; padding: 8px 4px; border-bottom: 2px solid #c0a892;">BAÚ 2</th>
            <th style="width: 18%; text-align: center; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; padding: 8px 4px; border-bottom: 2px solid #c0a892;">TRECHO</th>
            <th style="width: 12%; text-align: right; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; padding: 8px 12px; border-bottom: 2px solid #c0a892;">VALOR NF</th>
          </tr>
        </thead>
        <tbody style="background-color: rgba(253, 250, 245, 0.95);">
          ${rowsHtml}
        </tbody>
      </table>
    </div>`;
};

export default function SMCreator({ view = 'generator', onBack }: SMCreatorProps) {
  const [idaRows, setIdaRows] = useState<SMRow[]>([]);
  const [voltaRows, setVoltaRows] = useState<SMRow[]>([]);
  const [calcValues, setCalcValues] = useState<string[]>(['']);

  useEffect(() => {
    const smRef = ref(db, 'sm_creator_data');
    const unsubscribe = onValue(smRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.ida) setIdaRows(data.ida);
        if (data.volta) setVoltaRows(data.volta);
        if (data.calc) setCalcValues(data.calc);
      }
    });
    return () => unsubscribe();
  }, []);

  const saveIda = (rows: SMRow[]) => {
    setIdaRows(rows);
    set(ref(db, 'sm_creator_data/ida'), rows);
  };

  const saveVolta = (rows: SMRow[]) => {
    setVoltaRows(rows);
    set(ref(db, 'sm_creator_data/volta'), rows);
  };

  const saveCalc = (vals: string[]) => {
    setCalcValues(vals);
    set(ref(db, 'sm_creator_data/calc'), vals);
  };
  const [totalRawCopied, setTotalRawCopied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [idaCopied, setIdaCopied] = useState(false);
  const [voltaCopied, setVoltaCopied] = useState(false);

  const renderCodesTable = () => (
    <div className="report-card overflow-hidden">
      <div className="bg-[#4d0c24] p-3 text-center">
        <h3 className="text-white font-bold uppercase tracking-widest text-lg">Solicitação de Monitoramento</h3>
        <p className="text-[#fce783] text-xs font-bold uppercase">Trafegus</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-bold uppercase text-center text-xs">
          <thead>
            <tr className="bg-[#002d3d] text-white">
              <th className="border border-zinc-700 p-3 w-1/3">Assunto</th>
              <th className="border border-zinc-700 p-3 w-1/4">Códigos</th>
              <th className="border border-slate-700 p-3">Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Tipo de Transporte</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">1</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Transferencia</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Tipos de Operação</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">2</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100 italic opacity-80">Dedicados</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Embarcador</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">913</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Tres Corações Alimentos</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Transportador</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">87</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">3C Santa Luzia Dedicados</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Valor Mercadoria Especifica</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">126</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Acima de 900 Mil</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Valor Mercadoria Especifica</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">42</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Abaixo de 900 Mil</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const parseInput = (text: string, saveFunc: (rows: SMRow[]) => void, existingRows: SMRow[], section: 'ida' | 'volta', forceZeroValue: boolean = false) => {
    const lines = text.trim().split('\n');
    const newRows: SMRow[] = [];

    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        let trecho = parts[5] || '';
        if (section === 'volta') {
          trecho = invertRoute(trecho);
        }

        newRows.push({
          dataSaida: parts[0] || '',
          motorista: parts[1] || '',
          placa: (parts[2] || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
          bau1: parts[3] || '',
          bau2: parts[4] || '',
          trecho: trecho,
          valorNf: forceZeroValue ? '0,00' : (parts[6] || '')
        });
      }
    });

    if (newRows.length > 0) {
      saveFunc([...existingRows, ...newRows]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, section: 'ida' | 'volta') => {
    const text = e.clipboardData.getData('text');
    parseInput(text, section === 'ida' ? saveIda : saveVolta, section === 'ida' ? idaRows : voltaRows, section, true);
  };

  const addNewRow = (section: 'ida' | 'volta') => {
    const newRow: SMRow = {
      dataSaida: new Date().toLocaleDateString('pt-BR'),
      motorista: '',
      placa: '',
      bau1: '',
      bau2: '',
      trecho: '',
      valorNf: '0,00'
    };
    if (section === 'ida') {
      saveIda([...idaRows, newRow]);
    } else {
      saveVolta([...voltaRows, newRow]);
    }
  };

  const updateRowValue = (index: number, field: keyof SMRow, value: any, section: 'ida' | 'volta') => {
    let finalValue = value;
    
    if (field === 'valorNf' && typeof value === 'string') {
      finalValue = formatNfValue(value);
    } else if (field === 'placa' && typeof value === 'string') {
      finalValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (field === 'trecho' && typeof value === 'string') {
      finalValue = value.toUpperCase();
    }

    if (section === 'ida') {
      const newRows = [...idaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveIda(newRows);
    } else {
      const newRows = [...voltaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveVolta(newRows);
    }
  };

  const calculateTotal = () => {
    const sum = calcValues.reduce((acc, curr) => {
      const val = parseFloat(curr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
      return isNaN(val) ? acc : acc + val;
    }, 0);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(sum);
  };

  const copyTotalRaw = () => {
    const total = calculateTotal();
    navigator.clipboard.writeText(total);
    setTotalRawCopied(true);
    setTimeout(() => setTotalRawCopied(false), 2000);
  };

  const addCalcLine = () => saveCalc([...calcValues, '']);
  const updateCalcValue = (index: number, val: string) => {
    const newVals = [...calcValues];
    newVals[index] = val;
    saveCalc(newVals);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 || hour < 24) return 'Boa noite';
    return 'Bom dia';
  };

  const getJourneyDate = (rows: SMRow[]) => {
    return rows[0]?.dataSaida || '---';
  };

  const copyToEmail = async () => {
    const greeting = getGreeting();

    const formatRowsText = (rows: SMRow[], title: string) => {
      if (rows.length === 0) return '';
      let text = `--- ${title} ---\n`;
      text += `DATA | MOTORISTA | PLACA | BAÚ 1 | BAÚ 2 | TRECHO | VALOR NF\n`;
      rows.forEach(r => {
        text += `${r.dataSaida} | ${r.motorista} | ${r.placa} | ${r.bau1} | ${r.bau2} | ${r.trecho} | ${r.valorNf}\n`;
      });
      return text + '\n';
    };

    const htmlContent = `
      <div style="font-family: sans-serif; color: #333;">
        <p>${greeting}!</p>
        <p>Segue relatórios de SM - Ida e Volta.</p>
        
        <div style="margin-top: 20px;">
          <h3 style="color: #14325c; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA IDA ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: <strong>${getJourneyDate(idaRows)}</strong>!</p>
          ${generateStyledTableHtml(idaRows, true)}
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #7f1d1d; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA VOLTA ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: <strong>${getJourneyDate(voltaRows)}</strong>!</p>
          ${generateStyledTableHtml(voltaRows, false)}
        </div>

        <p style="margin-top: 20px;"><strong>Total Calculado: ${calculateTotal()}</strong></p>
        <p>Att,</p>
      </div>
    `;

    const textContent = `${greeting}!\n\nSegue relatórios de SM - Ida e Volta.\n\nROTA IDA\n${greeting}, Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${getJourneyDate(idaRows)}!\n${formatRowsText(idaRows, '')}\nROTA VOLTA\n${greeting}, Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${getJourneyDate(voltaRows)}!\n${formatRowsText(voltaRows, '')}\nTotal Calculado: ${calculateTotal()}\n\nAtt,`;

    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([htmlContent], { type: typeHtml });
      const blobText = new Blob([textContent], { type: typeText });
      const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copySection = async (rows: SMRow[], title: string, setCopiedStatus: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (rows.length === 0) return;
    
    const color = title.includes('IDA') ? '#14325c' : '#7f1d1d';
    const isIda = title.includes('IDA');
    const greeting = getGreeting();
    const date = getJourneyDate(rows);
    
    const phrase = isIda 
      ? `Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${date}!`
      : `Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${date}!`;

    let html = `<div style="font-family: sans-serif; color: #333;">
      <h3 style="color: ${color}; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ${title} ---</h3>
      <p style="font-size: 13px;">${greeting},</p>
      <p style="font-size: 13px;">${phrase}</p>
      ${generateStyledTableHtml(rows, isIda)}
    </div>`;

    let text = `--- ${title} ---\n${greeting},\n${phrase}\n\n`;
    text += `| DATA | MOTORISTA | PLACA | BAÚ 1 | BAÚ 2 | TRECHO | VALOR NF |\n`;
    rows.forEach(r => {
      text += `| ${r.dataSaida} | ${r.motorista} | ${r.placa} | ${r.bau1} | ${r.bau2} | ${r.trecho} | ${r.valorNf} |\n`;
    });

    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([html], { type: typeHtml });
      const blobText = new Blob([text], { type: typeText });
      const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      await navigator.clipboard.write(data);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    } catch (err) {
      navigator.clipboard.writeText(text);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    }
  };

  return (
    <>
      {onBack && (
        <div className="w-full max-w-[94rem] mx-auto px-6 mt-4 md:hidden">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 w-full bg-[#3A2414] hover:bg-[#2A1408] text-[#fbdba5] py-3.5 rounded-2xl font-black text-xs transition-all border border-[#3A2414] shadow-md cursor-pointer"
          >
            <LayoutGrid size={16} className="text-[#B32025]" />
            <span>Voltar ao Menu Inicial</span>
          </button>
        </div>
      )}

      {/* ================= HEADER AREA ================= */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 max-w-[94rem] mx-auto mt-2 mb-6 px-6">
        
        {/* Left title and logo stack */}
        <div className="flex items-center gap-5 text-left w-full md:w-auto">
          {/* Logo stamp SVG */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 pointer-events-none hover:scale-105 transition-transform duration-500">
            <svg className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(58,36,20,0.35)]" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d92d33" />
                  <stop offset="100%" stopColor="#7a0307" />
                </linearGradient>
              </defs>
              {/* Embossed metal rim */}
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
              <circle cx="60" cy="60" r="50" fill="url(#redGrad)" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
              
              {/* Outer heart bundle */}
              <g transform="translate(60, 56) scale(0.72)">
                <path d="M-12,-10 C-17,-15 -25,-12 -25,-4 C-25,4 -15,10 0,22 C15,10 25,4 25,-4 C25,-12 17,-15 12,-10 C8,-6 2,-6 0,-6 C-2,-6 -8,-6 -12,-10 Z" fill="url(#goldGrad)" />
                {/* Embedded hearts inside */}
                <path d="M-6,-4 C-8.5,-6.5 -12.5,-5 -12.5,-1 C-12.5,3 -7.5,6 0,12 C7.5,6 12.5,3 12.5,-1 C12.5,-5 8.5,-6.5 6,-4 C4,-2 1,-2 0,-2 C-1,-2 -3,-2 -6,-4 Z" fill="#7a0307" />
                <path d="M-3,-1.5 C-4.2,-2.7 -6.2,-2 -6.2,0 C-6.2,2 -3.7,3.5 0,6 C3.7,3.5 6.2,2 6.2,0 C6.2,-2 4.2,-2.7 3,-1.5 C2,-0.5 0.5,-0.5 0,-0.5 C-0.5,-0.5 -1,-0.5 -3,-1.5 Z" fill="url(#goldGrad)" />
              </g>

              {/* Gold text border on top */}
              <path id="brandPath" d="M 18,60 A 42,42 0 0,0 102,60" fill="none" />
              <text fontFamily="Oswald" fontSize="9" fontWeight="bold" fill="url(#goldGrad)" textAnchor="middle">
                <textPath href="#brandPath" startOffset="50%">3 CORAÇÕES</textPath>
              </text>
            </svg>
          </div>

          {/* Page title next to the logo */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-rustic-title font-black text-[#2b180d] uppercase tracking-wide leading-none drop-shadow-[1px_2px_1px_rgba(255,255,255,0.45)]">
              SM
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 border border-[#fefdfa] animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.7)]" />
              <span className="text-xs font-mono font-black text-[#5c3c24] uppercase tracking-widest pl-0.5">
                MÓDULO ATIVO
              </span>
            </div>
          </div>
        </div>
      </div>

      {view === 'codes' ? (
        <div className="relative z-10 bg-[#fdfcf9] p-6 rounded-xl border-4 border-[#3A2414] shadow-2xl">{renderCodesTable()}</div>
      ) : (
        <div className="relative z-10 space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            {/* Main Work Area */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* ROTA IDA (Green Theme) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#3A2414] font-serif uppercase tracking-widest drop-shadow-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#B32025]" /> Rota Ida
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addNewRow('ida')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] bg-[#B32025] hover:brightness-110 text-white font-bold uppercase tracking-wider transition-all border-b-2 border-[#3A2414]/25 shadow-sm cursor-pointer"
                    >
                      <Plus size={12} /> Add Linha
                    </button>
                    {idaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(idaRows, 'ROTA IDA', setIdaCopied)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm border-b-2",
                          idaCopied 
                            ? "bg-green-600 text-white border-green-800" 
                            : "bg-[#3A2414] text-white border-black/30 hover:brightness-110"
                        )}
                      >
                        {idaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {idaCopied ? 'Copiado!' : 'Copiar Planilha'}
                      </button>
                    )}
                    <button onClick={() => saveIda([])} className="text-[10px] font-black text-[#B32025] hover:underline uppercase tracking-tighter cursor-pointer pl-1">Limpar Tudo</button>
                  </div>
                </div>

                <div className="bg-white/40 border-4 border-[#3A2414] rounded-2xl shadow-sm overflow-hidden relative"><div className="relative z-10 w-full overflow-hidden p-1.5">
                  {idaRows.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center bg-[#fdfaf5] h-full border border-[#c0a892]/50 shadow-inner">
                      <div className="p-4 bg-[#7a4b31]/10 rounded-full mb-4 border border-[#7a4b31]/20">
                        <Clipboard className="text-[#a57045] w-8 h-8" />
                      </div>
                      <p className="text-sm text-[#4a3623] mb-4 font-serif">Cole aqui as informações da Rota Ida ou adicione manualmente</p>
                      <div className="flex flex-col gap-3 w-full max-w-md">
                        <textarea 
                          onPaste={(e) => handlePaste(e, 'ida')}
                          placeholder="Ctrl+V aqui..."
                          className="w-full h-24 bg-white/5 border border-[#c0a892] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)]  bg-[#d2c2b2] rounded-xl p-4 text-xs font-mono text-[#4a3623] outline-none placeholder-[#a57045]/50 focus:border-green-500/50 resize-none"
                        />
                        <button 
                          onClick={() => addNewRow('ida')}
                          className="w-full py-3 border border-dashed border-[#14325c]/50 rounded-xl text-[#14325c] hover:text-[#1e3a8a] flex items-center justify-center gap-2 text-xs font-bold uppercase"
                        >
                          <Plus size={16} /> Adicionar manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-b from-[#14325c] to-[#0f2a4a] text-[#e2e8f0] text-[10px] uppercase font-bold tracking-[0.2em] border-b border-[#1e3a8a] shadow-sm">
                            <th className="p-4 w-10 text-center">#</th>
                            <th className="p-4 w-12 text-center">OK</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Motorista</th>
                            <th className="p-4 text-center">Placa</th>
                            <th className="p-4 text-center">Baú 1</th>
                            <th className="p-4 text-center">Baú 2</th>
                            <th className="p-4">Trecho</th>
                            <th className="p-4 text-right">Valor NF</th>
                            <th className="p-4 w-12 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c0a892]/50 bg-[#fdfaf5]/90 font-serif backdrop-blur-sm">
                          {idaRows.map((row, i) => (
                            <tr key={i} className="text-xs text-[#4a3623] hover:bg-[#d0a782]/10 transition-all group/row font-bold relative">
                              <td className="p-3 text-center text-stone-500 font-mono font-bold text-xs w-10">
                                {i + 1}
                              </td>
                              <td className="p-3 text-center w-12">
                                <button
                                  type="button"
                                  onClick={() => updateRowValue(i, 'ok', !row.ok, 'ida')}
                                  className={cn(
                                    "w-5 h-5 mx-auto flex items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                                    row.ok 
                                      ? "bg-green-600 border-green-700 text-white shadow-sm" 
                                      : "bg-stone-100 border-stone-300 text-transparent hover:border-green-600/50"
                                  )}
                                  title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                >
                                  <Check size={12} className="stroke-[3]" />
                                </button>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text"
                                  value={row.dataSaida}
                                  onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'ida')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-[#e6d5c3] focus:border-[#a57045] outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 font-bold group/cell">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text"
                                    value={row.motorista}
                                    onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'ida')}
                                    className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 focus:bg-[#e6d5c3] focus:border-[#a57045] outline-none transition-all uppercase"
                                  />
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.motorista)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-green-500/10 hover:bg-green-500/30 rounded-lg text-green-500 transition-all shrink-0"
                                    title="Copiar Motorista"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.placa}
                                  onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'ida')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-[#e6d5c3] focus:border-[#a57045] outline-none transition-all font-black tracking-widest uppercase"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau1}
                                  onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'ida')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-[#e6d5c3] focus:border-[#a57045] outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau2}
                                  onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'ida')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-[#e6d5c3] focus:border-[#a57045] outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text"
                                  value={row.trecho}
                                  onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'ida')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 focus:bg-[#e6d5c3] focus:border-[#a57045] outline-none transition-all uppercase"
                                />
                              </td>
                              <td className="p-3 text-right font-black text-green-500 group/cell">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-green-500/10 hover:bg-green-500/30 rounded-lg text-green-500 transition-all shrink-0"
                                    title="Copiar Valor"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <input 
                                    type="text"
                                    value={row.valorNf}
                                    onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'ida')}
                                    className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-right focus:bg-[#e6d5c3] focus:border-[#a57045] outline-none transition-all font-mono"
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => saveIda(idaRows.filter((_, idx) => idx !== i))} 
                                  className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg shadow-rose-500/10"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div></div></section>

              {/* ROTA VOLTA (Sky Theme) */}
              <section className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#3A2414] font-serif uppercase tracking-widest flex items-center gap-2 drop-shadow-sm">
                    <Download size={16} className="rotate-180 text-[#B32025]" /> Rota Volta
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addNewRow('volta')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] bg-[#B32025] hover:brightness-110 text-white font-bold uppercase tracking-wider transition-all border-b-2 border-[#3A2414]/25 shadow-sm cursor-pointer"
                    >
                      <Plus size={12} /> Add Linha
                    </button>
                    {voltaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(voltaRows, 'ROTA VOLTA', setVoltaCopied)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm border-b-2",
                          voltaCopied 
                            ? "bg-green-600 text-white border-green-800" 
                            : "bg-[#3A2414] text-white border-black/30 hover:brightness-110"
                        )}
                      >
                        {voltaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {voltaCopied ? 'Copiado!' : 'Copiar Planilha'}
                      </button>
                    )}
                    <button onClick={() => saveVolta([])} className="text-[10px] font-black text-[#B32025] hover:underline uppercase tracking-tighter cursor-pointer pl-1">Limpar Tudo</button>
                  </div>
                </div>

                <div className="bg-white/40 border-4 border-[#3A2414] rounded-2xl shadow-sm overflow-hidden relative"><div className="relative z-10 w-full overflow-hidden p-1.5">
                  {voltaRows.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center bg-[#fdfaf5] h-full border border-[#c0a892]/50 shadow-inner">
                      <div className="p-4 bg-[#b91c1c]/10 rounded-full mb-4 border border-[#b91c1c]/20">
                        <Clipboard className="text-[#b91c1c] w-8 h-8" />
                      </div>
                      <p className="text-sm text-[#4a3623] mb-4 font-serif">Cole aqui as informações da Rota Volta ou adicione manualmente</p>
                      <div className="flex flex-col gap-3 w-full max-w-md">
                        <textarea 
                          onPaste={(e) => handlePaste(e, 'volta')}
                          placeholder="Ctrl+V aqui..."
                          className="w-full h-24  bg-[#d2c2b2] border border-[#c0a892] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-xl p-4 text-xs font-mono text-[#4a3623] outline-none placeholder-[#a57045]/50 focus:border-[#b91c1c] resize-none"
                        />
                        <button 
                          onClick={() => addNewRow('volta')}
                          className="w-full py-3 border border-dashed border-[#991b1b]/50 rounded-xl text-[#991b1b] hover:text-[#b91c1c] flex items-center justify-center gap-2 text-xs font-bold uppercase"
                        >
                          <Plus size={16} /> Adicionar manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-b from-[#7f1d1d] to-[#991b1b] text-[#fdfaf5] text-[10px] uppercase font-bold tracking-[0.2em] border-b border-[#450a0a] shadow-sm">
                            <th className="p-4 w-10 text-center">#</th>
                            <th className="p-4 w-12 text-center">OK</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Motorista</th>
                            <th className="p-4 text-center">Placa</th>
                            <th className="p-4 text-center">Baú 1</th>
                            <th className="p-4 text-center">Baú 2</th>
                            <th className="p-4">Trecho</th>
                            <th className="p-4 text-right">Valor NF</th>
                            <th className="p-4 w-12 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c0a892]/50 bg-[#fdfaf5]/90 font-serif backdrop-blur-sm">
                          {voltaRows.map((row, i) => (
                            <tr key={i} className="text-xs text-[#4a3623] hover:bg-[#d0a782]/10 transition-all group/row font-bold relative">
                              <td className="p-3 text-center text-stone-500 font-mono font-bold text-xs w-10">
                                {i + 1}
                              </td>
                              <td className="p-3 text-center w-12">
                                <button
                                  type="button"
                                  onClick={() => updateRowValue(i, 'ok', !row.ok, 'volta')}
                                  className={cn(
                                    "w-5 h-5 mx-auto flex items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                                    row.ok 
                                      ? "bg-green-600 border-green-700 text-white shadow-sm" 
                                      : "bg-stone-100 border-stone-300 text-transparent hover:border-green-600/50"
                                  )}
                                  title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                >
                                  <Check size={12} className="stroke-[3]" />
                                </button>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text"
                                  value={row.dataSaida}
                                  onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'volta')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 font-bold group/cell">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text"
                                    value={row.motorista}
                                    onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'volta')}
                                    className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all uppercase"
                                  />
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.motorista)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-red-500/10 hover:bg-red-500/30 rounded-lg text-red-500 transition-all shrink-0"
                                    title="Copiar Motorista"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.placa}
                                  onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'volta')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-black tracking-widest uppercase"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau1}
                                  onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'volta')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau2}
                                  onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'volta')}
                                  className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 group/trecho">
                                  <input 
                                    type="text"
                                    value={row.trecho}
                                    onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'volta')}
                                    className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all uppercase"
                                  />
                                  <button 
                                    onClick={() => {
                                      const inverted = invertRoute(row.trecho);
                                      updateRowValue(i, 'trecho', inverted, 'volta');
                                    }}
                                    className="opacity-0 group-hover/trecho:opacity-100 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shrink-0 shadow-lg"
                                    title="Inverter Rota"
                                  >
                                    <RefreshCw size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right font-black text-red-500 group/cell">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-red-500/10 hover:bg-red-500/30 rounded-lg text-red-500 transition-all shrink-0"
                                    title="Copiar Valor"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <input 
                                    type="text"
                                    value={row.valorNf}
                                    onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'volta')}
                                    className="w-full  bg-[#d2c2b2] border border-[#c0a892] text-[#4a3623] shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] rounded-lg py-1.5 px-3 text-right focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => saveVolta(voltaRows.filter((_, idx) => idx !== i))} 
                                  className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg shadow-rose-500/10"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div></div></section>
            </div>

            {/* Calculator Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/45 border-4 border-[#3A2414] p-1.5 rounded-3xl shadow-[0_8px_20px_rgba(58,36,20,0.06)] relative overflow-hidden h-full flex flex-col">
       <div className="border border-[#3A2414]/15 bg-[#fdfcf9] rounded-2xl p-6 flex flex-col flex-1 relative shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-[#3A2414] font-serif flex items-center gap-2 drop-shadow-sm uppercase">
                    <Calculator size={16} className="text-[#B32025]" />
                    Soma de Valores
                  </h3>
                  <button 
                    onClick={() => saveCalc(calcValues.map(() => ''))}
                    className="p-1.5 text-[#B32025] hover:underline text-shadow-sm font-serif ml-2 transition-colors cursor-pointer"
                    title="Resetar calculadora"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[#B32025] to-[#8c060d] rounded-xl p-6 mb-6 border border-[#3A2414]/25 shadow-md text-center relative group/total overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  <p className="text-[11px] font-black text-white/80 font-serif uppercase tracking-[0.2em] mb-2">Total Consolidado</p>
                  <h4 className="text-3xl font-black text-white tracking-tighter font-serif drop-shadow-md">
                    <span className="text-orange-200 mr-2 text-xl font-medium">R$</span>
                    {calculateTotal()}
                  </h4>
                  <div className="absolute top-3 right-3 opacity-0 group-hover/total:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={copyTotalRaw}
                      className={cn(
                        "p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center cursor-pointer",
                        totalRawCopied ? "bg-green-650 text-white" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                      title="Copiar Valor"
                    >
                      {totalRawCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] no-scrollbar pr-1">
                  {calcValues.map((val, i) => (
                    <div key={i} className="group relative flex items-center">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-[10px]">R$</div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateCalcValue(i, e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-white border border-[#3A2414]/15 rounded-xl pl-9 pr-20 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none transition-all placeholder:text-stone-300 shadow-sm"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {val && (
                          <button 
                            onClick={() => updateCalcValue(i, '')}
                            className="text-[#3A2414]/40 hover:text-[#B32025] hover:bg-[#B32025]/5 rounded-lg p-1.5 transition-all cursor-pointer"
                            title="Limpar Campo"
                          >
                            <X size={13} className="stroke-[2.5]" />
                          </button>
                        )}
                        {calcValues.length > 1 && (
                          <button 
                            onClick={() => saveCalc(calcValues.filter((_, idx) => idx !== i))}
                            className="text-[#3A2414]/40 hover:text-red-650 hover:bg-[#B32025]/5 rounded-lg p-1.5 transition-all cursor-pointer"
                            title="Remover Linha"
                          >
                            <Trash2 size={13} className="stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <motion.button 
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(179, 32, 37, 0.05)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={addCalcLine}
                      className="py-4 border-2 border-dashed border-[#3A2414]/20 hover:border-[#B32025] rounded-xl text-[#3A2414] hover:text-[#B32025] flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-[0.15em] bg-transparent cursor-pointer"
                    >
                      <Plus size={16} /> Adicionar Linha
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(225, 29, 72, 0.05)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => saveCalc(calcValues.map(() => ''))}
                      className="py-4 border-2 border-dashed border-rose-500/20 hover:border-rose-500 text-rose-500/80 hover:text-rose-500 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-[0.15em] bg-transparent cursor-pointer"
                      title="Limpar todos os valores adicionados"
                    >
                      <Trash2 size={16} /> Limpar Tudo
                    </motion.button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#3A2414]/15 bg-white/50 p-4 rounded-xl shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#B32025]/10 rounded-lg text-[#B32025] mt-1 border border-[#B32025]/15">
                        <Info size={14} />
                      </div>
                      <p className="text-[10px] text-[#3A2414]/85 leading-relaxed font-serif font-bold">
                        A calculadora aceita valores com pontos e vírgulas. A soma é atualizada em tempo real.
                      </p>
                    </div>
                </div>
              </div>
            </div>
              
              <div className="bg-[#fdfcf9] border border-[#3A2414]/15 p-4 flex items-center justify-between group cursor-pointer hover:border-[#B32025] transition-all rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={18} className="text-[#B32025] group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] font-black text-[#3A2414]/60 uppercase tracking-widest font-serif drop-shadow-sm">Última Atualização</p>
                    <p className="text-xs font-bold text-[#3A2414] font-serif">Agora mesmo</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#3A2414]/40 group-hover:text-[#B32025] transition-colors" />
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
