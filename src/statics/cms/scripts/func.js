// active and delete device in addDeviceSetting page
$('.active-device-btn').click(function () {
    let item = $(this).attr("value")
    const deviceName = $(`${item} .device-name>input`).val();
    const deviceId = item.split("-")[1]
    const data = {
        deviceName: deviceName,
        deviceId: deviceId,
    }
    const submit = $.ajax({
        type: "post",
        url: `${baseUrl}/dashboard/device-setting/activate`,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            showToast('Thiết bị đã được thêm thành công.', 'success')
            $(`${item}`).remove();
        },
        error: function (xhr, status, error) {
            showToast('Kích hoạt thiêt bị không thành công.', 'failure')
        }
    })


});
$('.delete-device-btn').click(function () {
    let item = $(this).attr("value")
    const deviceId = item.split("-")[1]
    const data = {
        deviceId: deviceId,
        status: 'deleted'
    }
    const submit = $.ajax({
        type: "post",
        url: `${baseUrl}/dashboard/device-setting/update-status`,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            showToast('Thiết bị đã được xoá.', 'success')
            $(`${item}`).remove();
        },
        error: function (xhr, status, error) {
            showToast('Xoá thiết bị thất bại.', 'failure')
        }
    })
});

// button redirect to page device group detail to change data of group - custom-ui/device-group page
// $('.update-device-group-btn').click(function () {
//     let item = $(this).attr("value")
//     const deviceName = $(`${item} .device-name>input`).val();
//     const deviceId = item.split("-")[1]
//     const data = {
//         deviceName: deviceName,
//         deviceId: deviceId,
//     }
//     window.location.href = path + "/custom-ui/detail/p123";
// });


// move up  move down  - custom-ui/group-detail/:id page
$('.move-up').click(function (e) {
    const currentItem = $(this).closest('li');
    const prevItem = currentItem.prev('li');
    if (prevItem.length) {
        currentItem.insertBefore(prevItem);
    }

});
$('.move-down').click(function (e) {
    const currentItem = $(this).closest('li');
    const nextItem = currentItem.next('li');

    if (nextItem.length) {
        currentItem.insertAfter(nextItem);
    }

});


function submitChangeOrderForm(parent) {
    const list = $(`${parent} li`)
    const data = []
    list.each(function (index) {
        const deviceId = $(this).attr("deviceid");
        if (deviceId) {
            data.push({
                index: index + 1, // hoặc index nếu muốn 0-based
                deviceId,
            });
        }
    });
    console.log(data)

    const submit = $.ajax({
        type: "post",
        url: `${baseUrl}/dashboard/device-setting/update-device-orders`,
        data: JSON.stringify({ order: data }),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            showToast('Thao tác thành công.', 'success')
            window.location.reload()
        },
        error: function (xhr, status, error) {
            showToast('Thao tác không thành công.', 'failure')
        }
    })

}

// ======= Pin local storage ======

(function () {
    const pathOnly = window.location.pathname;
    const hasNoQuery = window.location.search === "";

    if (pathOnly.match(/^\/dashboard\/device-control\/?$/) && hasNoQuery) {
        const favoriteDeviceIds = JSON.parse(localStorage.getItem("favoriteDeviceIds") || "[]");
        const favoriteGroupIds = JSON.parse(localStorage.getItem("favoriteGroupIds") || "[]");

        // Nếu không có gì thì dừng
        if (!Array.isArray(favoriteDeviceIds) && !Array.isArray(favoriteGroupIds)) return;
        if (favoriteDeviceIds.length === 0 && favoriteGroupIds.length === 0) return;

        // Tạo query string
        const queryParams = new URLSearchParams();
        if (favoriteDeviceIds.length > 0) {
            queryParams.set("deviceIds", favoriteDeviceIds.join(","));
        }
        if (favoriteGroupIds.length > 0) {
            queryParams.set("groupIds", favoriteGroupIds.join(","));
        }

        // Redirect
        // const redirectUrl = `${window.location.origin}${pathOnly}?${queryParams.toString()}`;
        const redirectUrl = `${baseUrl}${pathOnly}?${queryParams.toString()}`;
        window.location.href = redirectUrl;
    }
})();

function handleAddPinLocalId(id, type) {
    if (type == "device") {
        const deviceIds = JSON.parse(localStorage.getItem("favoriteDeviceIds") || "[]");
        if (!deviceIds.includes(id)) {
            deviceIds.push(id);
        }
        localStorage.setItem("favoriteDeviceIds", JSON.stringify(deviceIds));
    }

    if (type == "group") {
        const groupIds = JSON.parse(localStorage.getItem("favoriteGroupIds") || "[]");
        if (!groupIds.includes(id)) {
            groupIds.push(id);
        }
        localStorage.setItem("favoriteGroupIds", JSON.stringify(groupIds));
    }

    // ✅ Chuyển hướng sau khi thêm xong
    window.location.href = "/dashboard/device-control";
}
function handleRemovePinLocalId(id, type) {
    console.log("Removing:", id, type);

    if (type === "device") {
        let deviceIds = JSON.parse(localStorage.getItem("favoriteDeviceIds") || "[]");
        deviceIds = deviceIds.filter(item => item !== id);
        localStorage.setItem("favoriteDeviceIds", JSON.stringify(deviceIds));
    }

    if (type === "group") {
        let groupIds = JSON.parse(localStorage.getItem("favoriteGroupIds") || "[]");
        groupIds = groupIds.filter(item => item !== id);
        localStorage.setItem("favoriteGroupIds", JSON.stringify(groupIds));
    }

    // ✅ Chuyển hướng sau khi gỡ ghim
    window.location.href = "/dashboard/device-control";
}


// =========== device control =============
function controlDevice(deviceId, key, value) {
    const data = { key: key, value: value }
    console.log("id", deviceId)
    console.log(data)
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
}


// ============= condition ==============
function addCondition(conditionClsName) {
    const model = $(`${conditionClsName} .condition-row .row`)[0]
    console.log(model)
    if (model) {
        const clone = model.cloneNode(true);
        $(`${conditionClsName} .condition-row`).append(clone);
    }
}
$(document).on('click', '.btn-delete-condition', function (e) {
    const target = $(this).attr('data-condition');
    const length = $(`${target} .condition-row .row`).length;
    if (length > 1) {
        $(this).closest('.row').remove();
    }
});

// ============= create account / check re-password
$('.create-account .re-password').on('input', function () {
    const rePassword = $(this).val();
    const password = $('.create-account .password').val();

    if (rePassword !== password) {
        $(".create-account .non-matching").removeClass("d-none");
        $(".create-account .matching").addClass("d-none");
        console.log("failed");
    } else {
        $(".create-account .non-matching").addClass("d-none");
        $(".create-account .matching").removeClass("d-none");
        console.log("succeed");
    }
});

// ===============record
function getRecordsData(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // lấy input device (giá trị dạng deviceId:key)
    const deviceInput = form.querySelector("select[name='device']");
    const deviceVal = deviceInput.value; // ví dụ: "687bbed3dc1a2beba639331e:temperature"
    const [deviceId, key] = deviceVal.split(":");

    // lấy ngày
    const dateInput = form.querySelector("input[name='date']");
    const dateVal = dateInput.value; // ví dụ: "2025-08-17"


    // build url
    const url = `${baseUrl}/dashboard/history?deviceId=${encodeURIComponent(deviceId)}&key=${encodeURIComponent(key)}&date=${encodeURIComponent(dateVal)}&limit=20`;

    // redirect
    window.location.href = url;
}