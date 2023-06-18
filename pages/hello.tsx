import { useEffect } from 'react'
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'


export default function () {

    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients

    const handleLogin = async () => {
        await authenticateCeramic(ceramic, composeClient)
        console.log(ceramic)
    }

    useEffect(() => {
        handleLogin()
    }, [])

    console.log(composeClient)
    async function test(){
        const response = await composeClient.executeQuery(`
        query MyQuery {
            courseDetailsIndex(first: 10) {
              edges {
                node {
                  courseName
                  id
                  courseCode
                  courseCreator {
                    id
                  }
                }
              }
            }
          }
        `)
        console.log(response)
    }

    return (<>
        <button onClick={test}>Click Me</button>
    </>)
}
