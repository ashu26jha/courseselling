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
                image
                id
            }
        }
    }
}
`
export default CourseDetail
