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
            setCourseDetails(profile.data!.courseDetailsIndex.edges)
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
                        <Cards courseName={item.node.courseName} courseID={item.node.courseCode} imgURL="https://i.ibb.co/Lg7dJfN/Screenshot-2023-06-12-at-23-56-19.png" price={item.node.price} key={index}/>))
                :<></>}
            </div>
        </div>
        
    )
}
