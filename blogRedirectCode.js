var allLinks = [];
var text = "";


$(document).ready(function() {
    $.get("sitemap.xml", function(data){
		var links = $(data).find("loc").each(function(){
		    var link = $(this)[0].innerHTML;
		    
		    if(link.includes("/blog/")){
		       allLinks.push(link);
		    }
		});

        getTitle(0);
		
	});
});


function cleanLink(link){
    var array = link.split("/blog/");
    return "/blog/" + array[1];
}

function getTitle(i){
    console.log(allLinks[i]);
    
    $.get(allLinks[i], function(data){
        if(i < allLinks.length){
            var currentHTML = $.parseHTML(data);
            var currentTitle = $(currentHTML).find(".blog__post-title")[0].innerHTML;
            var newLink = cleanLink(allLinks[i]);
            i++;
            addToCSV(convertOldLink(currentTitle), newLink);
            getTitle(i);
        } else {
            outputText();
        }
    });
}

function addToCSV(oldLink, newLink){
    text = text + oldLink + "," + newLink + "," + "301,exact\n";
}

function convertOldLink(currentLink){
    
    currentLink = currentLink.replace(/\s+/g, '-').toLowerCase();
    currentLink = currentLink.replace("_", "-");
    currentLink = currentLink.replace(/[^A-Za-z0-9-]/g,'');

    return "/blog/post/" + currentLink + ".html";
}

function outputText(){
    console.log(text);
}

