$(document).ready(function(){
    var pagesToGet = []; //Array that will hold the page ajax requests
    var blogDictionary = {}; //A dictionary object that will hold every blog title / url pair.
    var blogTitles = []; //An array that holds every blog title to look up in the dictionary.
    var lastPageInt; //an int to hold how many pages need to be processed
    var results = []; //Array that will hold the results from the AJAX GET requests
    var domain = window.location.href.split('/'); //grabs the current domain
    var absolutePath = domain[0] + '//' + domain[2] + '/' + domain[3] + '/'; //The absolute path that will be put in front of all blog page urls for the redirect
    
    //Checks to make sure this is the blog page
    if($('.blog').length){

        //Checks to see if a "Last" button exists
        if($('.blog__pagination-item--last').length){

            //if one does, grabs the page and gets the number from it to know how many pages need to be pulled
            var lastPage = $('.blog__pagination-item--last > a').attr('href');
            var array = lastPage.split('/');
            lastPage = array[array.length - 1];
            lastPageInt = parseInt(lastPage, 10);
        }

        //if there isn't a "Last" button, checks to see if there is a button for another page
        else if($('.blog__pagination-item').length){

            //if there is, gets the item, finds the last link in the list, goes back one (the real last button is the "next" button), and gets its href
            var lastPage = $('.blog__pagination-item').last().prev().find('a').attr('href');
            
            //then gets the number of the page so we know how many pages to process
            var array = lastPage.split('/');
            lastPage = array[array.length - 1];
            lastPageInt = parseInt(lastPage, 10);

        //If there are no buttons at all, just sets the amount of pages to 1
        } else {
            lastPageInt = 1;
        }

        //Loops through every page starting at 1
        for( var i = 1; i <= lastPageInt; i++){

            //makes the link
            var url = absolutePath + "blog/page/" + i;

            //And does an AJAX GET request, storing the request in pagesToGet, and storing the data in the results array
            pagesToGet.push($.get(url, function(data){results.push(data);}));
        }

        //When all requests have received responses
        $.when.apply($, pagesToGet).then(function(){

            //loops through each result
            for(result in results){

                //and gets the redirect
                getBlogLinks(results[result]);
            }
            
            //Once all redirects have been set up, outputs the result to console
            displayCSV();
        });
    }
    
    /*
    Function to get the page title / url pair and add them to the blogDictionary and blogTitles array.
    data: String from AJAX GET request
    No Return, modifies blogDictionary and blogTitles global variables
    */
    function getBlogLinks(data) {

        //processes each title on the page
        $(data).find('.blog__post-title').each(function(){
            var title = $(this).text(); //Gets the title
            var url = $(this).attr('href'); //gets the url from the href
            title = escapeQuotes(title); //Replaces " with \" to prevent issues when displaying
            blogDictionary[title] = url; //Adds the url to the dictionary with the title as the key
            blogTitles.push(title); //adds the title to the array
        });
    }

    /*
    Function to create the csv file text and output it to console
    No input, utalizes global variables
    No return
    */
    function displayCSV(){
        var outputText = ''; //initalizes the output
        //goes through each title
        for(title in blogTitles){

            //gets the new link from the blogDictionary and makes it relative
            var newLink = makeLinkRelative(blogDictionary[blogTitles[title]]);

            var oldLink = convertOldLink(blogTitles[title]); //creates the old link based on the title
            outputText += oldLink + ',' + newLink + ',' + '301,exact\n'; //adds the csv for the title/url pair to the output text variable
        }
        console.log(outputText); //Outputs the result to console
    }
    

    /*
    Helper function to make a link relative for the csv
    link: A string that is a absolute linked url
    Return: A string of the url linked relatively
    */
    function makeLinkRelative(link){
        var splitArray = link.split('/blog/'); //splits the link using /blog/
        return "/blog/" + splitArray[splitArray.length - 1]; //adds back the /blog/ and only adds back the second half, thus making the link relative
    }

    /*
    Takes a title and converts it into what the url for on the old editor would be.
    currentTitle: A string of the title to be converted
    Return: A string of the converted url
    */
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

    /*
    Takes in a string and adds \ in front of every quote to prevent possible issues
    title: String to be processed
    return: string
    */
    function escapeQuotes(title) {
        return title.split('"').join('\"');
    }
});






