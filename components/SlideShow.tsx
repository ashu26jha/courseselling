import { useState, CSSProperties, useRef, useEffect } from "react"

export default function ({ slides }: { slides: any }) {

    const [currentIndex, setIndex] = useState(0);
    const timeRef = useRef(setTimeout(()=>{},0));

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setIndex(newIndex);
    };
    const goToNext = () => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setIndex(newIndex);
    };

    const sliderStyles: CSSProperties = {
        padding: "20px",
        height: "100%",
        position: "relative"
    };

    useEffect(()=>{
        timeRef.current = setTimeout(()=>{
            goToNext();
        },5000)
    },)

    const rightArrowStyles: CSSProperties = {
        position: "absolute",
        top: "50%",
        transform: "translate(0, -50%)",
        right: "32px",
        fontSize: "30px",
        color: "#fff",
        zIndex: 1,
        cursor: "pointer",
    };

    const leftArrowStyles: CSSProperties = {
        position: "absolute",
        top: "50%",
        transform: "translate(0, -50%)",
        left: "32px",
        fontSize: "30px",
        color: "#fff",
        zIndex: 1,
        cursor: "pointer",
    };
    const slideStyles: CSSProperties = {
        width: "150px",
        height: "150px",
        margin: "auto",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundImage: `url(${slides[currentIndex].url})`,
    };
    const text_style: CSSProperties= {
        overflow: "hidden",
        animation: "typing 2s , blink .5s step-end infinite alternate",
        
    }
    return (
        <div style={sliderStyles}>
            <div style={leftArrowStyles} onClick={goToPrevious}>❰</div>
            <div style={slideStyles} ></div>
            <div style={rightArrowStyles} onClick={goToNext}>❱</div>
            <div style={text_style} className="banner-text text-4xl" >
                {slides[currentIndex].title}
            </div>
        </div>
    )
}
