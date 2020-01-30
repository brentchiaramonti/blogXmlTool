var allLinks = [];
var text = "";


//The main of the function. Runs when document is finished loading
$(document).ready(function() {

    //Gets the sitemap of the website and process it to get every link for each blog
    $.get("sitemap.xml", function(data){

    //Gets every link on the sitemap
    var links = $(data).find("loc").each(function(){
        var link = $(this)[0].innerHTML;
        
        //then checks if it is actually a blog link
        if(link.includes("/blog/")){

          //then adds it to the link array
           allLinks.push(link);
        }
    });

    //after all links are in an array, starts to process them
    getTitle(0);
    
  });
});

//Helper function that gets the extension of the link, specifically works with links that have /blog/ in it
function cleanLink(link){
    var array = link.split("/blog/");
    return "/blog/" + array[1];
}


//Processes each link
//Input, i: The current index in the allLinks array that will be processed
function getTitle(i){

  //outputs the current link being processed to the console
    console.log(allLinks[i]);
    

    //gets the page for the current link
    $.get(allLinks[i], function(data){

        //checks to see if the current is out of bounds of the array
        if(i < allLinks.length){

            //if it isn't,
            //Gets the html of the page
            var currentHTML = $.parseHTML(data);

            //gets the title of the page
            var currentTitle = $(currentHTML).find(".blog__post-title")[0].innerHTML;

            //gets link that should be redirected to
            var newLink = cleanLink(allLinks[i]);

            //gets the link to redirect from and adds it to the csv variable
            addToCSV(convertOldLink(currentTitle), newLink);

            //increments i
            i++;

            //and recursively checks the next link in the array
            getTitle(i);
        } else {
            //if there are no more links to proccess, outputs the text
            outputText();
        }
    });
}

//function that takes the redirect from and redirect to links and puts together the redirect link in csv format for uploading
function addToCSV(oldLink, newLink){
    text = text + oldLink + "," + newLink + "," + "301,exact\n";
}


//Converts a title to
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


//Outputs the text to the console
function outputText(){
    console.log(text);
}


