using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web;

namespace AngularStarter.Models
{
    public class AngRenderModel : Umbraco.Web.Models.RenderModel
    {
        public bool isApp { get; set; }
        public bool isBot { get; set; }
        public AngRenderModel(): base(UmbracoContext.Current.PublishedContentRequest.PublishedContent)
        {

        }
    }
}