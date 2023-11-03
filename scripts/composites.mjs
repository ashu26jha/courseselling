import { readFileSync } from "fs";
import { CeramicClient } from "@ceramicnetwork/http-client";
import {
  createComposite,
  mergeEncodedComposites,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime,
} from "@composedb/devtools-node";

import { Composite } from "@composedb/devtools";


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

  // Reviews Composite 
  const ReviewsSchema = readFileSync(
    "./composites/Reviews.graphql",
    {
      encoding: "utf-8",
    }
  ).replace("$COURSE_DETAILS_ID", CourseDetailsComposite.modelIDs[0]);

  const ReviewsComposite = await Composite.create({
    ceramic,
    schema: ReviewsSchema,
  });

  const CourseDetailxReviewsSchema = readFileSync(
    "./composites/CourseXReviews.graphql",
    {
      encoding: "utf-8",
    }
  ).replace('$REVIEW_ID', ReviewsComposite.modelIDs[1]).replace('$COURSE_DETAILS_ID', CourseDetailsComposite.modelIDs[0]);


  const CourseDetailxReviewsComposite = await Composite.create({
    ceramic,
    schema: CourseDetailxReviewsSchema
  });

  const LiveStreamSchema = readFileSync(
    "./composites/LiveStream.graphql",
    {
      encoding: "utf-8",
    }
  ).replace("$COURSE_DETAILS_ID", CourseDetailsComposite.modelIDs[0]);

  const LiveStreamComposite = await Composite.create({
    ceramic,
    schema: LiveStreamSchema
  });

  const BasicProfileComposite = await createComposite(
    ceramic,
    "./composites/BasicProfile.graphql"
  );

  const DaoDataComposite = await createComposite(
    ceramic,
    "./composites/DaoData.graphql"
  );

  const TimeStampSchema = readFileSync(
    "./composites/TimeStamps.graphql",
    {
      encoding: "utf-8",
    }
  ).replace("$COURSE_DETAILS_ID", CourseDetailsComposite.modelIDs[0]);

  const TimeStampComposite = await Composite.create({
    ceramic,
    schema: TimeStampSchema
  });

  const composite = Composite.from([
    CourseDetailsComposite,
    ReviewsComposite,
    CourseDetailxReviewsComposite,
    LiveStreamComposite,
    BasicProfileComposite,
    DaoDataComposite,
    TimeStampComposite
  ])

  //Writing composites to local file
  await writeEncodedComposite(composite, "./src/__generated__/definition.json");
  spinner.info("creating composite for runtime usage");
  await writeEncodedCompositeRuntime(
    ceramic,
    "./src/__generated__/definition.json",
    "./src/__generated__/definition.js"
  );
  spinner.info("deploying composite");
  const deployComposite = await readEncodedComposite(
    ceramic,
    "./src/__generated__/definition.json"
  );
  const id = deployComposite.modelIDs;
  spinner.info(`Deployed the following models: ${id}`);

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
