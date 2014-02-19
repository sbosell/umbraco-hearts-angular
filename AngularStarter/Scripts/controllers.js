angular.module('app.controllers', ['app.services']).
    controller('AppController', ['$rootScope', '$scope', '$location', '$routeParams', 'contentService', '$sce', function ($rootScope, $scope, $location, $routeParams, contentService, $sce) {
 
        $rootScope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $scope.contentService = contentService;

        $scope.html = function (s, count) {
            var s = $sce.trustAsHtml(s);
            if (count && s.length>count) {
                s = s.substr(0, count - 1);
            }
            return s;
        }

        $scope.$on('state', function (event, args) {
            console.log(args);
        });

        $rootScope.$on('$stateChangeSuccess', 
            function (event, toState, toParams, fromState, fromParams) {
                $scope.currentUrl = toParams.path;
            })
        

        
    }
    ]).controller('RouteController', ['$scope', 'PublishedContent', 'contentService', '$stateParams', function ($scope, PublishedContent, contentService, $stateParams) {

        $scope.content = PublishedContent;
        console.log($stateParams);
        $scope.$broadcast('state', $stateParams);

        $scope.descendants = function (queryName, docType) {

            $scope.$watch(queryName, function (newVal) {
                $scope.safeApply(function () {
                     
                });
            });
            contentService.getDescendants($scope.content.Id, docType).then(function (data) {
                $scope[queryName] = data;
            });
        }

        

        $scope.descendantsByParentId = function (queryName, parentId, docType) {
            $scope.$watch(queryName, function (newVal) {
                $scope.safeApply(function () {

                });
            });

            contentService.getDescendants(parentId, docType).then(function (data) {
                $scope[queryName] = data;
                });
        }
     
    }])
    .controller('RouteController', ['$scope', 'PublishedContent', 'contentService', function ($scope, PublishedContent, contentService) {

        $scope.content = PublishedContent;

        $scope.descendants = function (queryName, docType) {

            $scope.$watch(queryName, function (newVal) {
                $scope.safeApply(function () {

                });
            });
            contentService.getDescendants($scope.content.Id, docType).then(function (data) {
                $scope[queryName] = data;
            });
        }



        $scope.descendantsByParentId = function (queryName, parentId, docType) {
            $scope.$watch(queryName, function (newVal) {
                $scope.safeApply(function () {

                });
            });

            contentService.getDescendants(parentId, docType).then(function (data) {
                $scope[queryName] = data;
            });
        }

    }])
    
    .directive('cycle', function($parse) {
        return {
            restrict: 'A',
            priority: 400,
            link: function (scope, element, attr) {
                scope.$watch('isLoaded', function (newVal) {
                    if (!newVal) return;

                    var opts = $parse(attr.cycle);
                        $(element).cycle(opts());
                });
                

            }

        }
    })
    .directive('umbDescendants', function (contentService, $compile, $q, $timeout, $log) {

        var getTemplate = function (element) {
            templateLoader = $(element).html();
            return templateLoader;
        }


        var linker = function (scope, element, attrs) {
          
            $scope = scope;
            scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            $scope.descendants = [];

            $scope.$watch('docType', function (newVal) {
                if (!newVal) return;
                contentService.getDescendantsFromRoot($scope.docType).then(function (data) {
                    $scope.safeApply(function () { $scope.descendants = data; });
                    
                });

            });
          
            
        }

        return {
            restrict: 'A',
            priority: 2000,
            template: function(tElement, tAttrs){
                return tElement.html();
            },
            scope: {
                parentId: '=',
                docType: '@'

            },
           
           /* compile: function(element, attrs, transclude) {

                $log.info("every instance element:", element);

                return function (scope, iElement, iAttrs) {

                    $log.info("this instance element:", element);

                    transclude(scope, function(clone){

                        $log.info("clone:", clone);

                    });
                
            }, */
            link: linker
        };
    })
    .directive('umbChildren', function (contentService, $compile) {
        return {
            restrict: 'A',
            priority: 1100,  // higher than  ng-repeat
            controller: function($scope) {
                $scope.children = [];
                $scope.isLoaded = false;
                $scope.safeApply = function (fn) {
                    var phase = this.$root.$$phase;
                    if (phase == '$apply' || phase == '$digest') {
                        if (fn && (typeof (fn) === 'function')) {
                            fn();
                        }
                    } else {
                        this.$apply(fn);
                    }
                };
                $scope.$watch('content.Id', function (newVal) {
                    if (!newVal) return;
                    
                    contentService.getChildrenById(newVal).then(function (data) {
                        $scope.children = data;
                        $scope.isLoaded = true;
                        $scope.safeApply();

                       
                    });
                });
            },
            
            
            link: function (scope, element, attr) {
             


            }

        }

    }).directive('umbMedia', function (contentService) {
        return {
            restrict: 'A',
            scope: {
                umbMedia: '='
            },
            link: function (scope, element, attr) {
                scope.$watch('umbMedia', function (newVal) {
                    if (!newVal) return;

                    contentService.getMediaById(newVal).then(function (data) {
                        $(element).attr('src', data.Url);
                    });
                });
            }

        }

    }).directive('umbContentLink', function (contentService) {
        return {
            restrict: 'A',
            scope: {
                umbContentLink: '='
            },
            link: function (scope, element, attr) {
                scope.$watch('umbContentLink', function (newVal) {
                    if (!newVal) return;

                    contentService.getContentById(parseInt(newVal)).then(function (data) {
                        $(element).attr('href', data.Url);
                    });
                });
            }

        }

    }).directive('umbNewsOverviewWidget', function (contentService, $compile, $q, $timeout, $log, $sce) {

       

        var linker = function (scope, element, attrs) {

          
            scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            scope.html = function(s, count) {
                var s = $sce.trustAsHtml(s);
                if (count && s.length > count) {
                    s = s.substr(0, count - 1);
                }
                return s;
            }

            scope.$watch('umbNewsOverviewWidget', function (newVal) {
                if (!newVal) return;
                contentService.getDescendantsFromRoot({ docType: "umbNewsOverview" }).then(function (data) {
                    scope.newsOverview = data[0];


                    contentService.getDescendants({ parentId: scope.newsOverview.Id, docType: "umbNewsItem", orderBy: "publishDate desc, createDate desc" }).then(function (data) {
                        scope.newsItems = data;
                        scope.featuredNewsItem = scope.newsItems[0];
                    });

                    scope.safeApply();
                });

            });

         

            $scope.descendants = [];

            $scope.$watch('docType', function (newVal) {
                if (!newVal) return;
                contentService.getDescendantsFromRoot($scope.docType).then(function (data) {
                    $scope.safeApply(function () { $scope.descendants = data; });

                });

            });


        }

        return {
            restrict: 'A',
            priority: 2000,
            template: function (tElement, tAttrs) {
                return tElement.html();
            },
            scope: {
                parentId: '=',
                docType: '@',
                umbNewsOverviewWidget: '='

            },

            /* compile: function(element, attrs, transclude) {
 
                 $log.info("every instance element:", element);
 
                 return function (scope, iElement, iAttrs) {
 
                     $log.info("this instance element:", element);
 
                     transclude(scope, function(clone){
 
                         $log.info("clone:", clone);
 
                     });
                 
             }, */
            link: linker
        };
    }).directive('umbLatestNewsWidget', function (contentService, $compile, $q, $timeout, $log, $sce) {



        var linker = function (scope, element, attrs) {
            
            $scope = scope;
            scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            scope.html = function (s, count) {
                var s = $sce.trustAsHtml(s);
                if (count && s.length > count) {
                    s = s.substr(0, count - 1);
                }
                return s;
            }

            scope.newsItems = [];

            scope.$watch('umbLatestNewsWidget', function (newVal) {
                
                contentService.getDescendantsFromRoot({ docType: "umbNewsOverview" }).then(function (data) {
                    scope.newsOverview = data[0];

                    contentService.getDescendants({ parentId: scope.newsOverview.Id, docType: "umbNewsItem", orderBy: "publishDate desc, createDate desc" }).then(function (data) {
                        
                        scope.safeApply(function () {
                            scope.newsItems = data;
                        });
                    });

                    
                });

            });



          

        }

        return {
            restrict: 'EA',
            priority: 2000,
            template: function (tElement, tAttrs) {
                return tElement.html();
            },
            scope: {
                parentId: '=',
                docType: '@',
                umbLatestNewsWidget: '='

            },

          
            link: linker
        };
    })
.directive('umbFeatures', function (contentService, $compile, $q, $timeout, $log, $sce) {



    var linker = function (scope, element, attrs) {

        $scope = scope;
        scope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        scope.html = function (s, count) {
            if (count && s.length > count) {
                s = s.substr(0, count - 1);
            }
            s = $sce.trustAsHtml(s);
          
            return s;
        }
        scope.features = [];

        scope.$watch('umbFeatures', function (newVal) {
            //homePage.Descendants("umbTextPages").Where("featuredPage")
            contentService.getDescendantsFromRoot({docType: "umbTextPage", where: "featuredPage"} ).then(function (data) {
                    scope.safeApply(function () {
                        scope.features = data;
                    });
            });

        });


    }

    return {
        restrict: 'EA',
        priority: 2000,
        template: function (tElement, tAttrs) {
            return tElement.html();
        },
        scope: {
            parentId: '=',
            docType: '@',
            umbFeatures: '='

        },


        link: linker
    };
})
