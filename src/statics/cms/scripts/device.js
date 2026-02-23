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

const isLedBarBtnDisable = new DisableAction();
function handleLedIncBtn(deviceId, key) {
  if (isLedBarBtnDisable.getStatus()) {
    return
  }
  isLedBarBtnDisable.disable();
  let lastValue = $(`.x-item-${deviceId} .x-key-${key} input`).val();
  lastValue++;
  handleLedState(deviceId, key, lastValue);
  return
}
function handleLedDecBtn(deviceId, key) {
  if (isLedBarBtnDisable.getStatus()) {
    return
  }
  isLedBarBtnDisable.disable();
  let lastValue = $(`.x-item-${deviceId} .x-key-${key} input`).val();
  lastValue--;
  handleLedState(deviceId, key, lastValue);
  return
}
function handleLedBarDrag(deviceId, key) {
  if (isLedBarBtnDisable.getStatus()) {
    return
  }
  isLedBarBtnDisable.disable();
  let value = $(`.x-item-${deviceId} .x-key-${key} input`).val();
  $(`.x-item-${deviceId} .x-key-${key} .value`).text(value);
  sendLedState(deviceId, key, value);
  return
}
function handleLedBarTelemetry(deviceId, key, value) {
  handleLedState(deviceId, key, value, false);
  return
}
function handleLedState(deviceId, key, value, isSendData = true) {
  value = Math.min(Math.max(value, 0), 100); // giới hạn giá trị từ 0 đến 100

  $(`.x-item-${deviceId} .x-key-${key} .value`).text(value);
  $(`.x-item-${deviceId} .x-key-${key} input`).val(value);
  // call api to send value to device 
  if (isSendData) {
    sendLedState(deviceId, key, value);
  }
  return
}
function sendLedState(deviceId, key, value) {
  const data = { key, value };
  sendDeviceControl(deviceId, key, value);
  return
}

function getDeviceValue(deviceId) {
  const data = { deviceId };
  const submit = $.ajax({
    type: "get",
    url: `${baseUrl}/dashboard/api/device-control/${deviceId}`,
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function (response) {
      showToast('Đã gửi yêu cầu.', 'success')
    },
    error: function (xhr, status, error) {
      showToast('Gửi yêu cầu thất bại.', 'failure')
    }
  })
  return;
}