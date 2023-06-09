import { useCallback, useEffect, useState } from "react";
import { HuddleIframe, iframeApi, useEventListner } from "@huddle01/iframe";
import { useDropzone } from 'react-dropzone';
import { ethers } from 'ethers';
import Huddle01Graphics from "../components/Huddle01Graphics";
import lighthouse from '@lighthouse-web3/sdk';
const LIGHTHOUSE_API_KEY = 'be64189e.15aac07bb7804b7bbbc339420a77e878';
const recordRoom = () => {

    const [lectureTitle, setLectureTitle] = useState("");
    const [lectureCID, setLectureCID] = useState("");
    const [lectures, setLectures] = useState([{}]);
    const [fileURL, setFileURL] = useState("");

    const obectRef = {
        "title": "",
        "CID": ""
    };

    async function addToList() {
        if (fileURL === "") {
            alert("Add a file to drop box!!")
            return;
        }

        var lectureHASH = (await uploadFileEncrypted());
        console.log("LECTURE HASH : ", lectureHASH);

        var temp = lectures;
        const obj = obectRef;
        obj.title = lectureTitle;
        obj.CID = lectureHASH.CID;
        temp.push(obj)

        console.log(lectures);
        setLectures(temp);
        setLectureTitle("")
        setLectureCID("")
    }


    useEventListner("lobby:initialized", () => {
        iframeApi.initialize({
            wallets: ["metamask"],
        });
    });

    useEventListner("room:joined", () => {
        var temp = document.getElementById('strip');
        var temp1 = temp?.style;
        if(temp1==null){
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

    const uploadFileEncrypted = async () => {
        console.log(fileURL)
        const sig = await encryptionSignature();
        const response = await lighthouse.uploadEncrypted(
            fileURL,
            LIGHTHOUSE_API_KEY,
            sig.publicKey,
            sig.signedMessage
        );
        console.log(response);
        setLectureCID(response.data.Hash);
        var CID:string = response.data.Hash
        console.log(response.data.Hash);
        console.log("Lecture CID : ", lectureCID);

        await applyAccessConditions(response.data.Hash)

        return ({
            CID
        })
    }
    
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
                        var help:any = a ;
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
                <Huddle01Graphics/>    
            </div>
            <div {...getRootProps({})} className='p-16 mt-10 ml-40 mr-40 w-1/2 dropbox'>
              <input {...getInputProps()} />
              {fileURL? (fileURL[0]).name : isDragActive ? <p>Drop the file here ...</p> : <p>Drag 'n' drop file here, or click to select file</p>}
            </div>
        </div>
    )
};
export default recordRoom;
