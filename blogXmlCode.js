
/*---------------------Blog XML converter code----------------*/
var text = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>';
var blogType = "new";

$(document).ready(function() {
  $("#page-sitemap").each(function(){
    $(this).append("<div id='output' style='display:none!important'></div>");
    getLinks();
  });
});

function getLinks(){
  
  if($('#main-wrapper').length){
    blogType = "old";
  } else if($('#content').length) {
    blogType = "3";
  } else if($('#intRight').length){
    blogType = "4";
  } else if($('.main-content').length){
    blogType = "5";
  } else if($('#index_contentInt').length){
  	blogType = "6";
  }

  var array = [];
  $("h1").each(function(){
    if($(this).text() == "Posts"){
      processLinks($(this).next("ul").find("li:first-child"));
    }
  });
}


function processLinks(listElement){



  var link = window.location.origin + listElement.find("a").attr('href');

  if( link == window.location.origin + "undefined"){
    console.log(text + "</channel></rss>");
    return;
  }

  console.log(link);

  if(blogType == "old"){
    $("#output").load(link + " .content", function(){
      text = text + getXMLOldDesign(link);
      processLinks($(listElement).next('li'));
    });
  } else if(blogType == "new") {
    $("#output").load(link + " #slot-main", function(){
      text = text + getXML(link);

      processLinks($(listElement).next('li'));
    });
  } else if (blogType == "3") {
    $("#output").load(link + " #content", function(){
      text = text + getXML(link);
      processLinks($(listElement).next('li'));
    });
  } else if (blogType == "4") {
    $("#output").load(link + " #intRight", function(){
      text = text + getXML(link);
      processLinks($(listElement).next('li'));
    });
  } else if (blogType == "5") {
  	$("#output").load(link + " .main-content", function(){
      text = text + getXML_5(link);
      processLinks($(listElement).next('li'));
    });
  } else if (blogType == "6") {
  	$("#output").load(link + " #index_contentInt", function(){
      text = text + getXML(link);
      processLinks($(listElement).next('li'));
    });
  }
}

function getXMLOldDesign(link) {
  var title = $("#output #title").html();
  link = link.replace(".edit.officite.com", "");
  link = link.replace(".build.officite.com", "");
  var description = $("#output #slot-main").html();
  description = fixPictureLinks(description);
  var date = getCurrentDate();
  var text = "<item><title>" + title + "</title><link>" + link + "</link><description><![CDATA[" + description + "]]></description><pubDate>" + date + "</pubDate></item>";
  return text;
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
  var title = $(".sbBlogPostTitle > h1 > a").html();
  link = link.replace(".edit.officite.com", "");
  link = link.replace(".build.officite.com", "");
  var description = $(".sbBlogPostContent").html();
  description = fixPictureLinks(description);
  var date = $(".sbBlogPostPublishDate").html();

  var categories = [];
  var tags = [];

  $('.sbBlogPostCategories > a').each(function(){
  	categories.push($(this).html());
  });

  $('.sbBlogPostTags > a').each(function(){
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

function getXML_5(link) {
  var title = $("#output .print-header").html();
  link = link.replace(".edit.officite.com", "");
  link = link.replace(".build.officite.com", "");
  var description = $(".sbBlogPostContent").html();
  description = fixPictureLinks(description);
  var date = getCurrentDate();
  var categories = [];
  var tags = [];

  $('.sbBlogPostCategories > a').each(function(){
  	categories.push($(this).html());
  });

  $('.sbBlogPostTags > a').each(function(){
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


function fixPictureLinks(contentText){
  var link = window.location.origin;

  contentText = contentText.split("=\"/images/").join("=\"" + link + "/images/");
  return contentText;
}
/*---------------------End Blog XML converter code----------------*/


