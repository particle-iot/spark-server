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
*/

const ROUTE_BASE = '/v1/webhooks';

class Webhooks {
  constructor(app) {
    app.get(ROUTE_BASE, this.get);
  }

  get(request, response) {
    // console.log(JSON.stringify(request));

    response.json(
      [
        {
          "id": "12345",
          "url": "https://samplesite.com",
          "event": "hello",
          "created_at": "2016-04-28T17:06:33.123Z",
          "requestType": "POST",
        },
      ],
    );
  }
}

module.exports = Webhooks;
