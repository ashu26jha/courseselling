import { comments } from '../../../data/comments';
import { readFileSync } from "fs";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";
import { definition } from "../../../src/__generated__/definition.js";
import { RuntimeCompositeDefinition } from "@composedb/types";

const ceramic = new CeramicClient("http://localhost:7007");
const composeClient = new ComposeClient({
    ceramic: "http://localhost:7007",
    definition: definition as RuntimeCompositeDefinition,
});

export default function handler(req:any, res:any) {
    const authenticate = async () => {
        const seed = readFileSync("./admin_seed.txt");
        const key = fromString(seed, "base16");
        const did = new DID({
            resolver: getResolver(),
            provider: new Ed25519Provider(key),
        });
        await did.authenticate();
        ceramic.did = did;
        composeClient.setDID(did);
        const profile = await composeClient.executeQuery(`
            mutation MyMutation {
                createCourseDetails(
                input: {content: {courseCode: "BCA", courseName: "Blockchain Advanced"}}
                ) {
                    document {
                        courseCode
                        courseName
                    }
                }
            }
            `
        );
        console.log(profile)
    };

    if (req.method === 'GET') {
        async function hello (){
            await authenticate();
        }
        hello();
        res.status(200).json(comments)
    }

    else if (req.method === 'POST') {
        const comment = req.body.comments
        const newComment = {
            id: Date.now(),
            text: comment
        }
        comments.push(newComment)
        res.status(201).json(newComment)
    }

}
