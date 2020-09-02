'use strict';

require('../models/db');
const config = require('config');
const url = require('url');

function respond(origin, req, res, next) {
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Max-Age', 60 * 60 * 24);
  res.header('Access-Control-Expose-Headers', 'Accepts, Content-Type, X-White-Spaces-Space-Role, X-White-Spaces-Channel, X-White-Spaces-Spacepassword, X-White-Spaces-Auth, X-White-Spaces-Space-Auth');
  res.header('Access-Control-Allow-Headers', 'Accepts, Accept-Language, Accept-Encoding, Accept-Language, Content-Type, X-White-Spaces-Space-Auth, X-White-Spaces-Space-Role, X-White-Spaces-Channel, X-White-Spaces-Spacepassword, X-White-Spaces-Auth');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

  if (req.method == 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
}

module.exports = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const parsedUrl = url.parse(origin, true, true);

    // FIXME
    if (parsedUrl.hostname == "cdn.white_spaces.com") {
      res.header('Cache-Control', "max-age");
      res.header('Expires', "30d");
      res.removeHeader("Pragma");

      respond(origin, req, res, next);
    } else {
      //Team.getTeamForHost(parsedUrl.hostname, (err, team, subdomain) => {
        //if (team) {
          respond(origin, req, res, next);
        //} else {
          next();
        //}
      //});
    }

  } else {
    next();
  }
}
