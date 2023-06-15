import { useRouter } from "next/router"
import { useCeramicContext } from '../../../context'
import { authenticateCeramic } from '../../../utils'
import CourseDetails from '../../../CourseDetail'
import Navbar from '../../../components/Navbar'
import LectureNames from "../../../components/LectureNames"
import { useEffect, useState } from "react";
import query from '../../../TimeStamp'

export default function () {

    const router = useRouter();
    const CourseID = router.query.courseid;
    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients

    const [courseDetails, setCourseDetails] = useState<any[]>([])
    const [lectureNames, setlectureNames] = useState(['']);
    const [cidToDecrypt, setcidToDecrypt] = useState('');
    const [bought, setBought] = useState(false);
    const [courseDetailsID, setcourseDetailID] = useState('');
    const [CourseBought, setCourseBought] = useState<any[]>([])
    

    async function BuyCourse(){
        // ***********************
        // * HARDHAT INTEGRATION *
        // ***********************
        const didPKP = composeClient.did?._parentId;
        const DID = didPKP.replace('pkh:eip155:137','key')
        console.log(DID)
        const response = await fetch ('/api/composeCreate',{
            method: 'POST',
            body: JSON.stringify({courseDetailsID,DID}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json()
        console.log(data)
    }


    const handleLogin = async () => {
        
        await authenticateCeramic(ceramic, composeClient)
        await GetCourseDetails()
    }

    useEffect(()=>{
        console.log(lectureNames)
    },[lectureNames])

    useEffect(()=>{
        if(courseDetails.length!=0){
            for(var i = 0 ; i < courseDetails.length ; i++){                                        // *********************
                if(courseDetails[i].node.courseCode == CourseID && courseDetails[i].node.price>10){ // REMOVE AND CONDITON *
                    var lectureNameTemp = [];                                                       //********************** 
                    const size = courseDetails[i].node.lectureName[0].length;
                    var temp = '';
                    setcourseDetailID(courseDetails[i].node.id);
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
        if(CourseBought.length!=0){
            var helper = (composeClient.did._parentId)
            var str = helper.replace('pkh:eip155:137','key')
            
            for(var i = 0 ; i < CourseBought.length ; i++){
                if((CourseBought[i].node.coursedetails.courseCode == CourseID) && (CourseBought[i].node.timestampFor.id==str)){
                    setBought(true)
                }
            }
        }
        console.log(CourseBought)

        
    },[courseDetails])

    const GetCourseDetails = async () => {
        if (ceramic.did !== undefined) {
            var profile = await composeClient.executeQuery(CourseDetails);
            var CourseBought = await composeClient.executeQuery(query);
            setCourseBought (CourseBought.data.timeStampsIndex.edges);
            setCourseDetails(profile.data!.courseDetailsIndex.edges);
        }
    }

    useEffect(() => {
        handleLogin();
    }, [])

    return (
        <div className="">
            <Navbar/>
            <div className="flex banner">
                
               
                <div>
                    <div className="m-4">{<><div className="text-xl">You havent bought this course!<button className="ml-8 p-2" onClick={BuyCourse}>Get this course</button></div></>}</div><br/>
                    Review<br/>
                    Huddle01 Live<br/>
                    Chat Push<br/>

                </div>
                <div className="ml-auto w-fit">
                    <div className="mt-2 mb-8 ml-2 text-2xl">
                        Course content
                    </div>
                    {
                        lectureNames.map((item,index)=>(<LectureNames courseID={CourseID} name={item} index={index} key={index}/>))
                    }
                </div>
               

            </div>
        </div>
    )
}
