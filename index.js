// Daily or Weekly standups
// Added short cuts /daily/<team> or /weekly/<team> that redirects to <team>-<date>
// Using the <team>-default as the starting point for new pads
// (c) 2020 Grant Street Group

var settings = require('ep_etherpad-lite/node/utils/Settings');
var async    = require('ep_etherpad-lite/node_modules/async');
var eejs     = require('ep_etherpad-lite/node/eejs');
var api      = require('ep_etherpad-lite/node/db/API');
var strftime = require('strftime');

// Inject a list of teams onto the front page
// TODO:   Move this to a configuration setting
exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
  if (settings.ep_standups) {
    args.content = args.content + eejs.require("ep_standups/templates/groups.ejs",{ "teams": settings.ep_standups} ) ;
  }

  return cb();
}



// Setup URL routes for daily and weekly endpoints
exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/daily/:group(*)', function(req, res) {

    var group = req.params.group;
    var defPad = group + "-default"; 
    var padName;

    createStandupPadName = function(group) {
      var sDate =  strftime('%F'); 
      var sReturn = group + "-" + sDate;

      return sReturn;
    };

      async.series([
	function(callback){
          // Generate Daily PadName
           padName = createStandupPadName(group);
           callback();
        },
      function (callback) {
          api.copyPad(defPad,padName,"false",callback)
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

  args.app.get('/weekly/:group(*)', function(req, res) {

    var group = req.params.group;
    var defPad = group + "-default"; 
    var padName;

    getMonday = function(d) {
        d = new Date(d);
        var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    createStandupPadName = function(group) {
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
          api.copyPad(defPad,padName,"false",callback)
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
};



