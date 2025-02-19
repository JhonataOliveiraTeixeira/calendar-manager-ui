/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Container, Flex, useDisclosure, Text } from "@chakra-ui/react";
import { EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AttendeesProps, InitialFocus } from "../Modal";
import { EventsEvent, useEvents } from "../../Contexts/EventsContext";
import { useCalendar } from "../../Contexts/CalendarContext";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps: {
    description: string;
    colorId: string;
    enableMeet?: boolean;
    attendees?: [
      {
        email: string;
      }
    ];
  };
}

export default function CalendarList() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(
    undefined
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { events, setEvents, pushEvents } = useEvents();
  const { selectedCalendarId } = useCalendar();

  function handleDateClick(info: { date: Date }) {
    const startDate = new Date(info.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const date = {
      id: "",
      title: "",
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      extendedProps: {
        description: "",
        colorId: "",
      },
    };
    setSelectedEvent(date);
    onOpen();
  }

  function handleEventClick(info: any) {
    console.log("Evento clicado:", info.event);

    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start.toISOString(),
      end: info.event.end?.toISOString() || info.event.start.toISOString(),
      extendedProps: {
        description: info.event.extendedProps?.description || "",
        colorId: info.event.extendedProps?.colorId || "",
        enableMeet: info.event.extendedProps?.enableMeet || false,
        attendees: info.event.extendedProps?.attendees || [],
      },
    };

    setSelectedEvent(event);
    onOpen();
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    
    const storedCalendars = localStorage.getItem("calendars-list");
    let calendarColor = "teal.400";
    if (storedCalendars) {
      const calendars = JSON.parse(storedCalendars);
      const mechedCalendar = calendars.find(
        (calendar: any) => calendar.id == selectedCalendarId
      );
      if (mechedCalendar) {
        calendarColor = mechedCalendar.backgroundColor;
      }
    }

    return (
      <Flex
        className="custom-event"
        bg={calendarColor}
        p={1}
        borderRadius="md"
        height={7}
        width={"100%"}
        maxW={"auto"}
        justifyContent={"space-between"}
        // _hover={{ bg: "teal.500" }}
      >
        <Text
          isTruncated
          width={"70%"}
          fontSize={13}
          as={"b"}
          color={"gray.700"}
        >
          {eventInfo.event.title}
        </Text>
        <Text as={"b"} color={"gray.600"}>
          {eventInfo.timeText}
        </Text>
      </Flex>
    );
  };

  function mapEvent(item: any): CalendarEvent {
    return {
      id: item.id,
      title: item.summary,
      start: item.start?.dateTime || item.start?.date,
      end: item.end?.dateTime || item.end?.date,
      extendedProps: {
        description: item.description || "",
        colorId: item.colorId || "",
        enableMeet: item.conferenceData ? true : false,
        attendees: item.attendees || [],
      },
    };
  }

  useEffect(() => {
    const storedEvents = pushEvents();
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        setEvents(parsedEvents);

        const storedAttendees = parsedEvents.reduce(
          (acc: any, event: CalendarEvent) => {
            if (event.extendedProps?.attendees) {
              acc[event.id] = event.extendedProps.attendees;
            }
            return acc;
          },
          {}
        );

        localStorage.setItem("eventAttendees", JSON.stringify(storedAttendees));
      } catch (error) {
        console.error("Erro ao carregar eventos do localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));

      const attendeesData: Record<string, AttendeesProps[]> = events.reduce(
        (acc, event) => {
          if (
            event.extendedProps?.attendees &&
            Array.isArray(event.extendedProps.attendees)
          ) {
            acc[event.id] = event.extendedProps.attendees;
          }
          return acc;
        },
        {} as Record<string, AttendeesProps[]>
      );

      localStorage.setItem("eventAttendees", JSON.stringify(attendeesData));
    }
  }, [events]);

  useEffect(() => {
    const socket = io("http://localhost:4567", { transports: ["websocket"] });

    const handleNewEvents = (data: any) => {
      if (Array.isArray(data)) {
        const mapped = data.map(mapEvent);
        setEvents((prevEvents: EventsEvent[]) => {
          const merged = [...prevEvents];
          mapped.forEach((newEvent) => {
            const index = merged.findIndex((e) => e.id === newEvent.id);
            if (index >= 0) {
              merged[index] = newEvent;
            } else {
              merged.push(newEvent);
            }
          });
          return merged;
        });
      }
    };

    socket.on("connect", () => console.log("Conectado ao WebSocket"));
    socket.on("calendarEvents", handleNewEvents);

    return () => {
      socket.off("calendarEvents", handleNewEvents);
      socket.disconnect();
    };
  }, []);

  return (
    <Flex>
      <Container
        marginTop={30}
        maxW="auto"
        width="90%"
        padding={50}
        background="gray.100"
        borderRadius={8}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={renderEventContent}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          locale="pt-br"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayMaxEventRows={4}
          height="auto"
          contentHeight="auto"
        />
        {isOpen && (
          <InitialFocus
            key={selectedEvent?.id || "new-event"}
            event={selectedEvent?.id !== "" ? selectedEvent : undefined}
            date={
              selectedEvent?.id === ""
                ? new Date(selectedEvent.start)
                : undefined
            }
            onCloseProp={onClose}
            isOpenProp={isOpen}
          />
        )}

        <style>{`
          .fc-daygrid-day {
            height: 160px;
          }

          .fc-daygrid-event {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .fc-daygrid-day-events {
            max-height: 135px;
            overflow: hidden;
            position: relative;
          }

          .fc-more-popover {
            max-width: 250px;
          }
          .fc-daygrid-day-top {
            height: 1.3rem;
            justify-content: right;
          }

          .fc-event.fc-event-start.fc-event-end.fc-event-past.fc-daygrid-event.fc-daygrid-dot-event {
            width: 100%;
            max-width: 190px;
            padding: 3px;
            font-size: 12px;
            text-align: left;
            background-color: transparent;
            border-radius: 6px;
            cursor: pointer;
          }
        `}</style>
      </Container>
    </Flex>
  );
}
