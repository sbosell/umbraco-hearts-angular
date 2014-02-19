using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web;
using Umbraco.Web.Models;
using Umbraco.Core.Models;

namespace App.Models
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
        public DateTime CreateDate { get; set; }

        public PageViewModel(IPublishedContent model)
        {
            Id = model.Id;
            Name = model.Name;
            Url = model.Url;
            Path = model.Path;
            ContentTypeAlias = model.ContentType.Alias;
            CreateDate = model.CreateDate;
            Template = model.GetTemplateAlias();
            TemplateId = model.TemplateId;
            Properties = new Dictionary<string,PropertyViewModel>();
            foreach(var x in model.Properties) {
                Properties.Add(x.PropertyTypeAlias, new PropertyViewModel() { DataValue = x.DataValue, HasValue = x.HasValue, PropertyTypeAlias = x.PropertyTypeAlias, Value = x.Value, XPathValue = x.XPathValue });
            }
            
        }

    }
}