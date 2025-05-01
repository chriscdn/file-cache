# @chriscdn/file-cache

`FileCache` is a node utility for caching generated and remote files. Common use cases include:

- **Caching files stored in Amazon S3**: Keep a local cache of frequently accessed files to avoid repeatedly fetching them.
- **Thumbnail caching**: Store generated thumbnails locally for quick access instead of regenerating them every time.

`FileCache` does not store state in memory, meaning your cache remains unaffected by application restarts. Cached files are automatically expired using a time-to-live (TTL) policy and the file's modified date. The file's modified date is updated each time the file is accessed.

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

- **Create a callback** — Write an async function that takes a file path and your custom input (like a URL), then generates or downloads the file and saves it to the path.
- **Set up the cache** — Initialize a `FileCache` with your callback and some options (like where to store files and how long to keep them).
- **Get a file** — Call the cache with your input. It will:
  - Hash the input to create a unique file name.
  - If the file is already cached and still valid, return its path.
  - If not, run your callback to create it, then cache and return the path.

Here's an example of an image cache:

```ts
import { FileCache, type FileCacheOptions } from "@chriscdn/file-cache";

// not required, but helps with duration calculations
import { Duration } from "@chriscdn/duration";

const downloadAndConvertToJPG = async (url: string, filePath: string) => {
  // ...
};

type MyCallbackArgs = {
  url: string;
};

const options: FileCacheOptions<MyCallbackArgs> = {
  // The path to the cache directory. The directory must exist. Do not store
  // anything else in this directory.
  cachePath: "/some/path/on/your/filesystem/",

  // optional, automatically create cachePath if it doesn't exist
  autoCreateCachePath: false,

  // An asynchronous callback function, which is executed if no matching cached
  // file is found. It is the responsibility of this function to use `context`
  // to write a file to `filePath`.
  cb: async (filePath: string, context: MyCallbackArgs) => {
    const { url } = context;
    await downloadAndConvertToJPG(url, filePath);
  },

  // Specifies the file extension for the cached file. Can be synchronous or asynchronous.
  ext: (context: MyCallbackArgs) => ".jpg",

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
This does not cleanup the cache directory.

## Tests

Run the tests using:

```bash
yarn test
```

## License

[MIT](LICENSE)
