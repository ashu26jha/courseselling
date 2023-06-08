import {useState} from "react";
import Navbar from "../components/Navbar"
import SlideShow from "../components/SlideShow";

const home = () => {
  const slides = [
    {"url": "./images/Buy_Course.png", "title": "Buy Courses", "length":11},
    {"url": "./images/Create_Course.png", "title": "Create & Sell courses","length":22},
    {"url": "./images/Verifiable_Credentials.png", "title": "Get Verfiable credentials on course completion", "length":50}
  ];

  const containerStyles = {
    width: "700px",
    height: "280px",
    margin: "0 auto",
    padding: "50px"
  };

  return (
    <div>
      <Navbar/>
      <div className="banner">
        <div style={containerStyles}>
          <SlideShow slides={slides}/>
        </div>
      </div>
    </div>
  )
};

export default home;
