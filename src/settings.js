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

import path from 'path';
import WebhookFileRepository from './lib/repository/WebhookFileRepository';

export default {
	baseUrl: 'http://localhost',
	coreFlashTimeout: 90000,
	coreKeysDir: path.join(__dirname, 'core_keys'),
	coreRequestTimeout: 30000,
	coreSignalTimeout: 30000,
	isCoreOnlineTimeout: 2000,
	maxHooksPerDevice: 10,
	maxHooksPerUser: 20,
	userDataDir: path.join(__dirname, 'users'),
	webhookRepository: new WebhookFileRepository(
		path.join(__dirname, 'webhooks'),
	),
};
