angular.module('myapp', ['ngRoute', 'ngAnimate', 'ui.router', 'app.controllers', 'app.services'])
    .config(['$urlRouterProvider', '$stateProvider', '$locationProvider', function ($urlRouterProvider, $stateProvider, $locationProvider) {

        //$urlRouterProvider.otherwise("/ab"); $locationProvider.html5Mode(true);
        
        $locationProvider.html5Mode(true).hashPrefix('!');
        $stateProvider
              .state("home", {
                  url: "*path",
                  templateProvider: function (templateService, contentService, $q, $stateParams) {
                      var d = $q.defer();
                      // prefetch the content, the service will actually cache it for the resolve function
                      return contentService.getContentByUrl($stateParams.path).then(function (content) {
                          //now that we have the content, we will get its template
                          // this will issue a get to the url and return the html from the view
                          return templateService.getTemplateByAlias(content.TemplateId, $stateParams.path).then(function (data) {
                              //  d.resolve(data);
                              return data;
                          });

                      });
                  },
                  resolve: {

                      PublishedContent: ['$q', '$http', '$stateParams', 'contentService', function ($q, $http, $stateParams, contentService) {
                          var d = $q.defer();
                          contentService.getContentByUrl($stateParams.path).then(function (data) {
                              d.resolve(data);
                          });
                          return d.promise;
                      }]
                  },
                  controller: 'RouteController'
              })

    }]).run(function($rootScope, $sce) {
        $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $rootScope.html = function (s, count) {
            var s = $sce.trustAsHtml(s);
            if (count && s.length > count) {
                s = s.substr(0, count - 1);
            }
            return s;
        }
    });