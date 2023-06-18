import Link from 'next/link'
interface CardProps {
    courseName: string;
    courseID: string;
    imgURL: string
}

import { useMoralis, useWeb3Contract} from "react-moralis";
import contractAddress from '../constants/Wis3Address.json'
import abi from '../constants/Wis3.json'
import { useEffect, useState } from 'react';

function Cards(props: CardProps) {

    const [Price,SetPrice] = useState(0);
    const { isWeb3Enabled, chainId, account, enableWeb3 } = useMoralis();
    const { runContractFunction: courseFee } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress.mumbai,
        functionName: "getCourseFee",
        params: {
            courseCode: props.courseID
        }
    });

    useEffect(()=>{
        async function hlp (){
            if(!isWeb3Enabled){
                await enableWeb3();
            }
            const a = await courseFee();
            console.log(a);
        }
    })

    return (
        <>
            <Link href={`./products/${props.courseID}`}>
                <div className="w-52 h-72 m-auto rounded-xl  Cards">
                    <img className="w-full h-1/2 rounded-xl "  src={props.imgURL}/> 
                    <div className="pl-6 mt-4 card-text text-xl">{props.courseName}</div>
                    <div className="pl-6 mt-4 card-text text-xl">{props.courseID}</div>
                </div>
            </Link>
        </>
    )
}
export default Cards
