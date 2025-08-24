// =========================================
const options = {
    chart: {
        type: 'line',
        height: 400,
        zoom: { enabled: true }
    },
    series: [
        { name: 'Giá trị trung bình', data: seriesAvg || [] },
        { name: 'Giá trị thấp nhất', data: seriesMin || [] },
        { name: 'Giá trị cao nhất', data: seriesMax || [] }
    ],
    colors: ['#000000', '#1E90FF', '#FF0000'],
    xaxis: {
        type: 'datetime',
        labels: {
            datetimeUTC: false // để hiện giờ theo local VN
        }
    },
    yaxis: {
        decimalsInFloat: 2,
        title: { text: "Value" }
    },
    grid: {
        show: true,
        borderColor: 'red',
        strokeDashArray: 3,
        position: 'back',
        xaxis: {
            lines: { show: true }  // lưới dọc
        },
        yaxis: {
            lines: { show: true }  // lưới ngang
        },
        row: {
            colors: ['#f9f9f9', 'transparent'], // xen kẽ
            opacity: 0.5
        }
    },
    tooltip: {
        x: { format: 'dd/MM HH:mm' }
    }
};

const chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();

// Toggle series
document.getElementById("chkAvg").addEventListener("change", e => {
    chart.toggleSeries("Avg");
});
document.getElementById("chkMin").addEventListener("change", e => {
    chart.toggleSeries("Min");
});
document.getElementById("chkMax").addEventListener("change", e => {
    chart.toggleSeries("Max");
});

// Refresh button (reload page)
document.getElementById("btnRefresh").addEventListener("click", () => {
    window.location.reload();
});

// =====================
function getChartData(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // lấy input device (giá trị dạng deviceId:key)
    const deviceInput = form.querySelector("select[name='device']");
    const deviceVal = deviceInput.value; // ví dụ: "687bbed3dc1a2beba639331e:temperature"
    const [deviceId, key] = deviceVal.split(":");

    // lấy ngày
    const dateInput = form.querySelector("input[name='date']");
    const dateVal = dateInput.value; // ví dụ: "2025-08-17"

    // lấy bucket
    const bucketInput = form.querySelector("input[name='bucket']");
    const bucketVal = bucketInput.value;

    // build url
    const url = `${baseUrl}/dashboard/chart?deviceId=${encodeURIComponent(deviceId)}&key=${encodeURIComponent(key)}&date=${encodeURIComponent(dateVal)}&bucket=${encodeURIComponent(bucketVal)}`;

    // redirect
    window.location.href = url;
}
