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
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddress from '../../../constants/Wis3Address.json'
import abi from '../../../constants/Wis3.json'
import Link from "next/link"

export default function () {

    const router = useRouter();
    const CourseID = router.query.courseid;
    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients
    const { isWeb3Enabled, chainId, account, enableWeb3 } = useMoralis()

    const [courseDetails, setCourseDetails] = useState<any[]>([])
    const [lectureNames, setlectureNames] = useState(['']);
    const [cidToDecrypt, setcidToDecrypt] = useState('');
    const [bought, setBought] = useState(false); // fix bought
    const [courseDetailsID, setcourseDetailID] = useState('');
    const [CourseBought, setCourseBought] = useState<any[]>([])
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setreviewText] = useState('');
    const [contractProvoke, setContractProvoke] = useState(false);
    const [price, setPrice] = useState(0);

    const { runContractFunction: courseFee } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress.mumbai,
        functionName: "getCourseFee",
        params: {
            courseCode: CourseID
        }
    });

    const { runContractFunction: createCourse } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress.mumbai,
        functionName: "buyCourse",
        msgValue: price,
        params: {
            courseCode: CourseID
        }
    });

    useEffect(()=>{
        if(price!=0){
            const helper = async () =>{
                await createCourse();
                console.log(courseDetailsID);
                setPrice(0);
                await BuyCourse();
            }
            helper();

        }
    },[price])

    useEffect(() => {
        if (contractProvoke != false) {
            const helper = async () =>{
                await enableWeb3();
                const see:any  = await courseFee();
                setPrice(parseInt(see));

            }
            helper()
            setContractProvoke(false);
        }
    }, [contractProvoke])

    async function BuyCourse() {
        const DID = "did:key:" + account?.toString();
        console.log(DID)
        console.log(courseDetailsID)
        const response = await fetch('/api/composeCreate', {
            method: 'POST',
            body: JSON.stringify({ courseDetailsID, DID }),
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

    useEffect(() => {
        console.log(lectureNames)
    }, [lectureNames])

    useEffect(() => {
        if (courseDetails.length != 0) {
            for (var i = 0; i < courseDetails.length; i++) {                                        // *********************
                if (courseDetails[i].node.courseCode == CourseID) { // REMOVE AND CONDITON *
                    var lectureNameTemp = [];                                                       //********************** 
                    const size = courseDetails[i].node.lectureName[0].length;
                    var temp = '';
                    setcourseDetailID(courseDetails[i].node.id);
                    for (var j = 0; j <= size; j++) {
                        if (j == size) {
                            lectureNameTemp.push(temp);
                        }
                        else if (courseDetails[i].node.lectureName[0][j] != ',') {
                            temp += courseDetails[i].node.lectureName[0][j];
                        }
                        else {
                            lectureNameTemp.push(temp);
                            temp = '';
                        }
                    }
                    setlectureNames(lectureNameTemp)
                }
            }

        }
        if (CourseBought.length != 0) {
            
            var str = 'did:key:' + account?.toString;

            for (var i = 0; i < CourseBought.length; i++) {
                if ((CourseBought[i].node.coursedetails.courseCode == CourseID) && (CourseBought[i].node.timestampFor.id == str)) {
                    setBought(true)
                }
            }
        }
        else{
            setBought(true);
        }
        console.log(CourseBought)


    }, [courseDetails])

    const GetCourseDetails = async () => {
        if (ceramic.did !== undefined) {
            var profile = await composeClient.executeQuery(CourseDetails);
            var CourseBought = await composeClient.executeQuery(query);
            console.log(CourseBought)
            const temp1: any = CourseBought.data!.timeStampsIndex;
            const temp2: any = profile.data!.courseDetailsIndex
            setCourseBought(temp1.edges);
            setCourseDetails(temp2.edges);
        }
    }

    async function submitReview() {
        const stars = rating.toString();
        console.log(stars);
        const did:string = 'did:key:' + account?.toString();
        const runQuery = await composeClient.executeQuery(
            `
            mutation MyMutation {
                createReviews(
                  input: {content: {text: "${reviewText}", rating: ` + stars + `, CourseDetailsID: "${courseDetailsID}", write: "${did}"}}
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

    async function test() {
        console.log('wtf')
        setContractProvoke(true);
    }

    useEffect(() => {
        handleLogin();
        const a = async ()=>{
            await enableWeb3()
        }
    }, [])

    return (
        <div className="">
            <Navbar />
            <div className="flex banner">

                <div className="ml-10 mt-10">
                    <div className="mt-4 active">Review</div>
                    <div className="mt-4 inactive">Huddle01 Live!</div>
                    {bought? <><div className="mt-4 inactive">Need a refund?</div></>:<></>}
                    

                </div>
                {bought ?
                    <div className="ml-20 w-1/2">
                        <div className="m-4 text-2xl">{bought ? <>Watch, discuss and attend live sessions!</> : <><div className="text-xl">You havent bought this course!<button className="ml-8 p-2" onClick={test}>Get this course</button></div></>}</div><br />

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
                                )
                            })}
                        </div>
                        <textarea className="form" value={reviewText} onChange={(e) => { setreviewText(e.target.value) }}></textarea>
                        <button className='product-button' onClick={submitReview}>Submit Review</button>
                    </div>
                    :
                    <button onClick={test}>Buy the course</button>
                }

                <div className="ml-auto w-fit mr-10">
                    <div className="mt-4 mb-8 ml-2 text-2xl">
                        Course contents
                    </div>
                    {
                        lectureNames.map((item, index) => (<LectureNames courseID={CourseID} name={item} index={index} key={index} />))
                    }
                </div>


            </div>
        </div>
    )
}
