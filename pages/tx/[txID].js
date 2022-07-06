import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Container,
  TableContainer,
  Tbody,
  Table,
  Tr,
  Td,
  HStack,
  VStack,
  Image,
  StackDivider,
  Alert,
  AlertIcon,
  Center,
} from "@chakra-ui/react";

import NavbarContainer from "../../components/NavbarContainer";
const axios = require("axios");
// import mysql from 'mysql'
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export default function Homepage(data) {
  console.log(data);
  return (
    <>
      <NavbarContainer maxWidth={"80ch"}>
        <Container maxWidth={"80ch"}>
          <Stack
            as={Box}
            textAlign={"left"}
            // spacing={{ base: 8, md: 1 }}
            py={{ base: 20, md: 36 }}
          >
            <Heading>Summary</Heading>

            <TransactionSummary
              tx_hash={data.result.transaction_hash}
              from={data.result.from_address}
              to={data.result.to_address}
              value={parseFloat(data.result.value)}
              gas_price={
                Math.round(10 * parseInt(data.result.gas_price) * 10 ** -9) /
                  10 +
                " Gwei"
              }
              gas_limit={data.result.gas_limit}
              gas_used={data.result.gas_used}
              user_reports={data.result.world_id}
            />

            <Heading paddingTop="20px">Simulation</Heading>
            <Stack spacing={2}>
              <TransferCard
                txs={JSON.parse(data.result.simulation)}
              ></TransferCard>
              <WarningsErrors data={data.result}></WarningsErrors>
            </Stack>
            <br></br>
            <Center
              mt="12px"
              _hover={{
                textColor: "textPrimary",
              }}
            >
              <Button
                bg="textPrimary"
                onClick={submitRawSignature(data.result.raw_transaction)}
              >
                Submit Transaction
              </Button>
            </Center>
          </Stack>
        </Container>
      </NavbarContainer>
    </>
  );
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function submitRawSignature(sig) {
  const response = await axios.post(
    "http://localhost:8000",
    JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: [sig],
      id: getRandomInt(10000000),
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
function WarningsErrors({ data }) {
  return (
    <>
      {data.errors !== "" ? (
        <>
          <Heading>Errors</Heading>
          <Alert status="error" textColor="textSecondary">
            {" "}
            <AlertIcon /> {data.errors}
          </Alert>
        </>
      ) : (
        <>
          {data.warnings !== "" ? (
            <>
              <Heading>Warnings</Heading>

              <Alert status="warning" textColor="textSecondary">
                {" "}
                <AlertIcon />
                {data.warnings}
              </Alert>
            </>
          ) : (
            <> </>
          )}
        </>
      )}
    </>
  );
}

function TransactionSummary(tx) {
  return (
    <TableContainer>
      <Table
        variant="simple"
        size="sm"
        colorScheme="facebook"
        borderColor={"button3"}
        textColor="textPrimary"
      >
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
        <Tbody>
          <Tr>
            <Td>User reports</Td>
            <Td isNumeric>{tx.user_reports}</Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function getRandomArbitrary(min, max) {
  // obviously wouldn't want to do this but
  // opensea's testnet stability is REALLY BAD and I can't get paradigm's multifaucet
  // metadata to load on OpenSea, meaning no tokenurl and image.
  // sadface
  return Math.random() * (max - min) + min;
}

function TransferCard({ txs }) {
  console.log(txs);
  return (
    <VStack divider={<StackDivider borderColor="textSecondary" />}>
      {txs.map((tx, index) => {
        return (
          <HStack key={index} w="full" spacing={4}>
            <Image
              // src={tx.image}
              src="https://lh3.googleusercontent.com/jDFIJBe7q7oE208GMI0gRWX8sNhw2apWX9vdsG_fBwVxy1A9nuA09azjOpFL1LRUFlN53tmkObnyjNyhcF1yTd02JOJh7hIpfrS_=w80"
              width={16}
            />
            <Text color="textPrimary">
              <b>{index + 1}. </b>
              {tx.function_name} {tx.token_name} (${tx.token_symbol}) #
              {1057200 + index} to {tx.to}
            </Text>
          </HStack>
        );
      })}
    </VStack>
  );
}

export async function getServerSideProps(context) {
  const db = await open({
    // filename: '/Users/terbi/Desktop/safenode_private/pages/safenode.sqlite3',
    filename: "./rpc/safenode.sqlite3",
    driver: sqlite3.Database,
  });

  const result = await db.get(
    "SELECT * from transactions where transaction_hash = (?)",
    context.params.txID
  );
  result.simulation = JSON.parse(result.simulation);

  var userReports = await db.get(
    "SELECT * from world_id where address = (?)",
    result.to_address
  );
  result.world_id = userReports ? userReports.count : 0;
  var expanded_simulation = [];
  for (const eventnum in result.simulation) {
    var event = result.simulation[eventnum];
    if (event.function_name == "ApprovalForAll") {
      const response = await axios.get(
        "https://testnets-api.opensea.io/api/v1/assets",
        {
          params: {
            owner: event.from,
            asset_contract_addresses: event.contract_address,
            order_direction: "desc",
            offset: "0",
            limit: "20",
            include_orders: "false",
          },
        }
      );

      for (const i in response.data.assets) {
        var imageAdded = event;
        event["image"] = i["image_url"];
        event["tokenId"] = i["token_id"];
        expanded_simulation.push(imageAdded);
      }
    }
  }
  result.simulation = JSON.stringify(expanded_simulation);
  return { props: { result } };
}
