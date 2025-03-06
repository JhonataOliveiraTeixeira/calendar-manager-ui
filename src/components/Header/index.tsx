 
import { Button, Flex, Image, Text, useDisclosure } from "@chakra-ui/react";
import logo from "../../assets/image.svg";
import { ConfigurationConection } from "../Menu";
import { InitialFocus } from "../Modal";
import { useState } from "react";

export function Header() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <Flex
        background="teal.600"
        p={5}
        gap={5}
        align="center"
        justifyContent="space-between"
        width={"100%"}
      >
        <Flex
        justifyContent={'center'}>
          <Image src={logo} />
        </Flex>

        <Flex gap={4} align={"center"}>
          <ConfigurationConection />
          <Button
            bg={"teal.700"}
            color={"white"}
            _hover={{ bg: "teal.800" }}
            onClick={() => {
              setSelectedDate(new Date());
              onOpen();
            }}
            width={"10rem"}
            // height={'5rem'}
          >
            <Text>Novo agendamento</Text>
          </Button>
        </Flex>
      </Flex>
      {isOpen && selectedDate && (
        <InitialFocus
          date={selectedDate}
          onCloseProp={onClose}
          isOpenProp={isOpen}
        />
      )}
    </div>
  );
}
