*   [Part I - Umbraco hearts Angular - A Series on building an SPA application](/web/20160709185925/http://kpensar.com/blog/2013/december/30/umbraco-hearts-angular-a-series-on-building-an-spa-application/)
*   [Umbraco Hearts Angular Part II - Web Api and Angular’s first date](/web/20160709185925/http://kpensar.com/blog/2014/02/17/umbraco-hearts-angular-part-ii-web-api-and-angulars-first-date/)
*   [Umbraco Hearts Angular Part III - Converting the TXT Starter Kit into an Angular App](/web/20160709185925/http://kpensar.com/blog/2014/02/19/umbraco-hearts-angular-part-iii-converting-the-txt-starter-kit-into-an-angular-app/)

This probably should have been a post released on Valentine’s day but I was too busy watching the second season of House of Cards. I’ve been toying around with the idea of how to build an Angular application using Umbraco as a backend. This isn’t a part of any client project or anything but just something I’ve wanted to investigate for a while. Let me start out by saying my thoughts and focus here will discuss one way of building an angular app and aren’t 100% complete. I have no doubt there are other ways that might be better, or better for you, or better for your scenario and in general I would love to hear your thoughts too.

Let’s start out with a few small requirements:

*   Let’s make sure our app is seo’able or search engine indexable
*   This post won’t get into authentication but is aimed toward a public app
*   We will include jQuery just because we may need a plugin in the future and recognize that jQuery has little to do with the Angular parts

This architecture probably won’t be too conducive for a complex app.

Some parts of the app like the main navigation or the footer _could_ be done in Angular but for all intents and purposes they’ll be included in the layout view because they are not going to be changing very much across pages

So that’s pretty simple. This post and small angular app will dive into some ways we can hook up our SPA to the Umbraco CMS.

# Front End / Client Architecture

There are a few areas of an angular app that are important to at least think about before we begin.

First, let’s talk about routing.

## Routing and the Template

This is the functionality of angular that takes a url/route and decides which template and controller are going to be associated with that route. Now remember, we are talking about angular controllers and views, not necessarily Umbraco ones. We have a bit of a challenge here because we do not know what template goes with each route. Umbraco allows us to associate any kind of template/view with any page/content node so this is a bit of a challenge. This means we have to make a call to the umbraco cms to get the current page’s template. In the default angular routing, we can define some wild card routing, however, and this is important, we can not at least to my knowledge, generate a template using dependency injected services. This was a bit of a sticking point for me as I was testing and finally decided on using the angular-ui’s router module which provides a templateProvider. This module allows us to define some routes with wildcards as well as it will also allow us to make some web calls to determine which template the current route will use. I’m not going to get into the nitty gritty of this module for this post, but it is quite useful, so check it out. Let’s check out some code:

    angular.module('darkweekend', ['ngRoute', 'ngAnimate', 'ui.router', 'dw.controllers', 'dw.services'])
      .config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
        function ($urlRouterProvider, $stateProvider, $locationProvider) {

          $locationProvider.html5Mode(true);
          $stateProvider
            .state("home", {
              url: "*path",
              templateProvider: function (templateService, contentService, $q, $stateParams) {
                var d = $q.defer();
                // prefetch the content, the service will actually cache it for the resolve function
                return contentService.getContentByUrl($stateParams.path).then(function (content) {
                  //now that we have the content, we will get its template
                  // this will issue a get to the url and return the html from the view
                  // content.Template, content.TemplateId we can use
                  return templateService.getTemplateByAlias(content.Template, $stateParams.path).then(function (data) {
                    //  d.resolve(data);
                    return data;
                  });

                });
              },
              resolve: {

                PublishedContent: ['$q', '$http', '$stateParams', 'contentService',
                  function ($q, $http, $stateParams, contentService) {
                    var d = $q.defer();
                    contentService.getContentByUrl($stateParams.path).then(function (data) {
                      d.resolve(data);
                    });
                    return d.promise;
                  }
                ]
              },
              controller: 'RouteController'
            })

        }
    ]);

A couple notes about this relatively simple setup. There is only one route defined because we are wildcarding it. It will capture all routes. This is one way to do it and in just about any angular spa app, you’d probably have multiple routes hitting multiple templates, but in this case, we’ve got one route. The first thing you’ll notice is that on the templateProvider we have a couple service calls. The purpose of the templateProvider is to let the app know which template to use for that route/state. The first one, `contentService.getContentByUrl($stateParams.path)`, will make a call to umbraco and return all of the data associated with the current url. This basically is a list of properties (Id, Name, Property Data you’ve defined, Template Info, etc). This is a webapi controller that will be shown later. Why do we have to do this? We have no idea which template name or url is associated with this content node and also this allows us to cache the content node’s data for the resolve function which will make this same call. Here is an example of what might be returned for the content. At this time, we are interested in the Template or TemplateId so that we can build our own template cache:

    {
      "Id": 1053,
      "Name": "Site",
      "Url": "/",
      "Path": "-1,1053",
      "ContentTypeAlias": "SiteMaster",
      "Properties": {
        "umbracoRedirect": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "umbracoRedirect",
          "Value": null,
          "XPathValue": null
        },
        "umbracoInternalRedirectId": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "umbracoInternalRedirectId",
          "Value": null,
          "XPathValue": null
        },
        "umbracoUrlName": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "umbracoUrlName",
          "Value": "",
          "XPathValue": ""
        },
        "umbracoUrlAlias": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "umbracoUrlAlias",
          "Value": "",
          "XPathValue": ""
        },
        "umbracoNaviHide": {
          "DataValue": "0",
          "HasValue": true,
          "PropertyTypeAlias": "umbracoNaviHide",
          "Value": false,
          "XPathValue": "0"
        },
        "sectionClasses": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "sectionClasses",
          "Value": "",
          "XPathValue": ""
        },
        "childSectionClass": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "childSectionClass",
          "Value": "",
          "XPathValue": ""
        },
        "pageTitle": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "pageTitle",
          "Value": "",
          "XPathValue": ""
        },
        "description": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "description",
          "Value": null,
          "XPathValue": null
        },
        "keywords": {
          "DataValue": "",
          "HasValue": false,
          "PropertyTypeAlias": "keywords",
          "Value": "",
          "XPathValue": ""
        }
      },
      "Template": "AngApp",
      "TemplateId": 1069
    }

The second call is to get the template for this content node. In a typical angular app you might define some static html templates, but I decided to have the url route return my angular template so all we need to do is perform a GET on the route and it will return our angular template. This is what `templateService.getTemplateByAlias(content.TemplateId, $stateParams.path)` does. So if my Umbraco url is /content-1/ it will make a `GET` to `/content-1/`. I’m going to jump over to that Umbraco/MVC View for a second. Here is a sample View:

    @inherits Umbraco.Web.Mvc.UmbracoViewPage<AngRenderModel>
    @{
        Layout = Model.isApp ? "Blank.cshtml" : "Static.cshtml";
    }

    @section Content {
        @if(Model.isApp) {

                <div ng-bind-html="html(content.body)"></div>
                <img umb-media="content.Properties.image.DataValue" />
        } else
        {
            <div ><h2>@Model.Content.Name</h2>
                @Model.Content.GetPropertyValue("body")

            </div>
        }
    }

The angular service when it makes a GET to the URL passes in a header which let’s Umbraco know that it is coming from the angular app. There is some route hijacking magic that allows us to inject this to the model. I will cover this a little more indepth on the backend architecture. This allows me to define two types of templates based on this condition. The first template is the angular one which contains the standard angular markup. The second one (case isApp is false) is the flat static view generated by Umbraco that a search engine might use to index. If you aren’t worried too much about search engine’s, the second template could be left off.

## Routing and the Resolve

The resolve function of our route is what brings it all together. The angular ui router is very similar to the standard angular routing in that the resolve method will make a second call to get the current node’s content which will already be in cache. Since we were going to be making the web call, I decided to make it in the tempalte provider so that we could cache the template with its name. This will then be passed to the RouteController which set’s a `$scope` variable with the content information. The view then has full access to it. If you check out the above code, you’ll notice the view is doing something like `html(content.body)` which will output the body property (Richtext editor in my case). A little note about outputting html, you’ll need to use the $sce module to mark it safe in the more recent versions of angular.

    app.controller('RouteController', ['$scope', 'PublishedContent', '$sce', 'contentService', function ($scope, PublishedContent, $sce, contentService) {
            // we set the content to be the published content.  Now the view has access to all of its properties.
            $scope.content = PublishedContent;

            $scope.html = function (s) {
                return $sce.trustAsHtml(s);
            }

    }]); 

## The Controllers

My app only has a couple controllers at this time. The first one is one that is being used as the Parent for all of them and is what is typically placed on the body or container div. We can add to the scope of the entire application some common functions and methods like safeApply or the above mentioned html function. Some of these could exist in services or even added to a `$rootScope`, but for simplicity we’ve got them there.

The second controller is `RouteController` and is what is receiving the PublishedContent value from the resolve function. It doesn’t do much except pass the current content node to its view.

    angular.module('dw.controllers', ['dw.services']).
        controller('AppController', ['$rootScope', '$scope', '$location', '$routeParams', 'contentService', function ($rootScope, $scope, $location, $routeParams, contentService) {

            $rootScope.safeApply = function (fn) {
                var phase = this.$root.$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            $scope.contentService = contentService;

            $scope.html = function (s) {
                return $sce.trustAsHtml(s);
            }
        }
        ]).controller('RouteController', ['$scope', 'PublishedContent', 'contentService', function ($scope, PublishedContent, contentService) {

            $scope.content = PublishedContent;

        }])

## The Services

Now, I know you are wondering about all those nifty functions we are calling in the routing and resolve functions and I’ll show them to you here. Please note that the backend webapi parts will be discussed in the second part of this post.

There are a total of three services: serviceApi, contentService, and templateService.

*   serviceApi: Responsible for the endpoint urls and mostly an internal service
*   contentService: Responsible for communicating with umbraco and web api in order to get content node information, children, etc.
*   templateService: This service basically gets the template for a content node.

And on to the code:

        angular.module('dw.services', [])
          .value('serviceBase', "/umbraco/api/pagegenapi/")
          .factory('serviceApi', ['serviceBase',
            function (serviceBase) {

              var service = {
                base: serviceBase,
                getMedia: serviceBase + 'GetMedia',
                getContent: serviceBase + 'getContent',
                getPath: serviceBase + 'getPage',
                getChildren: serviceBase + 'getChildren'
              }
              return service;

            }
          ])
          .factory('contentService', ['$http', '$q', 'serviceApi',
            function ($http, $q, serviceApi) {
              var childCache = {};
              var contentCache = {};

              var service = {
                getContentByUrl: function (url) {
                  var d = $q.defer();
                  var found = "";
                  for (key in contentCache) {
                    if (contentCache[key].Url == url) {
                      found = key;
                      break;
                    }
                  }
                  if (found !== "") {
                    d.resolve(contentCache[found]);
                  } else {

                    $http({
                      method: 'GET',
                      headers: {
                        app: true
                      },
                      url: serviceApi.getPath,
                      params: {
                        url: url
                      }
                    }).success(function (data) {
                      for (var key in data.Properties) {
                        data[key] = data.Properties[key].DataValue;
                      }

                      contentCache[data.Id] = data;
                      d.resolve(data);
                    });
                  }
                  return d.promise;
                },
                getContentById: function (id) {
                  var d = $q.defer();
                  if (contentCache[id]) {
                    d.resolve(contentCache[id]);
                  }

                  $http({
                    method: 'POST',
                    headers: {
                      app: true
                    },
                    url: serviceApi.getContent
                  }).success(function (data) {
                    for (var key in data.Properties) {
                      data[key] = data.Properties[key].DataValue;
                    }
                    if (!contentCache[id])
                      contentCache[id] = data;

                    d.resolve(contentCache[id]);
                  });
                  return d.promise;
                },
                getMediaById: function (mediaId) {
                  var d = $q.defer();
                  $http({
                    method: 'POST',
                    data: {
                      id: mediaId
                    },
                    url: serviceApi.getMedia
                  }).success(function (data) {
                    d.resolve(data);
                  });
                  return d.promise;
                },
                getChildrenById: function (id) {
                  var d = $q.defer();
                  if (!childCache[id]) {
                    $http({
                      method: 'POST',
                      data: {
                        id: id
                      },
                      url: serviceApi.getChildren
                    }).success(function (data) {
                      childCache[id] = data;
                      d.resolve(childCache[id]);
                    });

                  } else {
                    d.resolve(childCache[id]);
                  }

                  return d.promise;
                }

              }

              return service;
            }
          ])
          .factory('templateService', ['$http', '$q', 'serviceBase',
            function ($http, $q, serviceBase) {
              var templates = {};

              function hasTemplate(templateName) {
                if (templates[templateName])
                  return templates[templateName];

                return null;
              };

              var service = {
                test: function () {
                  return "<div></div>";
                },
                getTemplate: function (url) {
                  // this is the url of the current route
                  if (url == "") url = "/";
                  var d = $q.defer();
                  var template = hasTemplate(url)
                  if (!template) {

                    $http({
                      method: 'GET',
                      url: url,
                      headers: {
                        app: true
                      }
                    }).success(function (data) {
                      d.resolve(data);
                    });

                  } else {
                    d.resolve(template)
                  }

                  return d.promise;
                },
                getTemplateByAlias: function (alias, url) {
                  // template name from umbraco and url of current route
                  var d = $q.defer();
                  // check cache first
                  var template = hasTemplate(alias);
                  if (!template) {
                    // why the header app? We are using it on the template to denote it is a call from angular
                    $http({
                      method: 'GET',
                      url: url,
                      headers: {
                        app: true
                      }
                    }).success(function (data) {
                      templates[alias] = data;
                      d.resolve(templates[alias]);
                    });
                  } else {
                    d.resolve(template);
                  }
                  return d.promise;
                }

              };

              return service;
            }
          ]);

The services are meaty but they do some specific functions that are used in the routing templateProvider, the routing resolve as well as some directives as you’ll see. One of the challenges in my architecture is how to get child node information into the template as the templates aren’t tied to templates in a way that you’d normally integrate them with controllers. I decided on creating some directives with shared scope to pull the children out (or descendants) and will come back around to this when we pull it all together with the web api and backend code.

I know you might be thinking, why not just have razor generate the template and not use angular? Well, there probably isn’t anything wrong with that approach, I was just going for a more generic angular method of building an angular website. It will all be tied together in the next post.

## [Source code is on github](/web/20160709185925/https://github.com/sbosell/umbraco-hearts-angular).

A quick note about the project. I used the Starter Kit called Txt and the demo project demonstrates some of the scenarios outlined in this blog. It isn’t complete by any means nor is it exactly how I would build a particular app, but you should be able to take pieces (hopefully) and learn from it.
