function getTimeString(sec) {
    var min=0;
    if(sec>=60){
        min=sec/60;
        sec=sec%60;
    }
    if(sec<=9)
        sec='0'+sec;
    var time=Math.floor(min)+":"+ parseInt(sec, 10);
    return time;
}