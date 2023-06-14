import { readFileSync } from "fs";
import { CeramicClient } from "@ceramicnetwork/http-client";
import {
  createComposite,
  mergeEncodedComposites,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime,
} from "@composedb/devtools-node";

import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

const ceramic = new CeramicClient("http://localhost:7007");

/**
 * @param {Ora} spinner - to provide progress status.
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
export const writeComposite = async (spinner) => {
  await authenticate();
  spinner.info("writing composite to Ceramic");

  // CourseDetail Composite
  const CourseDetailsComposite = await createComposite(
    ceramic,
    "./composites/CourseDetails.graphql"
  );
  await writeEncodedComposite(CourseDetailsComposite,'./src/__generated__/CourseDetails.json');

  // Reviews Composite 
  const ReviewsComposite = await createComposite(
    ceramic,
    "./composites/Reviews.graphql"
  );
  await writeEncodedComposite(ReviewsComposite, './src/__generated__/Reviews.json');

  // CourseXReviews Composite
  const CourseXReviewsComposite = await createComposite(
    ceramic,
    "./composites/CourseXReviews.graphql"
  );
  await writeEncodedComposite(CourseXReviewsComposite, './src/__generated__/CourseXReviews.json');

  //TimeStamps Composite
  const TimeStampsComposite = await createComposite(
    ceramic,
    "./composites/TimeStamps.graphql"
  );
  await writeEncodedComposite(TimeStampsComposite, './src/__generated__/TimeStamps.json')

  await mergeEncodedComposites(ceramic,'./src/__generated__/CourseDetails.json','./src/__generated__/definition.json');
  await mergeEncodedComposites(ceramic,'./src/__generated__/Reviews.json','./src/__generated__/definition.json');
  await mergeEncodedComposites(ceramic,'./src/__generated__/CourseXReviews.json','./src/__generated__/definition.json');
  await mergeEncodedComposites(ceramic,'./src/__generated__/TimeStamps.json','./src/__generated__/definition.json');


  await writeEncodedCompositeRuntime(
    ceramic,
    './src/__generated__/definition.json',
    './src/__generated__/definition.js'
  )
  
  const deployComposite = await readEncodedComposite(
    ceramic,
    "./src/__generated__/definition.json"
  );

  await deployComposite.startIndexingOn(ceramic);
  spinner.succeed("composite deployed & ready for use");
};

/**
 * Authenticating DID for publishing composite
 * @return {Promise<void>} - return void when DID is authenticated.
 */
const authenticate = async () => {
  const seed = readFileSync("./admin_seed.txt");
  const key = fromString(seed, "base16");
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key),
  });
  await did.authenticate();
  console.log(did);
  ceramic.did = did;
};
