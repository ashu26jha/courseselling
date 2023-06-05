import React from "react";
import { useState, useEffect } from 'react';
import * as LitJsSdk from "@lit-protocol/lit-node-client";
const client = new LitJsSdk.LitNodeClient({debug: false});


  


const createCourse = () => {

    const [courseName, setCourseName] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [encryption, setEncryption] = useState("");
    const [symetric, setSymetry] = useState("");


    async function handleSubmit() {
        console.log(courseName, courseCode)
    }
    
    const accessControlConditions = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: "ethereum",
          method: 'eth_getBalance',
          parameters: [
            ':userAddress',
            'latest'
          ],
          returnValueTest: {
            comparator: '>=',
            value: '10000000000000'
          }
        }
    ]
    async function encrypt(){
        await client.connect()
        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: "ethereum" });
        // const { encryptedString, symmetricKey } = await LitJsSdk.encryptFile('')
        // LitJsSdk.decryptFile
    }
    


    


    return (
      <div>
          <div className="createCourse">
              Course Title
              <input type="text" className="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
              <input type="text" className="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
              <button onClick={handleSubmit}>Create Course</button>
          </div>
          <button>Encrypt</button>
          <button>Decrypt</button>
      </div>
    )
};

export default createCourse;
