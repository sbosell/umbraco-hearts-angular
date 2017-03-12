# Part III

The Source Code is on [github](https://github.com/sbosell/umbraco-hearts-angular).

*   [Umbraco Hearts Angular - A Series on building an SPA application](BLOG-POST-1.md)
*   [Umbraco Hearts Angular Part II - Web Api and Angular’s first date](BLOG-POST-2.md)
*   [Umbraco Hearts Angular Part III - Converting the TXT Starter Kit into an Angular App](BLOG-POST-3.md)

I outlined a few strategies on how to build an Angular application using Umbraco as a backend and wanted to make a few comments on my experience with the TXT Starter Kit. The starter kit is available for install in the installation process so it is easy to setup and get going.

The first thing I did was upgrade the `skelpanels` as they were throwing errors.

The TXT Starter kit probably wasn’t the best beginning point in building an Angular SPA (single page application) app, but the template is small and making the necessary changes wasn’t too hard. One of the first things I did was remove all of the dynamic properties on the views for their strongly typed ones.

Things such as `@CurrentPage.BodyText` became `@Model.Content.GetPropertyValue<string>("BodyText")` which wasn’t too hard. I’m just not a big fan of using dynamic properties (preference).

Secondly, and this was mentioned before, I could have built some static html templates with the same names as the Template Alias of a content node and used those in the angular app. This might have been a little cleaner but in the end I would be duplicating part of the Razor generated code anyways. It may not have been explained before, but because of some of the rewrite rules, when google visits the site, google will see and index the razor generated pages (instead of the angular ones). The user won’t see these pages because when they visit a url (ie /url ), it gets rewritten to /#!url which points back to our index/home. This happens because of the intelligencia rewrite module which allows us to define rules based on browser headers. As mentioned prior, you can use the IIS rewrite module as well for this but it won’t run in Visual Studio.

This starter kit contains a few partial views to render news items, the featured pages, and a couple others. I decided to make a directive for these that would “transclude” its contents and create a local scope. In the normal Angular transclude process, the transcluded contents actually get the parent scope which is why I put the quotes on the word. My implementation will include the contents, get the data (news Items for instance), and then use the contents of the directive’s element as its template in the directives isolated scope. This isn’t quite in line with how most Angular directive’s work, but it works in this case. You can review the contollers.js file at the bottom to see the list of directives. In retrospect I should have split these out into its own file (todo).

A little note about the umbMedia directive. This directive is to be used on an img tag and looks for a media id. I noticed that the TXT starter kit wasn’t storing its post images in the media section, so it isn’t be used.

The header and footer don’t change across pages, they don’t include much angular. The main navigation will set a class on the active page. You will always have some static parts of an app and not all of it needs to be dynamic.

There are a few things that can be tweaked. For instance, the data caching isn’t complete on things like descendants/etc. I should be caching those or even better putting them in localstorage which I might do in a future post.

This wraps up the Umbraco Hearts Angular posts.
