const CourseDetail = 
`
query CourseDetailsFetch {
    courseDetailsIndex(first: 100) {
        edges {
            node {
                courseCode
                courseName
                videoLecture
                courseCreator {
                    id
                }
                lectureName
                id
            }
        }
    }
}
`
export default CourseDetail
