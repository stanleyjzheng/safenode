import {
  Box,
  Heading,
  Stack,
  SlideFade,
} from "@chakra-ui/react";
import NavbarContainer from "../components/NavbarContainer";

import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

export default function Homepage() {
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
                Thank you for reporting an address
              </Box>
            </Heading>
          </SlideFade>
        </Stack>
      </NavbarContainer>
    </>
  );
}

async function increment(db, addr) {
  var current = await db.get(
    "SELECT * from world_id where address = (?)",
    addr
  );
  if (current != undefined) {
    await db.run(
      "UPDATE world_id SET count = (?) WHERE address = (?)",
      current.count + 1,
      addr
    );
  } else {
    await db.all(
      "INSERT INTO world_id (address, count) VALUES (?, ?)",
      addr,
      1
    );
  }
}

export async function getServerSideProps({ query }) {
  const db = await open({
    filename: "./rpc/safenode.sqlite3",
    driver: sqlite3.Database,
  });

  const client = jwksClient({
    jwksUri: "https://developer.worldcoin.org/api/v1/jwks",
  });

  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, function (err, key) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  };

  var token = query.verification_jwt;

  jwt.verify(token, getKey, "", function (err, decoded) {
    if (decoded.verified) {
      increment(db, decoded.signal);
    }
  });
  return {
    props: { params: query },
  };
}
