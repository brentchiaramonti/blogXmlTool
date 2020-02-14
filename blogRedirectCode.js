$(document).ready(function(){
    var pagesToGet = [];
    var blogDictionary = {};
    var blogTitles = [];
    var lastPageInt;
    var results = [];
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
            
            displayCSV();
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

    function displayCSV(){
        var outputText = '';
        for(title in blogTitles){
            var newLink = makeLinkRelative(blogDictionary[blogTitles[title]]);
            var oldLink = convertOldLink(blogTitles[title]);
            outputText += oldLink + ',' + newLink + ',' + '301,exact\n';
        }
        console.log(outputText);
    }
    
    function makeLinkRelative(link){
        var splitArray = link.split('/blog/');
        return "/blog/" + splitArray[splitArray.length - 1];
    }

    function convertOldLink(currentTitle){
        
        //takes the title, replaces all white spaces with a -, then converts to lowercase
        currentTitle = currentTitle.replace(/\s+/g, '-').toLowerCase();
    
        //replaces all underscores _ with a -
        currentTitle = currentTitle.replace("_", "-");
    
        //removes all non alphanumerical characters but keeps dashes in place
        currentTitle = currentTitle.replace(/[^A-Za-z0-9-]/g,'');
    
        //outputs what the old link would have been based on the title given
        return "/blog/post/" + currentTitle + ".html";
    }

   function escapeQuotes(title) {
        return title.split('"').join('\"');
    }
});