import  { createContext, useContext, useState, ReactNode } from "react";

interface CalendarContextType {
  selectedCalendarId: string | 'primary';
  setSelectedCalendarId: (id: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider = ({ children }: CalendarProviderProps) => {
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");

  return (
    <CalendarContext.Provider
      value={{ selectedCalendarId, setSelectedCalendarId }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
