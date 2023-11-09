const ele = `<div id="vli" class="container h-full w-full">
            <iframe id="vli" class="h-full w-full" src=" ${url}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
$('#add-video').append(ele);
var sub;
// $.ajax({
//     type: "GET",
//     url: `https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com/v1/v2s?video=${name}`,
//     success: function (data) {
//         sub = JSON.parse(data);
//     }
// });

// $.ajax({
//     type: "GET",
//     dataType: "jsonp",
//     url: `https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com/v1/v2s?video=${name}`,
//     headers: {Accept: "application/json;charset=utf-8", "Content-Type": "application/json;charset=utf-8","Access-Control-Allow-Origin":"http://127.0.0.1:8000"},
//     success: function (resp) {
//         var rep = JSON.parse(resp);
//         console.log(rep);
//     }
// });

// $(document).ready(function () {
//     console.log('Start')
//     $.ajax({
//         type: 'GET',
//         dataType: "jsonp",
//         url: `https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com/v1/v2s?video=${name}`,
//         success: function (data) {
//             console.log('Done')
//             alert(data);
//         }
//     });
//     console.log('ENd')
// });

// var formdata = new FormData();
// var ajax = new XMLHttpRequest();
// formdata.append('Access-Control-Allow-Origin','https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com')
// ajax.addEventListener("load", completeHandler, false);
// ajax.open("GET", `https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com/v1/v2s?video=${name}`);
// ajax.send(formdata);
//
// function completeHandler(event) {
//     response = JSON.parse(event.target.responseText);
//     console.log(response)
// }
var response;
$.ajax({
    type: "get",
    url: `https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com/v1/v2s?video=${name}`,
    contentType: "application/json",
    dataType: "html",
    success: function () {
        alert('Success');
    },
    error: function () {
        alert('Error');
    },
    complete: function (event) {
        // Handle the complete event
        response = JSON.parse(event.target.responseText);
        console.log(response)
        alert('Complete');
    }
});  // end Ajax