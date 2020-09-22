/*---------------------Webmanager blog importer code-----------------------*/

$(document).ready(function(){
    var pagesToGet = []; //Array to hold ajax get requests
    var blogDictionary = {}; //dictionary to hold title/url pairs
    var blogTitles = []; //Holds titles of blogs
    var lastPageInt; //variable to hold how many pages to pull
    var results = []; //array to hold responses from ajax get requests
    var blogXmls = []; //array to hold individual blog page xmls
    var domain = window.location.href.split('/'); //gets the main domain and splits it by the /
    var absolutePath = domain[0] + '//' + domain[2] + '/' + domain[3] + '/'; //puts together the absolute path for the blog page

    //checks to make sure this is the blog page
    if($('.blog').length){

    	//checks to see if there is a 'Last' button
        if($('.blog__pagination-item--last').length){

        	//if there is, grabs the number from its url so we know how many pages to process
            var lastPage = $('.blog__pagination-item--last > a').attr('href');
            var array = lastPage.split('/');
            lastPage = array[array.length - 1];
            lastPageInt = parseInt(lastPage, 10);
        }

        //If there is no 'Last' button, checks to see if there are any next or page buttons
        else if($('.blog__pagination-item').length){

        	//If there is, grabs the second to last button which is the last page
            var lastPage = $('.blog__pagination-item').last().prev().find('a').attr('href');
            //gets the number from the last page to know how many we need to process
            var array = lastPage.split('/');
            lastPage = array[array.length - 1];
            lastPageInt = parseInt(lastPage, 10);
        
        //If there are no next or last buttons, just sets it to 1 because there is only 1 page to process
        } else {
            lastPageInt = 1;
        }

        //Loops through every page
        for( var i = 1; i <= lastPageInt; i++){

        	//gets the path for the page and makes an ajax get request
            var url = absolutePath + "blog/page/" + i;

            //Pushes the request into the array, and puts the response in the results array
            pagesToGet.push($.get(url, function(data){results.push(data);}));
        }

        //When all AJAX requests have been completed
        $.when.apply($, pagesToGet).then(function(){

        	//Loops through each result
            for(result in results){

            	//and process each page to get all the links to each individual page
                getBlogLinks(results[result]);
            }
            
            //Once we have the link for each individual page, pulls and process each page
            getBlogs();

        });
    }
    
    
    /*
	Function that takes in list blog pages and gets every individual blog link on the page
	data: string, A response from an AJAX GET request
	No return, title/url pair is added to blogDictionary and blogTitles
    */
    function getBlogLinks(data) {

    	//Gets the title element
        $(data).find('.blog__post-title').each(function(){
            var title = $(this).text(); //Gets the title
            var url = $(this).attr('href'); //Gets the link
            title = escapeQuotes(title); //Escape quotes to prevent possible issues
            blogDictionary[title] = url; //adds to blog dictionary
            blogTitles.push(title); //adds to blogTitles
        });
    }

    /*
	Function to make ajax requests for every individual blog page
	No Input, uses global blogTitles and blogDictionary
	No return
    */
    function getBlogs(){
      var blog_results = []; //Array to hold AJAX request responses
      var blogPagesToGet = []; //Array to hold AJAX GET requets

      //Loops through every link in blogTitles
      for(link in blogTitles) {

      	//outputs the link to console for logging purposes
        console.log(blogDictionary[blogTitles[link]]);

        //Makes an ajax get request, adds it to the blogPagesToGet array
        blogPagesToGet.push($.get(blogDictionary[blogTitles[link]], function(data){
          generateXML(data); //When response is received, generates the xml for this blog
        }));
      }

      //When all requests are received and processed
      $.when.apply($, blogPagesToGet).then(function(){
        displayXML(); //outputs the xml to console
      });
    }
    
    /*
	Helper function to escape quotes
	title: String to have quotes inside escaped
	return: String
    */
    function escapeQuotes(title) {
        return title.split('"').join('\"');
    }


    
    /*
	Function that takes in an AJAX GET request result and creates the xml for the page
	blog_page: String, An AJAX GET request result
	No return: XML text is added as a string to the blogXMLs array
    */
    function generateXML(blog_page){
      var title = $(blog_page).find(".blog__post-title").html(); //gets the title
      var description = $(blog_page).find(".blog__post-content").html(); //gets the description
      var date = ''; //intializes the date
      var blog_url = blogDictionary[title]; //gets the url from the blog dictionary

      //Checks to see if there is a date
      if($(blog_page).find(".blog__post-creation-date").length){
        date = $(blog_page).find(".blog__post-creation-date").html().replace('posted: ', ''); //If there is gets the date
      } else {
        date = getCurrentDate(); //otherwise just sets todays date as the date of the post
      }

      var categories = []; //Array to hold the categories
      var tags = []; //Array to hold the tags

      //Gets every category and adds it to the array
      $(blog_page).find('.blog__post-category:contains(Category:) > a').each(function(){
        categories.push($(this).html());
      });

      //Gets every tag and adds it to the array
      $(blog_page).find('.blog__post-category:contains(Tags:) > a').each(function(){
        tags.push($(this).html());
      });

      var categoryText = ''; //variable to hold text for categories that will be added to the xml
      var tagText = ''; //variable to hold text for categories that will be added to the xml

      //Loops through every category
      for(var i = 0; i < categories.length; i++){

      	//if the category isn't uncategorized
        if(categories[i] != "Uncategorized"){
          categoryText = categoryText + '<category domain="category"><![CDATA[' + categories[i] + ']]></category>'; //adds the category to the category text
        }
      }

      //Loops through every tag
      for(var i = 0; i < tags.length; i++){

      	//If the tag isn't untagged
        if(tags[i] != "Untagged") {
          tagText = tagText + '<category domain="post_tag"><![CDATA[' + tags[i] + ']]></category>'; //adds the tag to the tag text
        }
      }

      //puts together the xml for this blog
      var text = "<item><title>" + title + "</title><link>" + blog_url + "</link><description><![CDATA[" + description + "]]></description><pubDate>" + date + "</pubDate>" + categoryText + tagText + "</item>";
      blogXmls.push(text); //adds it to the blog xml array
    }


    /*
	Helper function to calculate todays date
	Return: A string of the date in the form of month day, year
    */
    function getCurrentDate() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth();
      var yyyy = today.getFullYear();

      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return months[mm] + " " + dd + ", " + yyyy;
    }


    /*
	Function to put together the blog xml and output to console
	No Return
    */
    function displayXML() {
      var text = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>'; //sets the opening part of the xml

      //loops through every xml
      for(xml in blogXmls){
        text += blogXmls[xml]; //adds it to the text
      }
      console.log(text + "</channel></rss>"); //puts the end to the xml and outputs to the console
      
      //this is here to have the editor go back to the main blog page
      $.get(absolutePath + 'blog', function(data){});
    }

});

/*-------------------------end webmanager blog importer code---------------------------*/




