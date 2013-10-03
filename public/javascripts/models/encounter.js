define([
  'jquery',
  'underscore',
  'backbone',
  'models/pokemon'
], function($, _, Backbone, Pokemon){

  var Encounter = Backbone.Model.extend({
    url: '/api/encounter'

    ,defaults: {
      location: null
      ,area: null
      ,method: null
      ,pokemon: null
      ,battleResult: null
      ,battlePokemon: null
    }

    ,initialize: function(attributes, options){
      var me = this;
      me.pokemon = new Pokemon(this.get('pokemon'));
      me.battlePokemon = options.trainer.party.get(this.get('battlePokemon'));
      me.oldPokemon = me.battlePokemon && me.battlePokemon.toJSON();
      me.trainer = options.trainer;

      me.on('change:pokemon', function(){
        me.pokemon.set(me.get('pokemon'));
      });
    }

    // Encounter a Pokemon
    ,goto: function(location){
      var me = this;
      me.sync(null, me, {
        type: 'POST'
        ,data: {location: location}
        ,processData: true
        ,success: function(data){
          me.set(data);
        }
      });
    }

    // Begin battle
    ,battle: function(pokemon){
      var me = this, oldPokemon = pokemon.toJSON();
      me.battlePokemon = pokemon;

      me.sync(null, me, {
        url: me.url + '/battle'
        ,type: 'POST'
        ,data: {pokemonId: pokemon.id}
        ,processData: true
        ,success: function(data){
          me.set({battleResult: data.result});
          _.each(data.events, function(ev){
            var pokemon = me.trainer.party.get(ev.pokemon.id);
            pokemon && pokemon.set(ev.pokemon);
            me.trigger('pokemon:events', {
              model: pokemon
              ,pokemonEvents: ev.events
              ,oldPokemon: oldPokemon
            });
          });
        }
      });
    }

    // Escape from encounter
    ,escape: function(){
      var me = this;
      me.sync(null, me, {
        url: me.url + '/escape'
        ,type: 'POST'
        ,success: function(){
          me.trigger('escape');
          me.set(me.defaults);
        }
      });
    }
  });

  return Encounter;
});