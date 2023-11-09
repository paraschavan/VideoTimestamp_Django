function play(start) {
    document.getElementById('player').currentTime = start
}

var per = 0.80;
var chk;

$("#percentage").on("input", function () {
    per = parseFloat($(this).val()) / 100;
});
var currentTrack;
var currentIndex;
var st = document.getElementById("searchText");
st.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        go()
    }
});

function go() {
    if (response && response.data) {
        $('#data').remove();
        $('#timeStamp').append(`<div id="data"> </div>`);
        var videoElement = document.querySelector("video");
        var textTracks = videoElement.textTracks;
        currentTrack = textTracks
        for (let i = 0; i < textTracks.length; i++) {
            // console.log(textTracks[i].mode)
            if (textTracks[i].mode == 'showing') {
                currentIndex = i
                break;
            }
        }
        var search = document.getElementById('searchText').value;
        console.log(currentIndex);
        console.log(search);
        console.log(per);
        for (var i = 0; i < textTracks[currentIndex].cues.length; i++) {
            chk = check(textTracks[currentIndex].cues[i].text.replace(/\s+/g, ' ').trim(), search.replace(/\s+/g, ' ').trim())
            if (chk > per) {
                var base = `<div onclick="play(${textTracks[currentIndex].cues[i].startTime})" class="cursor-pointer flex mb-1 items-start rounded-xl bg-white p-4 shadow-lg">
                                    <div class="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-400"
                                             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <h2 class="font-semibold">${(chk * 100).toFixed(2)}% Match.</h2>
                                        <p class="mt-2 text-sm text-gray-500">${textTracks[currentIndex].cues[i].text}</p>
                                    </div>
                                </div>`
                $('#data').append(base)
                // console.log(check(textTracks[currentIndex].cues[i].text.replace(/\s+/g, ' ').trim(), search.replace(/\s+/g, ' ').trim()))
                // console.log(textTracks[currentIndex].cues[i].text);
                // document.getElementById('player').currentTime = textTracks[currentIndex].cues[i].startTime
            }
        }
    }
}

$('#search').click(function () {
    go();
});
$('#addVideosBtn').click(function () {
    $(this).parents().find('#addVideosInput').click();
});

$('#resetbtn').click(function () {
    document.getElementById("upF").reset()
    $('#vli').remove();
});

$("#up").click(function () {
    $('#upF').submit();
});
$("#upF").submit(function (event) {
    event.preventDefault();
    if (document.getElementById("addVideosInput").files.length > 0) {
        $("#up").prop("disabled", true);
        $("#addVideosBtn").prop("disabled", true);
        uploadFile();
    } else {
        $(this).parents().find('#addVideosInput').click();
        document.getElementById("upF").reset()
        $('#vli').remove();
        $('#up').hide();
    }

});
var videoURL;
document.getElementById('addVideosInput').onchange = e => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    videoURL = url
    const ele = `<div id="vli" class="container">
            <video controls crossorigin playsinline id="player" class="embed-responsive-item top-0 right-0 bottom-0 left-0 w-full h-full">
            <source src="${url}" type="video/mp4">
           </video></div>`
    $('#vli').remove();
    $('#add-video').append(ele);
    $("#up").show();
}


function _(el) {
    return document.getElementById(el);
}

function uploadFile() {
    var file = _("addVideosInput").files[0];
    console.log(file.name + " | " + file.size + " | " + file.type);
    var formdata = new FormData();
    formdata.append("video", file)
    var csrf = $("input[name=csrfmiddlewaretoken]").val();
    formdata.append("csrfmiddlewaretoken", csrf);
    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);
    ajax.open("POST", ".");
    ajax.send(formdata);
}

function progressHandler(event) {
    // _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
    var percent = (event.loaded / event.total) * 100;
    _("progressBar").value = Math.round(percent);
    // _("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
}

var response;

function completeHandler(event) {
    $("#up").removeAttr('disabled');
    $("#addVideosBtn").removeAttr('disabled');
    response = JSON.parse(event.target.responseText);
    if (response.data) {
        const highlightedItems = document.querySelectorAll("track");
        highlightedItems.forEach((track) => {
            track.remove();
        });
    }
    for (var num in response.data) {
        var lg = response.data[num].lg[0]
        console.log(lg)
        var blob = window.URL.createObjectURL(new Blob([response.data[num].lg[1]], {type: "text/vtt;charset=UTF-8"}));
        var tag = document.createElement("track");
        tag.kind = "captions"
        tag.label = lg
        tag.srclang = num
        tag.src = blob
        document.getElementById("player").appendChild(tag)
    }
    var videoElement = document.querySelector("video");
    var textTracks = videoElement.textTracks;
    currentTrack = textTracks
    for (let i = 0; i < textTracks.length; i++) {
        textTracks[i].mode = 'disabled';
    }
    if (response.data.length>0) {
        textTracks[0].mode = 'showing';
        $('#data').remove();
        $('#timeStamp').append(`<div id="data">
<h2>The video is uploading on S3 in background and will be available on this link in short time</h2>
<a class="text-yellow-600" href="https://v2s.s3.ap-northeast-1.amazonaws.com/static/video/${response.video}">https://v2s.s3.ap-northeast-1.amazonaws.com/static/video/${response.video}</a>
<h2>The subtitle is uploading on DyanmoDB and will be available on this link in short time</h2>
<a class="text-yellow-600" href="https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com/v1/v2s?video=${response.subtitle}">https://dvwu2a9yx1.execute-api.ap-northeast-1.amazonaws.com/v1/v2s?video=${response.subtitle}</a>
<h2>Search the text in subtitle using below search bar and use the percentage field to change match percentage</h2>
<h2>Use the below link to access you video and subtitle in future</h2>
<a class="text-yellow-600" href="/video/${response.ins}/">/video/${response.ins}/</a>
</div>`);
    }
    // _("loaded_n_total").innerHTML = "☺";
    alert(response.message)
    // _("status").innerHTML = '<h4>Done</h4>'
    _("progressBar").value = 0;

}

function errorHandler(event) {
    // _("status").innerHTML = "Upload Failed";
    alert('Upload Failed')
}

function abortHandler(event) {
    // _("status").innerHTML = "Upload Aborted";
    alert('Upload Aborted')
}

function check(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
