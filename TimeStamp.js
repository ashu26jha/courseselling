const query = `
query MyQuery {
    timeStampsIndex(first: 10) {
      edges {
        node {
          timestamp
          timestampFor {
            id
          }
          coursedetails {
            courseCode
          }
        }
      }
    }
  }
`
export default query
