import * as fs from 'fs';
import { z } from 'zod';

const SCHEMA = z.object({
  log: z.object({
    entries: z.array(
      z.object({
        request: z.object({
          url: z.string(),
        }),
      }),
    ),
  }),
});

const main = () => {
  const harFilePath = process.argv[2];
  if (typeof harFilePath !== 'string') {
    throw new Error('.har ファイルのパスを指定してください。');
  }

  const file = fs.readFileSync(harFilePath).toString();
  const json = JSON.parse(file);
  const res = SCHEMA.parse(json);
  const urls = res.log.entries.map((e) => e.request.url).join('\n');
  process.stdout.write(urls);
};

main();
