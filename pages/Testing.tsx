
import {useEffect } from "react";

const Testing = () => {

    useEffect(()=>{
        const video = document.getElementById('myVideo')
        video?.addEventListener('timeupdate',function(){
            var hours=parseInt(video.currentTime/(60*60),10);
            var minutes = parseInt(video.currentTime / 60, 10);
            var seconds = video.currentTime % 60;
            if (hours==0) { 
                document.getElementById("timer").innerHTML=minutes+":"+seconds.toFixed(0)
            } else { 
                document.getElementById("timer").innerHTML=hours+":"+minutes+":"+seconds.toFixed(0)
            }
            console.log(video.duration)
        })
    },[])

    return (
        <div>
            
            <div id="timer" className="text-black"> </div>
            <video src='./videos/Unstoppable.mp4' id="myVideo" width="800" height="800" className="ml-10"  controls autoPlay={true}>

            </video>
        </div>
    )
}
export default Testing;
