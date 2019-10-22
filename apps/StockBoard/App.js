$.extend(AV.Options, {
    definitions: {
        showSymbols: {},
        showType: { USER: true, HO: false, HA: false, UPCOM: false, ALL: true }, //Hiển thị dữ liệu 1 sàn, mặc định là hiện All theo mã CK được chọn, User là dành riêng cho VFPress
        screenWidth: 'auto', // lưu độ phân giải màn hình (1000 mặc định)
        tableType: { USER: 'normal', HO: 'normal', HA: 'normal', UPCOM: 'normal', ALL: 'normal' }, //lưu kiểu bảng hiện thị :bình thường (mặc định), cuộn vô tận, lật trang
        lineCount: 20, //số dòng chọn hiển thị
        lineHeight: 60, //chiều cao dòng trong bảng board data
        waitingTime: 10000, //thoi gian cho de lat trang
        scrollDelay: 50, //Thời gian trễ khi cuộn bảng
        hideColumns: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], //Ẩn / hiện cột : với bảng ALL thì không chia theo sàn nữa
        // HOSE : 0:1 Phiên 1 Giá-KL / 2:3 Phiên 2 Giá-KL / 
        // HNX  : 4:5 KL Mua-Bán / 6:7 Số lệnh Mua-Bán
        // ALL  : 8:9 NN Mua-Bán / 10:11 : Room còn lại / Tổng Room
        showIndexes: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
        showChart: true,
        showRawIndexes: true,
        fontStyle: 'normal', // lưu kiểu font chữ (normal mặc định)
        volColor: 'true', // nếu là 'true' hiện Khối lượng có cùng màu sắc với giá, ngược lại là màu trắng
        boardStyle: 'default', //kiểu bảng (template) mặc định là kiểu 'default'
        language: (AV.cookie('language') == 'en') ? 'en' : 'vi', //lưu ngôn ngữ, mặc định là tiếng việt 
        topSymbols: {}, //Các mã được chọn ở trên cùng của bảng
        showTopReport: false, //Hiển thị Top giao dịch CP
        showTopPT: false, //Hiển thị GDTT ở trên đầu bảng
        oldCssIndexes: {}, //Dùng cho việc thay đổi style bảng
        orderingColumn: 0, //Cột được sắp xếp (đánh số từ 0 -> 32)
        orderDir: 1, //Kiểu sắp xếp : -1 Tăng, 1 giảm
        selectionID: '1', //Nhóm CP được chọn (VN30, HNX30 ...)
        alertItems: {} //lưu các mã CK cảnh báo
    }
});
$.extend(AV.App, {
    map: {
        HO: [0, -1, -2, -3, 5, 6, 3, 4, 1, 2, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
        HA: [0, -1, -2, -3, 5, 6, 3, 4, 1, 2, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
        UPCOM: [0, -1, -2, -3, 5, 6, 3, 4, 1, 2, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        DOUBLE: [0, -1, -2, -3, 5, 6, 3, 4, 1, 2, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
    },
    indexMap: [
        0, //VNIndex
        7, //VN100
        6, //VN30
        10, //VNALL
        9, //VNMID
        8, //VNSML
        13, //HNXIndex
        11, //HNX30
        31, //HNXCon
        26, //HNXFFIndex
        29, //HNXFin
        27, //HNXLCap
        30, //HNXMan
        28, //HNXMSCap
        14, //HNXUpcomIndex
        32, //HNX30TRI

        111, //VNCOND
        112, //VNCONS
        113, //VNENE
        114, //VNFIN
        115, //VNHEAL
        116, //VNIND
        117, //VNIT
        118, //VNMAT
        119, //VNREAL
        120, //VNUTI
        121 //VNXALL
    ],
    indexName: [
        'VNIndex', 'VN100', 'VN30', 'VNALL', 'VNMID', 'VNSML', 'HNXINdex', 'HNX30', 'HNXCon', 'HNXFFIndex', 'HNXFin', 'HNXLCap', 'HNXMan', 'HNXMSCap', 'UPCOMIndex', 'HNX30TRI', 'VNCOND', 'VNCONS', 'VNENE', 'VNFIN', 'VNHEAL', 'VNIND', 'VNIT', 'VNMAT', 'VNREAL', 'VNUTI', 'VNXALL'
        ],
    //1 : 0 : Cot 1, -260 : Cot 2, -520 : Cot 3
    //2 : -10 : Hang 1, -130 : Hang 2, -250 : Hang 3, -370 : Hang 4, -490 : Hang 5
    chartPosition: [
        [0, -10], //VNIndex
        [-520, -130], //VN100
        [-730, -10], //VN30
        [0, -250], //VNALL
        [-260, -250], //VNMID
        [-520, -250], //VNSML
        [-370, -10], //HNXIndex
        [0, -130], //HNX30
        [0, -370], //HNXCon
        [-260, -370], //HNXFFIndex
        [-520, -370], //HNXFin
        [0, -490], //HNXLCap
        [-260, -490], //HNXMan
        [-520, -490], //HNXMSCap
        [-360, -170], //HNXUpcomIndex
        [-260, -130], //HNX30TRI

        [0, -10], //VNCOND
        [0, -10], //VNCONS
        [0, -10], //VNENE
        [0, -10], //VNFIN
        [0, -10], //VNHEAL
        [0, -10], //VNIND
        [0, -10], //VNIT
        [0, -10], //VNMAT
        [0, -10], //VNREAL
        [0, -10], //VNUTI
        [-520, -130] //VNXALL
    ],
    colors: { 'ss-ceil': '#DD00DD', 'ss-floor': '#66CCFF', 'ss-basic': '#EEFB00', 'ss-up': '#32CD32', 'ss-down': '#F70033' },
    init: function() {
        var language = $.cookie('language');
        AV.read(AV.rootURL + 'packages/StockBoard/languages/' + (language ? language.replace('"', '').replace('"', '') : 'vi') + '.js', function() {
            AV.load('StockBoard', getBasicInfo);
        });

    }
});
function getBasicInfo() {
    if (Stock) {
        Stock.pageWidth = (AV.Options.screenWidth != 'auto' && AV.Options.screenWidth != 'Auto' && AV.Options.screenWidth != '100%') ? (parseInt(AV.Options.screenWidth)) + 'px' : AV.Options.screenWidth;
        setTimeout(Stock.getBasicInfo, 10);
    }
    else {
        setTimeout(getBasicInfo, 50);
    }
}