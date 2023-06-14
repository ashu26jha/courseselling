import { useState } from "react";
import { readFileSync } from "fs";

function CommentsPage(){

    const [comments, setComment]=useState('')


    const fetchComments = async () =>{
        const response = await fetch ('/api/comments');
        const data = await response.json()
        setComment(data)
        console.log(data)
    }

    const submitComment = async () =>{
        const response = await fetch ('api/comments',{
            method: 'POST',
            body: JSON.stringify({comments}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log(data)

    }
    
    return(
        <>
            <input type="text" onChange={(e)=>setComment(e.target.value)} />

            <button onClick={submitComment}> 
                Comment
            </button>
            <button onClick={fetchComments}>
                Get Comment
            </button>
        </>
    )
}
export default CommentsPage;
