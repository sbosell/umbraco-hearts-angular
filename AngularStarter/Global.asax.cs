using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using Umbraco;
using Umbraco.Web;
using AngularStarter.Controllers;
using Umbraco.Web.Mvc;
using System.Web.Mvc;

namespace AngularStarter
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