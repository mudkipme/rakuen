define([
  'jquery',
  'underscore',
  'backbone',
  'models/item'
], function($, _, Backbone, Item){

  var PokeMart = Backbone.Collection.extend({
    model: Item
    ,url: '/api/item'

    ,filterPocket: function(pocket){
      return this.filter(function(item){
        return item.get('item').pocket == pocket;
      });
    }
  });

  return PokeMart;
});