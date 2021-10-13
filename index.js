// Daily or Weekly standups
// Added short cuts /daily/<team> or /weekly/<team> that redirects to <team>-<date>
// Using the <team>-default as the starting point for new pads
// (c) 2020 Grant Street Group
'use strict';

const log4js = require('ep_etherpad-lite/node_modules/log4js');
const logger = log4js.getLogger('Standups');

const settings = require('ep_etherpad-lite/node/utils/Settings');
const async    = require('ep_etherpad-lite/node_modules/async');
const eejs     = require('ep_etherpad-lite/node/eejs');
const api      = require('ep_etherpad-lite/node/db/API');
const padManager = require('ep_etherpad-lite/node/db/PadManager');
const strftime = require('strftime');

// Inject a list of teams onto the front page
exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
  if (settings.ep_standups) {
    args.content = args.content + eejs.require("ep_standups/templates/groups.ejs",{ "teams": settings.ep_standups} ) ;
  }

  return cb();
}



// Setup URL routes for daily and weekly endpoints
// exports.registerRoute = function (hook_name, args, cb) {
exports.expressCreateServer = (hook_name, args, cb)  => {

  args.app.get('/daily/:group(*)', (req, res, next) => {

    var group = req.params.group;
    var defPad = group + "-default"; 
    var padName;

    logger.info('Request for daily pad for '+group)

    const createStandupPadName = (group) => {
      var sDate =  strftime('%F'); 
      var sReturn = group + "-" + sDate;
      return sReturn;
    };

    async.series([
	    function(callback){
          // Generate Daily PadName
           padName = createStandupPadName(group);
           logger.info('Pad name '+ padName)
           callback();
        },
      function (callback) {
        const exists = padManager.doesPadExists(padName);
        if (!exists) {
            api.copyPad(defPad,padName,"false")
            logger.info('Copied '+defPad+' to '+ padName)
        }
        callback();
      },
      function (callback) {
        // redirect to new pad
        res.writeHead(302, {
          'Location': '/p/'+padName
        });
        res.end();
        callback(); 
      }
    ]);
  });

  args.app.get('/weekly/:group(*)', (req, res, next) => {


    logger.info('Request for weekly pad for '+group)

    var group = req.params.group;
    var defPad = group + "-default"; 
    var padName;

    const getMonday = (d) => {
        d = new Date(d);
        var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const createStandupPadName = (group) => {
      var sMonday = getMonday(new Date());
      var sDate =  strftime('%F', sMonday); 
      var sReturn = group + "-" + sDate;

      return sReturn;
    };

    async.series([
    	function(callback){
          // Generate Weekly PadName
           padName = createStandupPadName(group);
           callback();
        },
      function (callback) {
        // const exists = await padManager.doesPadExists(padID);
        // if (!exists) {
          api.copyPad(defPad,padName,"false",callback)
        // }
        callback();
      },
      function (callback) {
        // redirect to new pad
        res.writeHead(302, {
          'Location': '/p/'+padName
        });
        res.end();
        callback(); 
      }
    ]);
  });
  
  cb();
};



