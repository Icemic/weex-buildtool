'use strict';

function findCurrentDevice(devices) {
  for (var i in devices) {
    if (devices[i].status === 'Booted') {
      return devices[i];
    }
  }

  return;
}

module.exports = findCurrentDevice;