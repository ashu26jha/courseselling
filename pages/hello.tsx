import { useEffect, useState } from 'react'
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import { useMoralis, useWeb3Contract } from "react-moralis";

const courseCode = 'BCS';

// const createQuery = `
// mutation MyMutation {
//   createCourseDetails(
//     input: {
//       content: {
//         courseCode: "BCS", 
//         courseName: "BlockChain Basics", 
//         courseCreator: "did:key:0x74c7b157af4E5418F03eb928DF309cc98CE38E66"
//       }
//     }
//   ) {
//     document {
//       id
//       courseCreator {
//         id
//       }
//     }
//   }
// }
// `

const query = `
  query MyQuery {
    courseDetailsIndex(first: 10) {
      edges {
        node {
          id
          courseName
          courseCode
          courseCreator {
            id
          }
        }
      }
    }
  }
`;

export default function () {

  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const { isWeb3Enabled, chainId, account, enableWeb3 } = useMoralis()
  const [user, setUser] = useState(0);

  useEffect(()=>{
    if(user!=0){
      console.log(user);
    }
  },[user])


  const handleLogin = async () => {
    await enableWeb3()
    await authenticateCeramic(ceramic, composeClient)

    // Checking wheather it is course creator or not
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const response: any = (await composeClient.executeQuery(query)).data!.courseDetailsIndex;
    for (var i = 0; i < response.edges.length; i++) {
      const temp = response.edges[i].node;
      
      if (temp.courseCode == courseCode) {
        const connectedDID = 'did:key:' + account.toString()
        if((temp.courseCreator.id).toLowerCase() == connectedDID){
          console.log("Creator it is")
          setUser(1);
        }
        else{
          setUser(2);
        }


      }
    }
  }

  // async function createDemoCourse(){
  //   const update = await composeClient.executeQuery(createQuery);
  //   console.log(update)
  // }

  useEffect(() => {

    handleLogin()
  }, [])



  return (
    <>
      {user == 1 ? <><div className='peer-id'>Creator View</div></> :<></>}
      {user == 2 ? <><div className='peer-id'>Student View</div></> : <></>}
    </>
  )
}
