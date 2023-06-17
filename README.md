const response = await composeClient.executeQuery(query);
                var temp: any = response.data!.courseDetailsIndex;
                var tempArr = temp.edges;
                for (var i = 0; i < tempArr.length; i++) {
                    if (tempArr[i].node.courseCode == courseCode) {
                        const reuse = tempArr[i].node;
                        const streamid = reuse.id;
                        const courseName = reuse.courseName;
                        const LectureNames = reuse.lectureName;
                        const LectureCID = reuse.videoLecture;
                        if (LectureCID == undefined) {
                            const update = await composeClient.executeQuery(`
                                mutation MyMutation {
                                    updateCourseDetails(
                                    input: {content: {courseName: "${courseName}", courseCode: "${courseCode}",  videoLecture: "${[CID]}", lectureName: "${lectureTitle}" }, options: {replace: true}, id: "${streamID}"}
                                    ) {
                                        document {
                                            id
                                            price
                                            courseName
                                            courseCode
                                            videoLecture
                                            lectureName
                                            }
                                        }
                                    }
                                `);
                            console.log(update);
                            break;
                        }
                    }
                }
