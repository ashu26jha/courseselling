import Link from 'next/link'
interface CardProps {
    courseName: string;
    courseID: string;
    imgURL: string
    price: string
}

function Cards(props: CardProps) {
    console.log(props.courseName);
    return (
        <>
            <Link href={`./products/${props.courseID}`}>
                <div className="bg-slate-100 w-52 h-72 m-auto rounded-xl  Cards">
                    <img className="w-full h-1/2 rounded-xl drop-shadow-2xl"  src={props.imgURL}/> 
                    <div className="pl-6 mt-4 card-text text-xl">{props.courseName}</div>
                    <div className="pl-6 mt-4 card-text text-xl">{props.courseID}</div>
                    <div className="pl-6 mt-4 card-text">Price {props.price} ETH</div>
                </div>
            </Link>
        </>
    )
}
export default Cards
