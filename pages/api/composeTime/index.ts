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
    if(req.method=='POST'){
        const authenticate = async () => {
            const seed = readFileSync("./admin_seed.txt");
            const key = fromString(seed.toString(), "base16");
            const did = new DID({
                resolver: getResolver(),
                provider: new Ed25519Provider(key),
            });
            await did.authenticate();
            ceramic.did = did;
            composeClient.setDID(did);
            console.log(req)
            const profile = await composeClient.executeQuery(`
                mutation MyMutation {
                    updateTimeStamps(
                    input: {id: "${req.body.StreamID}", content: {CourseDetailsID: "${req.body.courseDetailsID}", timestamp: `+req.body.helpstr+` timestampFor: "${req.body.str}"}, options: {replace: true}}
                    ) {
                        document {
                            id
                        }
                    }
                }
            `);
            console.log(profile)
            
        };

        const  hello = async () => {
            await authenticate();
        }
        hello();
    }
}
