
/*---------------------Blog XML converter code----------------*/
var text = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>'; //Initializes the variable that will hold the output
var blogType; //Initializes blog type variable. Used to determine what divs to pull for the blog content
var pages = []; //Initializes array that will hold blog page get requests

/*----------MAIN-----------*/
$(document).ready(function() {

  //Makes sure that we are on the sitemap page before running, otherwise the code will not run
  $("#page-sitemap").each(function(){
    getVersion();
    getLinks();
  });
});


/*
Function to see which version of sitebuilder the website is.
Stores output in blogType variable
No Return
*/
function getVersion() {
    //Checks which divs exist. It then sets the blog type to match
  if($('#main-wrapper').length){
    blogType = "old";
  } else {
    blogType = "new";
  }

}


/*
Function to get the link for every blog page to pull
No Return
*/
function getLinks(){
  
  //If the blogtype is 'old', the program has to walk through every blog group pages as the actual individual blog page doesn't have all the information needed
  if(blogType == 'old'){
    walkBlog('/blog.html');

  //If the blog type is anything else
  } else {

    //Gets every h1 tag on the current page
    $("h1").each(function(){

      //finds the h1 tag with the text of "Posts"
      if($(this).text() == "Posts"){

        //Grabs the neighboring ul and finds the first child as this is the first blog to pull
        processLinks($(this).next("ul"));
      }
    });
  }
}


/*---------------------------Sitemap Blog Implementation--------------------------*/

/*
Function to process the links on the sitemap
Recursive function that runs on the next link until there are no more links, then outputs the text to the user
listElement: The ul with every link that needs to be processed
*/
function processLinks(listElement){

  //finds every link
  listElement.find("a").each(function(){
    var link = window.location.origin + $(this).attr('href');
    
    //Logs the current link being pulled
    console.log(link);

    //Creates a get AJAX request for current blog page.
    //Stores the request in in pagesToGet array
    //Sets callback function to process the data
    pages.push($.get(link, function(data){getXML(data);}));

  });

  //When all pages requests have come back, then...
  $.when.apply($, pages).then(function(){

    console.log(text + "</channel></rss>");

  });

}


/*
Function to process an Blog page to get the xml
data: The html of the page to be processed
No Return, adds text to text variable
*/
function getXML(data) {

  var title = $(data).find(".sbBlogPostTitle > h1 > a").html(); //gets the title
  var link = $(data).find(".sbBlogPostTitle > h1 > a").attr('href');
  link = link.replace(".edit.officite.com", ""); //gets the link and removes the editor part
  link = link.replace(".build.officite.com", ""); //gets the link and removes the build part
  var description = $(data).find(".sbBlogPostContent").html(); //gets the description
  description = fixPictureLinks(description); //Makes all picture links absolute

  //checks if there is a date and then pulls it
  if($(data).find(".sbBlogPostPublishDate").length){
    var date = $(data).find(".sbBlogPostPublishDate").html();
  } else {

    //if there is no date on the blog, sets todays date as the date of the blog
    date = getCurrentDate();
  }

  //Initializes categories and tags arrays
  var categories = [];
  var tags = [];

  //Processes each category and adds it to the category array
  $(data).find('.sbBlogPostCategories > a').each(function(){
    categories.push($(this).html());
  });

  //Processes each tag and adds it to the tag array
  $(data).find('.sbBlogPostTags > a').each(function(){
    tags.push($(this).html());
  });

  //Initializes text for categories and tags
  var categoryText = '';
  var tagText = '';

  //Loops through the category array
  for(var i = 0; i < categories.length; i++){

    //Makes sure the category isn't "Uncategorized" as that is a default category that we do not want to add
    if(categories[i] != "Uncategorized"){

      //Adds the category to the category text
      categoryText = categoryText + '<category domain="category"><![CDATA[' + categories[i] + ']]></category>';
    }
  }

  //Loops through the tags array
  for(var i = 0; i < tags.length; i++){

    //Makes sure the tag isn't "Untagged" as that is a default tag that we do not want to add
    if(tags[i] != "Untagged") {

      //Adds the tag to the tag text
      tagText = tagText + '<category domain="post_tag"><![CDATA[' + tags[i] + ']]></category>';
    }
  }

  //puts together the xml for the blog post
  var blogText = "<item><title>" + title + "</title><link>" + link + "</link><description><![CDATA[" + description + "]]></description><pubDate>" + date + "</pubDate>" + categoryText + tagText + "</item>";
  
  text = text + blogText;
}

/*-----------------End Sitemap Blog Implementation----------------------------------*/


/*---------------------Walk Blog Implementation--------------------------------------*/



/*
Walk Blog function. Instead of pulling the blog information from and individual page, this function pulls from the group blog page instead. 
Used for older designs that don't have all the necessary information on an individual blog page but does have the information on the group blog page.
Recursive code that processes each page then moves on to the next until all pages are pulled.
Outputs code to console once completed
*/
function walkBlog(link){
  console.log(link); //Logs which link is currently being processed
  if(typeof link == 'undefined'){ //If the current link is undefined
     console.log(text + "</channel></rss>"); //Takes the xml text, adds the closing tags and outputs it to the user
     return; //Returns as this function is now complete
  }

  //If the link is not undefined

  //Loads the blog posts into the output div to be processed
  $.get(link, function(data){

    //once the ajax commend is finished, processes the blogs in the output div
    walkBlogGetXmls(data);

    //Grabs the link in the output div that goes to the next page
    var nextLink = $(data).find('#sbBlogPager a:contains("Older")');

    //reruns this function on the next page
    walkBlog(nextLink.attr('href'));
  });
}

/*
Function to process the group of blogs
Saves data into higher scoped text variable
No return
*/
function walkBlogGetXmls(data){

  //Within the output, processes each blog post
  $(data).find('.sbBlogPost').each(function(){
    var title = $(this).find('.sbBlogPostTitle > h1 > a').html(); //Gets the title
    var link = $(this).find('.sbBlogPostTitle > h1 > a').attr('href'); //Gets the link to the blog page
    var description = $(this).find(".sbBlogPostContent").html(); //Gets the content of the blog page
    description = fixPictureLinks(description); //Makes all img links in the descripting be absolutely linked
    var date = $(this).find(".sbBlogPostPublishDate").html(); //Gets the date the blog was posted

    //Initializes arrays for categories and tags
    var categories = [];
    var tags = [];

    //Loops through each category
    $(this).find('.sbBlogPostCategories > a').each(function(){
      //Adds it to the category array
      categories.push($(this).html());
    });

    //Loops through each tag
    $(this).find('.sbBlogPostTags > a').each(function(){
      //Adds it to the tag array
      tags.push($(this).html());
    });

    //Initializes variables for category and tag text to add to the xml
    var categoryText = '';
    var tagText = '';

    //Loops through the category array
    for(var i = 0; i < categories.length; i++){

      //Makes sure the category isn't "Uncategorized" as that is a default category that we do not want to add
      if(categories[i] != "Uncategorized"){

        //Adds the category to the category text
        categoryText = categoryText + '<category domain="category"><![CDATA[' + categories[i] + ']]></category>';
      }
    }

    //Loops through the tags array
    for(var i = 0; i < tags.length; i++){

      //Makes sure the tag isn't "Untagged" as that is a default tag that we do not want to add
      if(tags[i] != "Untagged") {

        //Adds the tag to the tag text
        tagText = tagText + '<category domain="post_tag"><![CDATA[' + tags[i] + ']]></category>';
      }
    }

    //Adds this blog to the xml
    text = text + "<item><title>" + title + "</title><link>" + link + "</link><description><![CDATA[" + description + "]]></description><pubDate>" + date + "</pubDate>" + categoryText + tagText + "</item>";

  });
}

/*------------------------------------End Walk Blog Implementation------------------------------*/

/*----------------------Helper functions----------------------*/

/*
Certain blogs don't have a date set. If this is the case, calculates todays date, formats it and returns it
Return: Todays date in the format of Month dd, yyyy
*/
function getCurrentDate() {
  var today = new Date(); //makes new date object
  var dd = today.getDate(); //gets the day of the month
  var mm = today.getMonth(); //gets the month
  var yyyy = today.getFullYear(); //gets the year

  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return months[mm] + " " + dd + ", " + yyyy;
}


/*
Function to make picture links absolute in a block of text
contentText: String, the text that will have the img tags inside fixed
Return: String of the text with the updated links
*/
function fixPictureLinks(contentText){

  //gets the domain
  var link = window.location.origin;

  //Removes extra spaces before and after the text
  contentText = contentText.trim();

  //Replaces text with the absolute link. Does it only if there is a /images/ or /sbtemplates in the url
  contentText = contentText.split("=\"/images/").join("=\"" + link + "/images/");
  contentText = contentText.split("=\"/sbtemplates").join("=\"" + link + "/sbtemplates");

  //returns the updated text
  return contentText;
}
/*---------------------End Helper Functions------------------------*/

/*---------------------End Blog XML converter code----------------*/






