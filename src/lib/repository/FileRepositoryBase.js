import fs from 'fs';
import path from 'path';

class FileRepositoryBase {
  _path: string;

  constructor(path) {
    this._path = path;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  __createFile(fileName: string, data: Object): void {
    console.log(fileName);
    const filePath = path.join(this._path, fileName);
    if (fs.existsSync(filePath)) {
      return;
    }

		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  __deleteFile(fileName: string): void {
    const filePath = path.join(this._path, fileName);
    if (!fs.existsSync(filePath)) {
      return;
    }

    fs.unlink(filePath);
  }

  __getAllData<TModel>(): Array<TModel> {
    return fs.readdirSync(this._path).map(
      fileName => JSON.parse(fs.readFileSync(path.join(this._path, fileName))),
    );
  }

  __getFile<TModel>(fileName): TModel {
    const filePath = path.join(this._path, fileName);
    return JSON.parse(fs.readFileSync(filePath));
  }
}

export default FileRepositoryBase;
