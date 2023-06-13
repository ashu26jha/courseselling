import { useRouter } from "next/router"
export default function () {
    const router = useRouter();
    const CourseID = router.query.courseid;
    console.log("Products Roots",CourseID)
    return (
        <div>
        </div>
    )
}
