import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import lighthouse from '@lighthouse-web3/sdk'
import Navbar from "../components/Navbar"

/*********************************
 * 1. ADD CONTRACT INTEGRATION   *    
 * 2. ADD IMAGEURI TO COMPOSEDB  *               
 *********************************/

const createCourse = () => {

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [coursePrice, setCoursePrice] = useState("")
  const [ImageCID, setImageCID] = useState("");
  const [tokenURI, settokenURI] = useState("");
  const [fileURL, setFileURL] = useState("");

  const clients = useCeramicContext()
  const { ceramic, composeClient } = clients

  useEffect(()=>{

    if(ImageCID!=''){
      const helper = async function() {
        await CreateCourse();
      }
      helper();
    }
    
  },[ImageCID])

  useEffect (()=>{
    // ADD CONTRACT FUCNTIONS HERE
    if(tokenURI!=''){
      const helper = async function (){

      }
      helper
    }
  },[tokenURI])

  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient)
  }

  const CreateCourse = async () => {
    if (ceramic.did !== undefined) {
      const update = await composeClient.executeQuery(`
        mutation MyMutation {
            createCourseDetails(input: {content: {price: ${parseInt(coursePrice)}, courseCode: "${courseCode}", courseName: "${courseName}"}}) {
              document {
                courseCode
                courseName
                price
              }
            }
          }
        `);
      console.log(update)
    }
  }

  useEffect(() => {
    handleLogin()
  }, [])


  async function handleSubmit() {
    console.log(courseName, courseCode, coursePrice)
    await uploadFile();
  };

  const uploadFile = async () => {
    const uploadResponse = await lighthouse.upload(fileURL, "be64189e.15aac07bb7804b7bbbc339420a77e878");
    setImageCID(uploadResponse.data.Hash);
    const metaData = `{"title":${courseName},"type":"object","properties":{"name":{"type": "string","description": "Meta data for ${courseName}"},"courseID":{"type": "string","description": ${courseCode}},"image":{"type": "string","description": "https://ipfs.io/ipfs/${uploadResponse.data.Hash}"}}}`
    const outputMetaData = await lighthouse.uploadBuffer(metaData, "be64189e.15aac07bb7804b7bbbc339420a77e878");
    settokenURI(outputMetaData.data.Hash);
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    setFileURL(acceptedFiles);
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div>
      <Navbar />
      <div className="banner" >
        <img className="GodHelpPLS" src="./images/Design.png" />
        <div className="createCourse">
          <div className="helper">

            <div className="course-title-wrapper flex">
              <div className="text-xl m-3 ml-10">
                Course Title
              </div>
              <input type="text" className="courseName m-3 text-black" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            </div>

            <div className="course-codewrapper flex">
              <div className="text-xl m-3 ml-9">
                Course Code
              </div>
              <input type="text" className="courseCode m-3" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </div>

            <div className="course-codewrapper flex">
              <div className="text-xl m-3">
                Set Market Price
              </div>
              <input type="text" className="courseCode m-3" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} />
            </div>

            <div className="image-upload-wrapper flex">

            </div>

            <div {...getRootProps({})} className='p-16 mt-10 ml-40 mr-40 w-1/2 border border-neutral-200 dropbox'>

              <input {...getInputProps()} />
              {fileURL ? (fileURL[0]).name : isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
            </div>

            <div className="button-wrapper flex">
              <button onClick={handleSubmit} className="button-fix text-xl">Create Course</button>
            </div>
            {ImageCID}
          </div>
        </div>

      </div>
    </div>
  )
};

export default createCourse;
