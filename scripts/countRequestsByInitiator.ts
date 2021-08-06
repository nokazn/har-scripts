import * as fs from 'fs';
import { z } from 'zod';

const SCHEMA = z.array(
  z.object({
    full_url: z.string(),
    host: z.string(),
    initiator: z.object({
      url: z.string(),
      type: z.string(),
    }),
    objectSize: z.number(),
    thirdparty: z.object({
      name: z.string(),
      company: z.optional(z.string()),
      category: z.string(),
    }),
  }),
);

type RequestSchema = ReturnType<typeof SCHEMA.parse>;
type RequestMap = Record<string, RequestSchema>;g a

/**
 * RequestMap から export した JSON ファイルから、initiator ごとに集計する
 */
const extractHostFromUrl = (url: string) => {
  const parsedUrl = new URL(url);
  return parsedUrl.host;
};

const main = () => {
  const jsonFilePath = process.argv[2];
  if (typeof jsonFilePath !== 'string') {
    throw new Error('.har ファイルのパスを指定してください。');
  }

  const file = fs.readFileSync(jsonFilePath).toString();
  const json = JSON.parse(file);
  const result = SCHEMA.parse(json).map((req) => {
    return {
      ...req,
      initiator: {
        ...req.initiator,
        host: extractHostFromUrl(req.initiator.url),
      },
    };
  });
  const initiatorMap = result.reduce<RequestMap>((previous, req) => {
    const { host } = req.initiator;
    const previousRequestList = previous[host] ?? [];
    const requestList = [...previousRequestList, req];
    return {
      ...previous,
      [host]: requestList,
    };
  }, {});
  console.log(initiatorMap);

  const initiatorCountMap = Object.keys(initiatorMap)
    .map((key) => ({
      url: key,
      count: initiatorMap[key].length,
    }))
    // 降順
    .sort((a, b) => b.count - a.count)
    .map((req) => `${req.url}, ${req.count}`)
    .join('\n');
  console.log(initiatorCountMap);
};

main();
