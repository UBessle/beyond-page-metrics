var i, first, last, entries = performance.getEntries();
for (i=0; i<entries.length; i++) {
  if (entries[i].name.indexOf('platform.twitter.com') != -1) {
    if (first === undefined) first = entries[i];
    if (last === undefined) last = entries[i];
    if (entries[i].startTime < first.startTime) first = entries[i];
    if (entries[i].responseEnd > last.responseEnd) last = entries[i];
  }
}
console.log('Took ' + (last.responseEnd - first.startTime) + ' ms');