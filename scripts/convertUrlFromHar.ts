import * as fs from 'fs';

const main = () => {
  const harFilePath = process.argv[2];
  if (typeof harFilePath !== 'string') {
    throw new Error('.har ファイルのパスを指定してください。');
  }

  const file = fs.readFileSync(harFilePath).toString();
  const urlList = file.split('\n');
  const urlsWithoutParams = urlList
    .map((url) => {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol + '//' + parsedUrl.host + parsedUrl.pathname;
    })
    .join('\n');
  process.stdout.write(urlsWithoutParams);
};

main();
