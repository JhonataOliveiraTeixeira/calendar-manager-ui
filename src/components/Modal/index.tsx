"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Box,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Switch,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import DateTime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import axios from "axios";
import { useCalendar } from "../../Contexts/CalendarContext";
import { CalendarEvent } from "../Calendar";
import moment from "moment";

export interface AttendeesProps {
  email: string;
}
export function InitialFocus({
  event,
  date,
  onCloseProp,
  isOpenProp,
}: {
  event?: CalendarEvent | undefined;
  date?: Date;
  onCloseProp: () => void;
  isOpenProp: boolean;
}) {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [dateOnSave, setDateOnSave] = useState<Date>(date || new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [attendees, setAttendees] = useState<AttendeesProps[]>([]);
  const [newAttendee, setNewAttendee] = useState("");
  const [enableMeet, setEnableMeet] = useState(false);

  const { selectedCalendarId } = useCalendar();
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  useEffect(() => {

    if (event) {
      setEventName(event.title);
      setDescription(event.extendedProps?.description || "");
      setDateOnSave(new Date(event.start));
      setStartTime(new Date(event.start));
      setEndTime(new Date(event.end || event.start));
      setEnableMeet(event.extendedProps?.enableMeet || false);

      const storedAttendees = localStorage.getItem("eventAttendees");
      if (storedAttendees) {
        const parsedAttendees = JSON.parse(storedAttendees);
        setAttendees(parsedAttendees[event.id] || []);
      }
    } else if (date) {
      setDateOnSave(date);
      setStartTime(date);
      setEndTime(new Date(date.getTime() + 60 * 60 * 1000));
    }
  }, [event, date]);

  async function handleSave() {
    const payload = {
      calendarId: selectedCalendarId || "primary",
      summary: eventName,
      description: description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      attendees: attendees.length > 0 ? attendees : undefined,
      conferenceData: enableMeet
        ? {
            createRequest: {
              requestId: `${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          }
        : undefined,
    };

    try {
      const response = await axios.post(
        "http://localhost:4567/events/create",
        payload
      );

      const storedAttendees = JSON.parse(
        localStorage.getItem("eventAttendees") || "{}"
      );

      if (response.data.id) {
        storedAttendees[response.data.id] = attendees;
      }

      localStorage.setItem("eventAttendees", JSON.stringify(storedAttendees));

      onCloseProp();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  }

  async function handleUpdateEvent() {
    if (!event) return;

    const payload = {
      summary: eventName,
      description: description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: { dateTime: endTime.toISOString(), timeZone: "America/Sao_Paulo" },
      attendees: attendees,
      conferenceData: enableMeet
        ? {
            createRequest: {
              requestId: `${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          }
        : undefined,
    };

    try {
      await axios.put(
        `http://localhost:4567/events/update/${selectedCalendarId}/${event.id}`,
        payload
      );

      const storedAttendees = JSON.parse(
        localStorage.getItem("eventAttendees") || "{}"
      );
      storedAttendees[event.id] = attendees;
      localStorage.setItem("eventAttendees", JSON.stringify(storedAttendees));

      onCloseProp();
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
    }
  }

  function handleAddAttendee(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && newAttendee.trim() !== "") {
      const newAttendeeObj = { email: newAttendee.trim() };
      setAttendees([...attendees, newAttendeeObj]); 
      setNewAttendee("");
    }
  }

  function handleRemoveAttendee(email: string) {
    setAttendees(attendees.filter((att) => att.email !== email)); 
  }

  function handleStartTimeChange(newStartTime: Date) {
    setStartTime(newStartTime);
    setEndTime(new Date(newStartTime.getTime() + 60 * 60 * 1000));
  }

  async function handleCancelEvent() {
    try {
      if (event) {
        const eventId = event.id;
        const payload = {
          calendarId: selectedCalendarId,
          eventId,
        };
        await axios.delete(
          `http://localhost:4567/events/delete/${payload.calendarId}/${payload.eventId}`
        );
        onCloseProp();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpenProp}
      onClose={onCloseProp}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {event ? "Editar Evento" : "Agendar Novo Evento"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel>Nome do evento</FormLabel>
            <Input
              required
              placeholder="Nome do evento"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </FormControl>

          <FormControl mt={4} isRequired>
            <FormLabel>Descrição</FormLabel>
            <Input
              placeholder="Descrição do evento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          {/* Campo para adicionar participantes */}
          <FormControl mt={4}>
            <FormLabel>Adicionar Participantes</FormLabel>
            <Input
              placeholder="Digite o e-mail e pressione Enter"
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              onKeyDown={handleAddAttendee}
            />
            <HStack spacing={2} mt={2}>
              {attendees.map((att) => (
                <Tag
                  key={att.email}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="teal"
                >
                  <TagLabel>{att.email}</TagLabel>
                  <TagCloseButton
                    _hover={{ color: "teal.900" }}
                    onClick={() => handleRemoveAttendee(att.email)}
                  />
                </Tag>
              ))}
            </HStack>
          </FormControl>

          {/* Botão para ativar Google Meet */}
          <FormControl mt={4} display="flex" alignItems="center">
            <FormLabel mb="0">Criar reunião no Google Meet?</FormLabel>
            <Switch
              isChecked={enableMeet}
              onChange={(e) => setEnableMeet(e.target.checked)}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Selecione a data</FormLabel>
            <SingleDatepicker
              name="date-input"
              date={dateOnSave}
              onDateChange={setDateOnSave}
            />
          </FormControl>

          <Flex direction="row" align="center" gap={2} mt={4}>
            <FormControl>
              <FormLabel>Hora de início</FormLabel>
              <Box border="1px" borderColor="gray.300" borderRadius="md" p={2}>
                <DateTime
                  value={startTime}
                  onChange={(momentObj) =>
                    handleStartTimeChange(
                      moment.isMoment(momentObj)
                        ? momentObj.toDate()
                        : new Date(momentObj)
                    )
                  }
                  dateFormat={false}
                  timeFormat="HH:mm"
                />
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Hora de término</FormLabel>
              <Box border="1px" borderColor="gray.300" borderRadius="md" p={2}>
                <DateTime
                  value={endTime}
                  onChange={(momentObj) =>
                    handleStartTimeChange(
                      moment.isMoment(momentObj)
                        ? momentObj.toDate()
                        : new Date(momentObj)
                    )
                  }
                  dateFormat={false}
                  timeFormat="HH:mm"
                />
              </Box>
            </FormControl>
          </Flex>
        </ModalBody>
        {!event?.id && (
          <ModalFooter>
            <Button
              bg="teal.600"
              color="white"
              _hover={{ bg: "teal.800" }}
              mr={3}
              onClick={handleSave}
            >
              Salvar
            </Button>
            <Button
              onClick={onCloseProp}
              bg="red.600"
              color="white"
              _hover={{ bg: "red.800" }}
            >
              Cancelar
            </Button>
          </ModalFooter>
        )}

        {event?.id && (
          <ModalFooter>
            <Button
              bg="teal.600"
              color="white"
              _hover={{ bg: "teal.800" }}
              mr={3}
              onClick={handleUpdateEvent}
            >
              Atualizar
            </Button>
            <Button
              onClick={handleCancelEvent}
              bg="red.600"
              color="white"
              _hover={{ bg: "red.800" }}
            >
              Excluir
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
