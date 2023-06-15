import { useRouter } from "next/router"
import { useCeramicContext } from '../../../context'
import { authenticateCeramic } from '../../../utils'
import CourseDetails from '../../../CourseDetail'
import Navbar from '../../../components/Navbar'
import LectureNames from "../../../components/LectureNames"
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
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
    const [bought, setBought] = useState(false); // fix bought
    const [courseDetailsID, setcourseDetailID] = useState('');
    const [CourseBought, setCourseBought] = useState<any[]>([])
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setreviewText] = useState('');


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

    async function submitReview(){
        const stars  = rating.toString();
        console.log(stars); 
        const runQuery = await composeClient.executeQuery(
            `
            mutation MyMutation {
                createReviews(
                  input: {content: {text: "${reviewText}", rating: `+stars+`, CourseDetailsID: "${courseDetailsID}"}}
                ) {
                  document {
                    id
                  }
                }
              }
            `
        )
        console.log(runQuery);
    }

    useEffect(() => {
        handleLogin();
    }, [])

    return (
        <div className="">
            <Navbar/>
            <div className="flex banner">
                    
                <div className="ml-10 mt-10">
                    <div className="mt-4">Review</div>
                    <div className="mt-4">Huddle01 Live!</div>
                    <div className="mt-4">Discuss on Push</div>

                </div>
                {bought ? 
                    <div className="ml-20 w-1/2">
                        <div className="m-4 text-2xl">{bought?<>Watch, discuss and attend live sessions!</>:<><div className="text-xl">You havent bought this course!<button className="ml-8 p-2" onClick={BuyCourse}>Get this course</button></div></>}</div><br/>

                        <div className="star-rating m-1">
                            Drop a rating! 
                            {[...Array(5)].map((star, index) => {
                                index += 1;
                                return (
                                <button
                                    type="button"
                                    key={index}
                                    className={index <= (hover || rating) ? "on" : "off"}
                                    onClick={() => setRating(index)}
                                    onMouseEnter={() => setHover(index)}
                                    onMouseLeave={() => setHover(rating)}
                                >
                                    <span className="star">&#9733;</span>
                                </button>
                            )})}
                        </div>
                        <textarea className = "form"value = {reviewText} onChange={(e)=>{setreviewText(e.target.value)}}></textarea>
                        <button className='product-button' onClick={submitReview}>Submit Review</button>
                    </div>
                    :
                    <></>
                }
                    
                <div className="ml-auto w-fit mr-10">
                    <div className="mt-4 mb-8 ml-2 text-2xl">
                        Course contents
                    </div>
                    {
                        lectureNames.map((item,index)=>(<LectureNames courseID={CourseID} name={item} index={index} key={index}/>))
                    }
                </div>
               

            </div>
        </div>
    )
}
