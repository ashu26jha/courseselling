### Getting the course details
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
      }
    }
  }
}

### Creating/Adding courses
mutation MyMutation {
  createCourseDetails(input: {content: {courseCode: "BCS", courseName: "Blockhain Basics"}}) {
    document {
      courseCode
      courseName
    }
  }
}


## STREAM ID
kjzl6kcym7w8y6ltjx9n3xwc6ntmu5xrhghq1pduf5h6abjwlke11ooqffpepnc    


mutation MyMutation {
  updateCourseDetails(
    input: {content: {courseName: "Blockchain Max", courseCode: "BCS"}, options: {replace: true}, id: "kjzl6kcym7w8y6ltjx9n3xwc6ntmu5xrhghq1pduf5h6abjwlke11ooqffpepnc"}
  ) {
    document {
      id
      courseName
      courseCode
    }
  }
}
graphql-tools
