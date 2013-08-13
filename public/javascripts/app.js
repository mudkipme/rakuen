define([
  'jquery'
  ,'backbone'
  ,'marionette'
  ,'app-base'
  ,'i18next'
  ,'moment'
  ,'vent'
  ,'router'
  ,'controller'
  ,'views/alert'
  ,'views/modal'
  ,'moment/lang/zh-cn'
  ,'moment/lang/zh-tw'
  ,'bootstrap/collapse'
], function($, Backbone, Marionette, AppBase, i18n, moment,
  vent, Router, Controller, AlertView, ModalView){

  var App = new AppBase();

  // Main region, expand & collapse for home view
  var MainRegion = Marionette.Region.extend({
    el: '#paradise-app > main'
    ,expand: function(){
      this.$el.removeClass('col-lg-9 col-sm-9 col-lg-push-3 col-sm-push-3');
    }
    ,collapse: function(){
      this.$el.addClass('col-lg-9 col-sm-9 col-lg-push-3 col-sm-push-3');
    }
  });

  var AlertRegion = Marionette.Region.extend({
    el: '#paradise-alert'
    ,initialize: function(){
      var me = this;
      me.ensureEl();
      me.$el.on('closed.bs.alert', function(){
        me.close();
      });
    }
    ,onShow: function(){
      if ($(window).scrollTop() > this.$el.offset().top) {
        $(window).scrollTop(this.$el.offset().top);
      }
    }
  });

  var ModalRegion = Marionette.Region.extend({
    el: '#paradise-modal'
    ,initialize: function(){
      var me = this;
      me.ensureEl();
      me.$el.on('hidden.bs.modal', function(){
        setTimeout(function(){
          me.close();
        }, 0);
      });
    }
    ,onShow: function(view){
      view.$el.modal('show');
    }
  });

  App.addRegions({
    menuRegion: '#paradise-app > aside'
    ,mainRegion: MainRegion
    ,alertRegion: AlertRegion
    ,modalRegion: ModalRegion
  });

  // initialize locales
  App.addAsyncInitializer(function(dfd){
    i18n.init({
      lng: PARADISE.locale
      ,fallbackLng: false
      ,load: 'current'
      ,lowerCaseLng: true
      ,ns: {
        namespaces: ['app', 'pokemon', 'item', 'location']
        ,defaultNs: 'app'
      }
    }, function(){
      dfd.resolve();
    });

    var momentLngName = {'zh-hans': 'zh-cn', 'zh-hant': 'zh-tw'};
    moment.lang(momentLngName[PARADISE.locale] || PARADISE.locale);
  });

  // Alert and Model support
  App.addInitializer(function(){
    // Display an alert
    vent.on('alert', function(options){
      App.alertRegion.show(new AlertView(options));
    });

    // Display an alert
    vent.on('modal', function(options){
      App.modalRegion.show(new ModalView(options));
    });
  });

  // Ajax Error Handler
  App.addInitializer(function(){
    $(document).ajaxError(function(e, xhr){
      var content = i18n.t('error.retry-please');
      try {
        content = i18n.t('error.' + JSON.parse(xhr.responseText).error);
      } catch(e) {}
      vent.trigger('alert', {
        type: xhr.status == 500 ? 'danger' : ''
        ,title: i18n.t('error.title')
        ,content: content
      });
    });
  });

  // initialize router and controller
  App.addInitializer(function(){
    var controller = new Controller({
      App: App
    });

    App.appRouter = new Router({
      controller: controller
    });
  });

  // After all initialize events
  App.on('initialize:after', function(){
    Backbone.history.start({pushState: true});
  });

  return App;
});