import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddress from '../../../../constants/Wis3Address.json'
import abi from '../../../../constants/Wis3.json'
import { useCeramicContext } from '../../../../context'
import { authenticateCeramic } from '../../../../utils'
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";

export default function () {

    const router = useRouter();
    const [composeDB,setComposeDB] = useState('');
    const [toggle,settoggle] = useState('');
    const { runContractFunction: addCredentials } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress.mumbai,
        functionName: "addCredentials",
        params: {
            courseCode: router.query.courseid,
            composeDB: composeDB
        }
    })

    async function helper(){
        settoggle('a');
    }

    useEffect(()=>{
        if(toggle!=''){
            const helper = async ()=>{
                await addCredentials();
            }
            helper()
        }
    },[toggle])

    console.log(router.query.courseid)

    return (
    <>
        <Navbar/>
        <input type="text" className="courseCode m-3" placeholder='ComposeDB'value={composeDB} onChange={(e) => setComposeDB(e.target.value)} />
        <button onClick={helper}> Submit </button>
    </>
    )
}


