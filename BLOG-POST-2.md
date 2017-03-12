# Part II Getting the Client talking to the Server

In this post we’ll cover the backend parts of our angular app and tied it all together. If you haven’t read the first part, I recommend that you take some time to review it as I walked through some of the front end aspects of one way to integrate angular and Umbraco.

*   [Umbraco Hearts Angular - A Series on building an SPA application](BLOG-POST-1.md)
*   [Umbraco Hearts Angular Part II - Web Api and Angular’s first date](BLOG-POST-2.md)
*   [Umbraco Hearts Angular Part III - Converting the TXT Starter Kit into an Angular App](BLOG-POST-3.md)

I recommend that you read up on how to build a web api controller for Umbraco. There is some great documentation [here](/web/20160808061044/http://our.umbraco.org/documentation/Reference/WebApi/).

## Web Api

Based on our front end client, we need only a few pieces of information which mainly has to do with getting a content node from a url, getting some children, a media item, and/or whatever other data you might require. Our example will be pretty simple. Just sharing the code will probably be sufficient as it is straightforward:

    // PageGenApiController.cs
    namespace MvcApplication1.Controllers
    {
        // mvc needs a class to serialize a post, this is for a url
        public class UrlModel
        {
            public string url { get; set; }

        }
        // id class for post
        public class IdModel
        {
            public int id { get; set; }
        }

        public class PageGenApiController : UmbracoApiController
        {
            //
            // GET: /PageGenApi/

            [HttpPost, HttpGet]
            [AcceptVerbs("POST","GET")]
            [AllowAnonymous]
            public PageViewModel GetPage(string url)
            {
                var urlData = url;

                if (urlData[urlData.Length - 1] != '/') urlData = urlData + "/";

                var root = Umbraco.TypedContentAtRoot().First();
                var content = root.DescendantsOrSelf().Where(x => x.Url == urlData);
                PageViewModel pvm = new PageViewModel(content.First());

                return pvm;
            }

            [System.Web.Http.HttpPost, HttpGet]
            [AcceptVerbs("POST", "GET")]
            [AllowAnonymous]
            public PageViewModel GetMedia(IdModel data)
            {
                var id = data.id;

                var media = Umbraco.TypedMedia(id);
                PageViewModel pvm = new PageViewModel(media);

                return pvm;
            }

            [System.Web.Http.HttpPost, HttpGet]
            [AcceptVerbs("POST", "GET")]
            [AllowAnonymous]
            public PageViewModel GetContent(IdModel data)
            {
                var id = data.id;

                var content = Umbraco.TypedContent(id);
                PageViewModel pvm = new PageViewModel(content);

                return pvm;
            }

            [System.Web.Http.HttpPost, HttpGet]
            [AcceptVerbs("POST", "GET")]
            [AllowAnonymous]
            public List<PageViewModel> GetChildren(IdModel data)
            {
                var id = data.id;
                var content = Umbraco.TypedContent(id);
                return content.Children().Where(x => x.IsVisible()).Select(x => new PageViewModel(x)).ToList();
            }

        }
    }

The methods are just traversing the Umbraco tree and returning data. Nothing overly complicated except that instead of returning `PublishedContent` I’ve built my own model, PageViewModel. The PublishedContent has a lot of built in properties as well as the custom ones that a user adds in the backend and this class is giving me some control over what we are going to serialize. Basically we are getting the Id, Name, Template Info, Url, and custom properties that will be serialized back to our front end client.

Here is its definition:

    namespace MvcApplication1.Models
    {
        public class PropertyViewModel
        {
            public object DataValue { get; set; }
            public bool HasValue { get; set; }
            public string PropertyTypeAlias { get; set; }
            public object Value { get; set; }
            public object XPathValue { get; set; }

        }

        public class PageViewModel
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Url { get; set; }
            public string Path { get; set; }
            public string ContentTypeAlias { get; set; }
            public Dictionary<string, PropertyViewModel>Properties { get; set; }
            public string Template { get; set; }
            public int TemplateId { get; set; } 

            public PageViewModel(IPublishedContent model)
            {
                Id = model.Id;
                Name = model.Name;
                Url = model.Url;
                Path = model.Path;
                ContentTypeAlias = model.ContentType.Alias;

                Template = model.GetTemplateAlias();
                TemplateId = model.TemplateId;
                Properties = new Dictionary<string,PropertyViewModel>();
                foreach(var x in model.Properties) {
                    Properties.Add(x.PropertyTypeAlias, new PropertyViewModel() { DataValue = x.DataValue, HasValue = x.HasValue, PropertyTypeAlias = x.PropertyTypeAlias, Value = x.Value, XPathValue = x.XPathValue });
                }

            }
        }
    }

The web api is straight forward. You can create as many methods are you need to support your front end requirements. For instance you may require some descendants, get the root node, or do just about anything you require.

All of this is fine and dandy, but how do we get the template/view? If you recall, instead of creating some html views, I decided to use the content’s view to determine the angular template. The alternative to this is to create some static views perhaps with the same name as the the template alias and call those. This is probably a little easier to implement but less fun. So let me show you the content view again:

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

The first line you’ll notice we are not inheriting from `UmbracoTemplatePage`. The reason for this is that I wanted to add a property to the model to determine if our front end was making a GET to a page and do two things on that condition:

Change the layout to be a static one without angular if a search engine was browsing Be able to have both my angular template and the static view on the same page. It is a little duplicate work though.

If you recall in the Angular service I was making the GET with a header in the call. This is what is being passed to Umbraco and setting a isApp boolean. In order to do this, we have to create a class and inherit from `RenderModel`. My class is very simple and only adds one addition property.

    namespace App.Models
    {
        public class AngRenderModel : Umbraco.Web.Models.RenderModel
        {
            public bool isApp { get; set; }
            public AngRenderModel(): base(UmbracoContext.Current.PublishedContentRequest.PublishedContent)
            {

            }
        }
    }

Now to the Umbraco route hijacking. Before you read on, there is a bug in Umbraco when you follow the guide with regards to creating your own Model. You will get a bunch of ambiguous compile errors. Fortunately we don’t have to look much further than the awesome Umbraco forums to get an answer. The solution to the bug is outside the scope of the article, we’ll just copy and paste some code.

So, first we’ll create our new controller(DefaultController) that will override Umbraco’s. Inside this controller which runs on each page, we’ll check to see if the header exists (yes I could have done this on every single template). After that we are passing along our model that was inherited from RenderModel. This is what will populate the view. The CustomControllerFactory and CustomRenderActionInvoker are just addressing the issue about the ambiguous match and hopefully gets addressed in future versions.

    namespace MvcApplication1.Controllers
    {

        public class DefaultController : Umbraco.Web.Mvc.RenderMvcController
        {
            //
            // GET: /Default/

            public ActionResult Index(AngRenderModel model)
            {

                model.isApp = UmbracoContext.Current.HttpContext.Request.Headers["app"] != null;
                return base.Index(model);
            }

        }

        public class CustomControllerFactory : RenderControllerFactory
        {
            public override IController CreateController(RequestContext requestContext, string controllerName)
            {
                var instance = base.CreateController(requestContext, controllerName);
                var controllerInstance = instance as Controller;
                if (controllerInstance != null)
                {
                    controllerInstance.ActionInvoker = new CustomRenderActionInvoker();
                }

                return instance;
            }
        }
        public class CustomRenderActionInvoker : ControllerActionInvoker
        {
            protected override ActionDescriptor FindAction(ControllerContext controllerContext, ControllerDescriptor controllerDescriptor, string actionName)
            {
                var ad = base.FindAction(controllerContext, controllerDescriptor, actionName);
                if (ad == null)
                {
                    if (controllerContext.Controller is RenderMvcController)
                    {
                        return new ReflectedActionDescriptor(
                            controllerContext.Controller.GetType().GetMethods().First(x =>
                                x.Name == "Index" &&
                                !x.GetCustomAttributes(typeof(NonActionAttribute), false).Any()),
                            "Index",
                            controllerDescriptor
                        );
                    }
                }
                return ad;
            }
        }

    }

Now, the remaining steps are just from the guide about updating the global.asax to set the default controller for umbraco.

    namespace MvcApplication1
    {

        public class Global : UmbracoApplication
        {
            protected override void OnApplicationStarting(object sender, EventArgs e)
            {

                DefaultRenderMvcControllerResolver.Current.SetDefaultControllerType(typeof(DefaultController));
                IControllerFactory factory = new CustomControllerFactory();
                ControllerBuilder.Current.SetControllerFactory(new CustomControllerFactory());
                base.OnApplicationStarting(sender, e);
            }
        }
    }

Boom, now when our umbraco service executes a get against a url, it will return our angular template (assuming we have the condition).

One of the most common questions I’ve seen with regards to Angular apps is how the heck to manage linking to a page especially if it is in html 5 mode. We just need a few rules to handle it. Umbraco does come with a url rewriter, but I decided to use the Intelligencia Rewriter(nuget available). The reason is that I was going to rewrite based on a header which the default rewriter doesn’t support. Also, on a production system I’d probably use the IIS rewrite built in module so I’ll just provide you the rules I’m using and you can see how it fits into your implementation.

I am going to swing back to the front end and look at using a directive to produce some children. Let’s review our home page view. It needs to get a list of children, create a slider, and put the name on the page:

    @inherits Umbraco.Web.Mvc.UmbracoViewPage<App.Models.AngRenderModel>
    @{
        Layout = Model.isApp ? "Blank.cshtml" : "Static.cshtml";
    }

    @section Content {
        @if (Model.isApp)
        {
            <article umb-children="content.Id" cycle="{slides: '>div'}" style="clear: both">
                <div ng-repeat="slider in children">
                    <div>{{slider.Name}}</div>
                    <img umb-media="slider.Properties.image.DataValue" />
                </div>
            </article>
            <aside>
                <h3>{{content.Name}}</h3>
                <p ng-bind="html(content.body)"></p>
            </aside>    
        }
        else
        {
            <div>@Model.Content.Name</div>        
        }

    }

We have to do some directive trickery to get the children and have them be available. I should point out I think it might be easier to just create a controller that runs and populates some children but I decided to go the directive route. The three directives are: umbChildren, cycle, and umbMedia. I prefixed the umbraco calling directives with umb. Cycle is just setting up a jquery Cycle based on the children of the current node. Here is their code:

    app.directive('cycle', function($parse) {
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
        .directive('umbChildren', function (contentService, $compile) {
            return {
                restrict: 'A',
                priority: 1100,  // higher than  ng-repeat
                controller: function($scope) {
                    $scope.children = [];
                    $scope.isLoaded = false;
                    $scope.safeApply = function (fn) {
                        var phase = this.$root.$phase;
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

        });

I believe this pulls all the pieces together. Later this week, I will post the entire umbraco project on github based on one of the starter kits. I would love to hear your thoughts on what I’ve posted here or if you have some better ideas on where to take this.

## Source Code is on [github](https://github.com/sbosell/umbraco-hearts-angular).

A quick note about the project. I used the Starter Kit called Txt and the demo project demonstrates some of the scenarios outlined in this blog. It isn’t complete by any means nor is it exactly how I would build a particular app, but you should be able to take pieces (hopefully) and learn from it.
