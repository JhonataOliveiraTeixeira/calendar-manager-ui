"use client";

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Switch,
} from "@chakra-ui/react";
import { Bolt, Calendar, ChevronDownIcon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCalendar } from "../../Contexts/CalendarContext";
import { useEvents } from "../../Contexts/EventsContext";

interface CalendarsProps {
  id: string;
  summary: string;
  backgroundColor: string;
}

interface ConnectionToGoogleResponse {
  auth: {};
  calendarDatails: CalendarsProps[];
}

export function ConfigurationConection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncOn, setSyncOn] = useState(false);
  const [calendars, setCalendars] = useState<CalendarsProps[]>([]);
  const { selectedCalendarId, setSelectedCalendarId } = useCalendar();
  const {clearEvents} = useEvents()

  useEffect(() => {
    const localAuth = localStorage.getItem("isAuthenticated-calendar@1.0");
    if (localAuth === "true") setIsAuthenticated(true);
    const localSync = localStorage.getItem("syncOn-calendar@1.0");
    if (localSync === "true") setSyncOn(true);
    const storedCalendars = localStorage.getItem("calendars-list");
    if (storedCalendars) {
      try {
        const parsed = JSON.parse(storedCalendars);
        setCalendars(parsed);
        if (parsed.length > 0 && !selectedCalendarId) {
          setSelectedCalendarId('primary');
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  async function connectToGoogle() {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:4567/events/login");
      const { calendarDatails }: ConnectionToGoogleResponse =
        response.data.response;
      localStorage.setItem("calendars-list", JSON.stringify(calendarDatails));
      setCalendars(calendarDatails);
        setSelectedCalendarId('primary');
      if (response.status === 200) {
        setIsAuthenticated(true);
        setSyncOn(true);
        localStorage.setItem("isAuthenticated-calendar@1.0", "true");
        localStorage.setItem("syncOn-calendar@1.0", "true");
      } else {
        setIsAuthenticated(false);
        setSyncOn(false);
      }
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
      setSyncOn(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function stopSyncToGoogle() {
    try {
      const response = await axios.get(
        "http://localhost:4567/events/cancel-sync"
      );
      if (response.status === 200) {
        localStorage.removeItem("syncOn-calendar@1.0");
        localStorage.removeItem("calendarEvents");
        setSyncOn(false);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function logOutGoogle() {
    try {
      const response = await axios.get("http://localhost:4567/events/logout");
      if (response.status === 200) {
        setIsAuthenticated(false);
        setSyncOn(false);
        setSelectedCalendarId("");
        setCalendars([]);
        localStorage.removeItem("isAuthenticated-calendar@1.0");
        localStorage.removeItem("syncOn-calendar@1.0");
        localStorage.removeItem("calendars-list");

        clearEvents()
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function startSyncToGoogle() {
    try {
      await axios.get("http://localhost:4567/events/init-sync");
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdateCalendarId(calendarId: string) {
      try{
        const payload = {
          calendarId
        }
       await axios.put(
          `http://localhost:4567/events/update/calendarId/`,
          payload
        );

        clearEvents()

          } catch (error) {
          console.error("Erro ao atualizar agenda:", error);
        }
    }

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        _active={{ bg: "teal.800" }}
        as={Button}
        rightIcon={<ChevronDownIcon />}
        color="white"
        background="teal.700"
        _hover={{ bg: "teal.800" }}
      >
        <Bolt />
      </MenuButton>
      <MenuList>
        {isAuthenticated && (
          <MenuItem>
            <Switch
              marginRight={3}
              size="md"
              variant="solid"
              onChange={(e) => {
                if (!e.target.checked) {
                  stopSyncToGoogle();
                } else {
                  startSyncToGoogle();
                  setSyncOn(true);
                  localStorage.setItem("syncOn-calendar@1.0", "true");
                }
              }}
              isChecked={syncOn}
              color="teal"
              disabled={isLoading}
            />
            Sincronização com o Google
          </MenuItem>
        )}
        {!isAuthenticated && (
          <MenuItem
            onClick={connectToGoogle}
            disabled={isAuthenticated || isLoading}
          >
            Conectar com o Google
          </MenuItem>
        )}
        {isAuthenticated && calendars.length > 0 && (
          <MenuItem>
            <Calendar />
            <Select
              placeholder="Agendas"
              borderColor="transparent"
              _hover={{ bg: "gray.100" }}
              _selected={{ borderColor: "transparent" }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              value={selectedCalendarId}
              onChange={(e) => {
                const calendarId = e.target.value;
                handleUpdateCalendarId(calendarId);
                setSelectedCalendarId(e.target.value);
              }}
              marginLeft={3}
            >
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.summary}
                </option>
              ))}
            </Select>
          </MenuItem>
        )}
        {isAuthenticated && (
          <MenuItem onClick={logOutGoogle} gap={6}>
            <LogOut />
            Desconectar
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
}
