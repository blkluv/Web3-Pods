import { useEffect, useState } from "react"; 
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import { ethers } from "ethers";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import Minter from "../components/Minter";
import { ToastContainer } from "react-toastify";

const particle = new ParticleAuthModule.ParticleNetwork({
  projectId: "e0710b6b-8992-4c1f-af0c-90ddbd9f041f",
  clientKey: "coUkkiyela2Bt1irY2AyjS0RcxwWjneFGqTEE0MG",
  appId: "f43d843f-2b27-4b3b-8b26-482732ba2283",
  wallet: {
    displayWalletEntry: true,
    defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
  },
});


const bundler: IBundler = new Bundler({
    bundlerUrl:"https://bundler.biconomy.io/api/v2/84531/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: ChainId.BASE_GOERLI_TESTNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })
  
const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: "https://paymaster.biconomy.io/api/v1/84531/IyFW4VPt9.28b5665b-2603-4448-9d02-7d7c04d15028"
})



export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccount | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );
  
  // set user data if logged in
  useEffect(() => {
    (async () => {
      const userInfo = await particle.auth.isLoginAsync();
      if(userInfo){
        await setDetails();
      }
    })();
  }, []);
  
  const setDetails = async () => {
    const particleProvider = new ParticleProvider(particle.auth);
    const web3Provider = new ethers.providers.Web3Provider(
      particleProvider,
      "any"
    );
    setProvider(web3Provider);
    const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
      signer: web3Provider.getSigner(),
      chainId: ChainId.BASE_GOERLI_TESTNET,
      bundler: bundler,
      paymaster: paymaster,
    };
    let biconomySmartAccount = new BiconomySmartAccount(
      biconomySmartAccountConfig
    );
    biconomySmartAccount = await biconomySmartAccount.init();
    setAddress(await biconomySmartAccount.getSmartAccountAddress());
    setSmartAccount(biconomySmartAccount);
  }

  const connect = async () => {
    try {
      setLoading(true);
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      await setDetails();
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <>
      <Head>
        <title>Blockcast</title>
        <meta name="description" content="Blockcast" />
      </Head>
      <main className={styles.main}>
        <div className={styles.submain}>
          <div>
            <h1>Blockcast</h1>
            {!smartAccount && <p>Login to mint a pod.</p>}
            {!loading && !address && (
              <button onClick={connect} className={styles.connect}>
                Login
              </button>
            )}
            {loading && <p>Loading Smart Account...</p>}
            {address && (
              <h2>
                Smart Account:{" "}
                <a
                  href={`https://goerli.basescan.org/address/${address}`}
                  className={styles.address}
                  target="_blank"
                >
                  {address.slice(0, 6)}...{address.slice(-5, -1)}
                </a>
              </h2>
            )}
            {smartAccount && provider && (
              <Minter
                smartAccount={smartAccount}
                address={address}
                provider={provider}
              />
            )}
          </div>
        </div>
        <footer className={styles.footer}>
          <div>
            Made with malice 😈 by{" "}
            <a href="https://twitter.com/nonseodion">nonseodion</a>.
          </div>
          <div className={styles.source}>
            <a href="https://github.com/nonseodion/web3-pods" target="_blank">
              Source code
            </a>
            &nbsp; &nbsp;
            <a
              href="https://docs.google.com/presentation/d/1ydeQiLbDpaoG0eOhzuOsQZhVryRUU8cdMQbK3dki5Lg/edit?usp=sharing"
              target="_blank"
            >
              Slides
            </a>
          </div>
        </footer>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </main>
    </>
  );
}
