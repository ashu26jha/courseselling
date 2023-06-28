import { useEffect, useState, useRef } from 'react'
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useHuddle01, useEventListener } from '@huddle01/react';
import {
  useLobby,
  useAudio,
  useVideo,
  usePeers,
  useRoom,
  useLivestream,
} from "@huddle01/react/hooks";
import { Video, Audio } from "@huddle01/react/components";

const courseCode = 'BCS';


const query = `
  query MyQuery {
    courseDetailsIndex(first: 10) {
      edges {
        node {
          id
          courseName
          courseCode
          courseCreator {
            id
          }
        }
      }
    }
  }
`;

export default function () {

  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const { isWeb3Enabled, chainId, account, enableWeb3 } = useMoralis()
  const [user, setUser] = useState(0);
  const { initialize, isInitialized } = useHuddle01();
  const [projectId, setProjectId] = useState("GevCAkXtVgG_XGR_N2YeneVWZhtBH18H");
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined} = useRoom();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [roomId, setRoomId] = useState('');
  const [session, setSession] = useState(false);

  const {
    fetchVideoStream,
    produceVideo,
    stopProducingVideo,
    stopVideoStream,
    stream: camStream,
    isProducing: cam,
    error: camError,
  } = useVideo();
  const {
    fetchAudioStream,
    stopAudioStream,
    produceAudio,
    stopProducingAudio,
    stream: micStream,
    isProducing: mic,
    error: micError,
    isProducing
  } = useAudio();

  useEffect(() => {
    console.log("camera setting");
    console.log(camStream);
    console.log(videoRef)
    if (camStream && videoRef.current) {
      videoRef.current.srcObject = camStream;
      produceVideo(camStream);
      console.log(isProducing)
      setSession(true);
    }
  }, [camStream, videoRef.current]);

  useEffect(() => {
    console.log("mic setting");
    if (micStream) {
      console.log(micStream)
      produceAudio(micStream);
      console.log(isProducing)
    }
  }, [micStream]);


  useEffect(() => {
    if (user == 1) {
      const getRoom = async () => {
        console.log("s")
        const response = await fetch('/api', {
          method: 'POST',
          body: JSON.stringify({}),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (roomId == '') {
          setRoomId(data.roomId)
          await joinLobby(data.roomId);
        }

      }
      getRoom();
    }
  }, [user])


  const handleLogin = async () => {
    await enableWeb3()
    await authenticateCeramic(ceramic, composeClient)

    // Checking wheather it is course creator or not
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const response: any = (await composeClient.executeQuery(query)).data!.courseDetailsIndex;
    for (var i = 0; i < response.edges.length; i++) {
      const temp = response.edges[i].node;

      if (temp.courseCode == courseCode) {
        const connectedDID = 'did:key:' + account.toString()
        if ((temp.courseCreator.id).toLowerCase() == connectedDID) {
          console.log("Creator it is")
          setUser(1);
        }
        else {
          setUser(2);
        }
      }
    }
  }

  async function leave (){
    stopAudioStream();
    stopVideoStream();
    leaveRoom();
    leaveLobby();
  }


  function Lobby (){
    console.log(isLobbyJoined)
  }

  function Room (){
    console.log(isRoomJoined);
  }


  useEffect(() => {
    initialize(projectId);
    handleLogin()
  }, [])

  function fetching() {

  }

  return (
    <>
      {user == 1 ? <><div className='peer-id'>Creator View</div></> : <></>}
      {user == 2 ? <><div className='peer-id'>Student View</div></> : <></>}
      <div className='start'>
        {
          !session ?
            <>
              <button className='p-2' onClick={() => { fetchAudioStream(), fetchVideoStream()}}>
                Start the session!
              </button>
              
            </>
            :
            <>
              {
                !isRoomJoined ? 
                  <>
                    <button onClick={joinRoom} className='m-2'> 
                      Join Room 
                    </button>
                  </>
                  : 
                  <></>
              }
              <button className='m-2' onClick={leave}>
                Close the session
              </button>
            </>
        }
      </div>
        <button onClick={Room}>IS ROOM</button>
        <button onClick={Lobby}>IS Lobby</button>
      <video
        ref={videoRef}
        autoPlay
        muted
        className='vidStream'
      />
    </>
  )
}
