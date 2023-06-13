import { useRouter } from "next/router"
export default function () {
    const router = useRouter();
    const {courseid,lectureid} = router.query;
    console.log("Hello from Products",courseid, lectureid)
    return (
        <div>
        </div>
    )
}
