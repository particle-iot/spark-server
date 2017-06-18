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

import { Container } from 'constitute';
import { Logger as DefaultLogger } from './defaultLogger';
import { ILogger } from '../types';


let logger : ILogger = DefaultLogger;


export default {
  error(...params: Array<any>) {
    logger.error(...params);
  },
  info(...params: Array<any>) {
    logger.info(...params);
  },
  initialize(container: Container) {
    logger = container.constitute('LOGGING_CLASS');
  },
  log(...params: Array<any>) {
    logger.log(...params);
  },
  warn(...params: Array<any>) {
    logger.warn(...params);
  },
};
