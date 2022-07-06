import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  SlideFade,
  InputGroup,
  Input,
  VStack,
  Center,
} from "@chakra-ui/react";
import NavbarContainer from "../components/NavbarContainer";
import NextLink from "next/link";

import { useEffect, useState } from "react";

export default function Homepage() {
  const [addr, setaddr] = useState(null);

  return (
    <>
      <NavbarContainer maxW={"3xl"}>
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
                Report an address
              </Box>
            </Heading>
            <br></br>
            <Text textColor="textPrimary">
              Possible through World ID's anti-sybil PPPoPP
            </Text>
          </SlideFade>
          <VStack spacing={10}>
            <Center>
              <InputGroup size="lg" width="200%">
                <Input
                  placeholder="Address"
                  borderColor="button4"
                  focusBorderColor="button2"
                  textColor="textSecondary"
                  width="100%"
                  _placeholder={{ color: "darkText" }}
                  value={addr}
                  onChange={(e) => setaddr(e.currentTarget.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      location.assign(
                        "https://developer.worldcoin.org/hosted/wid_staging_40a540a5e6d14159c874dd969c800b2d?signal=" +
                          addr
                      );
                    }
                  }}
                />
              </InputGroup>
            </Center>

            <NextLink
              href={
                "https://developer.worldcoin.org/hosted/wid_staging_40a540a5e6d14159c874dd969c800b2d?signal=" +
                addr
              }
              passHref
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
                Vote with World ID
              </Button>
            </NextLink>
          </VStack>
        </Stack>
      </NavbarContainer>
    </>
  );
}
