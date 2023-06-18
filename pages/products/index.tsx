import Cards from "../../components/Cards"
import { useCeramicContext } from '../../context'
import { authenticateCeramic } from '../../utils'
import CourseDetails from '../../CourseDetail'
import Navbar from '../../components/Navbar'
import { useEffect, useState } from "react";


export default function () {
    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients
    const [courseDetails, setCourseDetails] = useState<any[]>([])

    const handleLogin = async () => {
        await authenticateCeramic(ceramic, composeClient)
        await GetCourseDetails()
    }

    useEffect(()=>{
        console.log(courseDetails)
    },[courseDetails])

    const GetCourseDetails = async () => {
        if (ceramic.did !== undefined) {
            var profile = await composeClient.executeQuery(CourseDetails);
            var help: any = profile.data!.courseDetailsIndex;
            setCourseDetails(help.edges)
        }
    }

    useEffect(() => {
        handleLogin();
    }, [])
    
    return (
        <div className="banner">
            <Navbar/>
            <div className="m-auto w-30 text-3xl text-center mt-10 ">Get some courses!</div>
            <div className="flex flex-wrap">
                {
                courseDetails? 
                    courseDetails.map((item,index)=>(
                        <Cards courseName={item.node.courseName} courseID={item.node.courseCode} imgURL="https://gateway.lighthouse.storage/ipfs/QmRXvHYQAZnayFjsgDz9gzZWRGpEwXemp9VKPEhmrtrV7Z"  key={index}/>))
                :<></>}
            </div>
        </div>
        
    )
}
