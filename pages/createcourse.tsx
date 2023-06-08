import React, { useCallback, useState, CSSProperties } from 'react'
import { useDropzone } from 'react-dropzone'
import lighthouse from '@lighthouse-web3/sdk'
import Navbar from "../components/Navbar"

const createCourse = () => {

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [ImageCID, setImageCID] = useState("");
  const [tokenURI, settokenURI] = useState();
  const [fileURL, setFileURL] = useState("");
  console.log("LMAO")
  async function handleSubmit() {
    console.log(courseName, courseCode)
    await uploadFile();

    // RUN CONTRACT FUNCTIONS
  };

  const uploadFile = async () => {
    const uploadResponse = await lighthouse.upload(fileURL, "be64189e.15aac07bb7804b7bbbc339420a77e878");
    setImageCID(uploadResponse.data.Hash);
    console.log(typeof(uploadResponse.data.Hash) )
    const metaData = `{"title":${courseName},"type":"object","properties":{"name":{"type": "string","description": "Meta data for ${courseName}"},"courseID":{"type": "string","description": ${courseCode}},"image":{"type": "string","description": "https://ipfs.io/ipfs/${uploadResponse.data.Hash}"}}}`
    // const json = JSON.stringify(metaData);
    const outputMetaData = await lighthouse.uploadBuffer(metaData, "be64189e.15aac07bb7804b7bbbc339420a77e878");
    console.log(outputMetaData.data.Hash);

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
              <div className="text-xl m-3">
                Course Title
              </div>
              <input type="text" className="courseName m-3 text-black" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            </div>

            <div className="course-codewrapper flex">
              <div className="text-xl m-3">
                Course Code
              </div>
              <input type="text" className="courseCode m-3" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </div>

            <div className="image-upload-wrapper flex">

            </div>

            <div {...getRootProps({})} className='p-16 mt-10 ml-40 mr-40 w-1/2 border border-neutral-200 dropbox'>
              <input {...getInputProps()} />
              {fileURL? (fileURL[0]).name : isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
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
