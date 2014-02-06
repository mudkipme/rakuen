var common = require('../app/common');
var async = require('async');
var _ = require('underscore');
var Trainer = require('../app/models/trainer');
var Pokemon = require('../app/models/pokemon');
var Species = require('../app/models/species');
var Log = require('../app/models/log');

var initLog = function(trainer, callback){

  var caught = {$or: [{trainer: trainer._id}, {originalTrainer: trainer._id}]};
  var hatch = _.extend({}, caught, {meetPlaceIndex: 'day-care'});

  async.series([
    function(next){
      Pokemon.findOne(caught, null, {sort: 'birthDate'}, function(err, pokemon){
        if (err) return next(err);
        Species.getBabySpecies(pokemon, function(err, num){
          if (err) return next(err);
          var pm = pokemon.toObject();
          pm.speciesNumber = num;
          next(null, pm);
        });
      });
    }
    ,Pokemon.count.bind(Pokemon, caught)
    ,Pokemon.count.bind(Pokemon, hatch)
  ], function(err, results){
    Log.addLog({type: 'begin', trainer: trainer, createTime: results[0].birthDate, params: {pokemon: results[0]}});
    trainer.catchTime = results[1];
    trainer.hatchTime = results[2];
    trainer.save(callback);
    console.log('Inited ' + trainer.name);
  });
};

common.mongoConnection.once('open', function(){
  Trainer.find({}, function(err, trainers){
    async.eachSeries(trainers, initLog, function(err){
      if (err) return console.log(err);
      console.log('Init log finished.');
    });
  });
});