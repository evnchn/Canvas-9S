debug_mode = false;

var ongoing_scan = false;

function log_debug(input_log) {
    if (debug_mode) {
        console.log(input_log);
    }
}
// my stupid little logging module, good enough!

var observeDOM = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1) return;

        if (MutationObserver) {
            // define a new observer
            var mutationObserver = new MutationObserver(callback)

            // have the observer observe for changes in children
            mutationObserver.observe(obj, { childList: true, subtree: true })
            return mutationObserver
        }

        // browser support fallback
        else if (window.addEventListener) {
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)
        }
    }
})()
// https://stackoverflow.com/a/14570614

observeDOM(document.body, function () {

    console.log("body changed");
    // https://stackoverflow.com/a/21453183
    var myATags = document.getElementsByTagName("a");
    for (var i = 0; i < myATags.length; i++) {

        if (myATags[i].innerHTML == 'All My Files') {

            myATags[i].innerHTML = "Find 9S for help";
            myATags[i].classList.add("commschannel")
            myATags[i].onclick = function (e) {
                e.preventDefault();
                if (!ongoing_scan) {
                    fetch_all_zip(location.href.replace("/files", "").split("/").slice(-1)[0], function (txt_in) {
                        commschannel_elem = document.getElementsByClassName("commschannel")[0];
                        commschannel_elem.innerHTML = txt_in;

                    });
                }


            }

        }

    }
})

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
// https://www.w3schools.com/js/js_cookies.asp
// Almost world-famous in JS Cookie Manipulation

function fetch_all_zip(course_id, output_function = (console.log)) {
    ongoing_scan = true;
    output_function("Scanning...");
    fetch('https://canvas.ust.hk/api/v1/courses/' + course_id + '/content_exports', {
        method: 'POST',
        headers: {
            'x-csrf-token': getCookie("_csrf_token"),
            'x-requested-with': 'XMLHttpRequest'
        },
        body: new URLSearchParams({
            'export_type': 'zip'
        })
    }).then((response) => response.json())
        .then((data) => {
            log_debug(data);

            function fetch_url_or_log_progress() {
                const request = new XMLHttpRequest();
                request.open('GET', data["progress_url"], false);  // `false` makes the request synchronous
                // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests

                request.setRequestHeader('x-csrf-token', getCookie("_csrf_token"));
                // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader

                request.send(null);

                if (request.status == 200) {
                    var jsonResponse = JSON.parse(request.responseText);
                    log_debug(jsonResponse);
                    output_function("Scanning: " + jsonResponse.completion + "%");
                    if (jsonResponse.completion == 100.0) {
                        return true
                    } else {
                        return fetch_url_or_log_progress();
                        // be sure to `return` to avoid literal stack overflow
                    }
                }

            }
            fetch_url_or_log_progress();

            fetch('https://canvas.ust.hk/api/v1/courses/' + course_id + '/content_exports/' + data["id"], {
                headers: {
                    'x-csrf-token': getCookie("_csrf_token"),
                    'x-requested-with': 'XMLHttpRequest'
                }
            }).then((response_final) => response_final.json())
                .then((data_final) => {
                    log_debug(data_final);
                    console.log(data_final.attachment.url);
                    // https://stackoverflow.com/a/8726513
                    /*var ifrm = document.createElement("iframe");
                    ifrm.setAttribute("src", data_final.attachment.url);
                    ifrm.style.display = "none";
                    document.body.appendChild(ifrm);*/
                    // Doesn't seem elegant to pop iframe

                    // https://stackoverflow.com/a/49917066
                    var link = document.createElement('a');
                    link.href = data_final.attachment.url;
                    link.click();
                    output_function("2B-san, hope it helped :)");
                    ongoing_scan = false;
                });
        });
}