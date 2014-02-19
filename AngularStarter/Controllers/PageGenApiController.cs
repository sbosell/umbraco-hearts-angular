using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using Umbraco.Web;
using Umbraco.Core.Models;
using Umbraco.Web.WebApi;
using App.Models;

namespace AngularStarter.Controllers
{
    public class UrlModel
    {
        public string url { get; set; }

    }

    public class IdModel
    {
        public string id { get; set; }
    }

    public class Query
    {
        public int parentId { get; set; }
        public string docType { get; set; }
        public string orderBy { get; set; }
        public string where { get; set; }

        
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

        [System.Web.Http.HttpPost, HttpGet]
        [AcceptVerbs("POST", "GET")]
        [AllowAnonymous]
        public List<PageViewModel> GetDescendants(Query q)
        {
            var parentNode = Umbraco.TypedContentAtRoot().First();

            if (q.parentId > -1)
            {
                parentNode = Umbraco.TypedContent(q.parentId); 
            }

            var results = parentNode.Descendants(q.docType).Where(x => x.IsVisible());

            if (!String.IsNullOrEmpty(q.orderBy))
            {
                results = results.OrderBy(q.orderBy);
            }
            if (!String.IsNullOrEmpty(q.where))
            {
                results = results.Where(q.where);
            }
            
            return results.Select(x => new PageViewModel(x)).ToList();
        }



    }
}
