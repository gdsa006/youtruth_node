
// FIXED HEADER
window.onscroll = function() {myFunction()};

var header = document.getElementById("tiv-header");
var sticky = header.offsetTop;

function myFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
      if(!$('#overlay').hasClass('overlay'))
        header.classList.remove("sticky");
  }
}


// TRENDING CAROUSEL SCRIPT

// $('#trending_lists').owlCarousel({
// items:4,
// nav:true,
// dots:false,
// loop:true,
// autoplay:true,
// autoplayTimeout:4000,
// autoplayHoverPause:true,
// smartSpeed:1000,
// rtl:false,
// singleItem:true,
// margin:0,
// responsive:{
//     0:{
//         items:1
//     },
//     600:{
//         items:3
//     },
//     1000:{
//         items:4
//     }
// }
// })


// // LATEST CAROUSEL SCRIPT

// $('#latest_lists').owlCarousel({
// items:4,
// nav:true,
// dots:false,
// loop:true,
// autoplay:true,
// autoplayTimeout:4000,
// autoplayHoverPause:true,
// smartSpeed:1000,
// rtl:false,
// singleItem:true,
// margin:0,
// responsive:{
//     0:{
//         items:1
//     },
//     600:{
//         items:3
//     },
//     1000:{
//         items:4
//     }
// }
// })



// // TOP VIDEOS CAROUSEL SCRIPT

// $('#topvideos_lists').owlCarousel({
// items:4,
// nav:true,
// dots:false,
// loop:true,
// autoplay:true,
// autoplayTimeout:4000,
// autoplayHoverPause:true,
// smartSpeed:1000,
// rtl:false,
// singleItem:true,
// margin:0,
// responsive:{
//     0:{
//         items:1
//     },
//     600:{
//         items:3
//     },
//     1000:{
//         items:4
//     }
// }
// })


