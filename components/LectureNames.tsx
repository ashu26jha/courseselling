import Link from 'next/link'
interface NameProps {
    name: string
    index: number
    courseID: string | string[] | undefined 
}
export default function (props: NameProps){


    return (
        <Link href={`./${props.courseID}/lecture/${props.index}`}>
            <div className='flex lectures w-52 m-2 cursor-pointer'>
                <div className='m-2'>{props.index+1}.</div>
                <div className='m-2'>{props.name}</div>
            </div>
        </Link>
    )
}
