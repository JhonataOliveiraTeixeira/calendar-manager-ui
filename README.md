# Calendar Management Frontend

Este projeto implementa uma aplicação de gestão de calendário, utilizando tecnologias como React, Chakra UI, FullCalendar e Socket.IO para sincronização em tempo real.

## Tecnologias Utilizadas

- **React** (com suporte a React 18 e Server Components)
- **Chakra UI** (para estilização)
- **FullCalendar** (gestão e visualização de eventos)
- **Socket.IO** (comunicação em tempo real)
- **Axios** (requisições HTTP)
- **DateTime** (controle de datas e horários)
- **Chakra Dayzed Datepicker** (seletor de datas)

## Estrutura do Projeto

### Components

#### CalendarList

Este componente principal exibe o calendário e permite:

- Visualizar eventos.
- Criar eventos ao clicar em um dia vazio.
- Editar eventos existentes ao clicar em um evento.
- Excluir eventos.

**Principais Funções:**

- `handleDateClick`: Cria um novo evento com data e horário de início e término com 1h de diferença.
- `handleEventClick`: Abre o modal para editar um evento.
- `mapEvent`: Mapeia eventos recebidos da API para o formato aceito pelo FullCalendar.
- `useEffect`: Atualização automática dos eventos com o uso de Socket.IO.

**Exemplo de JSX:**

```jsx
<FullCalendar
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  events={events}
  dateClick={handleDateClick}
  eventClick={handleEventClick}
  eventContent={renderEventContent}
/>


InitialFocus (Modal de Evento)

Este componente é o modal usado para criar, editar e excluir eventos.

Principais Funções:

handleSave: Envia uma requisição POST para criar um evento.

handleUpdateEvent: Atualiza um evento existente via requisição PUT.

handleCancelEvent: Remove um evento existente via DELETE.

handleStartTimeChange / handleEndTimeChange: Mantêm a diferença de 1 hora entre os horários de início e término.

Exemplo de JSX:

<Modal isOpen={isOpenProp} onClose={onCloseProp}>
  <ModalHeader>{event ? "Editar Evento" : "Agendar Novo Evento"}</ModalHeader>
  <FormControl>
    <FormLabel>Nome do evento</FormLabel>
    <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
  </FormControl>
  <DateTime value={startTime} onChange={(date) => handleStartTimeChange(date.toDate())} />
</Modal>

Contexts

EventsContext

Prover as funções relacionadas à manipulação de eventos:

events: Lista de eventos.

setEvents: Atualização dos eventos.

pushEvents: Recupera eventos do localStorage.

clearEvents: Limpa os eventos.

CalendarContext

Responsável por armazenar e manipular o ID do calendário selecionado.

Como Rodar o Projeto

Instale as dependências:

npm install

Inicie o projeto:

npm run dev

Certifique-se de que a API esteja em execução para as requisições de sincronização.

Endpoints Utilizados

GET /events/login: Conecta ao Google e recupera os calendários.

GET /events/init-sync: Inicia a sincronização dos eventos.

DELETE /events/delete/:calendarId/:eventId: Remove um evento.

PUT /events/update/:calendarId/:eventId: Atualiza um evento.

POST /events/create: Cria um evento.

Fluxo de Dados

O usuário clica em uma data ou evento no calendário.

O modal é aberto para edição ou criação.

Ao salvar ou excluir, uma requisição é enviada para a API.

Os eventos são atualizados e sincronizados automaticamente com o backend via Socket.IO.

Estilização Personalizada

O FullCalendar foi customizado com CSS para melhor adequação ao layout:

.fc-daygrid-day {
  height: 160px;
}
.fc-daygrid-event {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

Melhorias Futuras

Implementar validações para os campos obrigatórios no modal.

Adicionar notificções de sucesso e erro para as operações de eventos.

Melhorar o gerenciamento de erros na comunicação com a API.