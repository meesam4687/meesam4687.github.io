$(document).ready(function(){
    $(".pfpimg").hover(
        function(){
            $('.pfpText').css('display', 'block');
            $('.pfpText').animate({opacity: 1}, 10);
        },
        function(){
            $('.pfpText').animate({opacity: 0}, 10);
        }
    );
});