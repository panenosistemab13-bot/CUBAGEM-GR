import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Mail, 
  Truck, 
  Cpu, 
  User, 
  CreditCard, 
  Phone,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toAbsoluteUrl } from '../utils/url';
import mockupImg from '../assets/images/averba_o_interface_mockup_1780899726248.png';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface RawData {
  dataAverbacao: string;
  origem: string;
  destino: string;
  placaCav: string;
  placaCarr: string;
  nf: string;
  valorNf: string;
  somaVl: string;
  protocolo: string;
}

interface ExtraData {
  transportadora: string;
  tecnologia: string;
  nomeMotorista: string;
  cpf: string;
  telefone: string;
}

interface AverbacaoProps {
  onBack?: () => void;
  view: 'generator' | 'codes';
}

const DATA_PATH = 'averbacao_data/default';

export default function Averbacao({ onBack, view }: AverbacaoProps) {
  const [parsedRows, setParsedRows] = useState<RawData[]>([]);
  const [extraData, setExtraData] = useState<ExtraData>({
    transportadora: '',
    tecnologia: '',
    nomeMotorista: '',
    cpf: '',
    telefone: ''
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // First, try loading from local backup as an instant optimistic load/fallback
      const localSaved = localStorage.getItem('backup_averbacao_data');
      if (localSaved) {
        try {
          const data = JSON.parse(localSaved);
          if (data.parsedRows) setParsedRows(data.parsedRows);
          if (data.extraData) setExtraData(data.extraData);
        } catch (e) {
          console.error("Local backup parse error:", e);
        }
      }

      try {
        const docRef = doc(db, DATA_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.parsedRows) setParsedRows(data.parsedRows);
          if (data.extraData) setExtraData(data.extraData);
          // Sync back to local backup
          localStorage.setItem('backup_averbacao_data', JSON.stringify({
            parsedRows: data.parsedRows || [],
            extraData: data.extraData || {
              transportadora: '',
              tecnologia: '',
              nomeMotorista: '',
              cpf: '',
              telefone: ''
            }
          }));
        }
      } catch (error) {
        console.warn("Firestore offline or inaccessible. Operating with local backup:", error);
      }
    };
    fetchData();
  }, []);

  const saveData = async (rows: RawData[], extra: ExtraData) => {
    setParsedRows(rows);
    setExtraData(extra);
    
    // Always persist to local backup for offline-first resiliency
    localStorage.setItem('backup_averbacao_data', JSON.stringify({ parsedRows: rows, extraData: extra }));

    try {
      await setDoc(doc(db, DATA_PATH), { parsedRows: rows, extraData: extra });
    } catch (error) {
      console.warn("Failed to sync with Firestore (client might be offline):", error);
    }
  };

  const handleExtraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExtra = { ...extraData, [e.target.name]: e.target.value };
    await saveData(parsedRows, newExtra);
  };

  const clearData = async () => {
    const emptyRows: RawData[] = [];
    const emptyExtra: ExtraData = {
      transportadora: '',
      tecnologia: '',
      nomeMotorista: '',
      cpf: '',
      telefone: ''
    };
    await saveData(emptyRows, emptyExtra);
  };

  const parseInput = (text: string) => {
    const lines = text.trim().split('\n');
    const newRows: RawData[] = [];
    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 7) {
        newRows.push({
          dataAverbacao: parts[0] || '',
          origem: parts[1] || '',
          destino: parts[2] || '',
          placaCav: parts[3] || '',
          placaCarr: parts[4] || '',
          nf: parts[5] || '',
          valorNf: parts[6] || '',
          somaVl: parts[7] || '',
          protocolo: parts[8] || ''
        });
      }
    });
    if (newRows.length > 0) {
      saveData(newRows, extraData);
    }
  };

  const getTotalValue = () => {
    for (let i = parsedRows.length - 1; i >= 0; i--) {
      if (parsedRows[i].somaVl && parsedRows[i].somaVl.trim() !== '') return parsedRows[i].somaVl;
    }
    return 'R$ 0,00';
  };

  const getRoute = () => {
    if (parsedRows.length === 0) return 'ORIGEM x DESTINO';
    const row = parsedRows[0];
    return `${row.origem} x ${row.destino}`;
  };

  const getPlacasCarretas = () => [...new Set(parsedRows.map(r => r.placaCarr).filter(p => !!p))].join(' / ');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 && hour < 24) return 'Boa noite';
    return 'Bom dia';
  };

  const getProtocols = () => {
    const protocols = parsedRows
      .map(r => r.protocolo?.trim())
      .filter(p => !!p);
    return [...new Set(protocols)];
  };

  const copyToEmail = async () => {
    const greeting = getGreeting();
    const protocols = getProtocols();
    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14.5px; color: #000000; line-height: 1.6; padding: 25px 15px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; font-size: 14.5px; color: #000000;">${greeting}!</p>
        
        <p style="margin: 0 0 25px 0; font-size: 14.5px; color: #000000;">Segue <span style="background-color: #ffff00; font-weight: bold; padding: 1px 3px; border-radius: 2px;">averbação</span> realizada via sistema.</p>
        
        <p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000; text-transform: uppercase;">ROTA: ${getRoute().toUpperCase()}</p>
        ${protocols.length > 0 
          ? protocols.map(p => `<p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000;">PROTOCOLO: <span style="color: #0000ff;">${p}</span></p>`).join('') 
          : `<p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000;">PROTOCOLO: <span style="color: #0000ff;">---</span></p>`
        }
        <p style="margin: 0 0 25px 0; font-size: 14.5px; font-weight: bold; color: #000000;">Valor da Carga: <span style="color: #ff0000;">${getTotalValue()}</span></p>
        
        <p style="margin: 0 0 15px 0; font-size: 14.5px; color: #000000;">Segue dados e NF's em anexo.</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1.5px solid #000000; font-family: Arial, Helvetica, sans-serif; font-size: 11px; text-align: center; width: 100%; max-width: 900px; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #000000; color: #ffffff; text-transform: uppercase; font-weight: bold;">
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">ORIGEM</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">DESTINO</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">TRANSPORTADORA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">PLACA CAVALO</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 12%;">PLACAS CARRETAS</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">TECNOLOGIA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 12%;">NOME MOTORISTA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">CPF</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 10%;">TELEFONE</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-weight: bold; text-transform: uppercase; color: #000000;">
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${parsedRows[0]?.origem || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${parsedRows[0]?.destino || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.transportadora || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #cccccc;">${parsedRows[0]?.placaCav || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${getPlacasCarretas() || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.tecnologia || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.nomeMotorista || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.cpf || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.telefone || '---'}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin: 0; color: #000000; font-size: 14.5px;">Att,</p>
      </div>
    `;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([htmlContent], { type: 'text/html' }) })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen canvas-grid">
      {/* Sidebar - Artisan Plate */}
      <div className="w-full md:w-[320px] bg-[#E8D4B0] p-6 flex flex-col border-b-8 md:border-b-0 md:border-r-8 border-[#6B4423] shadow-2xl relative shrink-0">
        {onBack && (
          <button 
            onClick={onBack}
            className="md:hidden flex items-center justify-center gap-2 mb-4 w-full bg-[#3A2414] hover:bg-[#2D1A10] text-[#E8D4B0] py-3.5 rounded-xl font-black text-xs transition-all border border-[#C7A26A] shadow-md"
          >
            <LayoutGrid size={16} />
            VOLTAR AO MENU INICIAL
          </button>
        )}

        <div className="flex items-center gap-3 mb-6 bg-[#3A2414] p-4 rounded-xl border border-[#C7A26A]">
          <div className="w-12 h-12 bg-[#B32025] rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/20">3</div>
          <div>
            <h1 className="font-bold text-sm text-[#F2E4CC] tracking-widest uppercase">AVERBAÇÃO</h1>
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> MÓDULO ATIVO</p>
          </div>
        </div>
        
        {/* Input Fields */}
        <div className="space-y-4 flex-grow mb-6">
          {[
            { label: 'TRANSPORTADORA', key: 'transportadora', icon: Truck },
            { label: 'TECNOLOGIA', key: 'tecnologia', icon: Cpu },
            { label: 'NOME MOTORISTA', key: 'nomeMotorista', icon: User },
            { label: 'CPF', key: 'cpf', icon: CreditCard },
            { label: 'TELEFONE', key: 'telefone', icon: Phone }
          ].map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-[10px] font-black text-[#6B4423] flex items-center gap-2 uppercase tracking-wide"><field.icon size={12}/> {field.label}</label>
              <input name={field.key} value={(extraData as any)[field.key]} onChange={handleExtraChange} className="w-full p-3 rounded-lg border-2 border-[#C7A26A] bg-[#F2E4CC] text-xs font-bold text-[#2D1A10] placeholder-[#6B4423]/50 focus:border-[#B32025] focus:outline-none shadow-inner" placeholder="DIGITE..." />
            </div>
          ))}
        </div>
        
        <button onClick={copyToEmail} className="w-full bg-[#B32025] hover:bg-[#8c060a] text-white py-4 rounded-lg font-black text-xs mb-4 flex items-center justify-center gap-2 transition-all shadow-lg border-b-4 border-[#5a0f12]">
            <Mail size={16} /> {copied ? 'COPIADO!' : 'COPIAR PARA EMAIL'}
        </button>

        <button onClick={clearData} className="w-full bg-[#3A2414] hover:bg-[#2D1A10] text-[#E8D4B0] py-3 rounded-lg font-black text-[10px] mb-4 flex items-center justify-center gap-2 transition-all border-b-4 border-black/40">
            <Trash2 size={12} /> LIMPAR INFORMAÇÕES
        </button>

        <div className="bg-[#3A2414] p-4 rounded-lg text-[10px] text-[#F2E4CC] border-2 border-[#C7A26A] shadow-inner font-mono">
            <strong className="text-[#C7A26A]">DICA DE GESTÃO</strong><br/>Verifique os dados cuidadosamente antes de enviar.
        </div>
      </div>
      
      {/* Main - Artisan Report */}
      <div className="flex-1 p-4 sm:p-10 overflow-y-auto">
        {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] h-full text-[#6B4423] py-8">
               <div className="relative mb-6 group w-full max-w-sm flex justify-center">
                 <div className="absolute -inset-1 bg-gradient-to-r from-[#B32025] to-[#3A2414] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                 <img src={toAbsoluteUrl(mockupImg)} alt="Interface Mockup" className="relative w-72 sm:w-80 h-auto rounded-2xl shadow-2xl border-4 border-[#3A2414]/10 transform -rotate-2 hover:rotate-0 transition-all duration-500" />
               </div>
               <textarea onChange={(e) => parseInput(e.target.value)} placeholder="Cole os dados aqui..." className="w-full max-w-md h-48 p-6 border-4 border-dashed border-[#C7A26A] bg-[#fdfaf5] rounded-2xl text-center text-[#3A2414] placeholder-[#6B4423]/50 shadow-inner focus:border-[#B32025] focus:outline-none transition-all"/>
            </div>
        ) : (
            <div className="bg-white p-8 md:p-12 border border-[#d4c3a3] rounded-2xl shadow-xl max-w-4xl mx-auto font-sans text-stone-900 text-sm leading-relaxed relative">
              <div className="flex justify-between items-center border-b border-stone-200 pb-4 mb-8">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[#B32025] uppercase">PRÉ-VISUALIZAÇÃO DE ENVIO</span>
                  <h3 className="font-bold text-xs text-stone-400">EMAIL DE AVERBAÇÃO</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyToEmail} className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-black text-[10px] uppercase flex items-center gap-1.5 transition-all shadow-md cursor-pointer">
                    <Clipboard size={12} /> {copied ? 'COPIADO!' : 'COPIAR'}
                  </button>
                  <button onClick={clearData} className="px-3.5 py-1.5 bg-stone-100 hover:bg-[#B32025] hover:text-white text-stone-600 rounded-lg font-black text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer">
                    <Trash2 size={12} /> LIMPAR DADOS
                  </button>
                </div>
              </div>

              <div className="space-y-5 text-stone-900">
                <p className="font-medium">{getGreeting()}!</p>
                <p>Segue <span className="bg-yellow-300 font-bold px-1 py-0.5 rounded text-stone-950">averbação</span> realizada via sistema.</p>
                
                <div className="space-y-1.5 py-1 font-bold text-stone-950">
                  <p className="uppercase">ROTA: {getRoute().toUpperCase()}</p>
                  {getProtocols().length > 0 ? (
                    getProtocols().map(p => (
                      <p key={p}>PROTOCOLO: <span className="text-blue-600">{p}</span></p>
                    ))
                  ) : (
                    <p>PROTOCOLO: <span className="text-blue-600">---</span></p>
                  )}
                  <p>Valor da Carga: <span className="text-red-600">{getTotalValue()}</span></p>
                </div>

                <p>Segue dados e NF's em anexo.</p>

                <div className="overflow-x-auto my-6 border border-stone-900 rounded-lg shadow-sm">
                  <table className="w-full text-center text-xs border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-black text-white uppercase font-bold text-[10px]">
                        <th className="p-3 border border-stone-900">ORIGEM</th>
                        <th className="p-3 border border-stone-900">DESTINO</th>
                        <th className="p-3 border border-stone-900">TRANSPORTADORA</th>
                        <th className="p-3 border border-stone-900">PLACA CAVALO</th>
                        <th className="p-3 border border-stone-900">PLACAS CARRETAS</th>
                        <th className="p-3 border border-stone-900">TECNOLOGIA</th>
                        <th className="p-3 border border-stone-900">NOME MOTORISTA</th>
                        <th className="p-3 border border-stone-900">CPF</th>
                        <th className="p-3 border border-stone-900">TELEFONE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold text-[#000000] uppercase divide-x divide-stone-900">
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{parsedRows[0]?.origem || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{parsedRows[0]?.destino || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{extraData.transportadora || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#cccccc]">{parsedRows[0]?.placaCav || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{getPlacasCarretas() || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{extraData.tecnologia || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{extraData.nomeMotorista || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{extraData.cpf || '---'}</td>
                        <td className="p-4 border-t border-stone-900 bg-[#ffff00]">{extraData.telefone || '---'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="pt-2">Att,</p>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
