import {
  Box,
  Heading,
  Button,
  Stack,
  SlideFade,
} from "@chakra-ui/react";
import NavbarContainer from "../components/NavbarContainer";

export default function Homepage() {
  return (
    <>
      <NavbarContainer maxW={"3xl"} position="relative">
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <SlideFade
            direction="top"
            in={true}
            transition={{ enter: { duration: 0.4, delay: 0.1 } }}
          >
            <Heading
              fontSize="display"
              lineHeight={"95%"}
              color="textPrimary"
              letterSpacing={{ sm: "-1.2px", md: "-1.8px" }}
              position="relative"
              zIndex={1}
            >
              Safenode.
            </Heading>
          </SlideFade>
          <SlideFade
            direction="top"
            in={true}
            transition={{ enter: { duration: 0.4, delay: 0.2 } }}
          >
            <Heading
              color="textSecondary"
              fontSize="display2"
              fontWeight="medium"
              whiteSpace="pre-wrap"
              letterSpacing="-1.6px"
            >
              <Box color="textSecondary" as="span">
                Smart ETH-RPC compatible proxy
              </Box>
            </Heading>
          </SlideFade>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <Button
              bg={"button4"}
              rounded={"full"}
              px={6}
              _hover={{
                bg: "button2",
              }}
              textColor="textPrimary"
            >
              Get Started
            </Button>
          </Stack>
        </Stack>
      </NavbarContainer>
    </>
  );
}
