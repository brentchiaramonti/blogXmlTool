
/*---------------------Blog XML converter code----------------*/
var text = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>';
var allLinks = [];


$(document).ready(function() {
    $('body').append("<div id='output' style='display:none!important'></div>");
    getLinks();
});

function getLinks(){
  
 //Gets the sitemap of the website and process it to get every link for each blog
    $.get("sitemap.xml", function(data){
    //Gets every link on the sitemap
    $(data).find("loc").each(function(){
        var link = $(this)[0].innerHTML;
        
        //then checks if it is actually a blog link
        if(link.includes("/blog/")){

          //then adds it to the link array
           allLinks.push(link);
        }
    });

    //after all links are in an array, starts to process them
    processLinks(0);
    
  });
}


function processLinks(index){


  if(index < allLinks.length){
      var link = allLinks[index];

      console.log(link);

      $("#output").load(link + " .blog__post", function(){
        text = text + getXML(link);
        processLinks(index + 1);
      });
    } else {
      console.log(text + "</channel></rss>");
        return;
    }
}


function getCurrentDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth();
  var yyyy = today.getFullYear();

  var months = ['Januray', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return months[mm] + " " + dd + ", " + yyyy;
}

function getXML(link) {
  var title = $(".blog__post-title").html();
  var description = $(".blog__post-content").html();
  var date = '';

  if($(".blog__post-creation-date").length){
    date = $(".blog__post-creation-date").html().replace('posted: ', '');
  } else {
    date = getCurrentDate();
  }

  var categories = [];
  var tags = [];

  $('.blog__post-category:contains(Category:) > a').each(function(){
    categories.push($(this).html());
  });

  $('.blog__post-category:contains(Tags:) > a').each(function(){
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

  var text = "<item><title>" + title + "</title><link>" + link + "</link><description><![CDATA[" + description + "]]></description><pubDate>" + date + "</pubDate>" + categoryText + tagText + "</item>";
  return text;
}




/*---------------------End Blog XML converter code----------------*/



