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
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import DateTime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import axios from "axios";
import { useCalendar } from "../../Contexts/CalendarContext";
import { CalendarEvent } from "../Calendar";

export function InitialFocus({
  event,
  date,
  onCloseProp,
  isOpenProp,
}: {
  event: CalendarEvent | undefined;
  date?: Date;
  onCloseProp: () => void;
  isOpenProp: boolean;
}) {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [dateOnSave, setDateOnSave] = useState<Date>(date || new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const { selectedCalendarId } = useCalendar();
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  useEffect(() => {
    if (event?.id !== "" && event) {
      setEventName(event.title);
      setDescription(event.extendedProps?.description || "");
      setDateOnSave(new Date(event.start));
      const start = new Date(event.start);
      setStartTime(start);
      setEndTime(new Date(start.getTime() + 60 * 60 * 1000));
    } else if (date) {
      setDateOnSave(date);
      setStartTime(date);
      setEndTime(new Date(date.getTime() + 60 * 60 * 1000));
    }
  }, [event, date]);

  function combineDateAndTime(dateObj: Date, timeObj: Date): Date {
    const combined = new Date(dateObj);
    combined.setHours(timeObj.getHours(), timeObj.getMinutes());
    return combined;
  }

  function handleStartTimeChange(newStartTime: Date) {
    setStartTime(newStartTime);
    const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
    if (newEndTime > endTime) {
      setEndTime(newEndTime);
    }
  }

  function handleEndTimeChange(newEndTime: Date) {
    setEndTime(newEndTime);
    const minimumStartTime = new Date(newEndTime.getTime() - 60 * 60 * 1000);
    if (minimumStartTime > startTime) {
      setStartTime(minimumStartTime);
    }
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
      console.log(error);
    }
  }

  async function handleUpdateEvent() {
    try {
      if (event) {
        const eventId = event.id;

        const updatedStartTime =
          startTime.toISOString() !== new Date(event.start).toISOString()
            ? combineDateAndTime(dateOnSave, startTime).toISOString()
            : event.start;

        const updatedEndTime =
          endTime.toISOString() !==
          (event.end ? new Date(event.end).toISOString() : "")
            ? combineDateAndTime(dateOnSave, endTime).toISOString()
            : event.end;

        const updatedSummary =
          eventName !== event.title ? eventName : event.title;

        const updatedDescription =
          description !== (event.extendedProps?.description || "")
            ? description
            : event.extendedProps?.description;

        const payload: {
          end: {
            dateTime: string;
            timeZone: string;
          };
          start: {
            dateTime: string;
            timeZone: string;
          };
          summary?: string;
          description?: string;
        } = {
          summary: updatedSummary,
          description: updatedDescription,
          start: {
            dateTime: updatedStartTime,
            timeZone: "America/Sao_Paulo",
          },
          end: {
            dateTime: updatedEndTime,
            timeZone: "America/Sao_Paulo",
          },
        };

        await axios.put(
          `http://localhost:4567/events/update/${selectedCalendarId}/${eventId}`,
          payload
        );

        onCloseProp();
      }
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
    }
  }

  async function handleSave() {
    const startDateTime = combineDateAndTime(dateOnSave, startTime);
    const endDateTime = combineDateAndTime(dateOnSave, endTime);
    const payload = {
      calendarId: selectedCalendarId || "primary",
      summary: eventName,
      description: description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      attendees: [{ email: "email@example.com" }],
    };

    try {
      await axios.post("http://localhost:4567/events/create", payload);
      onCloseProp();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
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
              aria-required
              placeholder="Descrição do evento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                    handleStartTimeChange(momentObj.toDate())
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
                    handleEndTimeChange(momentObj.toDate())
                  }
                  dateFormat={false}
                  timeFormat="HH:mm"
                />
              </Box>
            </FormControl>
          </Flex>
        </ModalBody>
        <ModalFooter>
          {event?.id && (
            <div>
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
            </div>
          )}
          {!event?.id && (
            <div>
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
            </div>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
