import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants";
import { Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";


export default function Home() {
  const [ walletConnected, setWalletConnected ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ journeysMinted, setJourneysMinted ] = useState("0");
  const web3ModalRef = useRef();
  const [formData, setFormData] = useState(
      {
          source: "1",
          destination: "1",
          description: ""
      }
  )

  const handleChange = (event) => {
      const {name, value} = event.target;
      setFormData(prevFormData => {
          return {
              ...prevFormData,
              [name]: value
          }
      });
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false
      });
    }

    connectWallet();
  }, [walletConnected]);

    useEffect(() => {
      // Run the following every time the page is re-rendered
      getNumJourneysMinted();
    }, []);

  /**
   * Attempt to obtain the provider, which will prompt wallet connection when used for the first time
   */
  const connectWallet = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      setWalletConnected(true);
      console.debug("Wallet has been successfully connected");
    } catch (err) {
      if(err.code != -32002) { // Ignore the 'already processing eth_requestAccounts error
        console.log(err);
      }
    }
  }

  const getProviderOrSigner = async (signer) => {
    const instance = await web3ModalRef.current.connect();
    const provider = new providers.Web3Provider(instance);

    // If user is not connected to the Mumbai test network, let them know and throw an error
    const { chainId } = await provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Ethereum Rinkeby (test network) and reload");
      throw new Error("Change the network to Ethereum Rinkeby (test network) and reload");
    }

    return signer ? await provider.getSigner() : provider;
  }

  const getNumJourneysMinted = async () => {
    const provider = await getProviderOrSigner(false);
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const numJourneys = await contract.tokenCount();
    setJourneysMinted(numJourneys.toString());
  }

  const mintJourney = async () => {
    if(!walletConnected) {
      window.alert("You must connect a crypto wallet in order to mint. https://metamask.io/faqs/");
      return;
    }

    let minted = true;
    try {
      const signer = await getProviderOrSigner(true);
      const bearsContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      let tx = await bearsContract.mint(
        formData.source,
        formData.destination,
        formData.description,
        {
          value: utils.parseEther("0.05"),
        }
      );
      setLoading(true);
      await tx.wait();
    } catch (err) {
        minted = false;
        if(err.code === 4001) {
          console.log("User rejected the transaction.");
        }
        /**
         * Allowed errors:
         *    -32002 "Already processing eth_requestAccounts. Please wait"
         */
        else if(err.code != -32002) {
          window.alert("An error occurred - see console for details");
          console.log(err);
        }
    }

    setLoading(false);
    if(minted) {
      window.alert("Minted!");
      getNumJourneysMinted();
    }
  }

  const renderMintButton = () => {
    return (
      <button disabled={loading} className={styles.button} onClick={mintJourney}>{loading ? "Minting..." : "Mint this journey"}</button>
    )
  }

  const renderLoading = () => {
    return (
      <section className={styles.loading}>
        <h3 className={styles.loadingItem}>Minting...</h3>
        <img src="/loading.gif" alt="Loading gif" className={styles.loadingItem} />
      </section>
    );
  }

  return (
<div className={styles.container}>
      <Head>
        <title>Tube Memories</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Tube Memories</h1>

        <a
          href="https://testnets.opensea.io"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.a}
        >
          View the collection on OpenSea! (TODO)
        </a>

        <section>
          <h2 className={styles.textHeading}>Create your Tube Journey 👇</h2>
          <p className={styles.text}>Journeys minted so far: {journeysMinted}</p>
          {loading && renderLoading()}
          {renderMintButton()}
        </section>

      </main>
    </div>
  )
}
