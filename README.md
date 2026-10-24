# 💈 Teu Barber Studio - Sistema de Agendamento & Gestão

Aplicação completa desenvolvida sob medida para o **Teu Barber Studio**, substituindo a antiga plataforma legada por uma solução moderna, rápida, responsiva e com identidade visual premium (Dark Mode, acabamento metálico cromo/aço escovado).

---

## 🌟 Funcionalidades Principais

### 1. 📱 Portal de Agendamento do Cliente (Mobile-First)
* **Passo 1 - Escolha do Profissional**: Seleção entre **Teu** (Master Barber / Proprietário) e **Gustavo** (Barbeiro Profissional), com fotos, especialidades e avaliações.
* **Passo 2 - Catálogo Completo de Serviços**:
  * Filtros por categoria: *Cabelo, Barba, Combos, Química & Cores, Estética Facial*.
  * Valores e durações exatas do estúdio (ex: Corte R$ 30, Barba R$ 20, Combos de R$ 40 a R$ 70, Platinados a partir de R$ 100, Selagem R$ 80, Limpeza de Pele R$ 25).
* **Passo 3 - Escolha de Data e Horário Dinâmico**:
  * Pílulas rápidas para os próximos 7 dias + seletor de calendário.
  * Grade inteligente de horários que verifica em tempo real se o horário já está reservado ou bloqueado.
* **Passo 4 - Identificação do Cliente**: Nome completo, telefone com máscara de DDD (38), observações e forma de pagamento preferida (Pix, Dinheiro, Cartão).
* **Passo 5 - Confirmação Instantânea & WhatsApp**:
  * Comprovante com código de reserva `#TB-XXXXX`.
  * Botão com link direto para o WhatsApp do Teu Barber (`5538991218119`) com a mensagem de agendamento já formatada.

---

### 2. 🛡️ Painel Administrativo do Barbeiro
Acesso pelo botão **"Painel Gestão"** no cabeçalho superior. Contém 5 módulos completos:

#### 📅 1. Agenda & Atendimentos
* Visualização diária ou geral de agendamentos.
* Filtros por Barbeiro (Teu, Gustavo ou Todos), Status (Pendente, Confirmado, Concluído, Cancelado) e busca rápida.
* **Lembrete WhatsApp em 1 clique**: Abre o WhatsApp do cliente com texto pronto de lembrete do horário.
* **Concluir Atendimento**: Finaliza o atendimento e **lança automaticamente a receita no Fluxo de Caixa**.
* **Novo Agendamento Manual**: Registra clientes presenciais ou que agendaram por telefone.

#### ⏰ 2. Gestão de Horários & Expediente
* Grade interativa de horários por data e profissional.
* Bloqueio rápido em 1 clique (para intervalos de almoço, folgas, compromissos pessoais). O horário bloqueado fica indisponível para os clientes no mesmo instante.
* Ajuste de horários de funcionamento do estúdio (abertura, fechamento e intervalo de almoço).

#### 💰 3. Gestão Financeira & Fluxo de Caixa
* **Indicadores em Tempo Real**:
  * Faturamento Hoje (R$)
  * Entradas Totais Acumuladas (R$)
  * Despesas e Insumos (R$)
  * Saldo / Lucro Líquido (R$)
  * Ticket Médio por Atendimento (R$)
* **Divisão de Produção e Comissões**:
  * Relatório de atendimentos realizados por Teu e por Gustavo com cálculo automático da comissão devida.
* **Extrato de Movimentações**:
  * Histórico de todas as entradas e saídas com filtro (Pix, Cartão, Dinheiro), categorização e exclusão.
  * Lançamento manual de despesas (compra de lâminas, produtos, energia, aluguel).

#### 🛠️ 4. Planejamento de Aquisições (Melhoria do Espaço)
* Módulo exclusivo para reinvestimento e evolução do estúdio Teu Barber.
* Metas cadastradas:
  1. *Cadeira Hidráulica Reclinável Vintage em Couro*
  2. *Ar-Condicionado Split Inverter 18.000 BTUs*
  3. *Espelho Camarim com Iluminação Frontal LED 4000K* (Conquistado!)
  4. *Máquina Wahl Cordless Magic Clip Gold Edition*
  5. *Frigobar Retrô Preto Fosco para Clientes*
  6. *Sofá Chesterfield 3 Lugares para Sala de Espera*
* **Barra de Progresso Visual (%)** e status (Planejado, Em Economia, Adquirido).
* **Métrica do Barbeiro**: Conversão automática do valor restante em *"Quantos cortes de cabelo faltam"* para atingir o objetivo!
* **Aporte / Guardar Dinheiro**: Permite destinar recursos diretamente do caixa para cada meta com opção de dedução automática no fluxo de caixa.

#### ⚙️ 5. Catálogo & Configurações
* Edição rápida de preços e adição de novos serviços.
* Configuração de dados de contato (WhatsApp, Telefone, Endereço, Instagram).
* **Backup de Segurança**: Exportação e importação de todos os dados em arquivo `.json`.
* Botão para redefinir padrões originais se necessário.

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências (caso ainda não tenha feito)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
```

A aplicação está configurada para rodar em `http://localhost:3000/`.
