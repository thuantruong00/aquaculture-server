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
        url: `${path}/device-setting/activate`,
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
        url: `${path}/device-setting/update-status`,
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
        url: `${path}/device-setting/update-device-orders`,
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