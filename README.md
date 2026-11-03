# Care Companion Pro

Se você vai usar o Lovable para gerar o frontend do Sistema de Gestão de Cuidados para Idosos, o ideal é fornecer um prompt detalhado, descrevendo telas, componentes, navegação, design system e experiência do usuário.

Prompt para Lovable

Crie um frontend completo e moderno para um sistema web responsivo chamado CareSenior, uma plataforma de gestão de cuidados para idosos.

Tecnologias

React + TypeScript

Tailwind CSS

Shadcn/UI

React Router

Lucide Icons

Design responsivo Mobile First

Identidade Visual

Crie uma interface profissional para área da saúde.

Cores

Primária: #2563EB (Azul)

Secundária: #14B8A6 (Turquesa)

Sucesso: #22C55E

Alerta: #F59E0B

Erro: #EF4444

Fundo: #F8FAFC

Estilo

Limpo

Moderno

Acessível

Bordas arredondadas

Sombras suaves

Cards informativos

Tipografia clara

Estrutura de Navegação

Criar sidebar fixa contendo:

Dashboard

Idosos

Histórico Médico

Ocorrências

Medicamentos

Rotina

Documentos

Relatórios

Consultas

Calendário

Configurações

Navbar superior contendo:

Campo de busca

Notificações

Perfil do usuário

Logout

Tela Dashboard

Criar dashboard com:

Cards Resumo

Total de Idosos

Medicamentos Pendentes

Consultas Hoje

Ocorrências do Dia

Gráficos

Ocorrências por mês

Medicamentos administrados

Histórico de quedas

Atividades Recentes

Lista com:

Últimas ocorrências

Consultas agendadas

Medicamentos registrados

Tela Cadastro de Idosos

Tabela completa com:

Foto

Nome

Idade

Grau de Dependência

Responsável

Status

Botões:

Visualizar

Editar

Excluir

Filtro por:

Nome

Grau de Dependência

Status

Modal de cadastro contendo:

Dados Pessoais

Nome

Data de Nascimento

CPF

Telefone

Endereço

Informações de Saúde

Grau de Dependência

Dificuldades

Observações

Tela Histórico Médico

Criar prontuário organizado em abas:

Diagnósticos

Alergias

Internações

Cirurgias

Exames

Médicos Especialistas

Cada item deve possuir:

Data

Descrição

Responsável pelo registro

Tela Ocorrências

Tabela com:

Data

Tipo de Ocorrência

Idoso

Responsável

Filtros:

Período

Tipo

Idoso

Formulário contendo:

Tipo da ocorrência

Descrição

Data

Responsável

Observações

Destaque visual para:

Quedas

Emergências

Alterações de saúde

Tela Medicamentos

Tabela contendo:

Nome

Dosagem

Frequência

Horário

Status

Cards de alertas para medicamentos próximos do horário.

Formulário:

Nome

Dosagem

Frequência

Via de administração

Horários

Criar timeline de administração.

Tela Rotina Diária

Visualização estilo agenda.

Exibir:

Horário

Atividade

Responsável

Status

Permitir:

Marcar como concluída

Reagendar

Editar

Categorias:

Alimentação

Higiene

Exercícios

Terapias

Lazer

Tela Documentos

Sistema de upload com drag and drop.

Categorias:

RG

CPF

Convênio

Receitas

Procurações

Visualização:

Lista

Grade

Permitir:

Visualizar

Baixar

Excluir

Tela Relatórios

Gerar relatórios de:

Ocorrências

Quedas

Consultas

Medicamentos

Filtros:

Idoso

Período

Tipo

Botões:

Visualizar PDF

Exportar PDF

Enviar por E-mail

Tela Consultas

Calendário de consultas.

Tabela:

Data

Hora

Médico

Especialidade

Local

Formulário:

Médico

Especialidade

Data

Hora

Observações

Após consulta:

Diagnóstico

Recomendações

Prescrições

Próximos passos

Tela Calendário

Calendário mensal interativo.

Eventos:

Aniversários

Consultas

Datas comemorativas

Atividades de lazer

Cores diferentes por categoria.

Configurações

Perfil do usuário

Gestão de permissões

Notificações

Segurança

Alteração de senha

Componentes Reutilizáveis

Criar:

DataTable

SearchBar

Sidebar

Navbar

ModalForm

EmptyState

LoadingState

ConfirmDialog

NotificationToast

StatisticsCard

UX

Interface extremamente intuitiva

Responsiva para celular, tablet e desktop

Feedback visual para ações

Skeleton loading

Empty states elegantes

Formulários com validação

Toasts de sucesso e erro

Gere todas as páginas, rotas, componentes reutilizáveis, dados mockados e estrutura completa pronta para integração futura com API. Baseie-se em sistemas profissionais de prontuário eletrônico e gestão de instituições de longa permanência para idosos (ILPI).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://golden-days-care-journal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a4e0a8c1-415c-4427-91df-21b24a40f4bb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
