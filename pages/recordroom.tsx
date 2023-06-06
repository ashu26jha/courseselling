import React from "react";
import { useState, useEffect } from 'react';
import * as dotenv from 'dotenv'
dotenv.config();
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import { url } from "inspector";
const LIGHTHOUSE_API_KEY = "";

const recordRoom = () => {
    const [fileURL, setFileURL] = useState("");

    useEffect(() => {
        const track = document.querySelector('img')
        track!.src = fileURL;
    }, [fileURL]);
    const encryptionSignature = async () => {

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
        const signedMessage = await signer.signMessage(messageRequested);

        return ({
            signedMessage: signedMessage,
            publicKey: address
        });
    }

    const progressCallback = (progressData: any) => {
        console.log("Uploading..");
    };

    const uploadFileEncrypted = async (file: any) => {
        const sig = await encryptionSignature();
        const response = await lighthouse.uploadEncrypted(
            file,
            "be64189e.15aac07bb7804b7bbbc339420a77e878",
            sig.publicKey,
            sig.signedMessage,
            progressCallback
        );
        console.log(response);
    }

    const decrypt = async () => {
        // Fetch file encryption key
        const cid = "QmTFstA8fH74rUhYQ2poKPP286jadMCKkkbe8QHN3C3396"; //replace with your IPFS CID
        const { publicKey, signedMessage } = await encryptionSignature();
        const keyObject = await lighthouse.fetchEncryptionKey(
            cid,
            publicKey,
            signedMessage
        );

        const fileType = "image/jpeg";
        const decrypted = await lighthouse.decryptFile(cid, keyObject.data.key || "", fileType);
        console.log(decrypted)

        const url = URL.createObjectURL(decrypted);
        console.log(url);
        setFileURL(url);
    }

    const applyAccessConditions = async() =>{
    
        const cid = "QmTFstA8fH74rUhYQ2poKPP286jadMCKkkbe8QHN3C3396";
    
        // Conditions to add
        const conditions = [
            {
                id: 1,
                chain: "Mumbai",
                method: "balanceOf",
                standardContractType: "ERC1155",
                contractAddress: "0x16eCb7d5E76A1B0DfD54A9BE9293c35866CD6674",
                returnValueTest: { comparator: ">=", value: "1" },
                parameters: [":userAddress"],
            },
        ];
    
        const aggregator = "([1])";
        const {publicKey, signedMessage} = await encryptionSignature();
    
        const response = await lighthouse.applyAccessCondition(
          publicKey,
          cid,
          signedMessage,
          conditions,
          aggregator
        );
    
        console.log(response);

      }

    return (
        <div>

            <input onChange=
                {
                    e => {
                        if (!e.target.files) {
                            return
                        }
                        uploadFileEncrypted(e.target.files)
                    }
                }
                type="file" />

            <br />
            <button onClick={() => decrypt()}>decrypt</button>
            {fileURL ? <a href={fileURL} target="_blank">viewFile</a> : null}
            IMG
            <img src={fileURL} key={"s"} />
            <button onClick={applyAccessConditions}>APPLY ACCESS</button>
        </div>
    )
};
export default recordRoom;
