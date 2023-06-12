import "../styles/globals.css";
import type { AppProps } from "next/app";
import {CeramicWrapper} from "../context";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <CeramicWrapper>
      <Component {...pageProps} ceramic />
    </CeramicWrapper>
  );
};

export default MyApp;
