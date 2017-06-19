/**
*    Copyright (C) 2013-2014 Spark Labs, Inc. All rights reserved. -  https://www.spark.io/
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Affero General Public License, version 3,
*    as published by the Free Software Foundation.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Affero General Public License for more details.
*
*    You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*    You can download the source here: https://github.com/spark/spark-server
*
* @flow
*
*/

import chalk from 'chalk';
import settings from '../settings';
import { ILogger } from '../types';

function isObject(obj: any): boolean {
  return obj === Object(obj);
}

function _transform(...params: Array<any>): Array<any> {
  return params.map((param: any): string => {
    if (!isObject(param)) {
      return param;
    }

    return JSON.stringify(param);
  });
}

function getDate(): string {
  return (new Date()).toISOString();
}

export class Logger implements ILogger {

  static log(...params: Array<any>) {
    if (settings.SHOW_VERBOSE_DEVICE_LOGS) {
      Logger._log(`[${getDate()}]`, _transform(...params));
    }
  }

  static info(...params: Array<any>) {
    Logger._log(
      `[${getDate()}]`,
      chalk.cyan(_transform(...params)),
    );
  }

  static warn(...params: Array<any>) {
    Logger._log(
      `[${getDate()}]`,
      chalk.yellow(_transform(...params)),
    );
  }

  static error(...params: Array<any>) {
    Logger._log(
      `[${getDate()}]`,
      chalk.red(_transform(...params)),
    );
  }
  static _log(...params: Array<any>) {
    console.log(...params);
  }
}
