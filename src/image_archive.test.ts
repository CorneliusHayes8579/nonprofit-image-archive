import assert from "node:assert/strict";
import { archiveName, imagePrompt, imageRequest } from "./nonprofit_content.ts";

const reminder = imageRequest.parse({
  kind: "reminder",
  audience: "Saturday volunteers",
  subject: "sorting donated books",
});

assert.equal(archiveName(reminder), "reminder-sorting-donated-books.png");
assert.match(imagePrompt(reminder), /volunteer reminder/);
assert.throws(() => imageRequest.parse({ kind: "receipt", audience: "", subject: "gift" }));
console.log("nonprofit decision test passed");
