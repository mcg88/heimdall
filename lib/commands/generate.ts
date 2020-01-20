import { DynamoDB } from "aws-sdk";
import { ParsedMail } from "mailparser";
import generate from "nanoid/generate";
import { domain, email } from "../env";
import { Commands } from "../reserved";
import sendResponse from "./sendResponse";

export default async (parsedMail: ParsedMail): Promise<void> => {
  const source = parsedMail.subject;
  const generatedAlias = generate("0123456789abcdefghijklmnopqrstuvwxyz", 13);
  console.log(`Generated alias=${generatedAlias} for source=${source}`);

  console.log("Attempting to store alias-source record");
  const docClient = new DynamoDB.DocumentClient();
  const docParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: "aliases",
    Item: {
      alias: generatedAlias,
      source
    }
  };

  await docClient.put(docParams).promise();
  console.log("Successfully stored alias-source record");

  await sendResponse(
    `${Commands.Generate}@${domain}`,
    email,
    `Generated alias: ${generatedAlias}`,
    `You have generated ${generatedAlias}@${domain} for "${source}".`
  );
};