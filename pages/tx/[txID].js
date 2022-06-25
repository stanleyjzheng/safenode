import {
    Box,
    Heading,
    Text,
    Button,
    Stack,
    createIcon,
    SlideFade,
    Flex,
    Center,
    Container,
    Divider,
    TableContainer,
    Tbody,
    Table,
    Tr,
    Td,
} from '@chakra-ui/react';

import NavbarContainer from '../../components/NavbarContainer'

// import mysql from 'mysql'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export default function Homepage(data) {
  console.log(data)
  return (
    <>
      <NavbarContainer maxWidth={'80ch'}>
        <Container maxWidth={'80ch'}>
      <Stack
        as={Box}
        textAlign={'left'}
        // spacing={{ base: 8, md: 1 }}
        py={{ base: 20, md: 36 }}
          >

            <Heading>Summary</Heading>

            <TransactionSummary
              tx_hash={data.result.transaction_hash}
              from={data.result.from_address}
              to={data.result.to_address}
              value={parseFloat(data.result.value)}
              gas_price={Math.round(10*parseInt(data.result.gas_price)*(10**-9))/10 + ' Gwei'}
              gas_limit={data.result.gas_limit}
              gas_used={data.result.gas_used}
            />

            <Heading py={{ md: 10 }}>Simulation</Heading>
            <Stack spacing={2}>
              <Text display='inline'><b>1.</b> Transfer ERC-721 Doodles ($DODL) TokenId #1234 to 0xa7rs90t7ar89s7t980r7t987rs9t8</Text>

              <Divider borderColor='textSecondary'/>
            </Stack>
          </Stack>
        </Container>


      </NavbarContainer>
    </>
  );
}

function TransactionSummary(tx) {
  return < TableContainer >

    <Table variant='simple' size='sm' colorScheme="red" borderColor={"button1"}>
      <Tbody>
        <Tr>
          <Td>Tx hash</Td>
          <Td isNumeric>{tx.tx_hash}</Td>
        </Tr>
      </Tbody>
      <Tbody>
        <Tr>
          <Td>From</Td>
          <Td isNumeric>{tx.from}</Td>
        </Tr>
      </Tbody> 
      <Tbody>
        <Tr>
          <Td>To</Td>
          <Td isNumeric>{tx.to}</Td>
        </Tr>
      </Tbody>
      <Tbody>
        <Tr>
          <Td>ETH transferred</Td>
          <Td isNumeric>{tx.value}</Td>
        </Tr>
      </Tbody>
      <Tbody>
        <Tr>
          <Td>Max gas price</Td>
          <Td isNumeric>{tx.gas_price}</Td>
        </Tr>
      </Tbody>
      <Tbody>
        <Tr>
          <Td>Gas limit</Td>
          <Td isNumeric> {tx.gas_limit}</Td>
        </Tr>
      </Tbody>
      <Tbody>
        <Tr>
          <Td>Gas used</Td>
          <Td isNumeric>{tx.gas_used}</Td>
        </Tr>
      </Tbody>
    </Table>
  </TableContainer>
}

function TransferCard() {
  const simulation = [
    {
      
    }
  ]
}

export async function getServerSideProps(context) {
  const db = await open({
    // filename: '/Users/terbi/Desktop/safenode_private/pages/safenode.sqlite3',
    filename: './rpc/safenode.sqlite3',
    driver: sqlite3.Database
  })
  // var db = mysql.createConnection({
  //   host     : 'database-1.cioplj7ppcrv.us-east-1.rds.amazonaws.com',
  //   user     : 'admin',
  //   password : 'ApNLgWJzbbB4Rxw',
  //   database : 'database-1'
  // });

  // db.connect()
  // var tx = context.params
  // db.get("SELECT * from transactions where transaction_hash = (?)", context.params.txID, function (err, data) {
  //   if (err) {
  //     console.log(err)
  //     return { props: { data: err } }
  //   } else {
  //     console.log(data)
  //     return {
  //       props: {
  //         data
  //       }
  //     }
  //   }
  // })
  const result = await db.get("SELECT * from transactions where transaction_hash = (?)", context.params.txID)
  // const result = await db.get("SELECT * from transactions")
  return { props: { result } }
}
