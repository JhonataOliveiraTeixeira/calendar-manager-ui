import CalendarList from "../../components/Calendar";
import { Header } from "../../components/Header";
import { CalendarProvider } from "../../Contexts/CalendarContext";
import { EventsProvider } from "../../Contexts/EventsContext";

export function Calendar(){
  return (
    <div>
      <CalendarProvider>
        <EventsProvider>
          <Header />
          <CalendarList />
        </EventsProvider>
      </CalendarProvider>
    </div>
  );
}