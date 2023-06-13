const CourseDetail = 
`
    query CourseDetailsFetch {
        courseDetailsIndex(first: 10) {
            edges {
                node {
                    courseCode
                    courseName
                    version
                    videoLecture
                    courseCreator {
                        id
                    }
                    id
                    lectureName
                }
            }
        }
    }
`
export default CourseDetail
