import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "../styles/theme";
import { Global, css } from "@emotion/react";
import { prismDarkTheme } from "../styles/prism";
const GlobalStyle = ({ children }) => {
  return (
    <>
      <Global
        styles={css`
          ${prismDarkTheme};
          html {
            min-width: 356px;
          }
          #__next {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: #d8dee9;
          }
          ::-webkit-scrollbar {
            width: 8px;
            background: #303236;
          }

          ::-webkit-scrollbar-thumb {
            background: #26282b;
            border-radius: 8px;
          }
        `}
      />
      {children}
    </>
  );
};

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS theme={customTheme}>
      <GlobalStyle>
        <Component {...pageProps} />
      </GlobalStyle>
    </ChakraProvider>
  );
}
export default MyApp;
