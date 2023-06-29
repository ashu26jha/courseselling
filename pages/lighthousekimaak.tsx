import { useState } from "react"
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
const LIGHTHOUSE_API_KEY = 'be64189e.15aac07bb7804b7bbbc339420a77e878';
import contractAddress from '../constants/Wis3Address.json'

export default function () {
    const [cid, setCID] = useState('');
    const [sample, setSample] = useState('');

    const encryptionSignature = async () => {

        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
        const signedMessage = await signer.signMessage(messageRequested);
        return ({
            signedMessage: signedMessage,
            publicKey: address
        });
    }

    async function decrypt() {
        const { publicKey, signedMessage } = await encryptionSignature();
        console.log("DECRYPTIONG CID", cid)
        const keyObject = await lighthouse.fetchEncryptionKey(
            cid,
            publicKey,
            signedMessage
        );
        const fileType = "text/plain";
        const decrypted = await lighthouse.decryptFile(cid, keyObject.data.key || "", fileType);
        console.log(decrypted)

        const reader = new FileReader();

        // This fires after the blob has been read/loaded.
        reader.addEventListener('loadend', (e) => {
            var temp: any = e.currentTarget;
            console.log(temp.result)
        });

        // Start reading the blob as text.
        reader.readAsText(decrypted);
    }

    async function encrypt() {
        const sign = await encryptionSignature();
        console.log(sample);
        const response = await lighthouse.textUploadEncrypted(
            sample,
            LIGHTHOUSE_API_KEY,
            sign.publicKey,
            sign.signedMessage
        );

        const lighthouseResponse = await response;
        const textCID = lighthouseResponse.data.Hash;

        const NFTaddress = "0xB550E30110fc6CF4E3eDcA00c45045a77298E2D6";

        await applyAccessConditions(textCID, NFTaddress);
    }

    const applyAccessConditions = async (textCID: string, NFTaddress: string) => {
        console.log(textCID)
        const conditions = [
            {
                id: 1,
                chain: "Mumbai",
                method: "balanceOf",
                standardContractType: "ERC721",
                contractAddress: "0xB550E30110fc6CF4E3eDcA00c45045a77298E2D6",
                returnValueTest: { comparator: ">=", value: "1" },
                parameters: [":userAddress"],
            },
        ];
        console.log(textCID);
        const aggregator = "([1])";
        const { publicKey, signedMessage } = await encryptionSignature();

        const response = await lighthouse.applyAccessCondition(
            publicKey,
            textCID,
            signedMessage,
            conditions,
            aggregator
        );

        console.log("Access conditions applied ", response);

    }

    return (
        <>
            <input type="text" className="courseName m-3 text-black" value={cid} onChange={(e) => setCID(e.target.value)} placeholder="CID"/>
            <input type="text" className="courseName m-3 text-black" value={sample} onChange={(e) => setSample(e.target.value)} placeholder="sample"/>
            <button onClick={encrypt}>Encrpyt</button>
            <button onClick={decrypt}>Decrpyt</button>
        </>
    )

}


