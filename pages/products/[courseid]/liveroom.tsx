import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useEventListener, useHuddle01 } from "@huddle01/react";
import { Audio, Video } from "@huddle01/react/components";
/* Uncomment to see the Xstate Inspector */
// import { Inspect } from '@huddle01/react/components';

import {
    useAudio,
    useLobby,
    useMeetingMachine,
    usePeers,
    useRoom,
    useVideo,
    useRecording,
} from "@huddle01/react/hooks";

import { useDisplayName } from "@huddle01/react/app-utils";

import Button from "../../../components/Button";

const App = () => {
    // refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const [lock,setlock] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [projectId, setProjectId] = useState("GevCAkXtVgG_XGR_N2YeneVWZhtBH18H");

    const { initialize } = useHuddle01();
    const { joinLobby } = useLobby();

    async function JoinnNotify(){
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

    useEventListener("room:joined", () => {
        console.log("room:joined");
    });

    useEventListener("lobby:joined", () => {
        async function helper(){
            fetchVideoStream();
            fetchAudioStream();
        }
        helper();
        
    });
    useEffect(()=>{
        if(camStream && camStream.active){
            joinRoom();
        }
    },[camStream])

    useEffect(() => {
        initialize(projectId);
        console.log(lock)
        async function getRoom() {
            if(lock==false){
                setlock(true)
                const response = await fetch('/api', {
                    method: 'POST',
                    body: JSON.stringify({}),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if(roomId==''){
                    setRoomId(data.roomId)
                }                
            }   
            
        }
        getRoom();

    }, [])

    return (
        <div className="grid grid-cols-2">
            <div>
                
                <Button
                    disabled={!joinLobby.isCallable}
                    onClick={JoinnNotify}
                >
                    Start & 🔔 via Push 
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

