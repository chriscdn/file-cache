import { describe, expect, it } from "vitest";
import { FileCache } from "../lib";
import { Duration } from "@chriscdn/duration";
import { promises as fs } from "fs";
import temp from "temp";
import { pathExists } from "path-exists";

const pause = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const testPDFFile = "./__tests__/pdfs/lorem.pdf";

describe("Cache Expiration", async () => {
  const cache = new FileCache<{ a: number }>({
    cachePath: await temp.mkdir("file-cache-test"),
    cb: async (filePath, { a }) => {
      await fs.copyFile(
        testPDFFile,
        filePath,
      );
    },
    ext: () => ".pdf",
    ttl: Duration.toMilliseconds({ seconds: 1 }),
    cleanupInterval: Duration.toMilliseconds({ seconds: 2 }),
  });

  it("sync", async () => {
    //
    const filePath3 = await cache.getFile({ a: 1 });

    // test if filePath exists
    expect(await pathExists(filePath3)).toBe(true);

    // wait a second
    await pause(Duration.toMilliseconds({ seconds: 1 }));

    // should still exist
    expect(await pathExists(filePath3)).toBe(true);

    // wait 2 seconds
    await pause(Duration.toMilliseconds({ seconds: 2 }));

    // should not longer exist due to cleanup
    expect(await pathExists(filePath3)).toBe(false);
  });
});
