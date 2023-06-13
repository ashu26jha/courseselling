import { useRouter } from "next/router"
import { useCeramicContext } from '../../../context'
import { authenticateCeramic } from '../../../utils'
import CourseDetails from '../../../CourseDetail'
import Navbar from '../../../components/Navbar'
import LectureNames from "../../../components/LectureNames"
import { useEffect, useState } from "react";

export default function () {

    const router = useRouter();
    const CourseID = router.query.courseid;

    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients
    const [courseDetails, setCourseDetails] = useState<any[]>([])
    const [lectureNames, setlectureNames] = useState(['']);

    const handleLogin = async () => {
        await authenticateCeramic(ceramic, composeClient)
        await GetCourseDetails()
    }

    useEffect(()=>{
        console.log(lectureNames)
    },[lectureNames])

    useEffect(()=>{
        if(courseDetails.length!=0){
            for(var i = 0 ; i < courseDetails.length ; i++){
                if(courseDetails[i].node.courseCode == CourseID){
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
        
    },[courseDetails])

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
        <div className="">
            <Navbar/>
            <div className="flex banner">
                <div>
                    Review<br/>
                    Huddle01 Live<br/>
                    Chat Push<br/>
                </div>
                <div className="ml-auto w-fit">
                    <div className="mt-2 mb-4 ml-2 text-2xl">
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
