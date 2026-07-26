export type Idoso = {
  id: string;
  nome: string;
  idade: number;
  dataNascimento: string;
  cpf: string;
  telefone: string;
  endereco: string;
  grauDependencia: "Independente" | "Parcial" | "Total";
  responsavel: string;
  status: "Ativo" | "Inativo" | "Internado";
  foto: string;
  observacoes?: string;
};

export type Ocorrencia = {
  id: string;
  data: string;
  tipo: "Queda" | "Emergência" | "Alteração de Saúde" | "Comportamental" | "Outro";
  idoso: string;
  responsavel: string;
  descricao: string;
};

export type Medicamento = {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  horarios: string[];
  via: string;
  status: "Ativo" | "Suspenso";
  idoso: string;
};

export type Consulta = {
  id: string;
  data: string;
  hora: string;
  medico: string;
  especialidade: string;
  local: string;
  idoso: string;
  status: "Agendada" | "Realizada" | "Cancelada";
};

export type RotinaItem = {
  id: string;
  horario: string;
  atividade: string;
  categoria: "Alimentação" | "Higiene" | "Exercícios" | "Terapias" | "Lazer";
  responsavel: string;
  status: "Pendente" | "Concluída";
};

export type Documento = {
  id: string;
  nome: string;
  categoria: "RG" | "CPF" | "Convênio" | "Receitas" | "Procurações";
  tamanho: string;
  data: string;
  idoso: string;
};

export const idosos: Idoso[] = [
  {
    id: "1",
    nome: "Maria Aparecida Silva",
    idade: 82,
    dataNascimento: "1943-04-12",
    cpf: "123.456.789-00",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Acácias, 120 — São Paulo/SP",
    grauDependencia: "Parcial",
    responsavel: "Ana Silva",
    status: "Ativo",
    foto: "",
    observacoes: "Hipertensa, usa óculos para leitura.",
  },
  {
    id: "2",
    nome: "José Carlos Oliveira",
    idade: 76,
    dataNascimento: "1949-09-03",
    cpf: "987.654.321-00",
    telefone: "(11) 99876-5432",
    endereco: "Av. Brasil, 980 — São Paulo/SP",
    grauDependencia: "Independente",
    responsavel: "Pedro Oliveira",
    status: "Ativo",
    foto: "",
  },
  {
    id: "3",
    nome: "Antônia Pereira",
    idade: 89,
    dataNascimento: "1936-01-22",
    cpf: "456.789.123-00",
    telefone: "(11) 97777-1234",
    endereco: "Rua dos Ipês, 45 — São Paulo/SP",
    grauDependencia: "Total",
    responsavel: "Carlos Pereira",
    status: "Internado",
    foto: "",
    observacoes: "Mobilidade reduzida, acamada.",
  },
  {
    id: "4",
    nome: "Joaquim Rodrigues",
    idade: 71,
    dataNascimento: "1954-06-18",
    cpf: "321.654.987-00",
    telefone: "(11) 96666-7788",
    endereco: "Rua Verde, 22 — Guarulhos/SP",
    grauDependencia: "Independente",
    responsavel: "Marta Rodrigues",
    status: "Ativo",
    foto: "",
  },
  {
    id: "5",
    nome: "Luzia Fernandes",
    idade: 84,
    dataNascimento: "1941-11-30",
    cpf: "654.321.987-00",
    telefone: "(11) 95555-4433",
    endereco: "Rua Azul, 300 — São Paulo/SP",
    grauDependencia: "Parcial",
    responsavel: "Beatriz Fernandes",
    status: "Ativo",
    foto: "",
  },
];

export const ocorrencias: Ocorrencia[] = [
  { id: "o1", data: "2026-06-14 08:30", tipo: "Queda", idoso: "Antônia Pereira", responsavel: "Enf. Júlia", descricao: "Queda no banheiro sem fratura aparente." },
  { id: "o2", data: "2026-06-14 14:10", tipo: "Alteração de Saúde", idoso: "Maria Aparecida Silva", responsavel: "Enf. Carlos", descricao: "Pico de pressão 16/10." },
  { id: "o3", data: "2026-06-13 22:00", tipo: "Emergência", idoso: "José Carlos Oliveira", responsavel: "Dr. Roberto", descricao: "Dor torácica, encaminhado ao PS." },
  { id: "o4", data: "2026-06-12 10:00", tipo: "Comportamental", idoso: "Luzia Fernandes", responsavel: "Psic. Helena", descricao: "Episódio de agitação noturna." },
  { id: "o5", data: "2026-06-11 16:45", tipo: "Outro", idoso: "Joaquim Rodrigues", responsavel: "Enf. Júlia", descricao: "Recusou refeição da tarde." },
];

export const medicamentos: Medicamento[] = [
  { id: "m1", nome: "Losartana", dosagem: "50mg", frequencia: "12/12h", horarios: ["08:00", "20:00"], via: "Oral", status: "Ativo", idoso: "Maria Aparecida Silva" },
  { id: "m2", nome: "Metformina", dosagem: "850mg", frequencia: "8/8h", horarios: ["08:00", "14:00", "20:00"], via: "Oral", status: "Ativo", idoso: "José Carlos Oliveira" },
  { id: "m3", nome: "Donepezila", dosagem: "10mg", frequencia: "1x/dia", horarios: ["21:00"], via: "Oral", status: "Ativo", idoso: "Antônia Pereira" },
  { id: "m4", nome: "Omeprazol", dosagem: "20mg", frequencia: "1x/dia", horarios: ["07:00"], via: "Oral", status: "Ativo", idoso: "Luzia Fernandes" },
  { id: "m5", nome: "Sinvastatina", dosagem: "20mg", frequencia: "1x/dia", horarios: ["22:00"], via: "Oral", status: "Suspenso", idoso: "Joaquim Rodrigues" },
];

export const consultas: Consulta[] = [
  { id: "c1", data: "2026-06-15", hora: "09:00", medico: "Dr. Roberto Lima", especialidade: "Cardiologia", local: "Hospital Sírio", idoso: "Maria Aparecida Silva", status: "Agendada" },
  { id: "c2", data: "2026-06-15", hora: "14:30", medico: "Dra. Helena Souza", especialidade: "Geriatria", local: "Clínica Bem-Estar", idoso: "Antônia Pereira", status: "Agendada" },
  { id: "c3", data: "2026-06-18", hora: "10:00", medico: "Dr. Pedro Alves", especialidade: "Neurologia", local: "Hospital Albert", idoso: "Luzia Fernandes", status: "Agendada" },
  { id: "c4", data: "2026-06-10", hora: "11:00", medico: "Dra. Carla Mendes", especialidade: "Endocrinologia", local: "Clínica Vida", idoso: "José Carlos Oliveira", status: "Realizada" },
];

export const rotina: RotinaItem[] = [
  { id: "r1", horario: "07:00", atividade: "Café da manhã", categoria: "Alimentação", responsavel: "Cuidadora Ana", status: "Concluída" },
  { id: "r2", horario: "08:00", atividade: "Banho e higiene", categoria: "Higiene", responsavel: "Cuidadora Ana", status: "Concluída" },
  { id: "r3", horario: "10:00", atividade: "Caminhada no jardim", categoria: "Exercícios", responsavel: "Fisio. Bruno", status: "Pendente" },
  { id: "r4", horario: "12:00", atividade: "Almoço", categoria: "Alimentação", responsavel: "Cuidadora Ana", status: "Pendente" },
  { id: "r5", horario: "15:00", atividade: "Sessão de fisioterapia", categoria: "Terapias", responsavel: "Fisio. Bruno", status: "Pendente" },
  { id: "r6", horario: "16:30", atividade: "Atividade de leitura", categoria: "Lazer", responsavel: "Voluntária Júlia", status: "Pendente" },
  { id: "r7", horario: "19:00", atividade: "Jantar", categoria: "Alimentação", responsavel: "Cuidadora Sara", status: "Pendente" },
];

export const documentos: Documento[] = [
  { id: "d1", nome: "RG_MariaSilva.pdf", categoria: "RG", tamanho: "1.2 MB", data: "2024-02-10", idoso: "Maria Aparecida Silva" },
  { id: "d2", nome: "Convenio_Unimed.pdf", categoria: "Convênio", tamanho: "320 KB", data: "2025-01-05", idoso: "José Carlos Oliveira" },
  { id: "d3", nome: "Receita_Donepezila.pdf", categoria: "Receitas", tamanho: "210 KB", data: "2026-05-22", idoso: "Antônia Pereira" },
  { id: "d4", nome: "Procuracao_Luzia.pdf", categoria: "Procurações", tamanho: "540 KB", data: "2025-11-30", idoso: "Luzia Fernandes" },
];

export const ocorrenciasPorMes = [
  { mes: "Jan", total: 8 },
  { mes: "Fev", total: 5 },
  { mes: "Mar", total: 12 },
  { mes: "Abr", total: 7 },
  { mes: "Mai", total: 10 },
  { mes: "Jun", total: 6 },
];

export const medicamentosAdministrados = [
  { dia: "Seg", total: 32 },
  { dia: "Ter", total: 28 },
  { dia: "Qua", total: 35 },
  { dia: "Qui", total: 30 },
  { dia: "Sex", total: 33 },
  { dia: "Sáb", total: 29 },
  { dia: "Dom", total: 27 },
];

export const quedasPorMes = [
  { mes: "Jan", total: 2 },
  { mes: "Fev", total: 1 },
  { mes: "Mar", total: 3 },
  { mes: "Abr", total: 1 },
  { mes: "Mai", total: 2 },
  { mes: "Jun", total: 1 },
];

export const historicoMedico = {
  diagnosticos: [
    { id: "h1", data: "2024-03-15", descricao: "Hipertensão arterial sistêmica", responsavel: "Dr. Roberto Lima" },
    { id: "h2", data: "2025-01-20", descricao: "Diabetes Mellitus tipo 2", responsavel: "Dra. Carla Mendes" },
  ],
  alergias: [
    { id: "a1", data: "2024-03-15", descricao: "Penicilina — reação cutânea severa", responsavel: "Dr. Roberto Lima" },
  ],
  internacoes: [
    { id: "i1", data: "2025-08-02", descricao: "Pneumonia — 5 dias internada", responsavel: "Hospital Sírio" },
  ],
  cirurgias: [
    { id: "c1", data: "2018-06-10", descricao: "Catarata olho direito", responsavel: "Dr. Marcos Tavares" },
  ],
  exames: [
    { id: "e1", data: "2026-05-12", descricao: "Hemograma completo — normal", responsavel: "Lab. Fleury" },
    { id: "e2", data: "2026-04-08", descricao: "Eletrocardiograma — sem alterações", responsavel: "Clínica CardioVida" },
  ],
  especialistas: [
    { id: "m1", data: "—", descricao: "Dr. Roberto Lima — Cardiologia", responsavel: "Acompanhamento mensal" },
    { id: "m2", data: "—", descricao: "Dra. Helena Souza — Geriatria", responsavel: "Acompanhamento trimestral" },
  ],
};
