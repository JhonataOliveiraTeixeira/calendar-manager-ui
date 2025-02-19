"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export interface EventsEvent {
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


interface EventsContextProps {
  events: EventsEvent[];
  setEvents: React.Dispatch<React.SetStateAction<EventsEvent[]>>;
  clearEvents: () => void;
  pushEvents: () => string | undefined;
}

const EventsContext = createContext<EventsContextProps | undefined>(
  undefined
);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventsEvent[]>([]);
  function pushEvents(){
    const storedEvents = localStorage.getItem("calendarEvents");
    Array.isArray(storedEvents);
    if(storedEvents && storedEvents?.length >0){
      Array.isArray(storedEvents);
      
      return storedEvents 
    }
  }

  function clearEvents(){
    localStorage.removeItem("calendarEvents");
    setEvents([])
  }

  return (
    <EventsContext.Provider value={{ events, setEvents, clearEvents, pushEvents }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within a EventsProvider");
  }
  return context;
}
