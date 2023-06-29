import { useEffect, useState, useRef } from 'react'
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useHuddle01, useEventListener } from '@huddle01/react';
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
const LIGHTHOUSE_API_KEY = 'be64189e.15aac07bb7804b7bbbc339420a77e878';
import contractAddress from '../constants/Wis3Address.json'
import abi from '../constants/Wis3.json'

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
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const [courseDetailsID, setcourseDetailsID] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [roomId, setRoomId] = useState('');
  const [session, setSession] = useState(false);
  const [camera, setCam] = useState(false);
  const [microphone, setMic] = useState(false);
  const [help, setHelp] = useState(false);
  const [roomIdDec, setroomIdDec] = useState('');
  const [studentRoom, setstudentRoom] = useState('');

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
    if (roomIdDec != '') {
      const decrypt = async () => {
        console.log(roomIdDec)
        const { publicKey, signedMessage } = await encryptionSignature();
        const keyObject = await lighthouse.fetchEncryptionKey(
          roomIdDec,
          publicKey,
          signedMessage
        );
        const fileType = "text/plain";
        const decrypted = await lighthouse.decryptFile(roomIdDec, keyObject.data.key || "", fileType);
        console.log(decrypted)

        const reader = new FileReader();

        // This fires after the blob has been read/loaded.
        reader.addEventListener('loadend', (e) => {
          var temp: any = e.currentTarget;
          console.log(temp.result)
          setstudentRoom(temp.result);
        });

        // Start reading the blob as text.
        reader.readAsText(decrypted);
      }
      decrypt()

    }
  }, [roomIdDec])


  useEffect(() => {

    if (user == 1) {

      const getRoom = async () => {

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

    if (user == 2) {
      // Student
      const help = `
      query MyQuery {
        liveStreamIndex(first: 10) {
          edges {
            node {
              coursedetails {
                courseCode
              }
              isLive
              roomId
            }
          }
        }
      }
      `
      const getRoom = async () => {
        const response = await composeClient.executeQuery(help);
        console.log(response)
        const temp: any = response.data!.liveStreamIndex;
        const arr = temp.edges;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].node.coursedetails.courseCode == courseCode) {
            setroomIdDec(arr[i].node.roomId)
          }
        }
      }
      getRoom()
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
        const connectedDID = 'did:key:' + account.toString();
        setcourseDetailsID(temp.id);
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

  async function leave() {
    stopAudioStream();
    stopVideoStream();
    leaveRoom();
    leaveLobby();
    setSession(false)
  }

  useEffect(() => {
    initialize(projectId);
    handleLogin()
  }, [])

  function toggleCamera() {
    if (camera) {
      setCam(false);
      stopVideoStream();
    }
    else {
      setCam(true);
      fetchVideoStream()
    }

  }

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

  async function encryptRoom() {

    const sign = await encryptionSignature();
    console.log(roomId);
    const response = await lighthouse.textUploadEncrypted(
      roomId,
      LIGHTHOUSE_API_KEY,
      sign.publicKey,
      sign.signedMessage
    );

    const lighthouseResponse = await response;
    const textCID = lighthouseResponse.data.Hash;
    addToCeramic(textCID);

    const NFTaddress = "0xB550E30110fc6CF4E3eDcA00c45045a77298E2D6";

    await applyAccessConditions(textCID, NFTaddress);

  }

  async function addToCeramic(CID: string) {
    const query = `
      mutation MyMutation {
        createLiveStream(input: {content: {roomId: "${CID}", CourseDetailsID: "${courseDetailsID}", isLive: 1}}) {
          document {
            id
          }
        }
      }
    `;

    const response = await composeClient.executeQuery(query)
    console.log(response)
  }

  const applyAccessConditions = async (cid: string, NFTaddress: string) => {
    console.log(NFTaddress)
    const conditions = [
      {
        id: 1,
        chain: "Mumbai",
        method: "balanceOf",
        standardContractType: "ERC721",
        contractAddress: "0xB550E30110fc6CF4E3eDcA00c45045a77298E2D6",
        returnValueTest: { comparator: ">=", value: "0" },
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

  function toggleMic() {
    setMic(!microphone);
    stopAudioStream();
  }

  return (
    <>
      {user == 1 ? <><div className='peer-id'>Creator View</div></> : <></>}
      {user == 2 ? <><div className='peer-id'>Student View</div></> : <></>}
      <div className='start'>
        {
          !session && (user == 1) ?
            <>
              <button className='p-2' onClick={() => { fetchAudioStream(), fetchVideoStream(), setMic(true), setCam(true), encryptRoom() }}>
                Start the session!
              </button>

            </>
            :
            <>
              {
                !isRoomJoined && (user == 1) ?
                  <>
                    <button onClick={joinRoom} className='m-2'>
                      Join Room
                    </button>
                    <button className='m-2' onClick={leave}>
                      Close the session
                    </button>
                  </>
                  :
                  <></>
              }
              {
                user == 2 && studentRoom!='' ? 
                  <>
                  {!isRoomJoined ? <> {isLobbyJoined && !camera? <><button onClick={() => {fetchAudioStream(), fetchVideoStream(), setMic(true), setCam(true)}}>Start Cam & Mic</button></> : <>{}<button onClick={ () => {joinLobby(studentRoom)} }>Join Lobby</button></> } </> : <></>}
                  {camera && !isRoomJoined ? <><button onClick={joinRoom}>Join Room</button></> : <></>}
                    <div className=''>{studentRoom}</div>
                  </> 
                  : 
                  <>
                  </>
              }

            </>
        }
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        className='vidStream'
      />
      <div className='flex mt-4'>
        <div className='ml-auto mt-1 mr-6 cursor-pointer' onClick={toggleMic}>
          {session ? <>{!microphone ? <><img width="20" height="20" src="https://i.ibb.co/0QgPkNX/Screenshot-2023-06-28-at-16-58-45.png" alt="microphone" /></> : <><img width="24" height="24" src="https://i.ibb.co/5TTbWrv/Screenshot-2023-06-28-at-16-58-50.png" alt="external-microphone-off-user-interface-thin-kawalan-studio" /></>}</> : <></>}
        </div>
        <div className='mr-auto mt-2 cursor-pointer' onClick={toggleCamera}>
          {session ? <>{!camera ? <><img width="24" height="24" src="https://i.ibb.co/PrXbYPy/Screenshot-2023-06-28-at-16-58-54.png" alt="microphone" /></> : <><img width="24" height="24" src="https://i.ibb.co/wLKTgTH/Screenshot-2023-06-28-at-16-58-58.png" alt="external-microphone-off-user-interface-thin-kawalan-studio" /></>}</> : <></>}
        </div>

      </div>
    </>
  )
}
