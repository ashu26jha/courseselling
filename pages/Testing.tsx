import React, { useEffect, useRef, useState } from "react";
import { ethers } from 'ethers';
import { useEventListener, useHuddle01 } from "@huddle01/react";
import { Audio, Video } from "@huddle01/react/components";
import lighthouse from '@lighthouse-web3/sdk';
const LIGHTHOUSE_API_KEY = 'be64189e.15aac07bb7804b7bbbc339420a77e878';
const demoCID = "QmdVGX18CWDszot2L27iwZ8HeFMMJzkLUhcQvpDhsrH1Hw";
import {
    useAudio,
    useLobby,
    useMeetingMachine,
    usePeers,
    useRoom,
    useVideo,
    useRecording,
} from "@huddle01/react/hooks";


import Button from "../components/Button";

const App = () => {
    // refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const [lock, setlock] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [projectId, setProjectId] = useState("GevCAkXtVgG_XGR_N2YeneVWZhtBH18H");
    const [isAuthor, setIsAuthor] = useState(false);
    const [isStudent, setIsStudent] = useState(true);
    const [cidToDecrypt, setCidToDecrypt] = useState('');
    const [roomIdStudent, setRoomIdStudent] = useState('');

    const { initialize } = useHuddle01();
    const { joinLobby } = useLobby();

    async function JoinnNotify() {
        joinLobby(roomId)
    }

    const {
        fetchAudioStream,
        produceAudio,
        stopAudioStream,
        stopProducingAudio,
        stream: micStream,
    } = useAudio();
    const {
        fetchVideoStream,
        produceVideo,
        stopVideoStream,
        stopProducingVideo,
        stream: camStream,
    } = useVideo();
    const { joinRoom, leaveRoom } = useRoom();

    // Event Listner
    useEventListener("lobby:cam-on", () => {
        if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
    });

    const { peers } = usePeers();

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

    const applyAccessConditions = async (cid: string, NFTaddress: string) => {

        const conditions = [
            {
                id: 1,
                chain: "Mumbai",
                method: "balanceOf",
                standardContractType: "ERC1155",
                contractAddress: "0xB6BFAD5cDAC0306825DbeC64cb5398601670f00E",
                returnValueTest: { comparator: ">=", value: "1" },
                parameters: [":userAddress"],
            },
        ];
        console.log(cid);
        const aggregator = "([1])";
        const { publicKey, signedMessage } = await encryptionSignature();

        const response = await lighthouse.applyAccessCondition(
            publicKey,
            cid,
            signedMessage,
            conditions,
            aggregator
        );

        console.log("Access conditions applied ", response);

    }

    useEventListener("room:joined", () => {
        const uploadEncrypted = async () => {

            const sign = await encryptionSignature();

            const response = await lighthouse.textUploadEncrypted(
                roomId,
                LIGHTHOUSE_API_KEY,
                sign.publicKey,
                sign.signedMessage
            );

            const lighthouseResponse = await response;
            const textCID = lighthouseResponse.data.Hash;
            console.log(textCID);

            // Get NFT address from the contract!!! 
            const NFTaddress = "0xB6BFAD5cDAC0306825DbeC64cb5398601670f00E";
            // Applying access condition
            await applyAccessConditions(textCID, NFTaddress);
        }
        uploadEncrypted();
    });

    useEventListener("lobby:joined", () => {
        async function helper() {
            fetchVideoStream();
            fetchAudioStream();
        }
        helper();

    });
    useEffect(() => {
        if (camStream && camStream.active) {
            joinRoom();
        }
    }, [camStream])

    useEffect(() => {
        initialize(projectId);
        console.log(lock)
        async function getRoom() {
            if (isAuthor == true) {
                const response = await fetch('/api', {
                    method: 'POST',
                    body: JSON.stringify({}),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                console.log(data)
                if (roomId == '') {
                    setRoomId(data.roomId)
                }
            }

        }
        getRoom();

    }, [isAuthor]);

    useEffect(()=>{
        if(roomIdStudent!=''){
            // We have only fetch ID we do need to make it turn camera on
        }
    },[roomIdStudent])

    useEffect(() => {
        if (cidToDecrypt != '') {
            console.log("LMAO");
            const decrypter = async () => {
                const { publicKey, signedMessage } = await encryptionSignature();
                const keyObject = await lighthouse.fetchEncryptionKey(
                    cidToDecrypt,
                    publicKey,
                    signedMessage
                );
                const fileType = "text/plain";
                const decrypted = await lighthouse.decryptFile(cidToDecrypt, keyObject.data.key || "", fileType);
                console.log(decrypted)
                const reader = new FileReader();

                // This fires after the blob has been read/loaded.
                reader.addEventListener('loadend', (e) => {      
                    var temp: any = e.currentTarget;              
                    setRoomIdStudent(temp.result)
                });

                // Start reading the blob as text.
                reader.readAsText(decrypted);
            }
            decrypter();

        }
    }, [cidToDecrypt])

    useEffect(() => {
        if (isStudent == true) {
            // Get to see from composeDB if live session is active or not
            // Get CID from composeDB
            setCidToDecrypt(demoCID)
        }
    }, [isStudent])

    return (
        <div className="grid grid-cols-2">
            <div>

                <Button
                    disabled={!joinLobby.isCallable}
                    onClick={JoinnNotify}
                >
                    Start session & 🔔 via Push
                </Button>

            </div>
            <div>
                <video ref={videoRef} autoPlay muted className="live"></video>
                <div className="grid grid-cols-4">
                    {Object.values(peers)
                        .filter((peer) => peer.cam)
                        .map((peer) => (
                            <>
                                role: {peer.role}
                                <Video
                                    key={peer.peerId}
                                    peerId={peer.peerId}
                                    track={peer.cam}
                                    debug
                                />
                            </>
                        ))}
                    {Object.values(peers)
                        .filter((peer) => peer.mic)
                        .map((peer) => (
                            <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
                        ))}
                </div>

            </div>
        </div>
    );
};

export default App;

