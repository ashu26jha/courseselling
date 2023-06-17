import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import {CeramicWrapper} from "../context";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <MoralisProvider initializeOnMount={false}>
      <CeramicWrapper>
        <Component {...pageProps} ceramic />
      </CeramicWrapper>
    </MoralisProvider>
  );
};

export default MyApp;
