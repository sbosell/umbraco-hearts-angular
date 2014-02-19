using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Umbraco.Web.PublishedCache.XmlPublishedCache;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json.Utilities;
using System.Globalization;
using Umbraco.Web;
using AngularStarter.Models;
using Umbraco.Web.Mvc;
using System.Web.Routing;

namespace AngularStarter.Controllers
{

    public class DefaultController : Umbraco.Web.Mvc.RenderMvcController
    {
        //
        // GET: /Default/

        public ActionResult Index(AngRenderModel model)
        {

            model.isApp = UmbracoContext.Current.HttpContext.Request.Headers["app"] != null;
            model.isBot = UmbracoContext.Current.HttpContext.Request.Headers["HTTP_USER_AGENT"] != null && UmbracoContext.Current.HttpContext.Request.Headers["HTTP_USER_AGENT"].ToLower().Contains("googlebot");
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
