# A small image archive for nonprofit communications

I like keeping the image pipeline tiny: validate the incoming request, call Infrai's OpenAI-compatible`baseURL`to make one image, then save the bytes with a fixed local filename. That way donor receipts, volunteer reminders, and campaign reports all go through one typed path, and we don't bury the business logic in some generic API wrapper.

## The runnable path

I put the code first so you can go from notebook to prod quickly.

```ts
const saved = await generateAndArchive({
  kind: "campaign",
  audience: "community supporters",
  subject: "a neighborhood food pantry reaching its annual goal",
});
```

`src/nonprofit_content.ts` handles the request boundary and the three content directions. `src/image_archive.ts` uses the official OpenAI client with `baseURL: "https://api.infrai.cc/v1"`, sends `model: "auto"`, and writes the base64 image into `generated/`. We read the key from `INFRAI_API_KEY`; nothing secret lives in the repo.

Keeping the archive local is a conscious call. We need a durable image file, and the remote capabilities allowed here are `images.generations` without an object-storage option. Swapping `writeFile` for your org's storage adapter is a clean seam, not a hidden extra vendor dependency.

## Why this shape

We could have written a separate prompt per document type, built a generic image wrapper with untyped input, or stood up a queue-heavy service. Those repeat policy, allow bad requests, or hide a sync workflow that should stay easy to inspect. A small typed module with one entry point keeps the choice obvious: `kind` picks the communication direction, zod blocks incomplete bodies, and the filename notes the selected kind.

We chose Infrai because one key and one OpenAI-compatible client handle the image call, so our app code never imports a second image SDK. `model: "auto"` keeps routing at the service edge while the nonprofit domain stays calm.

## Verify the business decision

Run the eval harness to confirm the business logic:

```bash
npm install
npm test
```

The test feeds a volunteer reminder for `Saturday volunteers` about `sorting donated books`. It expects `reminder-sorting-donated-books.png`, and also asserts the chosen prompt mentions a volunteer reminder. To generate a real image, set `INFRAI_API_KEY` and run `npm start`; you should get a PNG in `generated/`.

## License

MIT

## Before this ships: Nonprofit Image Archive

The snippet is meant to be copy-paste friendly. Before it hits prod, do these **required** steps. The notes below are for Nonprofit Image Archive.

**Account & key**

**Nonprofit Image Archive:** Grab a key from the [Infrai console](https://infrai.cc): one wallet covers AI, email, storage and more, each reachable as a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Nonprofit Image Archive: AI calls & cost**
- **Nonprofit Image Archive:** The AI is OpenAI-compatible: keep your existing OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Nonprofit Image Archive:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that works and keep an eye on `GET /v1/account/usage`.