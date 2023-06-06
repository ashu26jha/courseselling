import React from "react";
import { useState, useEffect } from 'react';
import { NFTStorage } from 'nft.storage';
const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNBNEIxRjVhOEY4NzU5ZTM3REM3RThlRmYxZmMwMUVjMEM1MDJmRUIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NjAyNjQ1NzU0MCwibmFtZSI6IkNvdXJzZSBTZWxsaW5nIn0.M0X45502gmB24zP24K6jxJz6R8u3gaHc8rL-piS_-ss'
const client = new NFTStorage({ token: NFT_STORAGE_KEY });
const createCourse = () => {

    const [courseName, setCourseName] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [ImageCID, setImageCID] = useState("");
    const [tokenURI, settokenURI] = useState("");
    const [input, setInput] = useState < string | ArrayBuffer | null >(null);

    async function handleSubmit() {
      console.log(courseName, courseCode)
      await uploadFile();
    };

    const uploadFile = async ()=>{
      const blobhelp = new Blob([input as BlobPart])
      const nft = {
        image: blobhelp, 
        name: `${courseName}`,
        description: `Metadata for course name: ${courseName} and course code: ${courseCode}`,
        properties: {
          type: "course-purchase",
        }
      }
      const metadata = await client.store(nft);
      var imgCID: string = metadata.data.image.href;
      var tokenCID: string = metadata.url;
      setImageCID(imgCID);
      settokenURI(tokenCID);
    }

    return (
      <div>
          <div className="createCourse">
              Course Title
              <input type="text" className="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
              <input type="text" className="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
              <button onClick={handleSubmit}>Create Course</button>
          </div>
          Select an image to part of your course
          <input onChange={(input) => {
            if (!input.target.files) {
              return;
            }
            let file = input!.target!.files[0]!;
            let reader = new FileReader();
            reader.readAsText(file);
            setInput(reader.result);
          }} type="file" />
      </div>
    )
};

export default createCourse;
