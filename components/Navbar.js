import React, { useRef } from "react";
import {
  Button,
  Flex,
  Box,
  Text,
  Slide,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import NextLink from "next/link";
// import useMediaQuery from "../hook/useMediaQuery";
import { AiOutlineMenu } from "react-icons/ai";
import { SearchIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'

export default function Navbar({ enableTransition }) {
  const isLargerThan768 = "true";//useMediaQuery(768);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const firstField = useRef();
  const [txID, setTxID] = useState(null);

  const NavbarDrawer = () => (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        initialFocusRef={firstField}
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent backgroundColor="background">
          <DrawerCloseButton color="background" />
          <DrawerHeader borderBottomWidth="1px" borderColor="borderColor" backgroundColor="textPrimary" color="background">
            Nord.
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing="24px">
              <NextLink href="/" passHref>
                <Button as="a" variant="ghost" fontSize="16px" textColor="displayColor" _hover={{ bg: "#26282B", textColor: 'background' }}>
                  Home
                </Button>
              </NextLink>
              <NextLink href="/projects" passHref>
                <Button as="a" variant="ghost" fontSize="16px" textColor="displayColor" _hover={{ bg: "#26282B", textColor: 'background' }}>
                  Projects
                </Button>
              </NextLink>
              <NextLink href="/blog" passHref>
                <Button as="a" variant="ghost" fontSize="16px" textColor="displayColor" _hover={{ bg: "#26282B", textColor: 'background' }}>
                  Blog
                </Button>
              </NextLink>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );

  return (
    <Box zIndex="99">
      <Slide
        direction="top"
        reverse
        in={true}
        transition={
          enableTransition
            ? { enter: { duration: 0.5, delay: 0.01 } }
            : { enter: { duration: 0, delay: 0 } }
        }
        background="button2"
      >
        <Flex
          as="nav"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          px="3vw"
          py="3"
          borderBottom="0.5px solid borderColor"
          background="textPrimary"
        >
          <NextLink href="/">
            <a>
              <Text fontSize="32px" variant="filled" textColor="button4" fontFamily={'Neuzeit Grotesk Bold'} fontWeight="900" marginTop="-12px" marginBottom="-12px">
                safenode
              </Text>
            </a>
          </NextLink>
          <InputGroup size="md"
            width="50%"
            marginRight="-150px"
          >
            <Input
              placeholder="Tx Hash"
              borderColor="background"
              focusBorderColor="button2"
              textColor="background"
              width="100%"
              _placeholder={{ color: "darkText" }}
              value={txID}
              onChange={(e)=> setTxID(e.currentTarget.value)} 
              onKeyPress={e=> {
                if (e.key === 'Enter') {
                    location.assign('tx/' + txID)
                }
              }}
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={e=> {
                e.preventDefault();
                location.assign('tx/' + txID)
              }}>
              <SearchIcon/>
              </Button>
            </InputRightElement>
          </InputGroup>
          <button onClick={()=> location.assign('?wd=' + value)}>Search</button>
          {isLargerThan768 ? (
            <Box color="textPrimary">
              <NextLink href="/about" passHref>
                <Button as="a" textColor="background" variant="ghost" p="4" ml="3vw" fontSize="16px" _hover={{ bg: "#ECEFF4", textColor: 'textPrimary' }}>
                  About
                </Button>
              </NextLink>
              <NextLink href="/report" passHref>
                <Button as="a" textColor="background" variant="ghost" p="4" ml="3vw" fontSize="16px" _hover={{ bg: "#ECEFF4", textColor: 'textPrimary' }}>
                  Report Address
                </Button>
              </NextLink>
            </Box>
          ) : (
              <Icon as={AiOutlineMenu} w={7} h={7} onClick={onOpen} color="background" />
          )}
        </Flex>
      </Slide>
      <NavbarDrawer />
    </Box>
  );
}
