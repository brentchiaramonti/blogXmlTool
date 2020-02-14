/*---------------------Webmanager blog importer code-----------------------*/

$(document).ready(function(){
    var pagesToGet = [];
    var blogDictionary = {};
    var testDict = {}
    var blogTitles = [];
    var lastPageInt;
    var results = [];
    var blogXmls = [];
    var domain = window.location.href.split('/');
    var absolutePath = domain[0] + '//' + domain[2] + '/' + domain[3] + '/';

    if($('.blog').length){
        if($('.blog__pagination-item--last').length){
            var lastPage = $('.blog__pagination-item--last > a').attr('href');
            var array = lastPage.split('/');
            lastPage = array[array.length - 1];
            lastPageInt = parseInt(lastPage, 10);
        }
        else if($('.blog__pagination-item').length){
            var lastPage = $('.blog__pagination-item').last().prev().find('a').attr('href');
            var array = lastPage.split('/');
            lastPage = array[array.length - 1];
            lastPageInt = parseInt(lastPage, 10);
        } else {
            lastPageInt = 1;
        }

        for( var i = 1; i <= lastPageInt; i++){
            var url = absolutePath + "blog/page/" + i;
            pagesToGet.push($.get(url, function(data){results.push(data);}));
        }
        $.when.apply($, pagesToGet).then(function(){
            for(result in results){
                getBlogLinks(results[result]);
            }
            
            getBlogs();

        });
    }
    
    
    
    function getBlogLinks(data) {
        $(data).find('.blog__post-title').each(function(){
            var title = $(this).text();
            var url = $(this).attr('href');
            title = escapeQuotes(title);
            blogDictionary[title] = url;
            blogTitles.push(title);
        });
    }

    function getBlogs(){
      var blog_results = [];
      var blogPagesToGet = [];
      for(link in blogTitles) {
        console.log(blogDictionary[blogTitles[link]]);
        blogPagesToGet.push($.get(blogDictionary[blogTitles[link]], function(data){
          generateXML(data);
        }));
      }

      $.when.apply($, blogPagesToGet).then(function(){
        displayXML();
      });
    }
    
    function escapeQuotes(title) {
        return title.split('"').join('\"');
    }


    
    function generateXML(blog_page){
      var title = $(blog_page).find(".blog__post-title").html();
      var description = $(blog_page).find(".blog__post-content").html();
      var date = '';
      var blog_url = blogDictionary[title];

      if($(blog_page).find(".blog__post-creation-date").length){
        date = $(blog_page).find(".blog__post-creation-date").html().replace('posted: ', '');
      } else {
        date = getCurrentDate();
      }

      var categories = [];
      var tags = [];

      $(blog_page).find('.blog__post-category:contains(Category:) > a').each(function(){
        categories.push($(this).html());
      });

      $(blog_page).find('.blog__post-category:contains(Tags:) > a').each(function(){
        tags.push($(this).html());
      });

      var categoryText = '';
      var tagText = '';

      for(var i = 0; i < categories.length; i++){

        if(categories[i] != "Uncategorized"){
          categoryText = categoryText + '<category domain="category"><![CDATA[' + categories[i] + ']]></category>';
        }
      }

      for(var i = 0; i < tags.length; i++){
        if(tags[i] != "Untagged") {
          tagText = tagText + '<category domain="post_tag"><![CDATA[' + tags[i] + ']]></category>';
        }
      }

      var text = "<item><title>" + title + "</title><link>" + blog_url + "</link><description><![CDATA[" + description + "]]></description><pubDate>" + date + "</pubDate>" + categoryText + tagText + "</item>";
      blogXmls.push(text);
    }


    function getCurrentDate() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth();
      var yyyy = today.getFullYear();

      var months = ['Januray', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return months[mm] + " " + dd + ", " + yyyy;
    }


    function displayXML() {
      var text = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>';

      for(xml in blogXmls){
        text += blogXmls[xml];
      }
      console.log(text + "</channel></rss>");
      
      //this is here to have the editor go back to the main blog page
      $.get(absolutePath + 'blog', function(data){});
    }

    function displayList() {
        var text = "<h2>Blogs</h2><ul class='sitemap__list blog_list'>"
        blogTitles = blogTitles.sort();
        for(var i = 0; i < blogTitles.length; i++) {
            var title = blogTitles[i];
            var url = blogDictionary[title];
            text += "<li><a href='" + url + "'>" + title + "</a></li>"
        }
        text += "</ul>";
        $('.sitemap__list.level-1').after(text);
    }
});

/*-------------------------end webmanager blog importer code---------------------------*/


