import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import { useState, useEffect } from 'react'

const test = () => {
    const clients = useCeramicContext()
    const { ceramic, composeClient } = clients
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');


    const handleLogin = async () => {
        await authenticateCeramic(ceramic, composeClient)
        console.log(ceramic)
        await getProfile()
    }

    const getProfile = async () => {
        if (ceramic.did !== undefined) {
            const profile = await composeClient.executeQuery(`
                query CourseDetailsFetch {
                    courseDetailsIndex(first: 10) {
                        edges {
                            node {
                                courseCode
                                courseName
                                version
                                videoLecture
                                courseCreator {
                                    id
                                }
                                id
                            }
                        }
                    }
                }`
            );
            console.log(profile);
        }
        else{
            console.log("Lmao skipped")
        }
    }
    const updateProfile = async () => {
        if (ceramic.did !== undefined) {
            const update = await composeClient.executeQuery(`
            mutation MyMutation {
                createCourseDetails(input: {content: {courseCode: "${courseCode}", courseName: "${courseName}"}}) {
                  document {
                    courseCode
                    courseName
                  }
                }
              }
            `);

            console.log(update)

        }
    }
    useEffect(() => {
        // if (localStorage.getItem('did')) {
            handleLogin()
        // }
        
    }, [])

    return (
        <div>
            Course Name
            <input type="text" onChange={(e) => { setCourseName(e.target.value) }} />
            Course Code
            <input type='text' onChange={(e) => { setCourseCode(e.target.value) }} />

            <button onClick={getProfile}>Get Data</button>
            <button onClick={updateProfile}> Write Data</button>
        </div>
    )
}
export default test;
