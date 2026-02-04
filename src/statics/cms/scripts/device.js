async function sendDeviceControl(deviceId, key, value) {
  const data = { key: key, value: value };
  const submit = $.ajax({
    type: "post",
    url: `${baseUrl}/dashboard/api/device-control/${deviceId}`,
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function (response) {
      showToast('Thành công.', 'success')
    },
    error: function (xhr, status, error) {
      showToast('Thất bại.', 'failure')
    }
  })
  return;
}

function handleLedIncBtn(deviceId, key) {
  let lastValue = $(`.x-item-${deviceId} .x-key-${key} input`).val();
  lastValue++;
  handleLedState(deviceId, key, lastValue);
  return
}
function handleLedDecBtn(deviceId, key) {
  let lastValue = $(`.x-item-${deviceId} .x-key-${key} input`).val();
  lastValue--;
  handleLedState(deviceId, key, lastValue);
  return
}
function handleLedBarDrag(deviceId, key) {
  let value = $(`.x-item-${deviceId} .x-key-${key} input`).val();
  $(`.x-item-${deviceId} .x-key-${key} .value`).text(value);
  sendLedState(deviceId, key, value);
  return
}
function handleLedState(deviceId, key, value) {
  value = Math.min(Math.max(value, 0), 100); // giới hạn giá trị từ 0 đến 100

  // call api to send value to device 
  sendLedState(deviceId, key, value);

  $(`.x-item-${deviceId} .x-key-${key} .value`).text(value);
  $(`.x-item-${deviceId} .x-key-${key} input`).val(value);
  return
}
function sendLedState(deviceId, key, value) {
  const data = { key, value };
  console.log("command:", data);
  sendDeviceControl(deviceId, key, value);
  return
}
