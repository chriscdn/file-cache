# @chriscdn/file-cache

`FileCache` is a simple utility for caching generated and remote files.

Common use cases include:

- **Caching photos stored in Amazon S3**: Keep a local cache of frequently accessed images to avoid repeatedly fetching them.
- **Thumbnail caching**: Store generated thumbnails locally for quick access instead of regenerating them every time.
- **Data processing results**: Cache intermediate or final outputs of time-consuming data processing tasks to speed up subsequent runs.

`FileCache` does not store any state in memory, meaning your cache remains unaffected by application restarts. Cached files are automatically expired using a time-to-live (TTL) policy and the file's modified date. The file's modified date is updated each time the file is accessed.

## Installing

Using npm:

```bash
npm install @chriscdn/file-cache
```

Using yarn:

```bash
yarn add @chriscdn/file-cache
```

## Usage

The general approach is this:

- Define an asynchronous callback function that accepts a file path and custom parameters, generates or retrieves the file, and writes it to the provided path.
- Initialize a `FileCache` instance with this callback and additional options to control cache behavior.
- Use the `FileCache` instance to retrieve the file path. It will hash the provided parameters to determine the corresponding file name, and either return an existing cached file or invoke the callback to generate a new one if necessary.

Here's an example of an image cache:

```ts
import { FileCache, type FileCacheOptions } from "@chriscdn/file-cache";

// not required, but helps with calculating duration
import { Duration } from "@chriscdn/duration";

const downloadAndConvertToJPGFunction = (url: string, filePath: string) => {
  // ...
};

type MyCallbackArgs = {
  url: string;
};

const options: FileCacheOptions<MyCallbackArgs> = {
  // The path to the cache directory. The directory must exist. Do not store
  // anything else in this directory.
  cachePath: "/some/path/on/your/filesystem/",

  // An asynchronous callback function, which is executed if no matching cached
  // file is found. It is the responsibility of this function to use `context`
  // to write a file to `filePath`.
  cb: async (filePath: string, context: MyCallbackArgs) => {
    const { url } = context;
    await downloadAndConvertToJPGFunction(url, filePath);
  },

  // Specifies the file extension for each cached file.
  // Currently, all files share the same extension (this may change in the future).
  ext: "jpg",

  // Determines the time-to-live (TTL) of a cached file, in milliseconds,
  // based on when it was last accessed.
  ttl: Duration.toMilliseconds({ days: 7 }),

  // How often the cleanup task should run to purge expired cached files, in milliseconds.
  cleanupInterval: Duration.toMilliseconds({ hours: 4 }),
};

// create an instance
const imageCache = new FileCache(options);

const imageFilePath = await imageCache({
  url: "https://example.com/some/file/path.jpg",
});
```

## Cleanup

`FileCache` instances are intended to be instantiated as singletons, persisting throughout the lifecycle of your app. If you need to deallocate an instance, be sure to call the `destroy()` method to prevent a memory leak.

## Tests

Run the tests using:

```bash
yarn test
```

## License

[MIT](LICENSE)
