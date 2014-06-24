var slowest, i, entries = performance.getEntries();
slowest = entries[0];
for (i=0; i<entries.length; i++) {
  if (entries[i].duration > slowest.duration) slowest = entries[i];
}
console.log(slowest);