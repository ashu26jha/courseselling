import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCeramicContext } from '../../../../context';
import { authenticateCeramic } from '../../../../utils';
import { ethers } from 'ethers';
import CourseDetails from '../../../../CourseDetail';
import Navbar from '../../../../components/Navbar';
import LectureNames from "../../../../components/LectureNames";
const LIGHTHOUSE_API_KEY = 'be64189e.15aac07bb7804b7bbbc339420a77e878';
import lighthouse from '@lighthouse-web3/sdk';
// *********************************
// REMOVE AND CONDITION OF PRICE   *  LINE 50 74
//********************************** 

export default function () {


    const router = useRouter();
    const {courseid,lectureid} = router.query;
    console.log("Hello from Products",courseid, lectureid);

    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients
    const [courseDetails, setCourseDetails] = useState<any[]>([])
    const [courseName, setCourseName] = useState('')
    const [lectureNames, setlectureNames] = useState(['']);
    const [cidToDecrypt, setcidToDecrypt] = useState('');


    const handleLogin = async () => {
        await authenticateCeramic(ceramic, composeClient)
        await GetCourseDetails()
    }

    useEffect(()=>{
        console.log(lectureNames)
    },[lectureNames])

    // useEffect(()=>{
    //     if(cidToDecrypt!=''){
    //         const help = async function(){
    //             await decrypt();
    //         }
    //         help()
    //     }
        
    // },[cidToDecrypt]);

    useEffect(()=>{
        console.log(courseDetails)
        if(courseDetails.length!=0){
            for(var i = 0 ; i < courseDetails.length ; i++){                                        // ***********************
                if(courseDetails[i].node.courseCode == courseid && courseDetails[i].node.price>10){ // * REMOVE AND CONDITON *
                    setCourseName(courseDetails[i].node.courseName)                                 //************************
                    var lectureNameTemp = [];
                    const size = courseDetails[i].node.lectureName[0].length;
                    var temp = '';
                    for( var j = 0 ; j <= size ; j++){
                        if(j==size){
                            lectureNameTemp.push(temp);
                        }
                        else if(courseDetails[i].node.lectureName[0][j]!=','){
                            temp+=courseDetails[i].node.lectureName[0][j];
                        }
                        else{
                            lectureNameTemp.push(temp);
                            temp='';
                        }
                    }
                    setlectureNames(lectureNameTemp)
                }
            }

            
        }
        for(var i = 0 ; i < courseDetails.length ; i++){
            if(courseDetails[i].node.courseCode == courseid && courseDetails[i].node.price>10){ /// REMOVE CONDITION
                var lectureCID='';
                var counter = 0 ;
                const size = courseDetails[i].node.videoLecture[0].length;
                for(var j = 0 ; j <= size ; j++){
                    if(size==j){
                        console.log(lectureCID)
                        setcidToDecrypt(lectureCID)
                    }
                    if(courseDetails[i].node.videoLecture[0][j]!=','){
                        lectureCID+=courseDetails[i].node.videoLecture[0][j];
                    }
                    else {
                        if(counter == parseInt(lectureid)) {
                            setcidToDecrypt(lectureCID)
                            break;
                        }
                        lectureCID='';
                        counter+=1;
                    }
                    
                }
    
            }
        }
        
    },[courseDetails]);

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
        const keyObject = await lighthouse.fetchEncryptionKey(
            cidToDecrypt,
            publicKey,
            signedMessage
        );
        const fileType = "video/mp4";
        const decrypted = await lighthouse.decryptFile(cidToDecrypt, keyObject.data.key || "", fileType);
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

    const GetCourseDetails = async () => {
        if (ceramic.did !== undefined) {
            var profile = await composeClient.executeQuery(CourseDetails);
            setCourseDetails(profile.data!.courseDetailsIndex.edges)
        }
    }

    useEffect(() => {
        handleLogin();
    }, [])


    return (
        <div>
            <Navbar/>
            <div className="flex banner">
                <div>
                    <div className=" m-2 text-3xl">
                        {courseName}
                    </div>
                    <div className=" m-4 text-xl">
                        {lectureNames.length > 1 ? <>Topic: {lectureNames[lectureid]}</>:<></>}
                    </div>

                    <div>
                        <video id="vidplayer" width="800" height="800" controls className="m-10">

                        </video>
                    </div>
                </div>
                <div className="ml-auto w-fit mr-10 mt-6">
                    <div className="mt-2 mb-8 ml-2 text-2xl">
                        Course content
                    </div>
                    {
                        lectureNames.map((item,index)=>(<LectureNames courseID={courseid} name={item} index={index} key={index}/>))
                    }
                </div>
               

            </div>
        </div>
    )
}
