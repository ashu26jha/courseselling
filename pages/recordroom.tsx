import { useCallback, useEffect, useState } from "react";
import { HuddleIframe, iframeApi, useEventListner } from "@huddle01/iframe";
import { useDropzone } from 'react-dropzone';
import { ethers } from 'ethers';
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import Huddle01Graphics from "../components/Huddle01Graphics";
import lighthouse from '@lighthouse-web3/sdk';
const LIGHTHOUSE_API_KEY = 'be64189e.15aac07bb7804b7bbbc339420a77e878';
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddress from '../constants/Wis3Address.json'
import abi from '../constants/Wis3.json';
const query =
    `query CourseDetailsFetch {
    courseDetailsIndex(first: 100) {
        edges {
            node {
                courseCode
                courseName
                videoLecture
                courseCreator {
                    id
                }
                lectureName
                id
            }
        }
    }
}`

const recordRoom = () => {

    const { isWeb3Enabled, chainId, account, enableWeb3 } = useMoralis()
    const [lectureTitle, setLectureTitle] = useState("");
    const [lectureCID, setLectureCID] = useState("");
    const [lectures, setLectures] = useState([{}]);
    const [fileURL, setFileURL] = useState("");
    const [courseCreator, setCourseCreator] = useState("");
    const [nftaddress, setNFTaddress] = useState('');
    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients
    const [courseCode, setCourseCode] = useState('');

    const { runContractFunction: getNFTaddress } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress.mumbai,
        functionName: "getNFTaddress",
        params: {
            courseCode: courseCode
        }
    })

    const handleLogin = async () => {
        await authenticateCeramic(ceramic, composeClient)
        console.log(ceramic)
    }

    useEffect(() => {
        if (courseCode != '') {
            const helper = async () => {
                console.log(courseCode)
                await enableWeb3();
                const res = await getNFTaddress();
                console.log(res)
                setNFTaddress(res!.toString())
            }
            helper();
        }
    }, [courseCode])

    useEffect(() => {
        handleLogin()
    }, [])


    async function addToList() {
        await enableWeb3()
        if (fileURL === "") {
            alert("Add a file to drop box!!")
            return;
        }
        if (ceramic.did !== undefined) {
            const response = await composeClient.executeQuery(query);
            var temp: any = response.data!.courseDetailsIndex;
            var tempArr = temp.edges;
            const didkey: string = 'did:key:' + account!.toString();

            for (var i = 0; i < tempArr.length; i++) {
                if (tempArr[i].node.courseCreator.id == didkey) {
                    setCourseCode(tempArr[i].node.courseCode)
                }
            }
        }


    }


    useEventListner("lobby:initialized", () => {
        iframeApi.initialize({
            wallets: ["metamask"],
        });
    });

    useEventListner("room:joined", () => {
        var temp = document.getElementById('strip');
        var temp1 = temp?.style;
        if (temp1 == null) {
            return
        }
        temp1.display = 'none';
    });

    const onDrop = useCallback((acceptedFiles: any) => {
        setFileURL(acceptedFiles);
        console.log(acceptedFiles)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

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

    useEffect(() => {
        if (nftaddress != '') {
            const helper = async () => {
                
                const uploadResponse = (await uploadFileEncrypted()).CID;
                await applyAccessConditions(uploadResponse, nftaddress);
                
                // ComposeDB

                const response = await composeClient.executeQuery(query);
                var temp: any = response.data!.courseDetailsIndex;
                var tempArr = temp.edges;
                for (var i = 0; i < tempArr.length; i++) {
                    if (tempArr[i].node.courseCode == courseCode) {
                        const reuse = tempArr[i].node;
                        const streamid = reuse.id;
                        const courseName = reuse.courseName;
                        const LectureNames = reuse.lectureName;
                        const LectureCID = reuse.videoLecture;
                        const did:string = 'did:key:' + account?.toString()
                        console.log(courseName)
                        if (LectureCID == undefined) {
                            console.log(courseName)
                            const update = await composeClient.executeQuery(`
                            mutation MyMutation {
                                updateCourseDetails(
                                  input: {id: "${streamid}", content: {courseCode: "${courseCode}", courseName: "${courseName}", courseCreator: "${did}", lectureName: "${[lectureTitle]}", videoLecture: "${uploadResponse}"}, options: {replace: true}}
                                ) {
                                  document {
                                    courseCreator {
                                      id
                                      isViewer
                                    }
                                  }
                                }
                              }
                                `);
                            console.log(update);
                            break;
                        }
                        else{
                            var CIDarray = [...LectureCID,uploadResponse];
                            var Namearray = [...LectureNames,lectureTitle];
                            const update = await composeClient.executeQuery(`
                                mutation MyMutation {
                                    updateCourseDetails(
                                    input: {content: {courseName: "${courseName}", courseCode: "${courseCode}",  videoLecture: "${[CIDarray]}", courseCreator: "${did}",lectureName: "${Namearray}" }, options: {replace: true}, id: "${streamid}"}
                                    ) {
                                        document {
                                            id
                                            price
                                            courseName
                                            courseCode
                                            courseCreator{
                                                id
                                            }
                                            videoLecture
                                            lectureName
                                            }
                                        }
                                    }
                                `);
                            console.log(update);
                        }
                    }
                }
            }
            helper()

        }
    }, [nftaddress])

    const applyAccessConditions = async (cid: string, nft: string) => {

        const conditions = [
            {
                id: 1,
                chain: "Mumbai",
                method: "balanceOf",
                standardContractType: "ERC1155",
                contractAddress: nft,
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

        console.log("Access conditions applied ", response);

    }

    const uploadFileEncrypted = async () => {

        const sig = await encryptionSignature();

        const response = await lighthouse.uploadEncrypted(
            fileURL,
            LIGHTHOUSE_API_KEY,
            sig.publicKey,
            sig.signedMessage
        );

        console.log(response);
        var CID: string = response.data.Hash
        console.log(response.data.Hash);
        console.log("Lecture CID : ", lectureCID);

        return ({
            CID
        })

    }

    useEffect(() => {
        async function help() {
            if (!isWeb3Enabled) {
                await enableWeb3();
            }

        }
        help()
    }, [])


    return (
        <div className="recordRoom">
            <div className="flex ">
                <HuddleIframe roomUrl="https://iframe.huddle01.com/" className="w-3/4 h-full aspect-video bg-black huddle" />
                <div>
                    <div className="text-2xl ml-10 mt-4">
                        Lecture Contents
                    </div><br></br>
                    <div className="ml-10 opacity-80">
                        Record the lecture, drop the files below,<br /> add lecture name and hit +
                    </div>
                    {lectures.length > 1 ? lectures.map((a, index) => {
                        var help: any = a;
                        return (
                            <>
                                {index != 0 ? <div className="mt-2 ml-10 lectures w-3/4" key={index}><p key={index}>{index}. {help.title}</p></div> : <></>}
                            </>
                        )
                    }) : <></>}
                    <div className="input-wrapper flex">
                        <input type="text" className="courseName ml-10 mt-10 text-black  " value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} /> <div className="mt-11 ml-2 add cursor-pointer" onClick={addToList}>✚</div>
                    </div>
                </div>
            </div>
            <div className="w-3/4" id="strip">
                <Huddle01Graphics />
            </div>
            <div className="w-full h-72">
                <div {...getRootProps({})} className='dropbox'>
                    <input {...getInputProps()} />
                    {fileURL ? (fileURL[0]).name : isDragActive ? <p>Drop the file here ...</p> : <p>Drag 'n' drop file here, or click to select file</p>}
                </div>
            </div>

        </div>
    )
};
export default recordRoom;
