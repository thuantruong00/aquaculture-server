var socket = io(`${webSocketUrl}`, {
  path: "/socket.io",
  reconnection: true,        // bật reconnect
  reconnectionAttempts: 10,   // thử lại tối đa 5 lần
  reconnectionDelay: 2000,   // 2 giây mỗi lần
  transports: ["websocket", "polling"]
});
// Listen for 'chat message' event

// ==============================
function handleTelemetryStatus(deviceId, key, value) {
  const $status = $(`.x-item-${deviceId} .x-key-${key}.device-status`);
  if ($status.length === 0) {
    return;
  }

  const normalizedValue =
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true";

  $status.removeClass("device-status-online");
  $status.removeClass("device-status-offline");
  $status.removeClass("device-status-error");
  $status.addClass(
    normalizedValue ? "device-status-online" : "device-status-offline",
  );
}

socket.on("iotDataTelemetry", function (data) {
  const { devices, id, ts, deviceModelName } = data
  console.log("iotDataTelemetry:", data);
  updateLastUpdateTime(id, ts);

  if (!devices || devices.length === 0) return;
  for (const item of devices) {
    $(`.x-item-${id} .x-key-${item.key} span.value`).text(item.value)
    handleTelemetryStatus(id, item.key, item.value);
    if (deviceModelName && deviceModelName == "led-bar-2-line-AT") {
      handleLedBarTelemetry(id, item.key, item.value);
    }
  }
});

socket.on("deviceSettingInfo", function (data) {
  console.log("deviceSettingInfo:", data);
  const { id, setting:{ ip, ssid, fwVersion } } = data
  updateFirmwareInfo(id, ip, ssid, fwVersion);
  return;
});

// socket.on("iotDataResponse", function (data) {
//   const { field, id, template, ts } = data
//   const now = new Date(Number(ts))
//   console.log("iotDataResponse:", data);
//   if (template == "a-1y-size-12-12-onoff") {
//     $(`.x-item-${id} .updated-at i`).text(now.toLocaleTimeString('en-GB'))
//     const styleClass = field.value ? "device-status-online" : "device-status-offline";
//     $(`.x-item-${id}  .device-status`).removeClass(`device-status-offline`)
//     $(`.x-item-${id}  .device-status`).removeClass(`device-status-online`)
//     $(`.x-item-${id}  .device-status`).removeClass(`device-status-error`)

//     $(`.x-item-${id}  .device-status`).addClass(`${styleClass}`)
//     return;
//   }
//   if (template == "led-bar-2") {
//     $(`.x-item-${id} .updated-at i`).text(now.toLocaleTimeString('en-GB'))
//     $(`.x-item-${id} .x-key-${data.field.key} input`).val(data.field.value);
//     // handleLedBarTelemetry(id, data.field.key);
//     return;
//   }

// });


let click_status = true;
$(".my-dropdown-button").click(function () {
  /*
    ===== dropdown menu
        <a class="my-dropdown-button"  dropdown-menu-name="#profile" ></a>
        <div class="dropdown-child-buble" id="profile"></div>
        dropdown-child-buble : close when click out
    */
  click_status = false;
  let menu_id = $(this).attr("dropdown-menu-name");
  $(menu_id).toggleClass("d-none d-block");
  $(this).toggleClass("dropdown-btn-active");
  setTimeout(() => {
    click_status = true;
  }, 1000);
});

$(window).click(function () {
  if (click_status) {
    $(".dropdown-btn-buble").removeClass("dropdown-btn-active");
    $(".dropdown-child-buble").addClass("d-none");
  }
});

function handleCloseModal() {
  $("#modal-notification").remove();
}

function modal(result) {
  return `<div class="modal fade show" id="modal-notification" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" style="display: block;" aria-modal="true">
  <div class="modal-dialog " role="document">
    <div class="modal-content">
     
      <div class="modal-body">
      <div class="d-flex justify-content-between align-items-center">
         ${result}
         <button type="button" class="btn btn-primary" onclick="handleCloseModal()" data-dismiss="modal" >Đóng</button>
      </div>

      </div>
    </div>
  </div>
</div>`;
}

function updateLastUpdateTime(deviceId, timestamp, isDisplayDate = false) {
  if (!timestamp) {
    $(`.x-item-${deviceId} .updated-at i`).text("--/--");
    return;
  }

  const dateObj = new Date(Number(timestamp));

  if (isNaN(dateObj.getTime())) {
    $(`.x-item-${deviceId} .updated-at i`).text("--/--");
    return;
  }

  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  if (isDisplayDate) {
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    $(`.x-item-${deviceId} .updated-at i`)
      .text(`${hours}:${minutes}:${seconds} ${day}/${month}/${year}`);
  } else {
    $(`.x-item-${deviceId} .updated-at i`)
      .text(`${hours}:${minutes}:${seconds}`);
  }
}

function updateFirmwareInfo(id, ip, ssid, fwVersion) {
  $(`.firmware-id-${id} .device-ssid`).text(ssid);
  $(`.firmware-id-${id} .device-fwVersion`).text(fwVersion); 
  return;
}

const defaultDelay = 300; // 500ms
class DisableAction {
  constructor() {
    this.isDisabled = false;
  }
  disable(delay = defaultDelay) {
    this.isDisabled = true;
    setTimeout(() => {
      this.isDisabled = false;
    }
      , delay);
  }

  canPerform() {
    return !this.isDisabled;
  }
  getStatus() {
    return this.isDisabled;
  }
}
