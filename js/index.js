function CreateHeading(len) {
    var para = document.createElement("P");
    var t;
    if(len==1)
        t = document.createTextNode(len+" video found");
    else
        t = document.createTextNode(len+" videos found");
    // para.setAttribute("style","color:#eff913");
    para.appendChild(t);
    document.getElementById("heading").appendChild(para);
}

function Create(name,url,i,resultData,text1) {
    var row_master_div = document.createElement("div");
    row_master_div.classList.add("videoSearch");

    var vid_master_div = document.createElement("div");
    vid_master_div.classList.add("videoDiv");

    var details_master_div = document.createElement("div");
    details_master_div.classList.add("videoDetailsDiv");

    var v_name = document.createElement("P");
    var t = document.createTextNode((i+1) + ". " + name+"\n");
    v_name.appendChild(t);
    v_name.setAttribute("style","font-weight: bold; font-size: 130%");
    vid_master_div.appendChild(v_name);

    var ifrm = document.createElement("video");
    ifrm.id="iframe"+i;
    ifrm.controls="true";
    ifrm.setAttribute("src",url);
    ifrm.setAttribute("style","height:280px; width:500px; padding-bottom:10px;}");
    vid_master_div.appendChild(ifrm);

    var leftDiv = document.createElement("div");                   //Create left div
    leftDiv.id = "left";                                           //Assign div id
    a = document.createElement('a');
    a.href = url;
    a.innerHTML = "Get Video";                //<a>INNER_TEXT</a>
    leftDiv.appendChild(a);  // Append the link to the div
    // document.body.appendChild(leftDiv);

    vid_master_div.appendChild(leftDiv);
    row_master_div.appendChild(vid_master_div);

    if (null != resultData.hits.hits[i].inner_hits) {
        var len1=resultData.hits.hits[i].inner_hits.subtitle.hits.hits.length;
        leftDiv.setAttribute("style","padding-bottom:10px;");
        var t2 = document.createTextNode(" GO TO TIME :-");
        row_master_div.appendChild(t2);
        row_master_div.setAttribute("style","font-weight: bold;");
        var div1= document.createElement("div");
        var sub= document.createElement("p");
        sub.id="sub"+i;
        row_master_div.appendChild(sub);
        for(var j=0;j<len1;j++)
        {
            var lines=resultData.hits.hits[i].inner_hits.subtitle.hits.hits[j];
            var t = document.createElement("button");                         //Create button
            var sec=lines._source.time;
            var min=0;
            if(sec>=60){
                min=sec/60;
                sec=sec%60;
            }
            if(sec<=9)
                sec='0'+sec;
            var time=Math.floor(min)+":"+ parseInt(sec, 10);
            var t1 = document.createTextNode(time);       // Create a text node
            t.setAttribute('data',time+" - "+lines._source.word);
            t.id = i+"####"+lines._source.time;
            t.appendChild(t1);
            t.addEventListener('click', function() {
                var v=this.id;
                var l=v.length;
                var frame_number="";
                var time="";
                var f=0;
                for(var i=0;i<l;i++){
                    var ch=v[i];
                    if(ch!='#' && f==0)
                        frame_number+=ch;
                    else if(ch=='#'){
                        f=1;
                        continue;
                    }
                    if(ch!='#' && f==1)
                        time+=ch;
                }
                document.getElementById("iframe"+frame_number).currentTime = time;

                var data1=this.getAttribute('data');
                var text2=text1;
                var time1=data1.substring(0,5);

                text2="<span style='background-color:#e2f442;'>"+text2+"</span>";
                time2="<span style='color:#272727;'>"+time1+"</span>";
                var re = new RegExp(text1, "ig");
                data1=data1.replace(re,text2);
                data1=data1.replace(time1,time2);
                var text = document.createElement("p");
                text.innerHTML = data1;
                document.getElementById("iframe"+frame_number).play();
                var t2 = document.createTextNode(text);
                document.getElementById("sub"+frame_number).innerHTML= "";
                document.getElementById("sub"+frame_number).appendChild(text);
            }, false);
            t.setAttribute("style","margin-right:20px; background: #ddd;  width:40px; height:30px; margin-bottom:20px;");

            div1.appendChild(t);
            row_master_div.appendChild(div1);

            document.getElementById("vd").appendChild(row_master_div);
            // var div2=document.createElement("div");

            document.getElementById("sub"+i).setAttribute("style", "color:#747474; font-size: 120%;");
        }
    }
}

function dispResult(a,b,resultData,text) {
    var c;
    if(a>=b){
        document.getElementById("more").innerHTML = "";
        return;
    }
    if(b-a<=2)
    {
        for(var i=a;i<b;i++){
            var name=resultData.hits.hits[i]._source.name;
            var url=resultData.hits.hits[i]._source.url;
            Create(name,url,i,resultData,text);
        }
        document.getElementById("more").innerHTML = "";
        // dispResult(a,b,resultData);
    }
    if(b-a>2){
        document.getElementById("more").innerHTML = "";
        for(var i=a;i<a+2;i++){
            var name=resultData.hits.hits[i]._source.name;
            var url=resultData.hits.hits[i]._source.url;
            Create(name,url,i,resultData,text);
        }
        a=a+2;
        var btn = document.createElement("BUTTON");        // Create a <button> element
        var t = document.createTextNode("Load More");      // Create a text node
        btn.appendChild(t);                                // Append the text to <button>
        btn.setAttribute("style"," width:600px;height:50px;background:#ddd;margin-bottom:20px;");
        document.getElementById("more").appendChild(btn);
        btn.addEventListener('click', function() {
            dispResult(a,b,resultData,text);
        }, false);
    }
}

function search() {
    // console.log("yes");
    var x = document.getElementById("search");
    var text = "";
    text = x.value;
    var data = {
        "_source": {
            "includes": ["name","url"]
        },
        "query": {
            "nested": {
                "path": "subtitle",
                "query": {
                    "match_phrase_prefix": {
                        "subtitle.word":text
                    }
                },
                "inner_hits": {
                    "size": 15,
                    "highlight": {
                        "fields": {
                            "subtitle.time": {}
                        }
                    },
                    "sort": {"subtitle.time" :{"order" :"asc"}}
                }
            }
        }
    }
    if ("*" === text) {
        data = {
            "query": {
                "match_all": {}
            }
        }
    }
    $.ajax({
        type : 'POST',
        url: "https://search-esawskol-p2qmao574p4skf63bo7ssbi66a.us-west-2.es.amazonaws.com/media/_search?size=100",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(resultData){
            document.getElementById("heading").innerHTML = "";
            document.getElementById("vd").innerHTML = "";
            document.getElementById("name_url").innerHTML = "";
            document.getElementById("more").innerHTML = "";
            var len=resultData.hits.hits.length;
            CreateHeading(len);
            if(len==0){}
            // console.log("No videos");
            else{
                dispResult(0,len,resultData,text);
            }
        }
    });
}