function measureResource(id) {
  var src = document.getElementById(id).src;
  var r = performance.getEntriesByName(src)[0];
  return {
    "startTime": r.startTime,
    "timeToLoaded": r.responseEnd,
    "duration": r.duration
  }
}

function timeByInitiatorType() {
  var type, res = performance.getEntriesByType("resource"), o = {};
  for (var i=0;i<res.length;i++) {
    if (o[res[i].initiatorType]) {
      o[res[i].initiatorType].duration += res[i].duration;
      if (res[i].duration > o[res[i].initiatorType].max) o[res[i].initiatorType].max = res[i].duration;
      if (res[i].duration < o[res[i].initiatorType].min) o[res[i].initiatorType].min = res[i].duration;
      o[res[i].initiatorType].resources += 1;
      o[res[i].initiatorType].avg = o[res[i].initiatorType].duration / o[res[i].initiatorType].resources;
    } else {
      o[res[i].initiatorType] = {"duration": res[i].duration, "resources": 1, "avg": res[i].duration, "max": res[i].duration, "min": res[i].duration};
    }
  }
  return o;
}

function findSlowResources(ms, i) {
  var res = performance.getEntriesByType("resource"), arr = [];
  for (var i=0; i<res.length; i++) {
    if (res[i].duration > ms) arr.push(res[i]);
  }
  arr.sort(function(a,b){ return b.duration - a.duration });
  return arr.slice(0,i);
}

function findPossibleSpofs(ms) {
  var res = performance.getEntriesByType("resource"), spofs = [];
  for (var i=0;i<res.length;i++) {
    var isSpof = true;
    for (var j=0;j<res.length;j++) {
      if (res[i].name != res[j].name &&
        (res[j].startTime > res[i].startTime && res[j].startTime < res[i].responseEnd) ||
        (res[j].endTime > res[i].startTime && res[j].endTime < res[i].responseEnd) ||
        (res[j].startTime < res[i].startTime && res[j].endTime > res[i].responseEnd)) {
          isSpof = false;
        }
    }
    if (isSpof && res[i].duration > ms) spofs.push(res[i]);
  }
  return spofs;
}

function findPerfByHost(hosts) {
  var res = performance.getEntriesByType("resource"), obj={};
  for (var i=0;i<res.length;i++) {
    var start = res[i].name.indexOf("://")+3,
      host = res[i].name.substring(start),
      end = host.indexOf("/");
    host = host.substring(0,end);
    if (hosts && hosts.indexOf(host) === -1) {
      continue;
    }

    function upsert(host) {
      if (obj[host]) {
        obj[host].resources += 1;
        obj[host].duration += res[i].duration;
        if (res[i].duration < obj[host].min) obj[host].min = res[i].duration;
        if (res[i].duration > obj[host].max) obj[host].max = res[i].duration;
        obj[host].avg = obj[host].duration / obj[host].resources;
      }
      else {
        obj[host] = {"duration": res[i].duration, "min": res[i].duration, "max": res[i].duration, "avg": res[i].duration, "resources": 1};
      }
    }

    upsert(host);
    upsert("_all");
  }
  return obj;
}

function findSlowestHost(obj) {
  var found=undefined;
  for(i in obj) {
    if (!found || found.max < obj[i].max) {
      found = obj[i];
      found.host = i;
    }
  }
  return found;
}
