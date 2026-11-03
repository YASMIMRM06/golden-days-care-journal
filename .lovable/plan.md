# SAMI — integração dos registros reais

## Resultado
Manter o visual, a navegação e os recursos atuais, substituindo os dados de demonstração e a persistência local de registros por dados salvos na Lovable Cloud. A estrutura ausente será criada aqui, conforme sua escolha.

## Estrutura e proteção dos dados
- Criar `idosos`, `idoso_contatos`, `historico_medico`, `medicamentos`, `medicamento_administracoes`, `consultas`, `ocorrencias`, `rotina_atividades`, `documentos`, `eventos`, `notificacoes` e `relatorio_modelos`.
- Criar as views `vw_idosos_lista`, `vw_calendario_itens` e `vw_dashboard_resumo`.
- Usar vínculos por UUID e permissões verificadas no banco: usuários aprovados acessam os cuidados; só administradores inativam/reativam idosos e excluem documentos; notificações pertencem a cada usuário.
- Criar os espaços privados `idosos-fotos`, `documentos` e `relatorios-anexos`, com limite de 15 MB para anexos de relatórios. Preservar o espaço privado de exames.
- Não transformar dados fictícios em registros reais. O sistema mostrará listas vazias até o cadastro de dados verdadeiros.

## Integração das telas
1. **Idosos e ficha:** lista pela view, cadastro e edição com contatos, primeiro parente como responsável principal, CPF só com dígitos, foto privada e ficha relacionada pelo UUID. Ocultar inativos por padrão, permitir filtro explícito e confirmação para inativação/reativação por administrador.
2. **Histórico, medicamentos, alimentação e exames:** registros vinculados ao idoso; seletor no topo do histórico; abas filtradas por categoria; horários de medicamentos como array; remover o uso de nomes como vínculo.
3. **Ocorrências e rotina:** responsáveis selecionados entre usuários aprovados, com o usuário atual como padrão; horário de ocorrência em São Paulo; rotina geral do dia com data e autor da conclusão.
4. **Documentos e relatórios:** upload privado e metadados persistentes; abrir, baixar e imprimir o arquivo real; exclusão de documentos exclusiva do administrador, com confirmação e sem senha especial; salvar os modelos de relatório e seus anexos.
5. **Calendário e painel:** agenda pela view unindo eventos, consultas e aniversários; editar/excluir apenas eventos próprios da agenda; indicadores pela view e gráficos calculados a partir de ocorrências e administrações reais.
6. **Notificações e preferências:** salvar e ler por conta; registrar leitura no banco; retirar dados de demonstração e armazenamento local de dados de aplicação, preservando o armazenamento necessário à sessão de login.
7. **Cadastro de conta:** retirar Médico do seletor, mantendo os demais cargos e os métodos atuais de entrada.

## Regras preservadas
- Seletores de idosos excluem inativos.
- “Outro + Especifique” salva o texto final na própria coluna.
- Valores internos de status são minúsculos e sem acento; os rótulos atuais continuam na tela.
- Falhas de leitura, gravação e upload aparecem em avisos, sem mensagem falsa de sucesso.

## Detalhes técnicos
- Regenerar os tipos após criar a estrutura e usar funções autenticadas, cache de consultas e invalidação após gravações.
- Adequar as telas internas ao carregamento autenticado do TanStack sem alterar suas URLs ou aparência.
- Preservar dados antigos de alimentação e exames: atualmente `idoso_id` é texto e alguns valores apontam para demonstrações, não UUIDs. Fazer adaptação aditiva com referência UUID validada, sem apagar registros nem converter identificadores fictícios em pessoas reais; manter os campos antigos apenas para compatibilidade e marcá-los como descontinuados. A aplicação usará exclusivamente o vínculo UUID novo nesses dois casos.
- Garantir permissões explícitas, políticas de acesso e proteção dos arquivos no banco, não somente esconder botões.
- Atualizar os metadados próprios das páginas e registrar a arquitetura adotada.

## Verificação
- Testes das regras de status, CPF, “Outro”, vínculos UUID, fuso horário, conclusão de rotina, limite de anexo e permissões.
- Testar com sessão autenticada: cadastrar idoso e contato, editar sem duplicar, vincular registros, enviar e abrir arquivo, marcar notificação como lida e recarregar para confirmar persistência.
- Conferir as telas, erros e acesso por administrador e usuário aprovado; informar qualquer verificação que depender de conta ainda indisponível.