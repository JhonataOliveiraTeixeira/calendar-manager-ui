import { Calendar } from './pages/calendar';
import { ChakraProvider } from '@chakra-ui/react';

function App() {
  return (
      <ChakraProvider>
        <Calendar />
      </ChakraProvider>
  );
}

export default App
