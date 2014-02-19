angular.module('app.services', [])
    .value('serviceBase', "/umbraco/api/pagegenapi/")
    .factory('serviceApi', ['serviceBase', function (serviceBase) {
        
        var service = {
            base: serviceBase,
            getMedia: serviceBase + 'GetMedia',
            getContent: serviceBase + 'getContent',
            getPath: serviceBase + 'getPage',
            getChildren: serviceBase + 'getChildren',
            getDescendants: serviceBase + 'GetDescendants'
        }
        return service;

    }])
    .factory('contentService', ['$http', '$q', 'serviceApi', function ($http, $q, serviceApi) {
        var childCache = {};
        var contentCache = {};

        function normalizeContent(data) {
            var temp = data;
            for (var key in temp.Properties) {
                temp[key] = temp.Properties[key].DataValue;
            }
            return temp;
        }

        function normalizeContentArray(data) {
            var temp = data;
            for (var i = 0, l = temp.length; i < l; i++) {
                temp[i] = normalizeContent(temp[i]);
            }
            return temp;
        };
        

        var service = {
            getContentByUrl: function(url){
                var d = $q.defer();
                var found = "";
                for (key in contentCache)
                {
                    if (contentCache[key].Url == url)
                    {
                        found = key;
                        break;
                    }
                }
                if (found !=="")
                {
                    d.resolve(contentCache[found]);
                }
                else {

                
                $http({ method: 'GET', headers: { app: true }, url: serviceApi.getPath, params: {url: url} }).success(function (data)
                {
                    for (var key in data.Properties)
                    {
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
                if (contentCache[id])
                {
                    d.resolve(contentCache[id]);
                }
           
                $http({ method: 'POST', headers: { app: true }, data: {id:id}, url: serviceApi.getContent }).success(function (data) {
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
                $http({ method: 'POST', data: {id: mediaId},  url: serviceApi.getMedia }).success(function (data) {
                    d.resolve(data);
                });
                return d.promise;
            },
            getChildrenById: function (id)
            {
                var d = $q.defer();
                if (!childCache[id])
                {
                    $http({ method: 'POST', data: { id: id }, url: serviceApi.getChildren }).success(function (data)
                    {
                        childCache[id] = data;
                        d.resolve(childCache[id]);
                    });
                 
                } else
                {
                    d.resolve(childCache[id]);
                }
              
                return d.promise;
            },
            getDescendants: function (parentId, docType, orderBy, where) {
                var opts = {parentId: -1, docType: '', orderBy: '', where: ''};
                if (angular.isObject(parentId)) {
                    // passing in object
                    angular.extend(opts, parentId);
                } else {
                    orderBy = orderBy ? orderBy : "";
                    where = where ? where : "";
                }
                

                var d = $q.defer();

                $http({ method: 'POST', data: opts, url: serviceApi.getDescendants }).success(function (data) {

                    d.resolve(normalizeContentArray(data));
                });


                return d.promise;
            },
            getDescendantsFromRoot: function (docType, orderBy, where) {
                var opts = { parentId: -1, docType: '', orderBy: '', where: '' };
                if (angular.isObject(docType)) {
                    // passing in object
                    angular.extend(opts, docType);
                } else {
                    orderBy = orderBy ? orderBy : "";
                    where = where ? where : "";
                }

                var d = $q.defer();
                
                    $http({ method: 'POST', data: opts, url: serviceApi.getDescendants }).success(function (data) {
                        d.resolve(normalizeContentArray(data));
                        
                    });

                
                return d.promise;
            }

        }

        return service;
    }])
    .factory('templateService', ['$http', '$q', 'serviceBase',  function ($http, $q, serviceBase) {
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

                    $http({ method: 'GET', url: url, headers: {app: true}}).success(function (data) {
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
                    $http({ method: 'GET', url: url, headers: { app: true } }).success(function (data) {
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
    }]);