import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import lighthouse from '@lighthouse-web3/sdk'
import { ethers } from 'ethers';
const LIGHTHOUSE_API_KEY = "";

function Dropzone({ className }: { className: any }) {

    const [fileURL, setFileURL] = useState("");

    const onDrop = useCallback((acceptedFiles: any) => {
        console.log(acceptedFiles)
        setFileURL(acceptedFiles);
    }, [])


    const encryptionSignature = async () => {

        const provider = new ethers.providers.Web3Provider( (window as any) .ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
        const signedMessage = await signer.signMessage(messageRequested);

        return ({
            signedMessage: signedMessage,
            publicKey: address
        });
    }

    const uploadFileEncrypted = async () => {
        console.log(fileURL)
        const sig = await encryptionSignature();
        const response = await lighthouse.uploadEncrypted(
            fileURL,
            LIGHTHOUSE_API_KEY,
            sig.publicKey,
            sig.signedMessage
        );
        console.log(response.data[0].Hash);
        await applyAccessConditions(response.data[0].Hash)
    }

    const decrypt = async () => {
        const cid = "QmTFstA8fH74rUhYQ2poKPP286jadMCKkkbe8QHN3C3396";
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
    }

    const applyAccessConditions = async (cid: string) => {

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
        const { publicKey, signedMessage } = await encryptionSignature();

        const response = await lighthouse.applyAccessCondition(
            publicKey,
            cid,
            signedMessage,
            conditions,
            aggregator
        );
        
        console.log("Access conditions applied ",response);

    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <>
            <div {...getRootProps({ className: className })}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p>Drag 'n' drop some files here, or click to select files</p>
                }

            </div>
            <button onClick={uploadFileEncrypted}>Add to lighthouse and apply access control</button>
        </>
    )
}
export default Dropzone;
