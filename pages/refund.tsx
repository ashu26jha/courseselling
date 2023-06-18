import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis";
import contractAddress from '../constants/Wis3Address.json'
import abi from '../constants/Wis3.json'
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import Navbar from "@/components/Navbar";
export default function () {

    const [courseCode, setcourseCode] = useState('');
    const [description, setDescription] = useState('');
    const [composeDB, setComposeDB] = useState('');
    const [name, setName] = useState('')
    const [address,setaddress] = useState('')
    const [bool, setbool] = useState('');
    const { isWeb3Enabled, chainId, account, enableWeb3 } = useMoralis();
    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients;
    const [basicProfileID,setbasicProfileId] = useState('');
    const [daoarray, setdaoarray] = useState([]);
    const [votingIndex,setVotingIndex] = useState(-1);
    const [votingcourse,setvotingcourse] = useState('');
    const [vote,setVote] = useState(0);

    const { runContractFunction: createProposal } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress.mumbai,
        functionName: "createProposal",
        params: {
            courseCode: courseCode,
            description: description,
            composeStream: composeDB
        }
    })

    const { runContractFunction: voteProp } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress.mumbai,
        functionName: "performVoting",
        params: {
            addr: address,
            vote: votingIndex.toString()
        }
    })

    useEffect(() => {
        if (composeDB != '' && description != '' && courseCode != '') {
            console.log('Tring')
            const helper = async () => {
                await createProposal();
                await addProfileToCompose();
            }
            helper();
        }
    }, [bool])

    useEffect(() => {
        async function help() {
            await enableWeb3();
        }
        help()
    }, [])

    async function trig() {
        setbool("a");
    }

    // Ceramic: 
    const handleLogin = async () => {
        await authenticateCeramic(ceramic, composeClient)
        const respone = await composeClient.executeQuery(`
            query MyQuery {
                daoDataIndex(first: 10) {
                edges {
                    node {
                    basicprofile {
                        displayName
                    }
                    courseCode
                    description
                    address
                    }
                }
                }
            }
        `)
        var i:any = respone.data!.daoDataIndex;
        setdaoarray(i.edges)
        console.log(respone)
    }

    useEffect(() => {
        handleLogin()
        
    }, []);

    async function addProfileToCompose() {
        const response = await composeClient.executeQuery(`
            mutation MyMutation {
                createSimpleProfile(
                    input: {
                        content: {
                            displayName: "${name}"
                        }
                    }) {
                    document {
                        id
                    }
                }
            }
        `);
        console.log(response);
        const temp: any = response.data!.createSimpleProfile;
        setbasicProfileId(temp.document.id);
        
    }

    useEffect(()=>{
        if(basicProfileID!=''){
            const helper = async () => {
                console.log(address)
                console.log(courseCode);
                console.log(basicProfileID);
                console.log(typeof(courseCode));
                console.log(typeof(basicProfileID));
                const update = await composeClient.executeQuery(
                    
                    `
                    mutation MyMutation {
                        createDaoData(
                          input: {content: {BasicProfileID: "${basicProfileID.toString()}", courseCode: "${courseCode}", description: "${description}", address:"${address}"}}
                        ) {
                          document {
                            id
                          }
                        }
                    }
                    `
                )
                console.log(update)
            }
            helper()
            
        }
    },[basicProfileID])


    useEffect(()=>{

        console.log(votingIndex,address)
        async function helping(){
            await enableWeb3();
            const a = await voteProp();
            console.log(a)
        }
        helping();
    },[votingIndex])

    function favour (index: any){
        setVotingIndex(1);
    }

    function against(index: any){
        setVotingIndex(0);
    }

    

    return (
        <>
            <Navbar />
            <div>
                <div className="w-56 m-auto mt-8">
                    <input type="text" className="courseCode text-black " value={courseCode} onChange={(e) => setcourseCode(e.target.value)} placeholder="Enter Course Code" />
                </div>
                <br />
                <div className="w-56 m-auto">
                    <input type="text" className="courseCode text-black " value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                </div>
                <br />
                <div className="w-56 m-auto">
                    <input type="text" className="courseCode text-black " value={composeDB} onChange={(e) => setComposeDB(e.target.value)} placeholder="ID" />
                </div>
                <br />
                <div className="w-56 m-auto">
                    <input type="text" className="courseCode text-black " value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                </div>
                <br />
                <div className="w-56 m-auto">
                    <input type="text" className="courseCode text-black " value={address} onChange={(e) => setaddress(e.target.value)} placeholder="Address" />
                </div>
                <div className="m-auto opacity-980 text-center w-1/5">
                    Entering incorrect could lead DAO members voting against proposal
                    <button className="mt-10 w-20" onClick={trig}>Submit</button>
                </div>

                {
                    daoarray.length!=0 ? 
                    <>
                        {daoarray.map((item,index)=>(
                            <>
                                <div className="proposals">
                                    <div className="proposalname mt-4">
                                        Name: {item.node.basicprofile.displayName}
                                    </div>
                                    <div className="proposalcourse">
                                        Course Code: {item.node.courseCode}
                                    </div>
                                    <div className="proposaldes">
                                        Description: {item.node.description}
                                    </div >
                                    <div className="voting flex m-auto">
                                        <button className="ml-4 w-full fav" onClick={()=>favour(index)}

                                        >Favour</button>
                                        <button className="mr-4 ml-1 w-full fav" onClick={()=>against(index)}>Against</button>

                                    </div>
                                </div>
                            </>
                        ))}
                    </>
                    
                    :<></>
                }



            </div>
        </>
    )

}
