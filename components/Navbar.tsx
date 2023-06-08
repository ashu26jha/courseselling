import {useEffect, useState, useRef} from "react";

export default function () {

    const [imgURL, setimgURL] = useState("./images/White_Logo.png");
    const [color, setColor] = useState(true);

    const changeColor=()=>{
        if(window.scrollY >= 90){
            setColor(false);
            setimgURL("./images/Black_Logo.png")
        }
        else{
            setColor(true);
            setimgURL("./images/White_Logo.png")
        }
    }

    useEffect(()=>{
        window.addEventListener("scroll", changeColor)
    },[])

    
    return (

        <div className={color ?  "bg-black-11 m-auto  w-full h-20  flex sticky top-0" : "bg-white w-full h-20  flex sticky top-0"}>
            <a href="./"><img src={imgURL} className="h-16 pt-3 pl-2 transition-all" /></a>
            <a href="./buycourses"><div className={color ? "text-slate-100 mt-5 ml-5 mr-5 text-2xl hover:text-violet-400 transition-all" : "text-slate-800 mt-5 ml-5 mr-5 text-2xl hover:text-violet-600 transition-all"}>Buy Course</div> </a>
            <a href="./createcourse"><div className={color ? "text-slate-100 mt-5 ml-5 mr-5 text-2xl hover:text-violet-400 transition-all" : "text-slate-800 mt-5 ml-5 mr-5 text-2xl hover:text-violet-600 transition-all"}>Create Course</div></a>
            <a href="./about"><div className={color ? "text-slate-100 mt-5 ml-5 mr-5 text-2xl hover:text-violet-400 transition-all" : "text-slate-800 mt-5 ml-5 mr-5 text-2xl hover:text-violet-600 transition-all"}>About</div></a>
        </div>

    )
}
