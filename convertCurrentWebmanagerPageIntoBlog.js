$(document).ready(function(){

  var title = $(".page__title").html();
  var description = $(".wrap__page-content .editable").html();
  var date = getCurrentDate();
  var blog_url = window.location.href;


  var text = "<item><title>" + title + "</title><link>" + blog_url + "</link><description><![CDATA[" + description + "]]></description><pubDate>" + date + "</pubDate></item>";
  console.log(text);


function getCurrentDate() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth();
      var yyyy = today.getFullYear();

      var months = ['Januray', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return months[mm] + " " + dd + ", " + yyyy;
    }

});


