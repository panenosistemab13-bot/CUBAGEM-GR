import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  User,
  CreditCard,
  Phone,
  Info,
  Sliders,
  Send,
  Sparkles,
  FileText,
  Truck,
  Cpu,
  Image,
  MapPin,
  Search,
  Package,
  Hash,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Battery,
} from "lucide-react";
import { cn } from "../lib/utils";
import { rtdb as db } from "../firebase";
import { ref, onValue, set, update } from "firebase/database";

// Vintage Screw component
function Screw({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className,
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

const TRANSPORTADORAS = [
  "apk",
  "tomasi",
  "moedense",
  "Frota 3C",
  "TRANSMAGNA",
  "RNCGG",
  "GT MINAS",
  "GOBOR",
  "SRH SARAIVA",
  "PACTUAL",
  "JETTA",
  "TECPET",
  "TRANS DANIEL",
  "UTISEG TRANSPORTES E LOCACOES LTDA",
  "COMBOIO",
  "REAL 94",
  "TORNADO",
  "FUJIOKA",
  "MERCOTRUCK",
  "UNITRADING LOG",
];

const EMBARQUE_IMAGES = [
  { value: "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF", label: "Paletizado (Padrão)" },
  {
    value: "https://lh3.googleusercontent.com/d/1L3oKNxekiqIQ_Uy8L9a7q8qZwx772qmH",
    label: "Carga Batida (Padrão)",
  },
  { value: "https://lh3.googleusercontent.com/d/1RdjcMTVC2ofuxQVzajM0S01VSMAXLaMf", label: "AMARELIN" },
  { value: "https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh", label: "SUPERIOR BATIDO" },
  { value: "https://lh3.googleusercontent.com/d/1JGe0rvxIMqBpMMxclgFpQj47GqVl1VMX", label: "CASTANHA" },
  { value: "https://lh3.googleusercontent.com/d/1kI3l33NFrTlqnDveMgKWHfFfU5WA6OTQ", label: "IZOTONICO" },
  { value: "none", label: "Nenhum Embarque" },
];

const DESTINOS_OPCOES = [
  "SANTA LUZIA/MG x RIO DE JANEIRO/RJ",
  "SANTA LUZIA/MG x GUARULHOS/SP",
  "SANTA LUZIA/MG x BRASÍLIA/DF",
  "SANTA LUZIA/MG x PINHAIS/PR",
  "SANTA LUZIA/MG x MONTES CLAROS/MG",
  "SANTA LUZIA/MG x LONDRINA/PR",
  "SANTA LUZIA/MG x VIANA/ES",
  "SANTA LUZIA/MG x 3 CAFFI",
  "SANTA LUZIA/MG x CAMPO GRANDE/MS",
  "SANTA LUZIA/MG x CLIENTE",
  "SANTA LUZIA/MG x CUIABÁ/MT",
  "SANTA LUZIA/MG x EUSÉBIO/CE",
  "SANTA LUZIA/MG x EXPORTAÇÃO",
  "SANTA LUZIA/MG x GOV. CELSO RAMOS/SC",
  "SANTA LUZIA/MG x GRAVATAÍ/RS",
  "SANTA LUZIA/MG x JUIZ DE FORA/MG",
  "SANTA LUZIA/MG x MANAUS/AM",
  "SANTA LUZIA/MG x MOSSORÓ/RN",
  "SANTA LUZIA/MG x NATAL/RN",
  "SANTA LUZIA/MG x ARIQUEMES/RO",
  "SANTA LUZIA/MG x RECIFE/PE",
  "SANTA LUZIA/MG x SALVADOR/BA",
  "SANTA LUZIA/MG x SANTA LUZIA/MG",
  "SANTA LUZIA/MG x SMART",
  "SANTA LUZIA/MG x SUMARÉ/SP",
  "SANTA LUZIA/MG x TOTAL SERVICE",
  "SANTA LUZIA/MG x VESPASIANO/MG",
  "SANTA LUZIA/MG x BEBEDOURO/SP",
  "SANTA LUZIA/MG x CASTRO/PR",
  "SANTA LUZIA/MG x JUNDIAÍ/SP",
  "SANTA LUZIA/MG x DMA",
  "SANTA LUZIA/MG x PATROCÍNIO PAULISTA/SP",
  "SANTA LUZIA/MG x VARGEM GRANDE DO SUL/SP",
  "SANTA LUZIA/MG x SUPERFRIO",
  "SANTA LUZIA/MG x TRIANGULO/SP",
  "SANTA LUZIA/MG x NATAL/RN x EUSÉBIO/CE",
  "SANTA LUZIA/MG x BARRA VELHA/SC",
  "SANTA LUZIA/MG x UBERLÂNDIA/MG",
  "SANTA LUZIA/MG x CONTAGEM/MG",
  "SANTA LUZIA/MG x POUSO ALEGRE/MG",
  "SANTA LUZIA/MG x CONDOR x CURITIBA/PR",
  "SANTA LUZIA/MG x MUFFATO x CAMBÉ/PR",
  "SANTA LUZIA/MG x DESTRO x CURITIBA/PR",
  "SANTA LUZIA/MG x CUIABÁ/MT x ARIQUEMES/RO",
  "SANTA LUZIA/MG x PORTO ALEGRE/RS",
  "SANTA LUZIA/MG x CECONSUD",
  "SANTA LUZIA/MG x FUJIOKA x BRASÍLIA/DF",
  "SANTA LUZIA/MG x XAXIM/SC",
  "SANTA LUZIA/MG x TERESINA/PI",
  "SANTA LUZIA/MG x BARBALHA/CE",
  "SANTA LUZIA/MG x CSD x PAIÇANDU/PR",
  "SANTA LUZIA/MG x CARIACICA/ES",
  "SANTA LUZIA/MG x CAMPO GRANDE/MS x CUIABÁ/MT",
  "SANTA LUZIA/MG x MACEIÓ/AL",
  "SANTA LUZIA/MG x EF SOLUÇÕES LOG x GUARULHOS/SP",
  "SANTA LUZIA/MG x JOÃO PESSOA/PB",
  "SANTA LUZIA/MG x BELÉM/PA",
];

const ORIGEM_OPCOES = [
  "SANTA LUZIA/MG",
  "VIANA/ES",
  "SERRA/ES",
  "CARIACICA/ES",
  "MONTES CLAROS/MG",
  "SMART/MG",
  "TOTAL SERVICE/MG",
  "CUIABÁ/MT",
  "JUIZ DE FORA/MG",
];

interface ControleProps {
  onBack?: () => void;
}

export default function Controle({ onBack }: ControleProps) {
  // State for all form fields
  const [numCarretas, setNumCarretas] = useState<1 | 2>(2);
  const [alertaResgate, setAlertaResgate] = useState(
    "FAVOR SE ATENTAR AO RESGATE!",
  );
  const [infoAbaixo, setInfoAbaixo] = useState(
    "Atentar às informações abaixo:",
  );

  // Routes & Warning lines
  const [origem, setOrigem] = useState("SANTA LUZIA/MG");
  const [rota1, setRota1] = useState("");
  const [instrucao1, setInstrucao1] = useState("* Favor, acusar o recebimento do pré-alerta;");

  // Table information (CCC.PNG layout)
  const [nfInicio, setNfInicio] = useState("");
  const [nfFim, setNfFim] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [motorista, setMotorista] = useState("");
  const [cavalo, setCavalo] = useState("");

  // Row 1 lists (Carreta 1, Isca 1, Produto 1, UMA 1)
  const [carreta1, setCarreta1] = useState("");
  const [carreta2, setCarreta2] = useState("");
  const [isca1, setIsca1] = useState("");
  const [isca2, setIsca2] = useState("");
  const [produto1, setProduto1] = useState("");
  const [produto2, setProduto2] = useState("");
  const [uma1, setUma1] = useState("");
  const [uma2, setUma2] = useState("");

  const [destino, setDestino] = useState("");
  const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const months = [
      "jan.",
      "fev.",
      "mar.",
      "abr.",
      "mai.",
      "jun.",
      "jul.",
      "ago.",
      "set.",
      "out.",
      "nov.",
      "dez.",
    ];
    return `${day}-${months[now.getMonth()]}`;
  };

  const formatUMA = (value: string) => {
    // Remove all non-numeric characters
    let digits = value.replace(/\D/g, "");

    // If first digit is '9' or '6', do not add leading '0' nor any dots, and allow up to 14 digits
    if (digits.length > 0 && (digits[0] === "9" || digits[0] === "6")) {
      return digits.substring(0, 14);
    }

    // Only add '0' automatically if there are 11 digits and it doesn't start with '0' (meaning 1 digit is missing out of 12)
    if (digits.length === 11 && digits[0] !== "0") {
      digits = "0" + digits;
    }

    // Limit to 12 digits (0XXX.XXX.XXX.XXX pattern)
    digits = digits.substring(0, 12);

    // Apply dots every 3 characters
    let formatted = "";
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ".";
      }
      formatted += digits[i];
    }
    return formatted;
  };

  const getInitialGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia,";
    if (hour < 18) return "Boa tarde,";
    return "Boa noite,";
  };

  const [dataEnviada, setDataEnviada] = useState(getFormattedDate());
  const [saudacao, setSaudacao] = useState(getInitialGreeting());

  useEffect(() => {
    setDataEnviada(getFormattedDate());
    setSaudacao(getInitialGreeting());
  }, []);

  // Parametrização and Esquema de Embarque
  const [parametrizacao, setParametrizacao] = useState(
    "Parametrização das Iscas",
  );
  const [esquemaEmbarque, setEsquemaEmbarque] = useState(
    "CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA",
  );

  // Isca positions (addresses, times and battery level) matching the image exactly
  const [isca1Endereco, setIsca1Endereco] = useState("");
  const [isca2Endereco, setIsca2Endereco] = useState("");
  const [isca1Data, setIsca1Data] = useState("");
  const [isca2Data, setIsca2Data] = useState("");
  const [isca1Bateria, setIsca1Bateria] = useState("");
  const [isca2Bateria, setIsca2Bateria] = useState("");

  // Interactive ladders for Esquema de Embarque
  const [ladder1, setLadder1] = useState<string[][]>(() => {
    const grid = Array(12)
      .fill(null)
      .map(() => Array(2).fill(""));
    grid[0][0] = "P";
    return grid;
  });
  const [ladder2, setLadder2] = useState<string[][]>(() => {
    const grid = Array(12)
      .fill(null)
      .map(() => Array(2).fill(""));
    grid[0][0] = "P";
    return grid;
  });

  // Sidebar specific inputs (COLUNA.PNG layout)
  const [sidebarTransportadora, setSidebarTransportadora] =
    useState("moedense");
  const [sidebarTecnologia, setSidebarTecnologia] = useState("SASCAR");
  const [sidebarMotorista, setSidebarMotorista] = useState(
    "MARISON REZENDE LEMOS",
  );
  const [sidebarEmbarque1, setSidebarEmbarque1] = useState("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
  const [sidebarEmbarque2, setSidebarEmbarque2] = useState("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
  const [searchRota, setSearchRota] = useState("");
  const [pastePlanilha, setPastePlanilha] = useState("");

  // Prefixes and Suffixes for N° ISCAS (individual prefixes)
  const [iscaPrefix1, setIscaPrefix1] = useState("R10000");
  const [iscaPrefix2, setIscaPrefix2] = useState("R10000");
  const [iscaSuffix1, setIscaSuffix1] = useState("2195");
  const [iscaSuffix2, setIscaSuffix2] = useState("3797");

  const [copied, setCopied] = useState(false);
  const [copiedAssunto, setCopiedAssunto] = useState(false);
  const [ocultarNotas, setOcultarNotas] = useState(false);
  const [customTransportadoras, setCustomTransportadoras] = useState<string[]>([]);
  const [newTranspName, setNewTranspName] = useState("");
  const [isAddingTransp, setIsAddingTransp] = useState(false);

  const allTransportadoras = [...TRANSPORTADORAS, ...customTransportadoras];

  // Sync transportadora and motorista states when either updates, keeping both sections intuitive
  const handleSidebarTranspChange = (val: string) => {
    setSidebarTransportadora(val);
    setTransportadora(val);
  };

  const handleSidebarMotoristaChange = (val: string) => {
    setSidebarMotorista(val);
    setMotorista(val);
  };

  const handleTableTranspChange = (val: string) => {
    setTransportadora(val);
    setSidebarTransportadora(val);
  };

  const handleTableMotoristaChange = (val: string) => {
    setMotorista(val);
    setSidebarMotorista(val);
  };

  const handleAddCustomTransp = () => {
    const trimmed = newTranspName.trim();
    if (!trimmed) return;
    
    const exists = allTransportadoras.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert("Esta transportadora já está cadastrada!");
      return;
    }

    const updated = [...customTransportadoras, trimmed];
    setCustomTransportadoras(updated);
    setSidebarTransportadora(trimmed);
    setTransportadora(trimmed);
    setNewTranspName("");
    setIsAddingTransp(false);
  };

  const handleIsca1Change = (val: string) => {
    setIsca1(val);
    if (val.startsWith(iscaPrefix1)) {
      setIscaSuffix1(val.substring(iscaPrefix1.length));
    } else {
      const prefixes = ["R100000", "R10000", "30D10000"];
      const matched = prefixes.find((p) => val.startsWith(p));
      if (matched) {
        setIscaPrefix1(matched);
        setIscaSuffix1(val.substring(matched.length));
      } else {
        setIscaSuffix1(val);
      }
    }
  };

  const handleIsca2Change = (val: string) => {
    setIsca2(val);
    if (val.startsWith(iscaPrefix2)) {
      setIscaSuffix2(val.substring(iscaPrefix2.length));
    } else {
      const prefixes = ["R100000", "R10000", "30D10000"];
      const matched = prefixes.find((p) => val.startsWith(p));
      if (matched) {
        setIscaPrefix2(matched);
        setIscaSuffix2(val.substring(matched.length));
      } else {
        setIscaSuffix2(val);
      }
    }
  };

  const handlePastePlanilhaChange = (text: string) => {
    setPastePlanilha(text);
    if (!text.trim()) return;

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    interface ParsedIsca {
      id: string;
      endereco: string;
      data: string;
      bateria: string;
    }
    const parsedItems: ParsedIsca[] = [];

    lines.forEach((line) => {
      const matchIsca = line.match(/^(\S+)/);
      if (!matchIsca) return;
      const iscaId = matchIsca[1];

      // Match DD/MM/YYYY HH:MM:SS or HH:MM
      const dateRegex =
        /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})|(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/;
      const matchDate = line.match(dateRegex);

      let address = "";
      let dateVal = "";
      let batteryVal = "100%";

      if (matchDate && matchDate.index !== undefined) {
        dateVal = matchDate[0];
        const dateIndex = matchDate.index;

        address = line.substring(iscaId.length, dateIndex).trim();

        const remaining = line.substring(dateIndex + dateVal.length).trim();
        const matchBattery = remaining.match(/(\d+%)/);
        if (matchBattery) {
          batteryVal = matchBattery[1];
        }
      } else {
        const parts = line.split(/\s+/);
        if (parts.length > 1) {
          address = parts.slice(1).join(" ");
        }
      }

      parsedItems.push({
        id: iscaId,
        endereco: address,
        data: dateVal,
        bateria: batteryVal,
      });
    });

    let matchedIsca1 = false;
    let matchedIsca2 = false;
    const matchedItemIndices = new Set<number>();

    // Pass 1: Try to match by current suffix/ID to preserve assignment if already entered
    parsedItems.forEach((item, index) => {
      const cleanId = item.id.toUpperCase();
      const cleanIsca1 = isca1.toUpperCase();
      const cleanIscaSuffix1 = iscaSuffix1.toUpperCase();
      const cleanIsca2 = isca2.toUpperCase();
      const cleanIscaSuffix2 = iscaSuffix2.toUpperCase();

      const isMatch1 =
        cleanIscaSuffix1.length >= 3 &&
        (cleanId.includes(cleanIscaSuffix1) || cleanIsca1.includes(cleanId));
      const isMatch2 =
        cleanIscaSuffix2.length >= 3 &&
        (cleanId.includes(cleanIscaSuffix2) || cleanIsca2.includes(cleanId));

      if (isMatch1 && !matchedIsca1) {
        setIsca1(item.id);
        setIsca1Endereco(item.endereco);
        setIsca1Data(item.data);
        setIsca1Bateria(item.bateria);
        handleIsca1Change(item.id);
        matchedIsca1 = true;
        matchedItemIndices.add(index);
      } else if (isMatch2 && !matchedIsca2) {
        setIsca2(item.id);
        setIsca2Endereco(item.endereco);
        setIsca2Data(item.data);
        setIsca2Bateria(item.bateria);
        handleIsca2Change(item.id);
        matchedIsca2 = true;
        matchedItemIndices.add(index);
      }
    });

    // Pass 2: Assign unmatched items to remaining unmatched slots in order
    parsedItems.forEach((item, index) => {
      if (matchedItemIndices.has(index)) return;

      if (!matchedIsca2) {
        setIsca2(item.id);
        setIsca2Endereco(item.endereco);
        setIsca2Data(item.data);
        setIsca2Bateria(item.bateria);
        handleIsca2Change(item.id);
        matchedIsca2 = true;
        matchedItemIndices.add(index);
      } else if (!matchedIsca1) {
        setIsca1(item.id);
        setIsca1Endereco(item.endereco);
        setIsca1Data(item.data);
        setIsca1Bateria(item.bateria);
        handleIsca1Change(item.id);
        matchedIsca1 = true;
        matchedItemIndices.add(index);
      }
    });

    if (parsedItems.length === 1) {
      setNumCarretas(1);
    } else if (parsedItems.length >= 2) {
      setNumCarretas(2);
    }
  };

  const STORAGE_KEY = "controle_pgr_data";

  // Sync initial values and load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.numCarretas !== undefined) setNumCarretas(data.numCarretas);
        if (data.alertaResgate !== undefined) setAlertaResgate(data.alertaResgate);
        if (data.infoAbaixo !== undefined) setInfoAbaixo(data.infoAbaixo);
        if (data.origem !== undefined) setOrigem(data.origem);
        if (data.rota1 !== undefined) setRota1(data.rota1);
        if (data.instrucao1 !== undefined) setInstrucao1(data.instrucao1);
        if (data.nfInicio !== undefined) setNfInicio(data.nfInicio);
        if (data.nfFim !== undefined) setNfFim(data.nfFim);
        if (data.transportadora !== undefined) setTransportadora(data.transportadora);
        if (data.motorista !== undefined) setMotorista(data.motorista);
        if (data.cavalo !== undefined) setCavalo(data.cavalo);
        if (data.carreta1 !== undefined) setCarreta1(data.carreta1);
        if (data.carreta2 !== undefined) setCarreta2(data.carreta2);
        if (data.isca1 !== undefined) setIsca1(data.isca1);
        if (data.isca2 !== undefined) setIsca2(data.isca2);
        if (data.produto1 !== undefined) setProduto1(data.produto1);
        if (data.produto2 !== undefined) setProduto2(data.produto2);
        if (data.uma1 !== undefined) setUma1(data.uma1);
        if (data.uma2 !== undefined) setUma2(data.uma2);
        if (data.destino !== undefined) setDestino(data.destino);
        if (data.parametrizacao !== undefined) setParametrizacao(data.parametrizacao);
        if (data.esquemaEmbarque !== undefined) setEsquemaEmbarque(data.esquemaEmbarque);
        if (data.isca1Endereco !== undefined) setIsca1Endereco(data.isca1Endereco);
        if (data.isca2Endereco !== undefined) setIsca2Endereco(data.isca2Endereco);
        if (data.isca1Data !== undefined) setIsca1Data(data.isca1Data);
        if (data.isca2Data !== undefined) setIsca2Data(data.isca2Data);
        if (data.isca1Bateria !== undefined) setIsca1Bateria(data.isca1Bateria);
        if (data.isca2Bateria !== undefined) setIsca2Bateria(data.isca2Bateria);
        if (data.ladder1 !== undefined) setLadder1(data.ladder1);
        if (data.ladder2 !== undefined) setLadder2(data.ladder2);
        if (data.sidebarTransportadora !== undefined) setSidebarTransportadora(data.sidebarTransportadora);
        if (data.sidebarTecnologia !== undefined) setSidebarTecnologia(data.sidebarTecnologia);
        if (data.sidebarMotorista !== undefined) setSidebarMotorista(data.sidebarMotorista);
        if (data.sidebarEmbarque1 !== undefined) setSidebarEmbarque1(data.sidebarEmbarque1);
        if (data.sidebarEmbarque2 !== undefined) setSidebarEmbarque2(data.sidebarEmbarque2);
        if (data.iscaPrefix1 !== undefined) setIscaPrefix1(data.iscaPrefix1);
        if (data.iscaPrefix2 !== undefined) setIscaPrefix2(data.iscaPrefix2);
        if (data.iscaSuffix1 !== undefined) setIscaSuffix1(data.iscaSuffix1);
        if (data.iscaSuffix2 !== undefined) setIscaSuffix2(data.iscaSuffix2);
        if (data.customTransportadoras !== undefined) setCustomTransportadoras(data.customTransportadoras);
      } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
      }
    } else {
      setSidebarTransportadora(transportadora);
      setSidebarMotorista(motorista);
    }
  }, []);

  // Save to localStorage whenever a state changes
  useEffect(() => {
    const dataToSave = {
      numCarretas,
      alertaResgate,
      infoAbaixo,
      origem,
      rota1,
      instrucao1,
      nfInicio,
      nfFim,
      transportadora,
      motorista,
      cavalo,
      carreta1,
      carreta2,
      isca1,
      isca2,
      produto1,
      produto2,
      uma1,
      uma2,
      destino,
      parametrizacao,
      esquemaEmbarque,
      isca1Endereco,
      isca2Endereco,
      isca1Data,
      isca2Data,
      isca1Bateria,
      isca2Bateria,
      ladder1,
      ladder2,
      sidebarTransportadora,
      sidebarTecnologia,
      sidebarMotorista,
      sidebarEmbarque1,
      sidebarEmbarque2,
      iscaPrefix1,
      iscaPrefix2,
      iscaSuffix1,
      iscaSuffix2,
      customTransportadoras,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    numCarretas,
    alertaResgate,
    infoAbaixo,
    origem,
    rota1,
    instrucao1,
    nfInicio,
    nfFim,
    transportadora,
    motorista,
    cavalo,
    carreta1,
    carreta2,
    isca1,
    isca2,
    produto1,
    produto2,
    uma1,
    uma2,
    destino,
    parametrizacao,
    esquemaEmbarque,
    isca1Endereco,
    isca2Endereco,
    isca1Data,
    isca2Data,
    isca1Bateria,
    isca2Bateria,
    ladder1,
    ladder2,
    sidebarTransportadora,
    sidebarTecnologia,
    sidebarMotorista,
    sidebarEmbarque1,
    sidebarEmbarque2,
    iscaPrefix1,
    iscaPrefix2,
    iscaSuffix1,
    iscaSuffix2,
    customTransportadoras,
  ]);

  const handleClear = () => {
    if (
      window.confirm(
        "Deseja realmente limpar todas as informações do controle?",
      )
    ) {
      setNumCarretas(2);
      setSaudacao(getInitialGreeting());
      setAlertaResgate("Favor se atentar ao resgate!");
      setInfoAbaixo("Atentar às informações abaixo:");
      setOrigem("SANTA LUZIA/MG");
      setRota1("");
      setInstrucao1("* Favor, acusar o recebimento do pré-alerta;");
      setNfInicio("");
      setNfFim("");
      setTransportadora("");
      setMotorista("");
      setCavalo("");
      setCarreta1("");
      setCarreta2("");
      setIsca1("");
      setIsca2("");
      setProduto1("");
      setProduto2("");
      setUma1(formatUMA("0"));
      setUma2(formatUMA("0"));
      setDestino("");
      setDataEnviada(getFormattedDate());
      setParametrizacao("Parametrização das iscas");
      setEsquemaEmbarque(
        "CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA",
      );

      setIsca1Endereco("");
      setIsca2Endereco("");
      setIsca1Data("");
      setIsca2Data("");
      setIsca1Bateria("");
      setIsca2Bateria("");

      setLadder1(() => {
        const grid = Array(12)
          .fill(null)
          .map(() => Array(2).fill(""));
        grid[0][0] = "P";
        return grid;
      });
      setLadder2(() => {
        const grid = Array(12)
          .fill(null)
          .map(() => Array(2).fill(""));
        grid[0][0] = "P";
        return grid;
      });

      setSidebarTransportadora("");
      setSidebarTecnologia("");
      setSidebarMotorista("");
      setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
      setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
      setPastePlanilha("");

      setIscaPrefix1("R10000");
      setIscaPrefix2("R10000");
      setIscaSuffix1("");
      setIscaSuffix2("");
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Function to build and copy HTML template for Email pasting
  const handleCopyToEmail = async () => {
    // Helper to render ladder visual grid inside email HTML matching the provided style
    const renderLadderHtml = (
      grid: string[][],
      label: string,
      plate: string,
      extraStyle: string = "",
    ) => {
      return `
        <td style="vertical-align: top; width: 50%; text-align: center; ${extraStyle}">
          
          <table cellpadding="0" cellspacing="0" style="width: 75px; margin: 0 auto; border-collapse: collapse;">
            <tr>
              <td colspan="2" style="background-color: #4A131E; color: #FFFFFF; font-size: 9px; font-weight: bold; padding: 5px 0; border: 1px solid #4A131E; text-transform: uppercase; text-align: center;">${label}</td>
            </tr>
            ${grid
              .map((row) => {
                return `
                <tr>
                  ${row
                    .map((cell) => {
                      const bg = cell === "P" ? "#6C061D" : "#FFFFFF";
                      const color = cell === "P" ? "#FFFFFF" : "#000000";
                      return `<td style="border: 1px solid #5A5A5A; background-color: ${bg}; color: ${color}; font-size: 10px; font-weight: bold; width: 50%; height: 18px; text-align: center; vertical-align: middle;">${cell === "P" ? "P" : ""}</td>`;
                    })
                    .join("")}
                </tr>`;
              })
              .join("")}
          </table>
          
          <p style="font-size: 11px; font-weight: bold; color: #521521; margin-top: 15px; text-transform: uppercase;">${plate}</p>
        </td>
      `;
    };

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; background-color: #FFFFFF; padding: 20px; color: #3e2516; max-width: 850px; border-radius: 4px;">
        
        <!-- Saudação -->
        <p style="font-family: 'Georgia', serif; font-weight: 900; font-style: italic; color: #3e2516; font-size: 14px; margin-bottom: 15px; margin-top: 0; padding: 0;">${saudacao || "Boa tarde,"}</p>
        
        <!-- Alerta Vinho Banner -->
        <div style="background-color: #7A0C22; color: #FFFFFF; font-weight: 900; padding: 10px 15px; display: inline-block; margin-bottom: 20px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
          ${alertaResgate || "FAVOR SE ATENTAR AO RESGATE!"}
        </div>
        
        <p style="font-weight: 900; font-size: 13px; margin-bottom: 14px; color: #3e2516;">${infoAbaixo || "Atentar às informações abaixo:"}</p>
        
        <!-- Caixa de Observações (Double Border effect) -->
        <div style="border: 1px solid #c5ab92; background-color: #EFE3CD; padding: 3px; margin-bottom: 24px; max-width: 580px;">
          <div style="border: 1px solid #c5ab92; padding: 12px; font-size: 12px; font-weight: bold; color: #3e2516; line-height: 1.6; background-color: #EFE3CD;">
            <div style="margin-bottom: 8px;">
              <span style="color: #c5ab92; margin-right: 8px;">•</span> ${rota1}
            </div>
            <div>
              <span style="color: #c5ab92; margin-right: 8px;">•</span> ${instrucao1}
            </div>
          </div>
        </div>

        <!-- TABELA 1: PRÉ-ALERTA DE ISCA EMBARCADA -->
        <table style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; font-size: 12px; text-align: center; font-weight: bold; color: #000000; margin-bottom: 25px; border: 1px solid #c5ab92;">
          <thead>
            <tr style="border: 1px solid #c5ab92;">
              <th colspan="2" style="background: linear-gradient(to bottom, #7A0C22, #44030E); background-color: #7A0C22; color: #FFFFFF; border-right: 1px solid #c5ab92; font-weight: 900; padding: 10px; text-transform: uppercase; font-size: 11px; width: 25%;">NÚMERO DA NF:</th>
              <th colspan="1" style="border-right: 1px solid #c5ab92; padding: 6px; width: 15%; background-color: #EFE3CD; text-align: center; font-family: sans-serif; font-size: 11px; line-height: 1.2;">
                <div style="font-weight: 900; color: #000000; text-align: center; width: 100%;">${nfInicio.replace(/-/g, '') || '&nbsp;'}</div>
                ${numCarretas === 2 && isca2 !== "SEM ISCA" ? `
                  <div style="font-weight: 900; color: #000000; text-align: center; width: 100%;">${nfFim.replace(/-/g, '') || nfInicio.replace(/-/g, '') || '&nbsp;'}</div>
                ` : ''}
              </th>
              <th colspan="1" style="background: linear-gradient(to bottom, #7A0C22, #44030E); background-color: #7A0C22; color: #FFFFFF; border-right: 1px solid #c5ab92; font-weight: 900; padding: 10px; text-transform: uppercase; font-size: 11px; width: 18%;">TRANSPORTADORA:</th>
              <th colspan="2" style="border-right: 1px solid #c5ab92; padding: 6px; width: 25%; background-color: #EFE3CD; text-transform: uppercase; font-weight: 900;">${transportadora}</th>
              <th colspan="2" style="background: linear-gradient(to bottom, #7A0C22, #44030E); background-color: #7A0C22; width: 17%;"></th>
            </tr>
            <tr style="background: linear-gradient(to bottom, #7A0C22, #44030E); background-color: #7A0C22; color: #FFFFFF; text-transform: uppercase; font-size: 10px; font-weight: 900;">
              <th style="border-right: 1px solid #c5ab92; border-bottom: 1px solid #c5ab92; padding: 8px; width: 22%;">MOTORISTA</th>
              <th style="border-right: 1px solid #c5ab92; border-bottom: 1px solid #c5ab92; padding: 8px; width: 11%;">CAVALO</th>
              <th style="border-right: 1px solid #c5ab92; border-bottom: 1px solid #c5ab92; padding: 8px; width: 11%;">CARRETAS</th>
              <th style="border-right: 1px solid #c5ab92; border-bottom: 1px solid #c5ab92; padding: 8px; width: 13%;">N° ISCA</th>
              <th style="border-right: 1px solid #c5ab92; border-bottom: 1px solid #c5ab92; padding: 8px; width: 14%;">PRODUTO EMBARCADO</th>
              <th style="border-right: 1px solid #c5ab92; border-bottom: 1px solid #c5ab92; padding: 8px; width: 15%;">CÓDIGO U.M.A.</th>
              <th style="border-right: 1px solid #c5ab92; border-bottom: 1px solid #c5ab92; padding: 8px; width: 11%;">DESTINO</th>
              <th style="border-bottom: 1px solid #c5ab92; padding: 8px; width: 11%;">DATA PARTIDA</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #c5ab92; text-align: center; background-color: #EFE3CD;">
              <td rowspan="${numCarretas}" style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; text-transform: uppercase; font-size: 11px;">${motorista}</td>
              <td rowspan="${numCarretas}" style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: 900; text-transform: uppercase; font-size: 13px; text-decoration: underline;">${cavalo.replace(/-/g, '')}</td>
              <td style="border-right: 1px solid #c5ab92; padding: 10px; text-transform: uppercase; font-weight: bold;">${carreta1}</td>
              <td style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; font-size: 13px; color: #FF0000;">${isca1}</td>
              <td style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; font-size: 13px;">${produto1}</td>
              <td style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; font-size: 13px;">${uma1}</td>
              <td rowspan="${numCarretas}" style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; text-transform: uppercase; font-size: 11px;">${destino}</td>
              <td rowspan="${numCarretas}" style="padding: 10px; font-weight: bold; font-size: 12px;">${dataEnviada}</td>
            </tr>
            ${
              numCarretas === 2
                ? `
            <tr style="border-bottom: 1px solid #c5ab92; text-align: center; background-color: #EFE3CD;">
              <td style="border-right: 1px solid #c5ab92; padding: 10px; text-transform: uppercase; font-weight: bold;">${carreta2}</td>
              <td style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; font-size: 13px; color: #FF0000;">${isca2}</td>
              <td style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; font-size: 13px;">${produto2}</td>
              <td style="border-right: 1px solid #c5ab92; padding: 10px; font-weight: bold; font-size: 13px;">${uma2}</td>
            </tr>
            `
                : ""
            }
          </tbody>
        </table>

        <!-- TABELA 2: PARAMETRIZAÇÃO DAS ISCAS -->
        <table style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; font-size: 11px; text-align: center; font-weight: bold; color: #333333; margin-bottom: 30px; border: 1px solid #c5ab92;">
          <tr style="background: linear-gradient(to bottom, #7A0C22, #44030E); background-color: #7A0C22; color: #FFFFFF; font-size: 12px;">
            <td colspan="4" style="padding: 10px; border: 1px solid #c5ab92; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">PARAMETRIZAÇÃO DAS ISCAS</td>
          </tr>
          <tr style="background: linear-gradient(to bottom, #7A0C22, #44030E); background-color: #7A0C22; color: #FFFFFF; font-size: 10px;">
            <td style="padding: 8px; border: 1px solid #c5ab92; width: 25%;">
              <span style="background-color: #FFFFFF; color: #000000; padding: 2px 6px; border-radius: 2px; font-size: 9px; text-transform: uppercase; font-weight: 900;">
                ${numCarretas === 2 && isca2 !== "SEM ISCA" ? `${isca1} ${isca2}` : isca1}
              </span>
            </td>
            <td style="padding: 8px; border: 1px solid #c5ab92; width: 45%; color: #FFFFFF;">🔍 ENDEREÇO APROXIMADO DA POSIÇÃO ⇅</td>
            <td style="padding: 8px; border: 1px solid #c5ab92; width: 20%; color: #FFFFFF;">🔍 DATA POSIÇÃO ⇅</td>
            <td style="padding: 8px; border: 1px solid #c5ab92; width: 10%; color: #FFFFFF;">🔍 BATERIA ISCA_RF ⇅</td>
          </tr>
          ${
            numCarretas === 2
              ? `
          <tr style="background-color: #EFE3CD;">
            <td style="padding: 8px; border: 1px solid #c5ab92; text-transform: uppercase; font-weight: 900; color: #FF0000;">${isca2 === "SEM ISCA" ? "" : isca2}</td>
            <td style="padding: 8px; border: 1px solid #c5ab92; text-align: left; padding-left: 10px; text-transform: lowercase; font-weight: 500;">${isca2 === "SEM ISCA" ? "" : isca2Endereco}</td>
            <td style="padding: 8px; border: 1px solid #c5ab92;">${isca2 === "SEM ISCA" ? "" : isca2Data}</td>
            <td style="padding: 8px; border: 1px solid #c5ab92;">
              <div style="display: flex; align-items: center; justify-content: center;">
                ${isca2 !== "SEM ISCA" ? `<span style="margin-right: 5px;">${isca2Bateria || "100%"}</span>` : ""}
                <div style="width: 18px; height: 9px; border: 1px solid #22c55e; border-radius: 1px; padding: 1px; display: inline-block; position: relative; vertical-align: middle;">
                  <div style="width: ${isca2 === "SEM ISCA" ? 0 : Math.min(100, parseInt(isca2Bateria) || 100)}%; height: 100%; background-color: #22c55e;"></div>
                  <div style="position: absolute; right: -2px; top: 2px; width: 1.5px; height: 4px; background-color: #22c55e; border-radius: 0 1px 1px 0;"></div>
                </div>
              </div>
            </td>
          </tr>
          `
              : ""
          }
          <tr style="background-color: #EFE3CD;">
            <td style="padding: 8px; border: 1px solid #c5ab92; text-transform: uppercase; font-weight: 900; color: #FF0000;">${isca1}</td>
            <td style="padding: 8px; border: 1px solid #c5ab92; text-align: left; padding-left: 10px; text-transform: lowercase; font-weight: 500;">${isca1Endereco}</td>
            <td style="padding: 8px; border: 1px solid #c5ab92;">${isca1Data}</td>
            <td style="padding: 8px; border: 1px solid #c5ab92;">
              <div style="display: flex; align-items: center; justify-content: center;">
                <span style="margin-right: 5px;">${isca1Bateria || "100%"}</span>
                <div style="width: 18px; height: 9px; border: 1px solid #22c55e; border-radius: 1px; padding: 1px; display: inline-block; position: relative; vertical-align: middle;">
                  <div style="width: ${Math.min(100, parseInt(isca1Bateria) || 100)}%; height: 100%; background-color: #22c55e;"></div>
                  <div style="position: absolute; right: -2px; top: 2px; width: 1.5px; height: 4px; background-color: #22c55e; border-radius: 0 1px 1px 0;"></div>
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- SEÇÃO: ESQUEMA DE EMBARQUE -->
        ${
          ocultarNotas
            ? ""
            : `
        <div style="margin-top: 25px;">
          <p style="font-weight: 900; font-size: 13px; margin-bottom: 25px; color: #3e2516; text-transform: uppercase; border-bottom: 1px solid #dac0a3; padding-bottom: 6px;">
            ESQUEMA DE EMBARQUE DAS ISCAS:
          </p>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; max-width: 720px; margin: 0 auto; gap: ${(!sidebarEmbarque1 && !sidebarEmbarque2) ? '10px' : '30px'};">
            <!-- Carreta 1 Section -->
            ${
              sidebarEmbarque1 === "none"
                ? ""
                : sidebarEmbarque1
                ? `
                <div style="text-align: center; width: 320px;">
                  <div style="background-color: #FFFFFF; border: 1px solid #D5CBBF; padding: 12px; margin-bottom: 15px; width: 320px; height: 420px; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                    <img src="${sidebarEmbarque1}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
                  </div>
                  <p style="font-size: 11px; font-weight: bold; color: #521521; margin-top: 15px; text-transform: uppercase;">${carreta1}</p>
                </div>
              `
                : `<div style="text-align: center; width: 100px;">
                    ${renderLadderHtml(ladder1, "ESCALA 01", carreta1, "").replace('padding-right: 15px; padding-top: 15px;', '')}
                  </div>`
            }

            <!-- Carreta 2 Section -->
            ${
              numCarretas === 2
                ? (sidebarEmbarque2 === "none"
                  ? ""
                  : sidebarEmbarque2
                  ? `
                <div style="text-align: center; width: 320px;">
                  <div style="background-color: #FFFFFF; border: 1px solid #D5CBBF; padding: 12px; margin-bottom: 15px; width: 320px; height: 420px; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                    <img src="${sidebarEmbarque2}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
                  </div>
                  <p style="font-size: 11px; font-weight: bold; color: #521521; margin-top: 15px; text-transform: uppercase;">${carreta2}</p>
                </div>
                `
                  : `<div style="text-align: center; width: 100px;">
                      ${renderLadderHtml(ladder2, "ESCALA 02", carreta2, "").replace('padding-top: 15px;', '')}
                    </div>`)
                : ""
            }
          </div>
        </div>
        `
        }

        <hr style="border: 0; border-top: 1px dashed #c5ab92; margin: 25px 0; clear: both;">

        <!-- Rodapé -->
        <p style="font-size: 11px; font-weight: 900; color: #7C0623; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">GERENCIAMENTO DE RISCO</p>
        <p style="font-size: 11px; color: #3e2516; margin: 0 0 5px 0; font-weight: 500; line-height: 1.4;">-Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem.</p>
        <p style="font-size: 11px; color: #3e2516; margin: 0 0 5px 0; font-weight: 500; line-height: 1.4;">Agradeço antecipadamente pelo compromisso em assegurar que esses envios sejam efetuados via veículos dedicados ou postagem de maneira a evitar qualquer inconveniente em nossa operação.</p>
        <p style="font-size: 11px; color: #3e2516; margin: 0 0 5px 0; font-weight: 500; line-height: 1.4;">A devolução dos rastreadores móveis é essencial, porém, muitos ainda não foram devolvidos prejudicando nossos processos. Por gentileza, devolvam as iscas o quanto antes para mantermos nossa excelência operacional.</p>
        <p style="font-size: 11px; color: #3e2516; margin: 0; font-weight: 500; line-height: 1.4;">Desde já agradeço e ficamos no aguardo do retorno sobre as devoluções.</p>

      </div>
    `;

    const plainText = `
${saudacao}

${alertaResgate}

${infoAbaixo}

· ${rota1};
· ${instrucao1}

-----------------------------------------------------------------------------------------------------------------
NÚMERO DA NF: ${[nfInicio, (numCarretas === 2 && isca2 !== "SEM ISCA" ? nfFim : "")].filter(Boolean).map(v => v.replace(/-/g, '')).join(' ')} | TRANSPORTADORA: ${transportadora}
-----------------------------------------------------------------------------------------------------------------
MOTORISTA: ${motorista}
CAVALO: ${cavalo.replace(/-/g, '')}
DESTINO: ${destino}
DATA ENVIADA: ${dataEnviada}
-----------------------------------------------------------------------------------------------------------------
DETALHES DE CARGA & ISCAS:
1. Carreta: ${carreta1} | N° Isca: ${isca1} | Produto: ${produto1} | Cód U.M.A.: ${uma1}
${numCarretas === 2 ? `2. Carreta: ${carreta2} | N° Isca: ${isca2} | Produto: ${produto2} | Cód U.M.A.: ${uma2}` : ""}
-----------------------------------------------------------------------------------------------------------------
${parametrizacao.toUpperCase()}
${
  ocultarNotas
    ? ""
    : `
ESQUEMA DE EMBARQUE DAS ISCAS:
${
  numCarretas === 1
    ? `1. CARRETA: ${carreta1} - ${sidebarEmbarque1 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)?.label : "Paletizado (Padrão)"}`
    : `
1. CARRETA: ${carreta1} - ${sidebarEmbarque1 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)?.label : "Paletizado (Padrão)"}
2. CARRETA: ${carreta2} - ${sidebarEmbarque2 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque2)?.label : "Paletizado (Padrão)"}
`.trim()
}
`
}
-----------------------------------------------------------------------------------------------------------------
Informações de Apoio:
Tecnologia: ${sidebarTecnologia}
Embarque: ${
  sidebarEmbarque1 || sidebarEmbarque2
    ? [
        sidebarEmbarque1
          ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)
              ?.label || "Carreta 1"
          : null,
        sidebarEmbarque2 && numCarretas === 2
          ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque2)
              ?.label || "Carreta 2"
          : null,
      ]
        .filter(Boolean)
        .join(" / ")
    : "PALETIZADO (PADRÃO)"
}
    `;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlEmail], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });
        const item = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      // Fallback
      try {
        await navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        alert(
          "Falha ao copiar conteúdo. Por favor, selecione e copie manualmente.",
        );
      }
    }
  };

  const handleCopySubject = async () => {
    const isDefaultOrigem = origem === "SANTA LUZIA/MG";
    const subjectPrefix = isDefaultOrigem ? "" : `${origem.toUpperCase()} X `;
    const subject = `PRÉ-ALERTA DE ISCA - ${subjectPrefix}${(destino || "GUARULHOS/SP").toUpperCase()} - ${(cavalo.replace(/-/g, "") || "TYQ6F51").toUpperCase()}`;
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedAssunto(true);
      setTimeout(() => setCopiedAssunto(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar assunto:", err);
    }
  };

  return (
    <div 
      className="w-full relative z-10 max-w-[102rem] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_310px_310px] gap-6 items-start font-sans"
      style={{ zoom: 0.9 }}
    >
      {/* LEFT AREA: Template Generator (expanded dynamically) */}
      <div className="col-span-1 xl:col-span-1 flex flex-col">
        <div className="flex-1 rounded-3xl bg-[#fdfbf7] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col p-6 sm:p-8">
          {/* Decorative brass flat-head screws on corners */}
          <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

          {/* Module Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#e1ccb0] pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#B32025] text-white p-2.5 rounded-2xl shadow-md">
                <Sliders size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3e2516] uppercase tracking-tight">
                  Gerador de Controle PGR
                </h2>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">
                  Gerador idêntico de pré-alerta e iscas
                </p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="bg-stone-100 hover:bg-stone-200 text-[#5c3e29] border border-stone-300 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft size={12} strokeWidth={3} /> Voltar ao Menu
              </button>
            )}
          </div>

          {/* Generator Workspace Form */}
          <div className="flex flex-col gap-6">
            {/* GREETING SELECTION (Menu Suspenso para Saudação) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FAF6ED] border border-[#e1ccb0]/80 rounded-2xl p-4 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3e29] shrink-0">
                Saudação:
              </label>
              <div className="relative flex-1 max-w-[200px]">
                <select
                  value={saudacao}
                  onChange={(e) => setSaudacao(e.target.value)}
                  className="w-full bg-white border-2 border-[#5c3e29]/35 rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#3e2516] focus:border-[#B32025] focus:ring-0 outline-none transition-all cursor-pointer shadow-xs"
                >
                  <option value="Boa tarde,">Boa tarde,</option>
                  <option value="Bom dia,">Bom dia,</option>
                  <option value="Boa noite,">Boa noite,</option>
                </select>
              </div>
              <p className="text-[10px] font-bold text-[#8c6b4e] uppercase tracking-wider">
                Define a saudação inicial do pré-alerta
              </p>
            </div>

            {/* EMAIL SUBJECT HEADER BLOCK (Separate from the email body per user request) */}
            <div className="bg-[#FFFDFB] border-3 border-stone-800 rounded-3xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8c6b4e] block mb-1">
                  Assunto do E-mail (Copiar separadamente)
                </span>
                <h1 className="text-lg font-sans font-black text-[#631C24] uppercase tracking-tight m-0 select-all">
                  PRÉ-ALERTA DE ISCA - {destino || "BRASÍLIA"} -{" "}
                  {cavalo.replace(/-/g, "") || "TYQ6F51"}
                </h1>
              </div>
              <button
                type="button"
                onClick={handleCopySubject}
                className={cn(
                  "flex items-center gap-2 font-black uppercase text-[10px] tracking-wider px-4 py-3 rounded-xl shadow-md transition-all cursor-pointer select-none active:scale-95 shrink-0 border-2",
                  copiedAssunto
                    ? "bg-green-600 text-white border-transparent"
                    : "bg-[#B32025] hover:bg-[#8c060a] text-white border-transparent",
                )}
              >
                {copiedAssunto ? (
                  <>
                    <Check size={12} className="stroke-[3]" /> COPIADO!
                  </>
                ) : (
                  <>
                    <Copy size={12} className="stroke-[2.5]" /> COPIAR ASSUNTO
                  </>
                )}
              </button>
            </div>

            {/* PREVIEW CONTAINER - LOOKS EXACTLY LIKE THE OUTLOOK EMAIL / CCC.PNG */}
            <div className="bg-[#FAF5EC] border-3 border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xl overflow-x-auto relative">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#8c6b4e] block mb-5 border-b border-[#dac0a3] pb-1.5">
                Visualização do Pré-Alerta (Template do E-mail)
              </span>

              <div className="min-w-[850px] font-sans text-xs text-[#3e2516]">
                {/* 1. Greeting Output */}
                <div className="mb-4 font-serif font-black italic text-sm text-[#3e2516] ml-0 pl-0">
                  {saudacao}
                </div>

                {/* 2. Beautiful Maroon Ribbon Fold */}
                <div className="mb-5 bg-[#7C0623] text-white font-black text-xs uppercase px-4 py-2.5 tracking-wider shadow-sm flex items-center rounded-r border-l-[10px] border-[#4D0012] max-w-max ml-0">
                  <input
                    type="text"
                    value={alertaResgate}
                    onChange={(e) => setAlertaResgate(e.target.value)}
                    className="bg-transparent border-none text-white w-full outline-none font-black text-xs uppercase p-0.5 focus:ring-1 focus:ring-white/40 hover:bg-white/10 rounded px-1.5 transition-all min-w-[280px]"
                    placeholder="ALERTA RESGATE"
                  />
                </div>

                {/* 3. Atentar às informações */}
                <div className="mb-3.5 font-black text-[#3e2516] text-[13px] ml-0 pl-0">
                  <input
                    type="text"
                    value={infoAbaixo}
                    onChange={(e) => setInfoAbaixo(e.target.value)}
                    className="bg-transparent border-none outline-none hover:bg-black/5 focus:bg-black/10 rounded px-1.5 py-0.5 w-full font-black text-[#3e2516] transition-all"
                  />
                </div>

                {/* 4. Routes and Instructions Selector Box with double border styling */}
                <div className="border border-[#c5ab92] outline outline-1 outline-[#c5ab92] outline-offset-[-3.5px] p-4 mb-6 font-bold leading-relaxed bg-[#EFE3CD] max-w-xl rounded-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#c5ab92] text-sm">•</span>
                    <input
                      type="text"
                      value={rota1}
                      onChange={(e) => setRota1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0.5 px-1.5 hover:bg-black/5 focus:bg-black/10 rounded text-xs text-[#3e2516] transition-all"
                      placeholder="· SANTA LUZIA/MG x GUARULHOS/SP;"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[#c5ab92] text-sm">•</span>
                    <input
                      type="text"
                      value={instrucao1}
                      onChange={(e) => setInstrucao1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0.5 px-1.5 hover:bg-black/5 focus:bg-black/10 rounded text-xs text-[#3e2516] transition-all"
                      placeholder="· * Favor, acusar o recebimento do pré-alerta;"
                    />
                  </div>
                </div>

                {/* 5. BIG INTERACTIVE SPREADSHEET TABLE 1 */}
                <div className="flex justify-end gap-2 mb-2">
                  {numCarretas === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNumCarretas(2);
                        if (isca2 === "SEM ISCA") {
                          setIsca2("");
                          setProduto2("");
                          setUma2("");
                        }
                      }}
                      className="flex items-center gap-1 bg-[#B32025] hover:bg-[#8c060a] text-white font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer select-none"
                    >
                      <Plus size={10} className="stroke-[3]" /> Adicionar
                      Segunda Carreta
                    </button>
                  ) : (
                    <>
                      {isca2 === "SEM ISCA" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsca2("");
                            setProduto2("");
                            setUma2("");
                          }}
                          className="flex items-center gap-1 bg-[#B32025] hover:bg-[#8c060a] text-white font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer select-none"
                        >
                          <Plus size={10} className="stroke-[3]" /> Adicionar Isca
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsca2("SEM ISCA");
                            setProduto2("---");
                            setUma2("---");
                            setNfFim("");
                            if (!carreta2 && carreta1) {
                              setCarreta2(carreta1);
                            }
                          }}
                          className="flex items-center gap-1 bg-[#B32025] hover:bg-[#8c060a] text-white font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer select-none"
                        >
                          <Minus size={10} className="stroke-[3]" /> Sem Isca
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setNumCarretas(1);
                          setNfFim("");
                        }}
                        className="flex items-center gap-1 bg-[#3e2516] hover:bg-[#2d1a10] text-[#efdfc6] border border-[#5c3e29]/30 font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer select-none"
                      >
                        <Minus size={10} className="stroke-[3]" /> Remover Segunda
                        Carreta
                      </button>
                    </>
                  )}
                </div>
                <table className="w-full border-collapse border border-[#c5ab92] text-xs font-sans text-black table-fixed">
                  <thead>
                    {/* Row 1: NF and Transportadora */}
                    <tr className="border border-[#c5ab92]">
                      <th
                        colSpan={2}
                        className="bg-linear-to-b from-[#7A0C22] to-[#44030E] border-r border-[#c5ab92] text-white text-center font-black p-2.5 uppercase text-[11px] align-middle w-[25%]"
                      >
                        NÚMERO DA NF:
                      </th>
                      <th
                        colSpan={1}
                        className="border-r border-[#c5ab92] p-1.5 align-middle w-[15%] bg-[#EFE3CD]"
                      >
                        <div className="flex flex-col items-center gap-0 w-full">
                          <input
                            type="text"
                            value={nfInicio}
                            onChange={(e) => setNfInicio(e.target.value.replace(/-/g, ""))}
                            className="w-full text-center font-black bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 text-[11px] text-black transition-all duration-200"
                            placeholder="INÍCIO"
                          />
                          {numCarretas === 2 && isca2 !== "SEM ISCA" && (
                            <input
                              type="text"
                              value={nfFim}
                              onChange={(e) => setNfFim(e.target.value.replace(/-/g, ""))}
                              className="w-full text-center font-black bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 text-[11px] text-black transition-all duration-200"
                              placeholder="FIM"
                            />
                          )}
                        </div>
                      </th>
                      <th
                        colSpan={1}
                        className="bg-linear-to-b from-[#7A0C22] to-[#44030E] border-r border-[#c5ab92] text-white text-center font-black p-2.5 uppercase text-[11px] align-middle w-[18%]"
                      >
                        TRANSPORTADORA:
                      </th>
                      <th
                        colSpan={2}
                        className="p-1.5 border-r border-[#c5ab92] align-middle w-[25%] bg-[#EFE3CD]"
                      >
                        <select
                          value={transportadora}
                          onChange={(e) =>
                            handleTableTranspChange(e.target.value)
                          }
                          className="w-full text-center font-black uppercase bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 text-xs cursor-pointer text-black transition-all duration-200"
                        >
                          <option value="">SELECIONE...</option>
                          {allTransportadoras.map((t) => (
                            <option
                              key={t}
                              value={t}
                              className="text-black uppercase text-xs font-black"
                            >
                              {t}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th colSpan={2} className="w-[17%] bg-linear-to-b from-[#7A0C22] to-[#44030E]"></th>
                    </tr>

                    {/* Row 2: Standard Columns Headings */}
                    <tr className="border-b border-[#c5ab92] bg-linear-to-b from-[#7A0C22] to-[#44030E] text-white text-center font-black uppercase text-[10px] h-[34px]">
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[22%]">
                        MOTORISTA
                      </th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[11%]">
                        CAVALO
                      </th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[11%]">
                        CARRETAS
                      </th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[13%]">
                        N° ISCA
                      </th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[14%]">
                        PRODUTO EMBARCADO
                      </th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[15%]">
                        CÓDIGO U.M.A.
                      </th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[11%]">
                        DESTINO
                      </th>
                      <th className="p-1.5 align-middle w-[11%]">
                        DATA PARTIDA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Rows of data */}
                    <tr className="border-b border-[#c5ab92] text-center text-xs h-[42px] bg-[#EFE3CD]">
                      {/* Motorista - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="border-r border-[#c5ab92] p-1.5 font-bold uppercase text-[11px] align-middle"
                      >
                        <textarea
                          value={motorista}
                          onChange={(e) =>
                            handleTableMotoristaChange(e.target.value)
                          }
                          className="w-full h-full min-h-[48px] text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded resize-none p-1 text-xs leading-snug text-black transition-all duration-200"
                          placeholder="NOME MOTORISTA"
                        />
                      </td>

                      {/* Cavalo - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="border-r border-[#c5ab92] p-1.5 font-bold uppercase text-[11px] align-middle"
                      >
                        <input
                          type="text"
                          value={cavalo}
                          onChange={(e) => setCavalo(e.target.value.replace(/-/g, ""))}
                          className="w-full text-center font-black uppercase bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 text-[15px] text-black transition-all duration-200"
                          placeholder="PLACA"
                        />
                      </td>

                      {/* Carreta Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input
                          type="text"
                          value={carreta1}
                          onChange={(e) => setCarreta1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-xs text-black transition-all duration-200"
                          placeholder="CARRETA 1"
                        />
                      </td>

                      {/* N Iscas Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input
                          type="text"
                          value={isca1}
                          onChange={(e) => handleIsca1Change(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-[13px] text-black transition-all duration-200"
                          placeholder="ISCA 1"
                        />
                      </td>

                      {/* Produto Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input
                          type="text"
                          value={produto1}
                          onChange={(e) => setProduto1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-[13px] text-black transition-all duration-200"
                          placeholder="PROD 1"
                        />
                      </td>

                      {/* UMA Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input
                          type="text"
                          value={uma1}
                          onChange={(e) => setUma1(formatUMA(e.target.value))}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-[13px] text-black transition-all duration-200"
                          placeholder="0XX.XXX.XXX.XXX"
                        />
                      </td>

                      {/* Destino - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="border-r border-[#c5ab92] p-1.5 font-bold uppercase text-[11px] align-middle"
                      >
                        <input
                          type="text"
                          value={destino}
                          onChange={(e) => setDestino(e.target.value)}
                          className="w-full text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 text-xs text-black transition-all duration-200"
                          placeholder="DESTINO"
                        />
                      </td>

                      {/* Data Enviada - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="p-1.5 font-bold text-black text-xs align-middle"
                      >
                        <input
                          type="text"
                          value={dataEnviada}
                          onChange={(e) => setDataEnviada(e.target.value)}
                          className="w-full text-center font-bold bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 text-xs text-black transition-all duration-200"
                          placeholder="DATA"
                        />
                      </td>
                    </tr>

                    {/* Second row of sub-items (Carreta 2, Isca 2, Prod 2, UMA 2) */}
                    {numCarretas === 2 && (
                      <tr className="border-b border-[#c5ab92] text-center text-xs h-[42px] bg-[#EFE3CD]">
                        {/* Carreta Row 2 */}
                        <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                          <input
                            type="text"
                            value={carreta2}
                            onChange={(e) => setCarreta2(e.target.value)}
                            className="w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-xs text-black transition-all duration-200"
                            placeholder="CARRETA 2"
                          />
                        </td>

                        {/* Isca Row 2 */}
                        <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                          <input
                            type="text"
                            value={isca2}
                            onChange={(e) => handleIsca2Change(e.target.value)}
                            className={cn(
                              "w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-[13px] transition-all duration-200",
                              isca2 === "SEM ISCA" ? "text-red-600 font-black" : "text-black"
                            )}
                            placeholder="ISCA 2"
                          />
                        </td>

                        {/* Produto Row 2 */}
                        <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                          <input
                            type="text"
                            value={produto2}
                            onChange={(e) => setProduto2(e.target.value)}
                            className={cn(
                              "w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-[13px] transition-all duration-200",
                              isca2 === "SEM ISCA" ? "text-stone-500 font-black" : "text-black"
                            )}
                            placeholder="PROD 2"
                          />
                        </td>

                        {/* UMA Row 2 */}
                        <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                          <input
                            type="text"
                            value={uma2}
                            onChange={(e) => setUma2(formatUMA(e.target.value))}
                            className={cn(
                              "w-full text-center bg-transparent border-none outline-none hover:bg-[#B32025]/5 focus:bg-[#B32025]/10 rounded px-1 py-0.5 uppercase font-bold text-[13px] transition-all duration-200",
                              isca2 === "SEM ISCA" ? "text-stone-500 font-black" : "text-black"
                            )}
                            placeholder="0XX.XXX.XXX.XXX"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* TABLE 2: PARAMETRIZAÇÃO DAS ISCAS */}
                <table className="w-full border-collapse border border-[#c5ab92] text-xs font-sans text-black table-fixed mt-0">
                  <tbody>
                    {/* Header bar */}
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-linear-to-b from-[#7A0C22] to-[#44030E] text-center font-black text-white p-2.5 uppercase text-[11px] tracking-wide border-b border-[#c5ab92]"
                      >
                        <input
                          type="text"
                          value={parametrizacao}
                          onChange={(e) => setParametrizacao(e.target.value)}
                          className="w-full text-center font-black bg-transparent border-none outline-none hover:bg-white/10 focus:bg-white/20 rounded px-1 py-0.5 text-[11px] uppercase text-white transition-all duration-200"
                        />
                      </td>
                    </tr>
                    {/* Subheaders Row */}
                    <tr className="bg-linear-to-b from-[#7A0C22] to-[#44030E] text-center font-black text-white text-[10px] h-[34px] border-b border-[#c5ab92]">
                      <td className="border-r border-[#c5ab92] p-1 w-[25%] align-middle text-center">
                        <div className="flex items-center bg-white border border-[#c5ab92]/50 rounded px-2 py-0.5 max-w-[150px] mx-auto shadow-inner">
                          <input
                            type="text"
                            value={
                              numCarretas === 2 && isca2 !== "SEM ISCA" ? `${isca1} ${isca2}` : isca1
                            }
                            readOnly
                            className="bg-transparent border-none text-black font-black text-[9px] uppercase p-0 focus:ring-0 w-full text-center outline-none select-all"
                          />
                          <span className="text-stone-400 font-bold text-[8px] cursor-pointer ml-1 select-none">
                            ⇅
                          </span>
                        </div>
                      </td>
                      <td className="border-r border-[#c5ab92] p-1 w-[45%] uppercase tracking-wider text-white text-[10px] align-middle">
                        🔍 ENDEREÇO APROXIMADO DA POSIÇÃO ⇅
                      </td>
                      <td className="border-r border-[#c5ab92] p-1 w-[18%] uppercase tracking-wider text-white text-[10px] align-middle">
                        🔍 DATA POSIÇÃO ⇅
                      </td>
                      <td className="p-1 w-[12%] uppercase tracking-wider text-white text-[10px] align-middle">
                        🔍 BATERIA ISCA_RF ⇅
                      </td>
                    </tr>
                    {/* Row 1 (Isca 2) */}
                    {numCarretas === 2 && (
                      <tr className="bg-[#EFE3CD] text-center font-semibold text-[#3e2516] h-[44px] border-b border-[#c5ab92]">
                        <td className="border-r border-[#c5ab92] p-1.5 font-black uppercase text-[11px] text-center bg-[#EFE3CD] align-middle">
                          {isca2 === "SEM ISCA" ? "" : isca2}
                        </td>
                        <td className="border-r border-[#c5ab92] p-1.5 text-left font-medium text-xs bg-[#EFE3CD] align-middle">
                          <textarea
                            value={isca2 === "SEM ISCA" ? "" : isca2Endereco}
                            onChange={(e) => setIsca2Endereco(e.target.value)}
                            disabled={isca2 === "SEM ISCA"}
                            rows={1}
                            className="w-full bg-transparent border-none outline-none hover:bg-black/5 focus:bg-black/10 rounded px-1.5 py-0.5 text-xs text-[#3e2516] resize-y leading-tight font-bold transition-all duration-200 disabled:opacity-50"
                            placeholder={isca2 === "SEM ISCA" ? "" : "Endereço da Isca 2..."}
                          />
                        </td>
                        <td className="border-r border-[#c5ab92] p-1.5 text-center font-bold text-xs bg-[#EFE3CD] align-middle">
                          <input
                            type="text"
                            value={isca2 === "SEM ISCA" ? "" : isca2Data}
                            onChange={(e) => setIsca2Data(e.target.value)}
                            disabled={isca2 === "SEM ISCA"}
                            className="w-full bg-transparent border-none outline-none hover:bg-black/5 focus:bg-black/10 rounded px-1.5 py-0.5 text-xs text-center text-[#3e2516] font-bold transition-all duration-200 disabled:opacity-50"
                            placeholder={isca2 === "SEM ISCA" ? "" : "Data/Hora..."}
                          />
                        </td>
                        <td className="p-1.5 text-center font-bold text-xs bg-[#EFE3CD] align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="text"
                              value={isca2 === "SEM ISCA" ? "" : isca2Bateria}
                              onChange={(e) => setIsca2Bateria(e.target.value)}
                              disabled={isca2 === "SEM ISCA"}
                              className="w-10 bg-transparent border-none outline-none hover:bg-black/5 focus:bg-black/10 rounded px-1 py-0.5 text-xs text-right text-[#3e2516] font-bold transition-all duration-200 disabled:opacity-50"
                              placeholder={isca2 === "SEM ISCA" ? "" : "100%"}
                            />
                            <div className="relative flex items-center">
                              <Battery className="w-5 h-5 text-green-600 fill-green-600/20" />
                              <div 
                                className="absolute left-[3px] top-[6.5px] h-[7px] bg-green-500 rounded-[1px]"
                                style={{ width: `${(isca2 === "SEM ISCA" ? 0 : Math.min(100, parseInt(isca2Bateria) || 100)) * 0.11}px` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Row 2 (Isca 1) */}
                    <tr className="bg-[#EFE3CD] text-center font-semibold text-[#3e2516] h-[44px] border-b border-[#c5ab92]">
                      <td className="border-r border-[#c5ab92] p-1.5 font-black uppercase text-[11px] text-center bg-[#EFE3CD] align-middle">
                        {isca1}
                      </td>
                      <td className="border-r border-[#c5ab92] p-1.5 text-left font-medium text-xs bg-[#EFE3CD] align-middle">
                        <textarea
                          value={isca1Endereco}
                          onChange={(e) => setIsca1Endereco(e.target.value)}
                          rows={1}
                          className="w-full bg-transparent border-none outline-none hover:bg-black/5 focus:bg-black/10 rounded px-1.5 py-0.5 text-xs text-[#3e2516] resize-y leading-tight font-bold transition-all duration-200"
                          placeholder="Endereço da Isca 1..."
                        />
                      </td>
                      <td className="border-r border-[#c5ab92] p-1.5 text-center font-bold text-xs bg-[#EFE3CD] align-middle">
                        <input
                          type="text"
                          value={isca1Data}
                          onChange={(e) => setIsca1Data(e.target.value)}
                          className="w-full bg-transparent border-none outline-none hover:bg-black/5 focus:bg-black/10 rounded px-1.5 py-0.5 text-xs text-center text-[#3e2516] font-bold transition-all duration-200"
                          placeholder="Data/Hora..."
                        />
                      </td>
                      <td className="p-1.5 text-center font-bold text-xs bg-[#EFE3CD] align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="text"
                            value={isca1Bateria}
                            onChange={(e) => setIsca1Bateria(e.target.value)}
                            className="w-10 bg-transparent border-none outline-none hover:bg-black/5 focus:bg-black/10 rounded px-1 py-0.5 text-xs text-right text-[#3e2516] font-bold transition-all duration-200"
                            placeholder="100%"
                          />
                          <div className="relative flex items-center">
                            <Battery className="w-5 h-5 text-green-600 fill-green-600/20" />
                            <div 
                              className="absolute left-[3px] top-[6.5px] h-[7px] bg-green-500 rounded-[1px]"
                              style={{ width: `${Math.min(100, parseInt(isca1Bateria) || 100) * 0.11}px` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 6. INTERACTIVE ESQUEMA DE EMBARQUE (LADDERS) */}
                {!ocultarNotas && (
                  <div className="mt-6 border-t border-[#c5ab92]/50 pt-5">
                    <span className="text-[13px] font-bold uppercase block mt-[25px] mb-[20px] text-[#222222] font-sans">
                      ESQUEMA DE EMBARQUE DAS ISCAS:
                    </span>
                    <p className="text-[10px] text-[#8c6b4e] font-black uppercase tracking-wider mb-4">
                      {sidebarEmbarque1 || sidebarEmbarque2
                        ? "Imagem do esquema de embarque selecionada! Ela será incluída no e-mail."
                        : 'Clique nas células para marcar/desmarcar a isca ("P"). Esse esquema será copiado visualmente para o e-mail!'}
                    </p>

                    <div className={cn(
                      "flex flex-wrap justify-center items-start max-w-[720px] mx-auto transition-all duration-300",
                      (!sidebarEmbarque1 && !sidebarEmbarque2) ? "gap-[10px]" : "gap-[30px]"
                    )}>
                      {/* Carreta 1 Section */}
                      {sidebarEmbarque1 !== "none" && (
                        <div className={cn(
                          "flex flex-col items-center transition-all duration-300",
                          sidebarEmbarque1 ? "w-[320px]" : "w-[100px]"
                        )}>
                          {sidebarEmbarque1 ? (
                            <div className="w-full flex flex-col">
                              <div className="bg-white border border-[#D5CBBF] p-2.5 text-center shadow-sm w-[320px] h-[420px] flex items-center justify-center box-border">
                                <img
                                  src={sidebarEmbarque1}
                                  alt="Esquema"
                                  referrerPolicy="no-referrer"
                                  className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain bg-white mx-auto block border-0"
                                />
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-[#521521] uppercase">
                                  CARRETA 1: {carreta1}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center w-full">
                              <div className="h-[350px] flex flex-col items-center justify-start pt-[15px]">
                                <div className="bg-[#4A131E] text-white font-black text-[9px] uppercase w-[75px] py-[5px] text-center border border-[#4A131E] tracking-normal">
                                  ESCALA 01
                                </div>
                                <div className="grid grid-cols-2 gap-0 border border-[#5A5A5A] bg-white w-[75px]">
                                  {ladder1.map((row, rIndex) =>
                                    row.map((cell, cIndex) => (
                                      <button
                                        key={`ladder1-${rIndex}-${cIndex}`}
                                        onClick={() => {
                                          const copy = [
                                            ...ladder1.map((r) => [...r]),
                                          ];
                                          copy[rIndex][cIndex] =
                                            copy[rIndex][cIndex] === "P" ? "" : "P";
                                          setLadder1(copy);
                                        }}
                                        className={cn(
                                          "w-full h-[18px] border-[0.5px] border-[#5A5A5A] font-black text-[10px] flex items-center justify-center transition-all cursor-pointer select-none",
                                          cell === "P"
                                            ? "bg-[#6C061D] text-white"
                                            : "bg-white hover:bg-stone-50",
                                        )}
                                      >
                                        {cell}
                                      </button>
                                    )),
                                  )}
                                </div>
                              </div>
                              <div className="text-center mt-[10px]">
                                <span className="text-[11px] font-black text-[#521521] uppercase">
                                  CARRETA 1: {carreta1}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Carreta 2 Section */}
                      {numCarretas === 2 && sidebarEmbarque2 !== "none" && (
                        <div className={cn(
                          "flex flex-col items-center transition-all duration-300",
                          sidebarEmbarque2 ? "w-[320px]" : "w-[100px]"
                        )}>
                          {sidebarEmbarque2 ? (
                            <div className="w-full flex flex-col">
                              <div className="bg-white border border-[#D5CBBF] p-2.5 text-center shadow-sm w-[320px] h-[420px] flex items-center justify-center box-border">
                                <img
                                  src={sidebarEmbarque2}
                                  alt="Esquema"
                                  referrerPolicy="no-referrer"
                                  className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain bg-white mx-auto block border-0"
                                />
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-[#521521] uppercase">
                                  CARRETA 2: {carreta2}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center w-full">
                              <div className="h-[350px] flex flex-col items-center justify-start pt-[15px]">
                                <div className="bg-[#4A131E] text-white font-black text-[9px] uppercase w-[75px] py-[5px] text-center border border-[#4A131E] tracking-normal">
                                  ESCALA 02
                                </div>
                                <div className="grid grid-cols-2 gap-0 border border-[#5A5A5A] bg-white w-[75px]">
                                  {ladder2.map((row, rIndex) =>
                                    row.map((cell, cIndex) => (
                                      <button
                                        key={`ladder2-${rIndex}-${cIndex}`}
                                        onClick={() => {
                                          const copy = [
                                            ...ladder2.map((r) => [...r]),
                                          ];
                                          copy[rIndex][cIndex] =
                                            copy[rIndex][cIndex] === "P" ? "" : "P";
                                          setLadder2(copy);
                                        }}
                                        className={cn(
                                          "w-full h-[18px] border-[0.5px] border-[#5A5A5A] font-black text-[10px] flex items-center justify-center transition-all cursor-pointer select-none",
                                          cell === "P"
                                            ? "bg-[#6C061D] text-white"
                                            : "bg-white hover:bg-stone-50",
                                        )}
                                      >
                                        {cell}
                                      </button>
                                    )),
                                  )}
                                </div>
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-[#521521] uppercase">
                                  CARRETA 2: {carreta2}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes additional line (HIDDEN PER USER REQUEST) */}
                <div className="hidden mt-5 max-w-xl mx-auto border-2 border-stone-800 rounded-2xl p-4 bg-[#FFFDFB] shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-[#8c6b4e] tracking-wider block">
                      Notas adicionais de embarque:
                    </span>
                    <button
                      type="button"
                      onClick={() => setOcultarNotas(!ocultarNotas)}
                      className={cn(
                        "flex items-center gap-1.5 font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-lg border-2 transition-all cursor-pointer select-none active:scale-95",
                        ocultarNotas
                          ? "bg-[#B32025] hover:bg-[#8c060a] text-white border-transparent"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300",
                      )}
                    >
                      {ocultarNotas ? (
                        <>
                          <EyeOff size={11} className="stroke-[3]" /> OCULTO NO
                          E-MAIL
                        </>
                      ) : (
                        <>
                          <Eye size={11} className="stroke-[2.5]" /> OCULTAR NO
                          E-MAIL
                        </>
                      )}
                    </button>
                  </div>

                  {!ocultarNotas ? (
                    <input
                      type="text"
                      value={esquemaEmbarque}
                      onChange={(e) => setEsquemaEmbarque(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-stone-300 focus:border-[#B32025] py-1 text-xs outline-none uppercase font-mono font-bold text-[#3e2516]"
                      placeholder="EX: CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO..."
                    />
                  ) : (
                    <p className="text-[10px] text-stone-500 font-semibold italic">
                      O esquema e as notas de embarque estão ocultos e não serão
                      incluídos no e-mail copiado.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick action helper card inside main container */}
            <div className="bg-[#FAF6ED] border border-[#e1ccb0] rounded-2xl p-4 flex gap-3 items-start mt-2">
              <Info className="text-[#B32025] shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#5c3e29] uppercase tracking-wide">
                  Dica do Gerador
                </span>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                  Você pode clicar diretamente nos campos da tabela acima para
                  preenchê-los manualmente de forma ágil, ou utilizar a coluna
                  de preenchimento rápido ao lado para carregar dados
                  corporativos específicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SIDEBAR: Fast Fill Column (fixed width) */}
      <div className="col-span-1 xl:col-span-1 flex flex-col">
        <div
          className="rounded-3xl bg-[#e6d5bf] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col p-6 sm:p-7"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #efdfc6 0%, #e2cfb2 100%)",
          }}
        >
          {/* Vintage brass flat-head screws on corners */}
          <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

          {/* Form Header */}
          <div className="border-b border-[#dac0a3] pb-4 mb-5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c6b4e] block">
              Painel Lateral
            </span>
            <h3 className="text-base font-serif font-black text-[#3e2516] uppercase tracking-tight mt-0.5 flex items-center gap-2">
              <Sliders size={18} className="text-[#B32025]" /> Formulário de
              Controle
            </h3>
          </div>

          {/* Form inputs identical to COLUNA.PNG layout */}
          <div className="flex flex-col gap-4">
            {/* ORIGEM (MENU SUSPENSO) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <MapPin size={12} className="text-[#8c6b4e]" /> ORIGEM
              </label>
              <select
                value={origem}
                onChange={(e) => {
                  const newOrigem = e.target.value;
                  setOrigem(newOrigem);
                  // Update rota1 if it already has a route to reflect the new origin
                  if (rota1) {
                    // Try to replace existing origin patterns or prepend if it's a simple destination
                    if (rota1.includes(" x ")) {
                      const parts = rota1.split(/\s*x\s*/i);
                      // Handle the case where there might be a leading dot or space in the first part
                      const firstPart = parts[0];
                      const prefixMatch = firstPart.match(/^(\s*·?\s*)/);
                      const prefix = prefixMatch ? prefixMatch[1] : "";
                      const restOfRoute = parts.slice(1).join(" x ");
                      setRota1(`${prefix}${newOrigem} x ${restOfRoute}`);
                    } else if (rota1.trim() !== "") {
                      // If it doesn't have ' x ', it might just be a destination or something else
                      // We don't want to blindly overwrite it unless it's clearly an origin-destination pair
                    }
                  }
                }}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
              >
                {ORIGEM_OPCOES.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="text-black uppercase text-xs font-black"
                  >
                    {opt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECIONAR ROTA (MENU SUSPENSO) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <MapPin size={12} className="text-[#8c6b4e]" /> SELECIONAR ROTA
                (DESTINO)
              </label>

              {/* Search input for filtering */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Search size={12} className="text-[#8c6b4e]/80" />
                </span>
                <input
                  type="text"
                  value={searchRota}
                  onChange={(e) => setSearchRota(e.target.value)}
                  className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl pl-9 pr-4 py-2 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none transition-all shadow-3xs placeholder:text-[#8c6b4e]/50"
                  placeholder="PESQUISAR ROTA..."
                />
                {searchRota && (
                  <button
                    type="button"
                    onClick={() => setSearchRota("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[10px] font-black text-[#8C1D24] hover:text-[#B32025] uppercase cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <select
                value={rota1}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setRota1(val);
                    // Auto extract destino (last element after 'x')
                    const parts = val.split(/\s*x\s*/i);
                    const lastPart = parts[parts.length - 1]?.trim();
                    if (lastPart) {
                      setDestino(lastPart);
                    }
                  } else {
                    setRota1("");
                    setDestino("");
                  }
                }}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="">
                  {searchRota
                    ? "RESULTADOS DA BUSCA..."
                    : "SELECIONE A ROTA..."}
                </option>
                {DESTINOS_OPCOES.filter((dest) =>
                  dest.toLowerCase().includes(searchRota.toLowerCase()),
                ).map((dest) => {
                  const displayDest = dest.replace(/^SANTA LUZIA\/MG/i, origem);
                  return (
                    <option
                      key={dest}
                      value={displayDest}
                      className="text-black uppercase text-xs font-black"
                    >
                      {displayDest.toUpperCase()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* TRANSPORTADORA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Truck size={12} className="text-[#8c6b4e]" /> TRANSPORTADORA
              </label>
              <select
                value={sidebarTransportadora}
                onChange={(e) => handleSidebarTranspChange(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="">SELECIONE...</option>
                {allTransportadoras.map((t) => (
                  <option
                    key={t}
                    value={t}
                    className="text-black uppercase text-xs font-black"
                  >
                    {t}
                  </option>
                ))}
              </select>

              {!isAddingTransp ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTransp(true)}
                  className="self-start text-[10px] font-black text-[#B32025] hover:text-[#7A0C22] flex items-center gap-1 mt-0.5 transition-colors uppercase tracking-wider"
                >
                  <Plus size={12} /> Adicionar Transportadora
                </button>
              ) : (
                <div className="flex flex-col gap-1.5 p-2 bg-white/50 rounded-lg border border-[#dac0a3]/50 mt-0.5 shadow-3xs">
                  <input
                    type="text"
                    placeholder="NOME DA TRANSPORTADORA"
                    value={newTranspName}
                    onChange={(e) => setNewTranspName(e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#5c3e29]/30 rounded-lg px-2.5 py-1.5 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-1 focus:ring-[#B32025]/20 outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTransp();
                      }
                    }}
                  />
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTransp(false);
                        setNewTranspName("");
                      }}
                      className="px-2 py-0.5 text-[10px] font-extrabold text-[#5c3e29] hover:bg-black/5 rounded uppercase transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomTransp}
                      className="px-2.5 py-0.5 text-[10px] font-black text-white bg-[#B32025] hover:bg-[#7A0C22] rounded uppercase shadow-xs transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COLAR DA PLANILHA (PARAMETRIZAÇÃO) textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <FileText size={12} className="text-[#8c6b4e]" /> COLAR DA
                PLANILHA (PARAMETRIZAÇÃO)
              </label>
              <textarea
                value={pastePlanilha}
                onChange={(e) => handlePastePlanilhaChange(e.target.value)}
                rows={3}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2 text-xs font-bold text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none transition-all shadow-2xs resize-none"
                placeholder="Cole as linhas da planilha de iscas aqui..."
              />
            </div>

            {/* NOME MOTORISTA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <User size={12} className="text-[#8c6b4e]" /> NOME MOTORISTA
              </label>
              <input
                type="text"
                value={sidebarMotorista}
                onChange={(e) => handleSidebarMotoristaChange(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="NOME COMPLETO"
              />
            </div>

            {/* MENU SUSPENSO DE PREFIXO ISCAS NO LUGAR DA COLUNA CPF */}
            <div className="flex flex-col gap-3 bg-[#FAF6ED]/70 border-2 border-[#5c3e29]/20 rounded-xl p-3 shadow-2xs">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Sliders size={12} className="text-[#8c6b4e]" /> N° ISCAS
                (PREFIXOS & BATERIA)
              </label>

              <div className="flex flex-col gap-3">
                {/* ISCA 1 SECTION */}
                <div className="border-b border-[#e1ccb0]/50 pb-2.5">
                  <span className="text-[9px] font-black uppercase text-[#B32025] block mb-1">
                    DISPOSITIVO ISCA 1:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">
                        PREFIXO:
                      </span>
                      <select
                        value={iscaPrefix1}
                        onChange={(e) => {
                          const newPrefix = e.target.value;
                          setIscaPrefix1(newPrefix);
                          setIsca1(newPrefix + iscaSuffix1);
                        }}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1 py-1.5 text-[10px] font-extrabold text-[#3e2516] focus:border-[#B32025] focus:ring-1 focus:ring-[#B32025]/20 hover:border-[#5c3e29]/50 outline-none cursor-pointer transition-all"
                      >
                        <option value="R100000">R100000</option>
                        <option value="R10000">R10000</option>
                        <option value="30D10000">30D10000</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">
                        RESTO:
                      </span>
                      <input
                        type="text"
                        value={iscaSuffix1}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setIscaSuffix1(val);
                          setIsca1(iscaPrefix1 + val);
                        }}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] uppercase focus:border-[#B32025] focus:ring-1 focus:ring-[#B32025]/20 hover:border-[#5c3e29]/50 outline-none transition-all"
                        placeholder="RESTO..."
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">
                        BATERIA:
                      </span>
                      <input
                        type="text"
                        value={isca1Bateria}
                        onChange={(e) => setIsca1Bateria(e.target.value)}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] focus:border-[#B32025] focus:ring-1 focus:ring-[#B32025]/20 hover:border-[#5c3e29]/50 outline-none transition-all"
                        placeholder="100%"
                      />
                    </div>
                  </div>
                </div>

                {/* ISCA 2 SECTION */}
                {numCarretas === 2 && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-[#B32025] block mb-1">
                      DISPOSITIVO ISCA 2:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">
                          PREFIXO:
                        </span>
                        <select
                          value={iscaPrefix2}
                          onChange={(e) => {
                            const newPrefix = e.target.value;
                            setIscaPrefix2(newPrefix);
                            setIsca2(newPrefix + iscaSuffix2);
                          }}
                          className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1 py-1.5 text-[10px] font-extrabold text-[#3e2516] focus:border-[#B32025] focus:ring-1 focus:ring-[#B32025]/20 hover:border-[#5c3e29]/50 outline-none cursor-pointer transition-all"
                        >
                          <option value="R100000">R100000</option>
                          <option value="R10000">R10000</option>
                          <option value="30D10000">30D10000</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">
                          RESTO:
                        </span>
                        <input
                          type="text"
                          value={iscaSuffix2}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setIscaSuffix2(val);
                            setIsca2(iscaPrefix2 + val);
                          }}
                          className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] uppercase focus:border-[#B32025] focus:ring-1 focus:ring-[#B32025]/20 hover:border-[#5c3e29]/50 outline-none transition-all"
                          placeholder="RESTO..."
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">
                          BATERIA:
                        </span>
                        <input
                          type="text"
                          value={isca2Bateria}
                          onChange={(e) => setIsca2Bateria(e.target.value)}
                          className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] focus:border-[#B32025] focus:ring-1 focus:ring-[#B32025]/20 hover:border-[#5c3e29]/50 outline-none transition-all"
                          placeholder="100%"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* EMBARQUE SECTIONS */}
            <div className="flex flex-col gap-4">
              {/* CARRETA 1 EMBARQUE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                  <Image size={12} className="text-[#8c6b4e]" /> EMBARQUE (CARRETA 1: {carreta1})
                </label>
                <select
                  value={sidebarEmbarque1}
                  onChange={(e) => setSidebarEmbarque1(e.target.value)}
                  className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none cursor-pointer transition-all shadow-2xs"
                >
                  {EMBARQUE_IMAGES.map((img) => (
                    <option
                      key={img.value}
                      value={img.value}
                      className="font-sans"
                    >
                      {img.label.toUpperCase()}
                    </option>
                  ))}
                </select>

                {sidebarEmbarque1 && (
                  <div className="mt-1 p-2 bg-white/70 border border-[#5c3e29]/20 rounded-xl flex flex-col items-center justify-center shadow-3xs">
                    <img
                      src={sidebarEmbarque1}
                      alt="Preview 1"
                      referrerPolicy="no-referrer"
                      className="max-h-[70px] object-contain rounded border border-[#5c3e29]/10"
                    />
                    <span className="text-[9px] font-black text-[#521521] mt-1.5 uppercase">
                      CARRETA 1: {carreta1 || "NÃO INFORMADA"}
                    </span>
                  </div>
                )}
              </div>

              {/* CARRETA 2 EMBARQUE */}
              {numCarretas === 2 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                    <Image size={12} className="text-[#8c6b4e]" /> EMBARQUE (CARRETA 2: {carreta2})
                  </label>
                  <select
                    value={sidebarEmbarque2}
                    onChange={(e) => setSidebarEmbarque2(e.target.value)}
                    className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none cursor-pointer transition-all shadow-2xs"
                  >
                    {EMBARQUE_IMAGES.map((img) => (
                      <option
                        key={img.value}
                        value={img.value}
                        className="font-sans"
                      >
                        {img.label.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {sidebarEmbarque2 && (
                    <div className="mt-1 p-2 bg-white/70 border border-[#5c3e29]/20 rounded-xl flex flex-col items-center justify-center shadow-3xs">
                      <img
                        src={sidebarEmbarque2}
                        alt="Preview 2"
                        referrerPolicy="no-referrer"
                        className="max-h-[70px] object-contain rounded border border-[#5c3e29]/10"
                      />
                      <span className="text-[9px] font-black text-[#521521] mt-1.5 uppercase">
                        CARRETA 2: {carreta2 || "NÃO INFORMADA"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buttons area (identical to COLUNA.PNG buttons) */}
            <div className="flex flex-col gap-3.5 mt-4">
              {/* COPIAR PARA EMAIL BUTTON (Red, elegant) */}
              <button
                onClick={handleCopyToEmail}
                className={cn(
                  "w-full text-white text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-97 cursor-pointer border-2 border-transparent",
                  copied
                    ? "bg-green-600 hover:bg-green-700 shadow-green-500/20"
                    : "bg-[#B32025] hover:bg-[#8c060a] hover:border-red-900 shadow-red-500/10",
                )}
              >
                {copied ? (
                  <>
                    <Check size={14} className="stroke-[3]" /> COPIADO COM
                    SUCESSO!
                  </>
                ) : (
                  <>
                    <Mail size={14} className="stroke-[2.5]" /> COPIAR PARA
                    EMAIL
                  </>
                )}
              </button>

              {/* LIMPAR INFORMAÇÕES BUTTON (Dark brown, styled) */}
              <button
                onClick={handleClear}
                className="w-full bg-[#3e2516] hover:bg-[#2d1a10] text-[#efdfc6] text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md border-2 border-[#5c3e29]/30 transition-all active:scale-97 cursor-pointer"
              >
                <Trash2 size={14} className="stroke-[2.5]" /> LIMPAR INFORMAÇÕES
              </button>
            </div>

            {/* DICA DE GESTÃO CARD */}
            <div className="bg-[#3c2518] rounded-2xl p-4 border border-[#5c3e29] shadow-inner mt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                Dica de Gestão
              </span>
              <p className="text-[10px] font-semibold text-[#fdefd1]/90 leading-relaxed">
                Verifique os dados cuidadosamente antes de enviar. O pré-alerta
                gerado deve estar 100% de acordo com a nota fiscal e a ordem de
                coleta de iscas do pátio para mitigar sinistros.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Vehicle & Cargo Column (fixed width) */}
      <div className="col-span-1 xl:col-span-1 flex flex-col">
        <div
          className="rounded-3xl bg-[#e6d5bf] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col p-6 sm:p-7"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #efdfc6 0%, #e2cfb2 100%)",
          }}
        >
          {/* Vintage brass flat-head screws on corners */}
          <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

          {/* Form Header */}
          <div className="border-b border-[#dac0a3] pb-4 mb-5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c6b4e] block">
              Painel de Viagem
            </span>
            <h3 className="text-base font-serif font-black text-[#3e2516] uppercase tracking-tight mt-0.5 flex items-center gap-2">
              <Truck size={18} className="text-[#B32025]" /> Veículo & Carga
            </h3>
          </div>

          {/* Form inputs */}
          <div className="flex flex-col gap-4">
            {/* CAVALO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Truck size={12} className="text-[#8c6b4e]" /> Placa do Cavalo
              </label>
              <input
                type="text"
                value={cavalo}
                onChange={(e) => setCavalo(e.target.value.replace(/-/g, "").toUpperCase())}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="PLACA DO CAVALO"
              />
            </div>

            {/* CARRETA 1 GROUP */}
            <div className="flex flex-col gap-3 p-3 bg-[#5c3e29]/5 rounded-xl border border-[#5c3e29]/15 shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                    <Truck size={10} className="text-[#8c6b4e]" /> Carreta 1
                  </label>
                  <input
                    type="text"
                    value={carreta1}
                    onChange={(e) => setCarreta1(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                    placeholder="CARRETA 1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                    <Package size={10} className="text-[#8c6b4e]" /> Produto 1
                  </label>
                  <input
                    type="text"
                    value={produto1}
                    onChange={(e) => setProduto1(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                    placeholder="PRODUTO 1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                    <Hash size={10} className="text-[#8c6b4e]" /> U.M.A. 1
                  </label>
                  <input
                    type="text"
                    value={uma1}
                    onChange={(e) => setUma1(formatUMA(e.target.value))}
                    className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                    placeholder="0XX.XXX.XXX.XXX"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                    <FileText size={10} className="text-[#8c6b4e]" /> NF Início
                  </label>
                  <input
                    type="text"
                    value={nfInicio}
                    onChange={(e) => setNfInicio(e.target.value.replace(/-/g, "").toUpperCase())}
                    className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                    placeholder="INÍCIO"
                  />
                </div>
              </div>
            </div>

            {/* CARRETA 2 GROUP */}
            {numCarretas === 2 && (
              <div className="flex flex-col gap-3 p-3 bg-[#5c3e29]/5 rounded-xl border border-[#5c3e29]/15 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                      <Truck size={10} className="text-[#8c6b4e]" /> Carreta 2
                    </label>
                    <input
                      type="text"
                      value={carreta2}
                      onChange={(e) => setCarreta2(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                      placeholder="CARRETA 2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                      <Package size={10} className="text-[#8c6b4e]" /> Produto 2
                    </label>
                    <input
                      type="text"
                      value={produto2}
                      onChange={(e) => setProduto2(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                      placeholder="PRODUTO 2"
                    />
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                  <div className={isca2 === "SEM ISCA" ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
                    <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                      <Hash size={10} className="text-[#8c6b4e]" /> U.M.A. 2
                    </label>
                    <input
                      type="text"
                      value={uma2}
                      onChange={(e) => setUma2(formatUMA(e.target.value))}
                      className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                      placeholder="0XX.XXX.XXX.XXX"
                    />
                  </div>
                  {isca2 !== "SEM ISCA" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                        <FileText size={10} className="text-[#8c6b4e]" /> NF Fim
                      </label>
                      <input
                        type="text"
                        value={nfFim}
                        onChange={(e) => setNfFim(e.target.value.replace(/-/g, "").toUpperCase())}
                        className="w-full bg-white border border-[#5c3e29]/30 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 hover:border-[#5c3e29]/50 outline-none transition-all shadow-2xs"
                        placeholder="FIM"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
