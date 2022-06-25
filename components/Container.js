import React, { useEffect } from 'react'
import { Flex, Stack, Box } from '@chakra-ui/react'
import Navbar from './Navbar'

const Container = ({ enableTransition, children }) => {
  return (
    <>
      <Navbar enableTransition={enableTransition} />
      <Flex as="main" justifyContent="center" flexDirection="column">
        {children}
      </Flex>
    </>
  )
}

export default Container
