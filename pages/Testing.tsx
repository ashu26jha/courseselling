import lighthouse from '@lighthouse-web3/sdk';
import { ethers } from 'ethers';
import { useDropzone } from 'react-dropzone';
import { useCallback, useEffect, useState } from "react";
const LIGHTHOUSE_API_KEY = 'be64189e.15aac07bb7804b7bbbc339420a77e878';
const CID = 'Qmb8abNWS1XuGHYycfrNBJgaG9sbZXwpkoPN1YxBMtmAN9';

const Testing = () => {
    const [fileURL, setFileURL] = useState("");

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

    const onDrop = useCallback((acceptedFiles: any) => {
        setFileURL(acceptedFiles);
        console.log(acceptedFiles)
    }, [])

    async function Submit() {
        const sig = await encryptionSignature();

        const response = await lighthouse.uploadEncrypted(
            fileURL,
            LIGHTHOUSE_API_KEY,
            sig.publicKey,
            sig.signedMessage
        );

        console.log(response);
    }

    async function decrypt() {
        const { publicKey, signedMessage } = await encryptionSignature();
        const keyObject = await lighthouse.fetchEncryptionKey(
            CID,
            publicKey,
            signedMessage
        );
        const fileType = "video/mp4";
        const decrypted = await lighthouse.decryptFile(CID, keyObject.data.key || "", fileType);
        console.log(decrypted)

        if(decrypted instanceof Blob){
            console.log("YUP")
        }
        if (document.getElementById('vidplayer') instanceof HTMLVideoElement){
            console.log("YUP")
        }

        var videoEl: any = document.getElementById('vidplayer');
        const newObjectUrl = URL.createObjectURL( decrypted );

        const oldObjectUrl = videoEl.currentSrc;
        if( oldObjectUrl && oldObjectUrl.startsWith('blob:') ) {
            videoEl.src = ''; 
            URL.revokeObjectURL( oldObjectUrl );
        }
    
        videoEl.src = newObjectUrl;
    
        videoEl.load();

    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div>
            <div {...getRootProps({})} className='p-16 mt-10 ml-40 mr-40 w-1/2 dropbox'>
                <input {...getInputProps()} />
                {isDragActive ? <p>Drop the file here ...</p> : <p>Drag 'n' drop file here, or click to select file</p>}
            </div>
            <button onClick={Submit}>Submit & encrypt</button>
            <br />
            <button onClick={decrypt}>Decrypt</button>
            <video id="vidplayer" width="320" height="240" controls>

            </video>
        </div>
    )
}
export default Testing;
