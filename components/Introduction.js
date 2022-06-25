import {
    Link,
    Text,
    Stack,
    Heading,
    Box,
    Button,
    SlideFade,
    Image,
    SimpleGrid,
    Flex,
    position,
  } from '@chakra-ui/react'
  import { FaEnvelope, FaGithub, FaDiscord } from 'react-icons/fa'
  import useMediaQuery from '../hook/useMediaQuery'
  
  export default function Introduction() {
    const isLargerThan800 = useMediaQuery(800)
    const isLargerThan900 = useMediaQuery(900)
    const isLargerThan1200 = useMediaQuery(1200)
    let imageSize = isLargerThan1200 ? '500px' : '250px'
    return (
      <>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Stack spacing={10} justifyContent="flex-start" alignItems="flex-start">
            <SlideFade
              direction="top"
              in={true}
              transition={{ enter: { duration: 0.4, delay: 0.7 } }}
            >
              <Box position="relative">
                <Text
                  color="#60646C"
                  fontSize="display2"
                  fontWeight="medium"
                  position="relative"
                  zIndex={1}
                >
                  We are...
                </Text>
              </Box>
              <Heading
                fontSize="display"
                lineHeight={'95%'}
                color="textPrimary"
                letterSpacing={{ sm: '-1.2px', md: '-1.8px' }}
                position="relative"
                zIndex={1}
              >
                Nord Studio.
              </Heading>
            </SlideFade>
  
            <SlideFade
              direction="top"
              in={true}
              transition={{ enter: { duration: 0.4, delay: 0.8 } }}
            >
              <Heading
                color="textSecondary"
                fontSize="display2"
                fontWeight="medium"
                whiteSpace="pre-wrap"
                letterSpacing="-1.6px"
              >
                <Box color="textSecondary" as="span">
                Building the future. One project at a time.
                </Box>
              </Heading>
            </SlideFade>
  
            <SlideFade
              direction="top"
              in={true}
              transition={{ enter: { duration: 0.4, delay: 0.9 } }}
            >
              <Text fontSize="display3" fontWeight="medium" color="textPrimary">
                • A digital studio.
                <br />
                <Stack isInline spacing={0}>
                  <Box></Box>
                  <Box>
                    • Developing since 2020.
                  </Box>
                </Stack>
              </Text>
            </SlideFade>
            
            <SlideFade
              direction="top"
              in={true}
              transition={{ enter: { duration: 0.4, delay: 1.0 } }}
            >
              <Stack isInline spacing={4}>
                <Link href="https://github.com/Nord-Studio" isExternal>
                  <Button
                    leftIcon={<FaGithub color="#5F85DB" />}
                    position="static"
                    size={isLargerThan800 ? 'md' : 'sm'}
                    color="textPrimary"
                    backgroundColor="secondary"
                    _hover={{ backgroundColor: 'buttonHover' }}
                  >
                    Github
                  </Button>
                </Link>
                <Link href="https://dsc.gg/nord" isExternal>
                  <Button
                    leftIcon={<FaDiscord color="#5F85DB" />}
                    position="static"
                    size={isLargerThan800 ? 'md' : 'sm'}
                    color="textPrimary"
                    backgroundColor="secondary"
                    _hover={{ backgroundColor: 'buttonHover'}}
                  >
                    Discord
                  </Button>
                </Link>
                <Link href="mailto:hello@nordstud.io" isExternal>
                  <Button
                    leftIcon={<FaEnvelope fill="#5F85DB" />}
                    transition="0.3s"
                    position="static"
                    size={isLargerThan800 ? 'md' : 'sm'}
                    color="textPrimary"
                    backgroundColor="secondary"
                    _hover={{ backgroundColor: 'buttonHover' }}
                  >
                    Contact
                  </Button>
                </Link>
              </Stack>
            </SlideFade>
          </Stack>
          <SlideFade
            direction="top"
            in={true}
            transition={{ enter: { duration: 0.4, delay: 1.2 } }}
          >
            <Flex marginLeft="100" alignItems="normal" justifyContent="center" position="relative">
              <Box
                maxW={{ base: imageSize, lg: '500px' }}
                maxH={{ base: imageSize, lg: '500px' }}
              >
                <Image
                  src={isLargerThan900 ? "https://i.imgur.com/rZBVlZC.png" : ""}
                  w="100%"
                  h="100%"
                  maxW={{ base: imageSize, lg: '500px' }}
                  maxH={{ base: imageSize, lg: '500px' }}
                  alt={isLargerThan900 ? "Nord Studio" : ""}
                  pos="intrinsic"
                />
              </Box>
            </Flex>
          </SlideFade>
        </SimpleGrid>
      </>
    )
  }
