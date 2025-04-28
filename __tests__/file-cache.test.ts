import { describe, expect, it } from "vitest";
import { FileCache } from "../src";
import { Duration } from "@chriscdn/duration";
import { promises as fs } from "fs";
import temp from "temp";
import { pathExists } from "path-exists";

const pause = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testPDFFile = "./__tests__/pdfs/lorem.pdf";

describe("Cache Expiration", async () => {
  const cache = new FileCache({
    cachePath: await temp.mkdir("file-cache-test"),
    cb: async (filePath, { a }: { a: number }) => {
      await fs.copyFile(
        testPDFFile,
        filePath,
      );
    },
    ext: "pdf",
    ttl: Duration.toMilliseconds({ seconds: 1 }),
    cleanupInterval: Duration.toMilliseconds({ seconds: 2 }),
  });

  it("sync", async () => {
    //
    const filePath3 = await cache.getFile({ a: 3 });

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
