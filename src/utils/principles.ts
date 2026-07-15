import { useState, useEffect } from 'react';

export interface Principle {
  num: number;
  title: string;
  description: string;
}

export const PRINCIPLES_OF_LEADERSHIP: Principle[] = [
  {
    num: 1,
    title: "1. ENCANTE O CONSUMIDOR",
    description: "Coloque-se no lugar do consumidor para compreender e atender às suas necessidades. Priorize-o em todas as decisões. Trabalhe continuamente para superar suas expectativas, gerando experiências e memórias prazerosas com nossos produtos e serviços."
  },
  {
    num: 2,
    title: "2. CONSTRUA LAÇOS LEGÍTIMOS E DURADOUROS",
    description: "Cultive relacionamentos com simplicidade e sinceridade. Tenha interesse genuíno pelas pessoas, dedique tempo a elas e promova conexões. Fortaleça os times e esteja presente nos momentos bons e nos difíceis. Construa um ambiente de trabalho acolhedor, seguro, diverso e inclusivo."
  },
  {
    num: 3,
    title: "3. PLANEJE E FAÇA ACONTECER",
    description: "Planeje antes de agir. Trabalhe com colaboração, entusiasmo e dedicação. Seja proativo e mão na massa. Assuma riscos calculados e busque a causa raiz na solução dos problemas. Evite desperdício de recursos e tempo. Vá até o fim, garantindo o resultado, respeitando os processos e com sinergia entre as áreas."
  },
  {
    num: 4,
    title: "4. EMPREENDA E INOVE",
    description: "Seja inquieto, curioso e criativo. Transforme necessidades em oportunidades. Teste e aprenda rápido, gerando e adaptando ideias. Empreenda a fim de gerar valor para o negócio. Seja um agente de transformação!"
  },
  {
    num: 5,
    title: "5. TENHA ATITUDE DE DONO",
    description: "Comprometa-se com o que é melhor para o negócio. Tome decisões pensando no todo e com visão de longo prazo. Faça o que precisa ser feito, com zelo e da forma correta. Seja exemplo e construa uma empresa da qual você se orgulhe: esta é a sua obra!"
  },
  {
    num: 6,
    title: "6. COMUNIQUE-SE COM CLAREZA E RESPEITO",
    description: "Pratique a escuta ativa, com interesse sincero pela opinião do outro. Posicione-se de forma equilibrada e embasado em fatos e dados. Compartilhe informações com responsabilidade, transparência e objetividade. Não fuja das conversas difíceis, tratando as pessoas com cuidado e respeito."
  },
  {
    num: 7,
    title: "7. TENHA HUMILDADE PARA APRENDER E ENSINAR",
    description: "Aprenda, desaprenda e reaprenda. Busque conhecimentos, cultive novos hábitos e absorva o melhor da experiência dos outros. Compartilhe aprendizados, treine e incentive o crescimento de todos. Seja protagonista do seu desenvolvimento e nunca pare de evoluir!"
  },
  {
    num: 8,
    title: "8. SEJA RESILIENTE",
    description: "Tenha flexibilidade e reinvente-se frente às mudanças. Mantenha o equilíbrio e a serenidade para se adaptar às situações inesperadas, garantindo a operação mesmo diante das dificuldades. Persista com coragem e disciplina na nossa jornada."
  },
  {
    num: 9,
    title: "9. CONSTRUA UMA EMPRESA SUSTENTÁVEL",
    description: "Pratique a ESG! Trabalhe com foco nas melhores práticas para minimizar os efeitos da nossa operação no meio ambiente, causar impacto social positivo e aprimorar a nossa governança. Atue como cidadão: o futuro se constrói agora."
  }
];

export function getCurrentPrincipleIndex(): number {
  const hour = new Date().getHours();
  // Safe mod constraint to ensure we never get a index out of bounds
  return hour % PRINCIPLES_OF_LEADERSHIP.length;
}

export function getCurrentPrinciple(): Principle {
  const index = getCurrentPrincipleIndex();
  return PRINCIPLES_OF_LEADERSHIP[index];
}

export function useCurrentPrinciple(): Principle {
  const [principle, setPrinciple] = useState<Principle>(getCurrentPrinciple());

  useEffect(() => {
    // Check every 10 seconds to update the UI elegantly when hour transitions
    const interval = setInterval(() => {
      setPrinciple(getCurrentPrinciple());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return principle;
}
