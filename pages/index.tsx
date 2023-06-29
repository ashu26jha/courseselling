import {useState} from "react";
import Navbar from "../components/Navbar"
import SlideShow from "../components/SlideShow";

const home = () => {

  const containerStyles = {
    width: "700px",
    height: "280px",
    margin: "0 auto",
    padding: "50px"
  };

  return (
    <div>
      <Navbar/>
      <div className="MAINPAGE">
        <b className="learn">LEARN </b>
        <b className="teach">TEACH</b><br/>
        <b className="earn">EARN </b><br/>
   
          {/* <div style={containerStyles}>
            <SlideShow slides={slides}/>
          </div> */}
          <div className="w-4/5 h-1/5 m-auto main"><b className="built">Scroll to see, how its built</b></div>
        
      </div>
    </div>
    
  )
};

export default home;
