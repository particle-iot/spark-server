import fs from 'fs';
import path from 'path';

class FileManager {
  _path: string;

  constructor(path) {
    this._path = path;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  createFile<TModel>(fileName: string, data: TModel): void {
    if (fs.existsSync(path.join(this._path, fileName))) {
      return;
    }

		this.writeFile(fileName, data);
  }

  deleteFile(fileName: string): void {
    const filePath = path.join(this._path, fileName);
    if (!fs.existsSync(filePath)) {
      return;
    }

    fs.unlink(filePath);
  }

  getAllData<TModel>(): Array<TModel> {
    return fs.readdirSync(this._path).map(
      fileName => JSON.parse(fs.readFileSync(path.join(this._path, fileName))),
    );
  }

  getFile<TModel>(fileName): TModel {
    const filePath = path.join(this._path, fileName);
    return JSON.parse(fs.readFileSync(filePath));
  }

  writeFile<TModel>(fileName: string, data: TModel): void {
		fs.writeFileSync(
      path.join(this._path, fileName),
      JSON.stringify(data, null, 2),
    );
  }
}

export default FileManager;
